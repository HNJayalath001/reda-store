"use client";

import React from "react";
import type { Settings } from "../types"; // ✅ adjust if your types path is different

type ContactSectionProps = {
  wa: string;
  waClean: string;
  settings: Settings | null;
};

export function ContactSection({ wa, waClean, settings }: ContactSectionProps) {
  const siteName = settings?.siteName || "Reda Store";
  const email = settings?.email;

  return (
    <section className="bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
        <p className="text-gray-400 text-sm mb-8">Get in touch with {siteName}</p>

        <div className="flex flex-wrap items-center justify-center gap-8">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${waClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition">
              📞
            </div>
            <span className="text-sm font-medium group-hover:text-green-400 transition">
              {wa}
            </span>
          </a>

          {/* Email */}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition">
                ✉️
              </div>
              <span className="text-sm group-hover:text-blue-400 transition">{email}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}