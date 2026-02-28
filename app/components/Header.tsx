"use client";

import { RefObject, useState } from "react";
import { WaIcon } from "./ui";

interface NavItem {
  label: string;
  action: () => void;
}

interface HeaderProps {
  siteName: string;
  waClean: string;
  search: string;
  onSearchChange: (v: string) => void;
  navItems: NavItem[];
  instagramUrl: string;
  facebookUrl: string;
}

export function Header({
  siteName,
  waClean,
  search,
  onSearchChange,
  navItems,
  instagramUrl,
  facebookUrl,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-3">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 shrink-0 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Reda Store"
            width={36}
            height={36}
            className="rounded-xl object-cover shadow-sm ring-2 ring-blue-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/logo.svg";
            }}
          />
          <span className="font-extrabold text-gray-900 text-base hidden sm:block tracking-tight group-hover:text-blue-600 transition-colors">
            {siteName}
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 ml-1">
          {navItems.map((n) => (
            <button
              key={n.label}
              onClick={n.action}
              className="px-2.5 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm">
          <div className="relative w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="md:hidden p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${waClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-full transition-colors shadow-sm"
          >
            <WaIcon />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Mobile search dropdown */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-gray-100 pt-2 bg-white">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
            >
              Instagram
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      )}

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg absolute left-0 right-0">
          <nav className="flex flex-col p-3 gap-1">
            {navItems.map((n) => (
              <button
                key={n.label}
                onClick={() => {
                  n.action();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors text-left"
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
