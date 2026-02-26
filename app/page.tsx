"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────── */
/* Types */
/* ─────────────────────────────────────────────────────────────── */

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  sellingPrice: number;
  stockQty: number;
  imageFileIds: string[];
  videoUrl?: string;
  isOutOfStock?: boolean;
}

interface Settings {
  siteName?: string;
  whatsappNumber?: string;
  bannerImages?: string[];
  sliderImages?: string[];
  address?: string;
  email?: string;
  footerText?: string;
}

interface FeedbackItem {
  _id: string;
  name: string;
  message: string;
  rating: number;
  createdAt: string;
}

interface StockReq {
  _id: string;
  name: string;
  itemName: string;
}

/* ─────────────────────────────────────────────────────────────── */
/* Helpers */
/* ─────────────────────────────────────────────────────────────── */

const formatRs = (n: number) =>
  `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return m ? m[1] : null;
}

function Stars({ r, big }: { r: number; big?: boolean }) {
  return (
    <span className="inline-flex gap-px" suppressHydrationWarning>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`${big ? "text-xl" : "text-sm"} leading-none ${s <= r ? "text-yellow-400" : "text-gray-200"
            }`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHov(s)}
          onMouseLeave={() => setHov(0)}
          className={`text-3xl leading-none transition-colors ${s <= (hov || value) ? "text-yellow-400" : "text-gray-200"
            }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function WaIcon({ cls = "w-5 h-5" }: { cls?: string }) {
  return (
    <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.011L2 22l5.14-1.316A9.993 9.993 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.98 7.98 0 0 1-4.174-1.177l-.299-.178-3.051.782.82-3.027-.194-.314A8 8 0 1 1 12 20z" />
    </svg>
  );
}

function Img({
  src,
  alt,
  size = 18,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        display: "inline-block",
        objectFit: "contain",
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Product Modal */
/* ─────────────────────────────────────────────────────────────── */

function ProductModal({
  p,
  wa,
  onClose,
}: {
  p: Product;
  wa: string;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const ytId = p.videoUrl ? getYouTubeId(p.videoUrl) : null;

  useEffect(() => {
    setShareUrl(`${window.location.origin}/product/${p._id}`);
  }, [p._id]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isOOS = p.stockQty <= 0 || p.isOutOfStock;

  const msg = encodeURIComponent(
    `Hi! I'm interested in:\n*${p.name}*\nPrice: ${formatRs(
      p.sellingPrice
    )}\n\nProduct link: ${shareUrl || ""}\n\nPlease confirm availability.`
  );

  const waLink = `https://wa.me/${wa.replace(/[^0-9]/g, "")}?text=${msg}`;

  const copy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900 line-clamp-1 pr-2 text-sm">
            {p.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 shrink-0 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Media */}
          {p.imageFileIds.length > 0 || ytId ? (
            <div>
              {ytId && (
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setShowVideo(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors ${!showVideo
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <Img src="/images/photos.svg" alt="Photos" size={14} />
                    Photos
                  </button>
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors ${showVideo
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                      }`}
                  >
                    <Img src="/images/video.svg" alt="Video" size={14} />
                    Video
                  </button>
                </div>
              )}

              {showVideo && ytId ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                    title="Product video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : p.imageFileIds.length > 0 ? (
                <div>
                  <div className="w-full h-56 bg-gray-50 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/images/${p.imageFileIds[idx]}`}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {p.imageFileIds.length > 1 && (
                    <div className="flex gap-2 mt-2 justify-center flex-wrap">
                      {p.imageFileIds.map((fid, i) => (
                        <button
                          key={fid}
                          onClick={() => setIdx(i)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === idx ? "border-blue-600" : "border-gray-200"
                            }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/images/${fid}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center text-5xl text-gray-200">
              📦
            </div>
          )}

          {/* Info */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {p.category}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {p.brand}
            </span>

            {isOOS ? (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                Out of Stock
              </span>
            ) : p.stockQty <= 5 ? (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                Only {p.stockQty} left
              </span>
            ) : (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                In Stock
              </span>
            )}

            {ytId && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                ▶ Video
              </span>
            )}
          </div>

          <p className="text-2xl font-bold text-blue-600">
            {formatRs(p.sellingPrice)}
          </p>

          {p.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {p.description}
            </p>
          )}

          <div className="space-y-2 pt-1">
            {!isOOS ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors border border-green-600"
              >
                <WaIcon /> Order via WhatsApp
              </a>
            ) : (
              <a
                href="/out-of-stock"
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors border border-orange-600"
              >
                <Img src="/images/requestorder.svg" alt="Request" size={18} />{" "}
                Request When Available
              </a>
            )}

            <div className="flex gap-2">
              <button
                onClick={copy}
                className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                <Img src="/images/copylink.svg" alt="Copy" size={15} />
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={`/product/${p._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 text-gray-600 text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
              >
                <Img src="/images/fullpage.svg" alt="Full Page" size={15} />
                Full Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Request Section */
/* ─────────────────────────────────────────────────────────────── */

function RequestSection({
  requests,
  onNewRequest,
}: {
  requests: StockReq[];
  onNewRequest: (r: StockReq) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    itemName: "",
    details: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSending(true);

    const res = await fetch("/api/stock-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setErr(data.error || "Failed");
      return;
    }

    setDone(true);
    onNewRequest({
      _id: Date.now().toString(),
      name: form.name,
      itemName: form.itemName,
    });

    setForm({ name: "", phone: "", itemName: "", details: "" });

    setTimeout(() => {
      setDone(false);
      setShowForm(false);
    }, 3000);
  };

  return (
    <section className="bg-orange-50 border-t border-orange-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Requests
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Items customers are looking for
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setDone(false);
              setErr("");
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            {showForm ? "✕ Close" : "+ Request Item"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 mb-6 shadow-sm">
            {done ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-bold text-gray-900 text-lg">
                  Request submitted!
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  We will contact you when it becomes available.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 mb-4">
                  Request an Item
                </h3>
                <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={30}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="+94 77 123 4567"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Item Name / Model / Part No *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={form.itemName}
                      onChange={(e) =>
                        setForm({ ...form, itemName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="e.g. Charger / Headphones / Speaker model..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Additional Details
                    </label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={form.details}
                      onChange={(e) =>
                        setForm({ ...form, details: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      placeholder="Brand, color, specs, etc…"
                    />
                  </div>

                  {err && (
                    <p className="sm:col-span-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      {err}
                    </p>
                  )}

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                      {sending ? "Submitting…" : "Submit Request"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm">No pending requests yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {requests.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm"
              >
                <p className="font-semibold text-gray-900 text-sm">
                  {r.itemName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Requested by {r.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Main Page */
/* ─────────────────────────────────────────────────────────────── */

export default function StorefrontPage() {
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState("All");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Product | null>(null);

  const [sliderIdx, setSliderIdx] = useState(0);
  const [showOOS, setShowOOS] = useState(false);

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [requests, setRequests] = useState<StockReq[]>([]);

  const [fbForm, setFbForm] = useState({ name: "", message: "", rating: 0 });
  const [fbSending, setFbSending] = useState(false);
  const [fbDone, setFbDone] = useState(false);
  const [fbErr, setFbErr] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Your social links
  const INSTAGRAM_URL =
    "https://www.instagram.com/redasstore_official?igsh=MXAyeWZ4ajR4Z2l0NQ==";
  const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61556321730811";

  const bannerRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const requestsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const LIMIT = 20;

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  // initial fetch
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch(() => { });

    fetch("/api/feedback")
      .then((r) => r.json())
      .then((d) => setFeedbacks(d.feedback || []))
      .catch(() => { });

    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => { });

    fetch("/api/stock-requests?public=true")
      .then((r) => r.json())
      .then((d) => setRequests((d.requests || []).slice(0, 6)))
      .catch(() => { });
  }, []);

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

  /* ✅ FIXED: safe slider interval (no settings! crash) */
  useEffect(() => {
    const len = settings?.sliderImages?.length ?? 0;
    if (len === 0) return;

    const t = setInterval(() => {
      setSliderIdx((i) => (i + 1) % len);
    }, 4000);

    return () => clearInterval(t);
  }, [settings?.sliderImages]);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const submitFb = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fbForm.rating) {
      setFbErr("Please choose a star rating");
      return;
    }

    setFbErr("");
    setFbSending(true);

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fbForm),
    });

    const data = await res.json();
    setFbSending(false);

    if (!res.ok) {
      setFbErr(data.error || "Failed");
      return;
    }

    setFbDone(true);
    setFbForm({ name: "", message: "", rating: 0 });
  };

  const siteName = settings?.siteName || "Reda Store";

  // WhatsApp number (API preferred)
  const wa = settings?.whatsappNumber || "+94721126526";
  const waClean = wa.replace(/[^0-9]/g, "");

  const avg =
    feedbacks.length > 0
      ? (
        feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
      ).toFixed(1)
      : null;

  const navItems = [
    { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Products", action: () => scroll(productsRef) },
    { label: "Contact Us", action: () => scroll(contactRef) },
    { label: "About", action: () => scroll(aboutRef) },
    { label: "Reviews", action: () => scroll(reviewsRef) },
  ];

  const bannerLen = settings?.bannerImages?.length ?? 0;
  const sliderLen = settings?.sliderImages?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-3">
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

          {/* Search bar desktop */}
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
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="md:hidden p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileMenuOpen ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>

            {/* WhatsApp */}
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
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
              >
                Instagram
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        )}

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg absolute left-0 right-0">
            <nav className="flex flex-col p-3 gap-1">
              {navItems.map((n) => (
                <button
                  key={n.label}
                  onClick={n.action}
                  className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors text-left"
                >
                  {n.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ✅ FIXED BANNER (no TS error) */}
      <div ref={bannerRef}>
        {bannerLen > 0 && (
          <section className="w-full max-h-80 overflow-hidden bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/images/${settings?.bannerImages?.[0]}`}
              alt="Banner"
              className="w-full object-cover max-h-80"
            />
          </section>
        )}
      </div>

      {/* PRODUCTS */}
      <section ref={productsRef} className="max-w-7xl mx-auto px-3 sm:px-4 pt-6 pb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Our Products</h2>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 border-2 shadow-sm
                  ${category === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            {!loading && total > 0 ? `${products.length} of ${total} products` : ""}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product) => {
            const isOOS = product.stockQty <= 0 || product.isOutOfStock;
            const hasVideo = !!(product.videoUrl && getYouTubeId(product.videoUrl));
            return (
              <button
                key={product._id}
                onClick={() => setSelected(product)}
                className="bg-white rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-left overflow-hidden group"
              >
                <div className="relative w-full h-36 bg-gray-50 overflow-hidden">
                  {product.imageFileIds.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/images/${product.imageFileIds[0]}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-200">📦</div>
                  )}

                  {hasVideo && (
                    <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ▶ VIDEO
                    </div>
                  )}

                  {isOOS && (
                    <div className="absolute inset-0 bg-black/50 flex items-end p-2">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-2.5">
                  <p className="text-[10px] text-gray-400 truncate">{product.brand}</p>
                  <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.2rem] mt-0.5">
                    {product.name}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <p className="text-blue-600 font-bold text-xs">{formatRs(product.sellingPrice)}</p>
                    {!isOOS && product.stockQty <= 5 && (
                      <span className="text-[10px] text-orange-500 font-medium shrink-0">
                        {product.stockQty} left
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex justify-center mt-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-sm font-medium">No products found</p>
            {search && <p className="text-xs mt-1">Try a different search term</p>}
          </div>
        )}

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
      <section ref={reviewsRef} className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            {mounted && avg && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-5xl font-bold text-yellow-400">{avg}</span>
                <div>
                  <Stars r={Math.round(Number(avg))} big />
                  <p className="text-xs text-gray-400 mt-1">
                    {feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-3">What customers say</h3>
              {feedbacks.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                  <p className="text-2xl mb-1">💬</p>
                  <p className="text-sm">No reviews yet — be the first!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {feedbacks.map((fb) => (
                    <div key={fb._id} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {fb.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <p className="font-semibold text-gray-900 text-sm">{fb.name}</p>
                            <div className="flex items-center gap-1.5">
                              <Stars r={fb.rating} />
                              {mounted && (
                                <span className="text-[10px] text-gray-400">
                                  {new Date(fb.createdAt).toLocaleDateString("en-LK", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed mt-1">{fb.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Write a review</h3>
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                {fbDone ? (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">🎉</p>
                    <p className="font-bold text-gray-900">Thank you!</p>
                    <p className="text-gray-500 text-sm mt-1">Pending admin approval.</p>
                    <button
                      onClick={() => setFbDone(false)}
                      className="mt-4 text-blue-600 text-sm hover:underline"
                    >
                      Write another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitFb} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={fbForm.name}
                        onChange={(e) => setFbForm({ ...fbForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Rating *
                      </label>
                      <StarPicker
                        value={fbForm.rating}
                        onChange={(v) => setFbForm({ ...fbForm, rating: v })}
                      />
                      {fbForm.rating > 0 && (
                        <p className="text-xs text-blue-600 mt-0.5">
                          {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][fbForm.rating]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Your Review *
                      </label>
                      <textarea
                        required
                        rows={3}
                        minLength={5}
                        maxLength={1000}
                        value={fbForm.message}
                        onChange={(e) => setFbForm({ ...fbForm, message: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Share your experience…"
                      />
                      <p className="text-[10px] text-right text-gray-400">{fbForm.message.length}/1000</p>
                    </div>

                    {fbErr && (
                      <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {fbErr}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={fbSending}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {fbSending ? "Submitting…" : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REQUESTS */}
      <div ref={requestsRef}>
        <RequestSection
          requests={requests}
          onNewRequest={(r) => setRequests((prev) => [r, ...prev].slice(0, 6))}
        />
      </div>

      {/* ABOUT */}
      <section ref={aboutRef} className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About Us</h2>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.png"
                  alt="Reda Store"
                  width={52}
                  height={52}
                  className="rounded-2xl shadow object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/logo.svg";
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{siteName}</h3>
                  <p className="text-blue-600 text-sm font-medium">
                    Electronics · Accessories · Wholesale & Retail
                  </p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed text-sm mb-3">
                {siteName} is a Sri Lanka based electronics store offering both retail and wholesale.
                We focus on quality tech products like mobile accessories, chargers, headphones,
                gadgets, and more — with friendly support and fair pricing.
              </p>

              <p className="text-gray-600 leading-relaxed text-sm">
                Ordering is simple: message us on WhatsApp, get a fast response, confirm stock, and
                receive island-wide delivery across Sri Lanka.
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                >
                  <span>📷</span> Instagram
                </a>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <span>f</span> Facebook
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { i: "⚡", t: "Fast Response", d: "Quick WhatsApp support" },
                { i: "💰", t: "Best Prices", d: "Competitive pricing" },
                { i: "🚚", t: "Island-wide", d: "Delivery across Sri Lanka" },
                { i: "🔒", t: "Trusted Seller", d: "100s of happy customers" },
                { i: "📱", t: "Easy Ordering", d: "Order directly via WhatsApp" },
                { i: "✅", t: "Quality Items", d: "Carefully selected products" },
              ].map((x) => (
                <div key={x.t} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xl mb-1">{x.i}</p>
                  <p className="font-semibold text-gray-900 text-xs">{x.t}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section ref={contactRef} className="bg-gray-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href={`https://wa.me/${waClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-2xl p-5 transition-colors"
            >
              <div className="w-12 h-12 mb-3 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Img src="/images/mobile.svg" alt="WhatsApp" size={28} />
              </div>
              <p className="font-bold text-sm mb-1">WhatsApp</p>
              <p className="text-green-400 text-sm">{wa}</p>
              <p className="text-gray-400 text-xs mt-1">Tap to chat now →</p>
            </a>

            {!!settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="flex flex-col bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-2xl p-5 transition-colors"
              >
                <div className="w-12 h-12 mb-3 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Img src="/images/email.svg" alt="Email" size={28} />
                </div>
                <p className="font-bold text-sm mb-1">Email</p>
                <p className="text-blue-400 text-sm break-all">{settings.email}</p>
              </a>
            )}

            {!!settings?.address && (
              <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="w-12 h-12 mb-3 bg-white/10 rounded-xl flex items-center justify-center">
                  <Img src="/images/location.svg" alt="Location" size={28} />
                </div>
                <p className="font-bold text-sm mb-1">Location</p>
                <p className="text-gray-400 text-sm">{settings.address}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ✅ FIXED GALLERY */}
      {sliderLen > 0 && (
        <section className="bg-white border-t border-gray-100 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Gallery</h2>

            <div className="relative w-full h-52 sm:h-72 rounded-2xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/images/${settings?.sliderImages?.[sliderIdx]}`}
                alt="Gallery"
                className="w-full h-full object-cover"
              />

              {sliderLen > 1 && (
                <>
                  <button
                    onClick={() => setSliderIdx((i) => (i - 1 + sliderLen) % sliderLen)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xl"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSliderIdx((i) => (i + 1) % sliderLen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xl"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {(settings?.sliderImages || []).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSliderIdx(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === sliderIdx ? "bg-white" : "bg-white/40"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

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
      {selected && <ProductModal p={selected} wa={wa} onClose={() => setSelected(null)} />}
    </div>
  );
}