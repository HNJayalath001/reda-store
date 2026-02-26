"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Settings { siteName: string; whatsappNumber: string; }

export default function OutOfStockPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", itemName: "", details: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/settings").then(r => r.json()).then(d => setSettings(d.settings)); }, []);

  const siteName = settings?.siteName || "Reda Store";
  const whatsapp = settings?.whatsappNumber || "+94721126526";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/stock-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed to submit"); return; }
    setSuccess(true);
    setForm({ name: "", phone: "", itemName: "", details: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">R</div>
            <span className="text-lg font-bold text-gray-900">{siteName}</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/about" className="text-gray-500 hover:text-blue-600 transition-colors">About</Link>
            <Link href="/contact" className="text-gray-500 hover:text-blue-600 transition-colors">Contact</Link>
            <Link href="/out-of-stock" className="text-blue-600">Request Item</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-700 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-5xl mb-3">📦</p>
          <h1 className="text-4xl font-bold mb-3">Can&apos;t Find What You Need?</h1>
          <p className="text-orange-100 text-lg">Submit a request and we&apos;ll notify you when the item is back in stock or source it for you.</p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-14">
        {success ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
            <p className="text-5xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">We&apos;ve received your request. Our team will contact you as soon as the item is available.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setSuccess(false)} className="btn-secondary px-6">Submit Another</button>
              <Link href="/" className="btn-primary px-6 text-center">Browse Products</Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <span className="text-xl shrink-0">💡</span>
              <div className="text-sm text-orange-800">
                <p className="font-semibold">How it works</p>
                <p>Fill in the form below. Our team will check availability and WhatsApp you directly when the item is ready.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
              <h2 className="text-xl font-bold text-gray-900">Request an Item</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input" placeholder="Your full name" maxLength={80} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp *</label>
                  <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input" placeholder="+94 XX XXX XXXX" maxLength={30} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name / Part Number *</label>
                <input type="text" required value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })}
                  className="input" placeholder="e.g. NGK Spark Plug BKR6E, Toyota Corolla brake pads..." maxLength={200} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                <textarea rows={3} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })}
                  className="input resize-none" maxLength={500}
                  placeholder="Vehicle model, year, quantity needed, urgency level, etc." />
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? "Submitting..." : "📦 Submit Request"}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Or message us directly on WhatsApp</p>
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello! I'm looking for an item that is out of stock.")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm hover:text-green-700">
                  📱 {whatsapp}
                </a>
              </div>
            </form>
          </div>
        )}
      </section>

      <footer className="bg-gray-900 text-white py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
