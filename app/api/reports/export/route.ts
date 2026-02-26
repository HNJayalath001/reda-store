import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isNextResponse } from "@/lib/auth/requireAdmin";
import { getDb } from "@/lib/db/mongodb";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "@/lib/utils/dates";
import { formatRs } from "@/lib/utils/money";

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
    const totalReturns = returns.reduce((s, x) => s + x.total, 0);
    const netRevenue = totalRevenue - totalReturns;
    const netProfit = netRevenue - totalCost;

    const periodLabel = type === "daily" ? dateStr : type === "monthly" ? dateStr.slice(0, 7) : dateStr.slice(0, 4);
    const salesRows = sales.map((s) => `<tr><td>${s.billNo}</td><td>${new Date(s.createdAt).toLocaleString()}</td><td>${s.items.length}</td><td>${formatRs(s.total)}</td><td>${s.paymentMethod}</td></tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{color:#1a56db}
table{width:100%;border-collapse:collapse;margin-top:16px}
th,td{padding:8px 12px;border:1px solid #ddd;text-align:left;font-size:13px}
th{background:#1a56db;color:white}tr:nth-child(even){background:#f5f7ff}
.summary{display:flex;gap:24px;flex-wrap:wrap;margin:20px 0}
.card{background:#f5f7ff;border-radius:8px;padding:16px 24px;min-width:160px}
.card h3{margin:0 0 4px;font-size:12px;color:#666;text-transform:uppercase}
.card p{margin:0;font-size:20px;font-weight:bold;color:#1a56db}
.profit{color:${netProfit >= 0 ? "#16a34a" : "#dc2626"}!important}
</style></head><body>
<h1>Reda Store – ${type.charAt(0).toUpperCase() + type.slice(1)} Report</h1>
<p>Period: <strong>${periodLabel}</strong> | Generated: ${new Date().toLocaleString()}</p>
<div class="summary">
<div class="card"><h3>Total Revenue</h3><p>${formatRs(totalRevenue)}</p></div>
<div class="card"><h3>Returns</h3><p>${formatRs(totalReturns)}</p></div>
<div class="card"><h3>Net Revenue</h3><p>${formatRs(netRevenue)}</p></div>
<div class="card"><h3>Cost</h3><p>${formatRs(totalCost)}</p></div>
<div class="card"><h3>Net Profit</h3><p class="profit">${formatRs(netProfit)}</p></div>
<div class="card"><h3>Total Sales</h3><p>${sales.length}</p></div>
</div>
<h2>Sales (${sales.length})</h2>
<table><thead><tr><th>Bill No</th><th>Date/Time</th><th>Items</th><th>Total</th><th>Payment</th></tr></thead>
<tbody>${salesRows || "<tr><td colspan='5' style='text-align:center'>No sales in this period</td></tr>"}</tbody></table>
</body></html>`;

    return new NextResponse(html, { headers: { "Content-Type": "text/html", "X-Report-Period": periodLabel } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
