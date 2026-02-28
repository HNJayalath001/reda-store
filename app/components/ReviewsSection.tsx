"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { FeedbackItem } from "../types";
import { Stars, StarPicker } from "./ui";

interface ReviewsSectionProps {
  feedbacks: FeedbackItem[];
  mounted: boolean;
  onNewFeedback: (fb: FeedbackItem) => void;
}

export function ReviewsSection({
  feedbacks,
  mounted,
  onNewFeedback,
}: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const [fbForm, setFbForm] = useState({ name: "", message: "", rating: 0 });
  const [fbSending, setFbSending] = useState(false);
  const [fbDone, setFbDone] = useState(false);
  const [fbErr, setFbErr] = useState("");

  // for normal mode slider scroll (unchanged)
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // + button mode: show 3 reviews only (no scrollbar)
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 3;

  // newest first
  const list = useMemo(() => {
    return [...feedbacks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [feedbacks]);

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

  const submitFb = async (e: FormEvent) => {
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

    onNewFeedback({
      _id: Date.now().toString(),
      name: fbForm.name,
      message: fbForm.message,
      rating: fbForm.rating,
      createdAt: new Date().toISOString(),
    });

    setFbForm({ name: "", message: "", rating: 0 });

    setTimeout(() => {
      setFbDone(false);
      setShowForm(false);
    }, 2500);
  };

  return (
    <section className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* HEADER + + BUTTON */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <p className="text-gray-500 text-sm mt-0.5">What customers say</p>
          </div>

          <button
            onClick={() => {
              setShowForm((v) => !v);
              setFbDone(false);
              setFbErr("");
              setPage(0); // reset to first 3 when open
            }}
            className="shrink-0 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl flex items-center justify-center shadow-sm"
            aria-label={showForm ? "Close review form" : "Open review form"}
            title={showForm ? "Close" : "Write a review"}
          >
            {showForm ? "✕" : "+"}
          </button>
        </div>

        {/* when showForm -> 2 columns (left reviews + right form)
            else -> only slider */}
        <div className={showForm ? "grid md:grid-cols-[1fr,320px] gap-6" : ""}>
          {/* ================= LEFT: REVIEWS AREA ================= */}
          <div className="w-full">
            {list.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                No reviews yet
              </div>
            ) : showForm ? (
              // ✅ + mode: show ONLY 3 reviews, NO scrollbar, with ‹ › buttons
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border rounded-full shadow flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous reviews"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  disabled={page >= maxPage}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border rounded-full shadow flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next reviews"
                >
                  ›
                </button>

                <div className="px-10 py-2">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visible3.map((fb) => (
                      <div
                        key={fb._id}
                        className="bg-gray-50 rounded-xl border p-3 h-[113px] flex"
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                            {(fb.name || "?")[0].toUpperCase()}
                          </div>

                          <div className="flex-1 flex flex-col h-full">
                            <div className="flex justify-between items-center">
                              <p className="font-semibold text-sm">{fb.name}</p>
                              <Stars r={fb.rating} />
                            </div>

                            <div className="mt-1 overflow-hidden">
                              <p className="text-xs text-gray-600 line-clamp-3">
                                {fb.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* optional small counter */}
                  <p className="text-[11px] text-gray-400 mt-3 text-center">
                    Showing {page * PAGE_SIZE + 1}–
                    {Math.min((page + 1) * PAGE_SIZE, list.length)} of {list.length}
                  </p>
                </div>
              </div>
            ) : (
              // ✅ normal mode: keep your old scroll slider (unchanged)
              <div className="relative">
                <button
                  type="button"
                  onClick={() => scrollSlider("left")}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border rounded-full shadow flex items-center justify-center hover:bg-gray-50"
                  aria-label="Previous reviews"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => scrollSlider("right")}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border rounded-full shadow flex items-center justify-center hover:bg-gray-50"
                  aria-label="Next reviews"
                >
                  ›
                </button>

                <div
                  ref={sliderRef}
                  className="flex gap-4 overflow-x-auto scroll-smooth px-10 py-2"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>

                  {list.map((fb) => (
                    <div
                      key={fb._id}
                      className="bg-gray-50 rounded-xl border p-3 min-w-[340px] w-[340px] h-[113px] flex"
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                          {(fb.name || "?")[0].toUpperCase()}
                        </div>

                        <div className="flex-1 flex flex-col h-full">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm">{fb.name}</p>
                            <Stars r={fb.rating} />
                          </div>

                          <div className="mt-1 overflow-hidden">
                            <p className="text-xs text-gray-600 line-clamp-3">
                              {fb.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT: FORM (ONLY WHEN + CLICK) ================= */}
          {showForm && (
            <div className="bg-blue-50 rounded-2xl p-4 border h-fit">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">
                Write a review
              </h3>

              {fbDone ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-base font-bold">Thank you!</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pending admin approval.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitFb} className="space-y-3">
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={fbForm.name}
                    onChange={(e) =>
                      setFbForm({ ...fbForm, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Your name"
                  />

                  <StarPicker
                    value={fbForm.rating}
                    onChange={(v) => setFbForm({ ...fbForm, rating: v })}
                  />

                  <textarea
                    required
                    rows={3}
                    maxLength={1000}
                    value={fbForm.message}
                    onChange={(e) =>
                      setFbForm({ ...fbForm, message: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                    placeholder="Your review"
                  />

                  {fbErr && (
                    <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {fbErr}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={fbSending}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl font-semibold text-sm"
                  >
                    {fbSending ? "Submitting..." : "Submit"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}