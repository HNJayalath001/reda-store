"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Settings { siteName: string; whatsappNumber: string; address: string; email: string; }

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  useEffect(() => { fetch("/api/settings").then(r => r.json()).then(d => setSettings(d.settings)); }, []);

  const siteName = settings?.siteName || "Reda Store";
  const whatsapp = settings?.whatsappNumber || "+94721126526";

  const handleWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hello ${siteName}!\n\nName: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
    );
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
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
            <Link href="/contact" className="text-blue-600">Contact</Link>
            <Link href="/out-of-stock" className="text-gray-500 hover:text-blue-600 transition-colors">Request Item</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-green-100 text-lg">We&apos;re here to help. Reach out anytime.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <div className="space-y-4">
              {settings?.whatsappNumber && (
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl shrink-0">📱</div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">WhatsApp</p>
                    <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{settings.whatsappNumber}</p>
                    <p className="text-xs text-gray-400">Tap to open WhatsApp</p>
                  </div>
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl shrink-0">✉️</div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{settings.email}</p>
                    <p className="text-xs text-gray-400">We reply within 24 hours</p>
                  </div>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl shrink-0">📍</div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Location</p>
                    <p className="font-bold text-gray-900">{settings.address}</p>
                    <p className="text-xs text-gray-400">Sri Lanka</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-green-800 mb-1">💬 Fastest Response</p>
              <p className="text-sm text-green-700">WhatsApp is the quickest way to reach us. We typically respond within minutes during business hours.</p>
            </div>
          </div>

          {/* WhatsApp Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <form onSubmit={handleWhatsApp} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input" placeholder="+94 XX XXX XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="input resize-none" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                📱 Send via WhatsApp
              </button>
              <p className="text-xs text-gray-400 text-center">This will open WhatsApp with your message pre-filled</p>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/out-of-stock" className="hover:text-white transition-colors">Request Item</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
