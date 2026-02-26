"use client";


import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface ReportSummary {
  totalRevenue: number;
  totalCost: number;
  totalDiscount: number;
  totalReturns: number;
  netRevenue: number;
  netProfit: number;
  totalSales: number;
  totalReturnCount: number;
}

interface ItemBreakdown {
  productId: string; name: string; qty: number; revenue: number;
}

interface DeadStock {
  _id: string; name: string; sku: string; stockQty: number; sellingPrice: number;
}

interface ReportData {
  summary: ReportSummary;
  itemBreakdown: ItemBreakdown[];
  deadStock: DeadStock[];
}

interface Sale {
  _id: string; billNo: string; total: number; items: { productName: string }[];
  paymentMethod: string; createdAt: string; type: string;
}

function formatRs(n: number) { return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`; }

export default function ReportsPage() {
  const [type, setType] = useState<"daily" | "monthly" | "yearly">("daily");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<ReportData | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    const [reportRes, salesRes] = await Promise.all([
      fetch(`/api/reports?type=${type}&date=${date}`),
      fetch(`/api/sales?limit=50`),
    ]);
    const reportData = await reportRes.json();
    const salesData = await salesRes.json();
    setReport(reportData);
    setSales(salesData.sales || []);
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, [type, date]);

  const handleReturn = async (saleId: string, billNo: string) => {
    if (!confirm(`Return sale ${billNo}? Stock will be restored.`)) return;
    setReturning(saleId);
    const res = await fetch(`/api/sales/${saleId}`, { method: "POST" });
    const data = await res.json();
    setReturning(null);
    if (!res.ok) { alert(data.error); return; }
    alert(`Return processed: ${data.billNo}`);
    fetchReport();
  };

  const exportPDF = () => {
    const url = `/api/reports/export?type=${type}&date=${date}`;
    window.open(url, "_blank");
  };

  const summaryCards = report ? [
    { label: "Total Revenue", value: formatRs(report.summary.totalRevenue), color: "text-blue-600", icon: "💰" },
    { label: "Returns", value: formatRs(report.summary.totalReturns), color: "text-red-500", icon: "↩️" },
    { label: "Net Revenue", value: formatRs(report.summary.netRevenue), color: "text-green-600", icon: "📈" },
    { label: "Total Cost", value: formatRs(report.summary.totalCost), color: "text-orange-500", icon: "💸" },
    { label: "Net Profit", value: formatRs(report.summary.netProfit), color: report.summary.netProfit >= 0 ? "text-green-600" : "text-red-600", icon: "✅" },
    { label: "Total Sales", value: String(report.summary.totalSales), color: "text-purple-600", icon: "🧾" },
  ] : [];

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 text-sm">Sales analytics and profit tracking</p>
          </div>
          <button onClick={exportPDF} className="btn-secondary text-sm">📄 Export Report</button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(["daily", "monthly", "yearly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${type === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type={type === "daily" ? "date" : type === "monthly" ? "month" : "number"}
              value={type === "yearly" ? date.slice(0, 4) : type === "monthly" ? date.slice(0, 7) : date}
              onChange={(e) => {
                const v = e.target.value;
                setDate(type === "yearly" ? `${v}-01-01` : type === "monthly" ? `${v}-01` : v);
              }}
              className="input w-auto"
              min={type === "yearly" ? "2020" : undefined}
              max={type === "yearly" ? new Date().getFullYear().toString() : undefined}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : report ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {summaryCards.map((c) => (
                <div key={c.label} className="card text-center py-4">
                  <p className="text-xl">{c.icon}</p>
                  <p className={`text-base font-bold mt-1 ${c.color}`}>{c.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Items */}
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">Top Selling Items</h2>
                {report.itemBreakdown.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No sales in this period</p>
                ) : (
                  <div className="space-y-2">
                    {report.itemBreakdown.slice(0, 10).map((item, i) => (
                      <div key={item.productId} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        <span className="flex-1 text-sm text-gray-700 truncate">{item.name}</span>
                        <span className="text-xs text-gray-500">{item.qty} pcs</span>
                        <span className="text-sm font-semibold text-gray-900">{formatRs(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dead Stock */}
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">Dead Stock (Not Sold)</h2>
                {report.deadStock.length === 0 ? (
                  <p className="text-green-600 text-sm text-center py-8">✅ All stocked products were sold!</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {report.deadStock.map((item) => (
                      <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                        <div>
                          <p className="text-gray-800 font-medium">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.stockQty} pcs</p>
                          <p className="text-xs text-gray-400">{formatRs(item.sellingPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sales List with Return */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Recent Sales</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Bill No</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Items</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-left">Payment</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sales.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">No sales found</td></tr>
                    ) : (
                      sales.map((sale) => (
                        <tr key={sale._id} className={`hover:bg-gray-50 ${sale.type === "RETURN" ? "bg-red-50/30" : ""}`}>
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">{sale.billNo}</td>
                          <td className="px-4 py-3 text-gray-600">{new Date(sale.createdAt).toLocaleString("en-LK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-4 py-3 text-gray-600">{sale.items.length} item(s)</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatRs(sale.total)}</td>
                          <td className="px-4 py-3 capitalize text-gray-600">{sale.paymentMethod}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sale.type === "RETURN" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                              {sale.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {sale.type === "SALE" && (
                              <button
                                onClick={() => handleReturn(sale._id, sale.billNo)}
                                disabled={returning === sale._id}
                                className="text-xs text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
                              >
                                {returning === sale._id ? "..." : "↩ Return"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
