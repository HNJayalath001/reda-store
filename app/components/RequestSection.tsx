"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { StockReq } from "../types";

interface RequestSectionProps {
  requests: StockReq[];
  onNewRequest: (r: StockReq) => void;
}

export function RequestSection({ requests, onNewRequest }: RequestSectionProps) {
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

  // keep ref (still used for normal mode slider)
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // + mode paging
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 3;

  // newest first (optional)
  const list = useMemo(() => {
    return [...requests].reverse();
  }, [requests]);

  const maxPage = Math.max(0, Math.ceil(list.length / PAGE_SIZE) - 1);

  const visible3 = useMemo(() => {
    const start = page * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [list, page]);

  const scrollSlider = (dir: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;

    el.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  const submit = async (e: FormEvent) => {
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
    }, 2500);
  };

  return (
    <section className="bg-orange-50 border-t border-orange-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Requests
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Items customers are looking for
            </p>
          </div>

          {/* + button */}
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setDone(false);
              setErr("");
              setPage(0); // reset first 3 when open
            }}
            className="shrink-0 w-11 h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl flex items-center justify-center shadow-sm"
            aria-label={showForm ? "Close request form" : "Open request form"}
            title={showForm ? "Close" : "Request Item"}
          >
            {showForm ? "✕" : "+"}
          </button>
        </div>

        {/* ✅ When + clicked: Left = display 3 requests (NO SCROLLBAR) | Right = form */}
        {showForm ? (
          <div className="grid md:grid-cols-[1fr,420px] gap-6 items-start">
            {/* LEFT: 3 cards + arrows (no scrollbar) */}
            <div className="w-full">
              {list.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-sm">No pending requests yet.</p>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-orange-200 shadow-sm flex items-center justify-center hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Previous requests"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                    disabled={page >= maxPage}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-orange-200 shadow-sm flex items-center justify-center hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Next requests"
                  >
                    ›
                  </button>

                  <div className="px-10 py-2">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {visible3.map((r) => (
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

                    <p className="text-[11px] text-gray-400 mt-3 text-center">
                      Showing {page * PAGE_SIZE + 1}–
                      {Math.min((page + 1) * PAGE_SIZE, list.length)} of{" "}
                      {list.length}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: form */}
            <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm">
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
          </div>
        ) : (
          /* ✅ Normal mode: keep your old slider (unchanged) */
          <>
            {list.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">📦</p>
                <p className="text-sm">No pending requests yet.</p>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => scrollSlider("left")}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-orange-200 shadow-sm flex items-center justify-center hover:bg-orange-50"
                  aria-label="Previous requests"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => scrollSlider("right")}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-orange-200 shadow-sm flex items-center justify-center hover:bg-orange-50"
                  aria-label="Next requests"
                >
                  ›
                </button>

                <div
                  ref={sliderRef}
                  className="flex gap-4 overflow-x-auto scroll-smooth px-10 py-2 no-scrollbar"
                >
                  {list.map((r) => (
                    <div
                      key={r._id}
                      className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm min-w-[320px] w-[320px]"
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
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}