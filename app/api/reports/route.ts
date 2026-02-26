import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "daily";
    const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const date = new Date(dateStr);

    let startDate: Date, endDate: Date;
    if (type === "daily") { startDate = startOfDay(date); endDate = endOfDay(date); }
    else if (type === "monthly") { startDate = startOfMonth(date); endDate = endOfMonth(date); }
    else { startDate = startOfYear(date); endDate = endOfYear(date); }

    const db = await getDb();
    const sales = await db.collection("sales").find({ type: "SALE", createdAt: { $gte: startDate, $lte: endDate } }).toArray();
    const returns = await db.collection("sales").find({ type: "RETURN", createdAt: { $gte: startDate, $lte: endDate } }).toArray();

    const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
    const totalCost = sales.reduce((s, x) => s + x.totalCost, 0);
    const totalDiscount = sales.reduce((s, x) => s + x.discountAmount, 0);
    const totalReturns = returns.reduce((s, x) => s + x.total, 0);
    const netRevenue = totalRevenue - totalReturns;
    const netProfit = netRevenue - totalCost;

    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const sale of sales) {
      for (const item of sale.items) {
        if (!itemMap[item.productId]) itemMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        itemMap[item.productId].qty += item.qty;
        itemMap[item.productId].revenue += item.subtotal;
      }
    }
    const itemBreakdown = Object.entries(itemMap).map(([id, v]) => ({ productId: id, ...v })).sort((a, b) => b.qty - a.qty);

    const soldProductIds = new Set(Object.keys(itemMap));
    const deadStock = await db.collection("products").find({ stockQty: { $gt: 0 } }).project({ name: 1, sku: 1, stockQty: 1, sellingPrice: 1 }).toArray();
    const deadStockFiltered = deadStock.filter((p) => !soldProductIds.has(p._id.toString())).map((p) => ({ ...p, _id: p._id.toString() }));

    return NextResponse.json({
      period: { type, startDate, endDate },
      summary: { totalRevenue, totalCost, totalDiscount, totalReturns, netRevenue, netProfit, totalSales: sales.length, totalReturnCount: returns.length },
      itemBreakdown,
      deadStock: deadStockFiltered,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
