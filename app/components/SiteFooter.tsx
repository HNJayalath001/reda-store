"use client";

import Link from "next/link";

interface SiteFooterProps {
  siteName: string;
}

export function SiteFooter({ siteName }: SiteFooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
        <p>
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>

        <div className="flex gap-4">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/out-of-stock" className="hover:text-white transition-colors">
            Request Item
          </Link>
        </div>
      </div>
    </footer>
  );
}