import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { toObjectId } from "@/lib/db/toObjectId";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

// GET /api/sales/[id]
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/sales/[id]">
) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { id } = await ctx.params; // ✅ params is a Promise in Next 15.5

    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const db = await getDb();
    const sale = await db.collection("sales").findOne({ _id: oid });
    if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ sale: { ...sale, _id: sale._id.toString() } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/sales/[id]  (process return)
export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/sales/[id]">
) {
  const result = await requireAdmin(req);
  if (isNextResponse(result)) return result;

  try {
    const { id } = await ctx.params; // ✅

    const saleOid = toObjectId(id);
    if (!saleOid) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const db = await getDb();

    const originalSale = await db.collection("sales").findOne({ _id: saleOid });
    if (!originalSale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    if (originalSale.type === "RETURN") {
      return NextResponse.json({ error: "Cannot return a return" }, { status: 400 });
    }

    const existingReturn = await db.collection("sales").findOne({
      originalSaleId: id,
      type: "RETURN",
    });
    if (existingReturn) {
      return NextResponse.json({ error: "Sale already returned" }, { status: 400 });
    }

    const now = new Date();

    const insertResult = await db.collection("sales").insertOne({
      billNo: `RTN-${originalSale.billNo}`,
      items: originalSale.items,
      subtotal: originalSale.subtotal,
      discount: originalSale.discount,
      discountType: originalSale.discountType,
      discountAmount: originalSale.discountAmount,
      total: originalSale.total,
      totalCost: originalSale.totalCost,
      profit: -originalSale.profit,
      paymentMethod: originalSale.paymentMethod,
      type: "RETURN",
      originalSaleId: id,
      createdBy: result.admin.adminId,
      createdAt: now,
    });

    // restore stock
    for (const item of originalSale.items) {
      const productOid = toObjectId(item.productId);
      if (productOid) {
        await db.collection("products").updateOne(
          { _id: productOid },
          { $inc: { stockQty: item.qty }, $set: { updatedAt: now } }
        );
      }
    }

    return NextResponse.json({
      message: "Return processed",
      returnId: insertResult.insertedId.toString(),
      billNo: `RTN-${originalSale.billNo}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}