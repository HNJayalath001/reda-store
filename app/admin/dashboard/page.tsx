"use client";


import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface DashStats {
  totalProducts: number;
  outOfStockCount: number;
  todayRevenue: number;
  todaySales: number;
  todayProfit: number;
}

function formatRs(n: number) {
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      fetch("/api/admin/products?limit=1").then((r) => r.json()),
      fetch("/api/admin/products?limit=1&outOfStock=true").then((r) => r.json()),
      fetch(`/api/reports?type=daily&date=${today}`).then((r) => r.json()),
      fetch("/api/stock-requests").then((r) => r.json()),
    ]).then(([allProds, oos, report, stockReqs]) => {
      setStats({
        totalProducts: allProds.total || 0,
        outOfStockCount: oos.total || 0,
        todayRevenue: report.summary?.netRevenue || 0,
        todaySales: report.summary?.totalSales || 0,
        todayProfit: report.summary?.netProfit || 0,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "Total Products", value: stats?.totalProducts ?? "–", icon: "📦", color: "bg-blue-500", href: "/admin/products" },
    { label: "Out of Stock", value: stats?.outOfStockCount ?? "–", icon: "⚠️", color: "bg-red-500", href: "/admin/products?outOfStock=true" },
    { label: "Today Revenue", value: stats ? formatRs(stats.todayRevenue) : "–", icon: "💰", color: "bg-green-500", href: "/admin/reports" },
    { label: "Today Sales", value: stats?.todaySales ?? "–", icon: "🧾", color: "bg-purple-500", href: "/admin/reports" },
    { label: "Today Profit", value: stats ? formatRs(stats.todayProfit) : "–", icon: "📈", color: "bg-orange-500", href: "/admin/reports" },
  ];

  const quickActions = [
    { href: "/admin/products/new", label: "Add Product", icon: "➕" },
    { href: "/admin/products", label: "All Products", icon: "📦" },
    { href: "/admin/pos", label: "Open POS", icon: "🧾" },
    { href: "/admin/reports", label: "View Reports", icon: "📊" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Welcome back! Here&apos;s your store overview.</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
              <Link key={card.label} href={card.href} className="card hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-xl mb-3`}>
                  {card.icon}
                </div>
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="card">
            <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl px-4 py-3 text-sm font-medium transition-colors border border-gray-100 hover:border-blue-200"
                >
                  <span className="text-lg">{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-base font-bold text-gray-900 mb-4">System Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Store</span>
                <span className="font-medium">Reda Store</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Today&apos;s Date</span>
                <span className="font-medium">{new Date().toLocaleDateString("en-LK", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Platform</span>
                <span className="font-medium">Next.js + MongoDB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Version</span>
                <span className="font-medium text-green-600">✓ Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
