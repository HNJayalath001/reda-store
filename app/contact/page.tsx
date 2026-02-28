"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/app/components/SiteFooter";

interface Settings {
  siteName: string;
  whatsappNumber: string;
  address: string;
  email: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => setSettings(null));
  }, []);

  const siteName = settings?.siteName || "Reda Store";
  const whatsapp = settings?.whatsappNumber || "+94721126526";
  const waClean = whatsapp.replace(/[^0-9]/g, "");

  const insta =
    settings?.instagramUrl || "https://www.instagram.com/redastore.lk";
  const fb =
    settings?.facebookUrl || "https://www.facebook.com/redastore.lk";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="text-lg font-bold text-gray-900">
              {siteName}
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-gray-500 hover:text-blue-600">
              Home
            </Link>
            <Link href="/about" className="text-gray-500 hover:text-blue-600">
              About
            </Link>
            <Link href="/contact" className="text-blue-600">
              Contact
            </Link>
            <Link href="/out-of-stock" className="text-gray-500 hover:text-blue-600">
              Request Item
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-green-100 text-lg">
            We're here to help. Reach out anytime.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-4 py-14 flex-1">
        <div className="space-y-6">

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${waClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-300 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
              📞
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">WhatsApp</p>
              <p className="font-bold text-gray-900">{whatsapp}</p>
            </div>
          </a>

          {/* Email */}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
                ✉️
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Email</p>
                <p className="font-bold text-gray-900">{settings.email}</p>
              </div>
            </a>
          )}

          {/* Social */}
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href={insta}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-5 text-center shadow-md"
            >
              📷 Instagram
            </a>

            <a
              href={fb}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 text-white rounded-2xl p-5 text-center shadow-md"
            >
              f Facebook
            </a>
          </div>

        </div>
      </section>

      {/* Footer Component */}
      <SiteFooter siteName={siteName} />

    </div>
  );
}