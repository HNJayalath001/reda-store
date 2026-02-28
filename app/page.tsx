"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Product, Settings, FeedbackItem, StockReq } from "./types";
import { getYouTubeId } from "./utils";

import { Header } from "./components/Header";
import { ProductCard } from "./components/ProductCard";
import { ProductModal } from "./components/ProductModal";
import { ReviewsSection } from "./components/ReviewsSection";
import { RequestSection } from "./components/RequestSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { GallerySection } from "./components/GallerySection";
import { WaIcon } from "./components/ui";

/* ── Constants ── */
const INSTAGRAM_URL =
  "https://www.instagram.com/redasstore_official?igsh=MXAyeWZ4ajR4Z2l0NQ==";
const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61556321730811";
const LIMIT = 20;

/* ── Page ── */
export default function StorefrontPage() {
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showOOS, setShowOOS] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Product | null>(null);

  const [sliderIdx, setSliderIdx] = useState(0);

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [requests, setRequests] = useState<StockReq[]>([]);

  /* ── Refs ── */
  const productsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const requestsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  /* ── Helpers ── */
  const scroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const siteName = settings?.siteName || "Reda Store";
  const wa = settings?.whatsappNumber || "+94721126526";
  const waClean = wa.replace(/[^0-9]/g, "");
  const sliderImages = settings?.sliderImages ?? [];
  const sliderLen = sliderImages.length;

  /* ── Nav items ── */
  const navItems = [
    {
      label: "Home",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    { label: "Products", action: () => scroll(productsRef) },
    { label: "Contact Us", action: () => scroll(contactRef) },
    { label: "About", action: () => scroll(aboutRef) },
    { label: "Reviews", action: () => scroll(reviewsRef) },
  ];

  /* ── Mount ── */
  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  /* ── Initial data fetches ── */
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch(() => {});

    fetch("/api/feedback")
      .then((r) => r.json())
      .then((d) => setFeedbacks(d.feedback || []))
      .catch(() => {});

    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});

    fetch("/api/stock-requests?public=true")
      .then((r) => r.json())
      .then((d) => setRequests((d.requests || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  /* ── Product fetch ── */
  const doFetch = useCallback(
    async (pg: number, reset: boolean) => {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(pg),
        limit: String(LIMIT),
        ...(search && { search }),
        ...(category !== "All" && { category }),
        ...(showOOS ? { includeOutOfStock: "true" } : {}),
      });

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      setProducts((prev) =>
        reset ? data.products || [] : [...prev, ...(data.products || [])]
      );
      setTotal(data.total || 0);
      setLoading(false);
    },
    [search, category, showOOS]
  );

  useEffect(() => {
    setPage(1);
    doFetch(1, true);
  }, [search, category, showOOS, doFetch]);

  /* ── Slider auto-advance ── */
  useEffect(() => {
    if (sliderLen === 0) return;
    const t = setInterval(() => {
      setSliderIdx((i) => (i + 1) % sliderLen);
    }, 4000);
    return () => clearInterval(t);
  }, [sliderLen]);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* HEADER */}
      <Header
        siteName={siteName}
        waClean={waClean}
        search={search}
        onSearchChange={setSearch}
        navItems={navItems}
        instagramUrl={INSTAGRAM_URL}
        facebookUrl={FACEBOOK_URL}
      />

      {/* BANNER */}
      {(settings?.bannerImages?.length ?? 0) > 0 && (
        <section className="w-full max-h-80 overflow-hidden bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/images/${settings?.bannerImages?.[0]}`}
            alt="Banner"
            className="w-full object-cover max-h-80"
          />
        </section>
      )}

      {/* PRODUCTS */}
      <section
        ref={productsRef}
        className="max-w-7xl mx-auto px-3 sm:px-4 pt-6 pb-10"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Our Products</h2>

        {/* Category filter */}
        {categories.length > 0 && (
          <div
            className="flex gap-2 overflow-x-auto pb-2 mb-3"
            style={{ scrollbarWidth: "none" }}
          >
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 border-2 shadow-sm
                  ${
                    category === cat
                      ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            {!loading && total > 0
              ? `${products.length} of ${total} products`
              : ""}
          </p>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOOS}
              onChange={(e) => setShowOOS(e.target.checked)}
              className="accent-blue-600 w-3.5 h-3.5"
            />
            Show out of stock
          </label>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={() => setSelected(product)}
            />
          ))}
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center mt-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-sm font-medium">No products found</p>
            {search && (
              <p className="text-xs mt-1">Try a different search term</p>
            )}
          </div>
        )}

        {/* Load more */}
        {!loading && products.length < total && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                const np = page + 1;
                setPage(np);
                doFetch(np, false);
              }}
              className="px-8 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-full transition-colors"
            >
              Load More ({total - products.length} more)
            </button>
          </div>
        )}
      </section>

      {/* REVIEWS */}
      <div ref={reviewsRef}>
        <ReviewsSection
          feedbacks={feedbacks}
          mounted={mounted}
          onNewFeedback={(fb) => setFeedbacks((prev) => [fb, ...prev])}
        />
      </div>

      {/* REQUESTS */}
      <div ref={requestsRef}>
        <RequestSection
          requests={requests}
          onNewRequest={(r) => setRequests((prev) => [r, ...prev].slice(0, 6))}
        />
      </div>

      {/* ABOUT */}
     <AboutSection
  siteName={siteName}
  instagramUrl={INSTAGRAM_URL}
  facebookUrl={FACEBOOK_URL}
/>

      {/* CONTACT */}
      <div ref={contactRef}>
<ContactSection wa={wa} waClean={waClean} settings={settings} />
      </div>

      {/* GALLERY */}
      <GallerySection
        sliderImages={sliderImages}
        sliderIdx={sliderIdx}
        onPrev={() =>
          setSliderIdx((i) => (i - 1 + sliderLen) % sliderLen)
        }
        onNext={() => setSliderIdx((i) => (i + 1) % sliderLen)}
        onDot={(i) => setSliderIdx(i)}
      />

      {/* FOOTER */}
      <footer className="bg-gray-950 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 mb-6 text-center text-gray-500 text-xs">
          {settings?.footerText ||
            `© ${mounted ? currentYear : ""} ${siteName}. All rights reserved.`}
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${waClean}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-5 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <WaIcon cls="w-7 h-7 text-white" />
      </a>

      {/* Product Modal */}
      {selected && (
        <ProductModal
          p={selected}
          wa={wa}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
