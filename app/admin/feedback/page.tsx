"use client";


import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Feedback {
  _id: string;
  name: string;
  message: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-lg ${s <= rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );
}

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    const res = await fetch("/api/feedback?admin=true");
    const data = await res.json();
    setFeedback(data.feedback || []);
    setLoading(false);
  };

  useEffect(() => { fetchFeedback(); }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    setUpdating(id);
    await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setFeedback((prev) => prev.map((f) => f._id === id ? { ...f, status } : f));
    setUpdating(null);
  };

  const filtered = filter === "all" ? feedback : feedback.filter((f) => f.status === filter);
  const counts = {
    all: feedback.length,
    pending: feedback.filter((f) => f.status === "pending").length,
    approved: feedback.filter((f) => f.status === "approved").length,
    rejected: feedback.filter((f) => f.status === "rejected").length,
  };

  const avgRating = feedback.filter((f) => f.status === "approved").length > 0
    ? (feedback.filter((f) => f.status === "approved").reduce((s, f) => s + f.rating, 0) / feedback.filter((f) => f.status === "approved").length).toFixed(1)
    : "–";

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
            <p className="text-gray-500 text-sm">Review and approve customer ratings</p>
          </div>
          <div className="card py-3 px-5 text-center">
            <p className="text-2xl font-bold text-yellow-500">⭐ {avgRating}</p>
            <p className="text-xs text-gray-400">Avg approved rating</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors flex items-center gap-1.5 ${
                filter === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
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
            <p className="text-4xl mb-3">💬</p>
            <p>No feedback in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((fb) => (
              <div
                key={fb._id}
                className={`card border-l-4 ${
                  fb.status === "approved" ? "border-l-green-400" :
                  fb.status === "rejected" ? "border-l-red-300" : "border-l-yellow-400"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {fb.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{fb.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(fb.createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <StarDisplay rating={fb.rating} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[fb.status]}`}>
                        {fb.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed pl-12">{fb.message}</p>
                  </div>

                  <div className="flex gap-2 sm:flex-col pl-12 sm:pl-0">
                    {fb.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(fb._id, "approved")}
                        disabled={updating === fb._id}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        ✓ Approve
                      </button>
                    )}
                    {fb.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(fb._id, "rejected")}
                        disabled={updating === fb._id}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        ✕ Reject
                      </button>
                    )}
                    {fb.status !== "pending" && (
                      <button
                        onClick={() => updateStatus(fb._id, "pending")}
                        disabled={updating === fb._id}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        ↺ Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
