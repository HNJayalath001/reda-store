"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Settings {
  siteName: string;
  whatsappNumber: string;
  address: string;
  email: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

export default function AboutPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => setSettings(null));
  }, []);

  const siteName = settings?.siteName || "Reda Store";

  // ✅ UPDATED LINKS
  const whatsapp = settings?.whatsappNumber || "+94721126526";
  const facebook =
    settings?.facebookUrl ||
    "https://www.facebook.com/profile.php?id=61556321730811";
  const instagram =
    settings?.instagramUrl ||
    "https://www.instagram.com/redasstore_official?igsh=MXAyeWZ4ajR4Z2l0NQ==";

  const features = [
    { icon: "⚡", title: "Fast Response", desc: "Quick WhatsApp support" },
    {
      icon: "💰",
      title: "Best Prices",
      desc: "Competitive pricing (retail & wholesale)",
    },
    { icon: "🚚", title: "Island-wide Delivery", desc: "Delivery across Sri Lanka" },
    { icon: "🔒", title: "Trusted Seller", desc: "100s of happy customers" },
    { icon: "📱", title: "Easy Ordering", desc: "Order directly via WhatsApp" },
  ];

  const categories = [
    { icon: "📱", name: "Electronics" },
    { icon: "🎧", name: "Accessories" },
    { icon: "🔌", name: "Chargers" },
    { icon: "🧰", name: "Gadgets" },
    { icon: "📦", name: "Other" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="text-lg font-bold text-gray-900">{siteName}</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-blue-600">
              About
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-blue-600 transition-colors">
              Contact
            </Link>
            <Link
              href="/out-of-stock"
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              Request Item
            </Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12c0 4.84 3.44 8.84 7.94 9.8v-6.93H7.9v-2.87h2.99V9.41c0-2.96 1.76-4.59 4.45-4.59 1.29 0 2.64.23 2.64.23v2.9h-1.49c-1.47 0-1.93.92-1.93 1.86v2.24h3.28l-.52 2.87h-2.76V21.8C18.56 20.84 22 16.84 22 12z" />
              </svg>
            </a>

            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-500 hover:text-pink-500 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zm5.2-3.7a1.2 1.2 0 1 0 1.2 1.2 1.2 1.2 0 0 0-1.2-1.2z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* CTA WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow-xl font-bold transition-all"
        >
          📱 WhatsApp Us
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}