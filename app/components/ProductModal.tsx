"use client";

import { useEffect, useState } from "react";
import { Product } from "../types";
import { formatRs, getYouTubeId } from "../utils";
import { Img, WaIcon } from "./ui";

interface ProductModalProps {
  p: Product;
  wa: string;
  onClose: () => void;
}

export function ProductModal({ p, wa, onClose }: ProductModalProps) {
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
        {/* Header */}
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors ${
                      !showVideo
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <Img src="/images/photos.svg" alt="Photos" size={14} />
                    Photos
                  </button>
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors ${
                      showVideo
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
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                            i === idx ? "border-blue-600" : "border-gray-200"
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

          {/* Badges */}
       <div className="mt-2 rounded-xl border border-gray-200 bg-white/70 px-2.5 py-2">
  <div className="flex flex-wrap items-center gap-1.5">
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
  </div>
</div>

          <p className="text-2xl font-bold text-blue-600">
            {formatRs(p.sellingPrice)}
          </p>

          {p.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {p.description}
            </p>
          )}

          {/* Actions */}
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
                <Img
                  src="/images/requestorder.svg"
                  alt="Request"
                  size={18}
                />{" "}
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
