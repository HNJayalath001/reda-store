"use client";


import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface StockRequest {
  _id: string;
  name: string;
  phone: string;
  itemName: string;
  details?: string;
  status: "pending" | "fulfilled" | "rejected";
  createdAt: string;
}

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  fulfilled: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-600 border-red-200",
};
const BORDER_COLORS = {
  pending: "border-l-yellow-400",
  fulfilled: "border-l-green-400",
  rejected: "border-l-red-300",
};

export default function StockRequestsPage() {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "fulfilled" | "rejected">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await fetch("/api/stock-requests");
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: "pending" | "fulfilled" | "rejected") => {
    setUpdating(id);
    await fetch("/api/stock-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    setUpdating(null);
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    fulfilled: requests.filter(r => r.status === "fulfilled").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const openWhatsApp = (phone: string, itemName: string) => {
    const msg = encodeURIComponent(`Hello! We wanted to let you know that "${itemName}" is now available at Reda Store. Please visit us or reply to order.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Requests</h1>
            <p className="text-gray-500 text-sm">Customer requests for out-of-stock items</p>
          </div>
          {counts.pending > 0 && (
            <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1.5 rounded-full border border-orange-200">
              {counts.pending} pending
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "pending", "fulfilled", "rejected"] as const).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors flex items-center gap-1.5 ${
                filter === tab ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {tab}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === tab ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p>No requests in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => (
              <div key={req._id}
                className={`card border-l-4 ${BORDER_COLORS[req.status]}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border capitalize ${STATUS_COLORS[req.status]}`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(req.createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base mb-1">
                      📦 {req.itemName}
                    </h3>
                    {req.details && (
                      <p className="text-gray-600 text-sm mb-2 italic">{req.details}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-700">
                        <span>👤</span><strong>{req.name}</strong>
                      </span>
                      <button onClick={() => openWhatsApp(req.phone, req.itemName)}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium">
                        <span>📱</span>{req.phone}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    {req.status !== "fulfilled" && (
                      <button onClick={() => updateStatus(req._id, "fulfilled")} disabled={updating === req._id}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap">
                        ✓ Fulfilled
                      </button>
                    )}
                    <button onClick={() => openWhatsApp(req.phone, req.itemName)}
                      className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap">
                      📱 WhatsApp
                    </button>
                    {req.status !== "rejected" && (
                      <button onClick={() => updateStatus(req._id, "rejected")} disabled={updating === req._id}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                        ✕ Reject
                      </button>
                    )}
                    {req.status !== "pending" && (
                      <button onClick={() => updateStatus(req._id, "pending")} disabled={updating === req._id}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                        ↺ Reopen
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick add product link */}
                {req.status === "pending" && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Link href="/admin/products/new"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      ➕ Add this item as a new product →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
