"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

function formatRs(n: number) {
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
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
  return (
    // eslint-disable-next-line @next/next/no-img-element
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

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return m ? m[1] : null;
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [whatsapp, setWhatsapp] = useState("+94721126526");
  const [siteName, setSiteName] = useState("Reda Store");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product) setProduct(d.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.whatsappNumber) setWhatsapp(d.settings.whatsappNumber);
        if (d.settings?.siteName) setSiteName(d.settings.siteName);
      })
      .catch(() => { });
  }, [id]);

  const shareLink = useMemo(() => {
    if (typeof window !== "undefined") return window.location.href;
    return `https://redastore.lk/product/${id}`;
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = () => {
    if (navigator.share && product) {
      navigator.share({ title: product.name, url: shareLink });
    } else {
      copyLink();
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-5xl">📦</p>
        <p className="text-xl font-bold text-gray-700">Product not found</p>
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to store
        </Link>
      </div>
    );

  const isOOS = product.stockQty <= 0 || !!product.isOutOfStock;
  const ytId = product.videoUrl ? getYouTubeId(product.videoUrl) : null;

  const waMsg = encodeURIComponent(
    `Hi! I'm interested in:\n*${product.name}*\nPrice: ${formatRs(
      product.sellingPrice
    )}\n\nProduct link: ${shareLink}\n\nPlease confirm availability.`
  );

  const waLink = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${waMsg}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt={siteName}
              width={36}
              height={36}
              className="rounded-xl ring-2 ring-blue-100 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/logo.svg";
              }}
            />
            <span className="font-bold text-gray-900 text-lg">{siteName}</span>
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            ← All Products
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Images / Video */}
            <div className="p-6 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100">
              {/* Tab switcher */}
              {ytId && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setShowVideo(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold border-2 transition-colors ${!showVideo
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <Img src="/images/photos.svg" alt="Photos" size={14} />
                    Photos ({product.imageFileIds.length})
                  </button>

                  <button
                    onClick={() => setShowVideo(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold border-2 transition-colors ${showVideo
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
                    title={product.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <>
                  <div className="w-full h-72 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                    {product.imageFileIds.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/images/${product.imageFileIds[imgIdx]}`}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-6xl text-gray-200">📦</span>
                    )}
                  </div>

                  {product.imageFileIds.length > 1 && (
                    <div className="flex gap-2 mt-3 justify-center flex-wrap">
                      {product.imageFileIds.map((fid, i) => (
                        <button
                          key={fid}
                          onClick={() => setImgIdx(i)}
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx
                              ? "border-blue-600"
                              : "border-gray-200 hover:border-blue-300"
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
                </>
              )}

              {/* Share link box */}
              <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 mb-1.5 font-medium">
                  🔗 Share this product
                </p>

                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareLink}
                    className="flex-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 truncate"
                  />

                  <button
                    onClick={copyLink}
                    className={`shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-colors ${copied
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      }`}
                  >
                    {!copied && <Img src="/images/copylink.svg" alt="Copy" size={13} />}
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>

                <button
                  onClick={shareNative}
                  className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1"
                >
                  ↗ Share via browser
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col">
              {/* ✅ Badge "box" style like [In Stock] */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs border border-blue-300 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">
                  {product.category}
                </span>

                <span className="text-xs border border-gray-300 bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md">
                  {product.brand}
                </span>

                {isOOS ? (
                  <span className="text-xs border border-red-300 bg-red-50 text-red-600 px-2.5 py-1 rounded-md font-semibold">
                  Out of Stock
                  </span>
                ) : product.stockQty <= 5 ? (
                  <span className="text-xs border border-orange-300 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md font-semibold">
                    Only {product.stockQty} left
                  </span>
                ) : (
                  <span className="text-xs border border-green-300 bg-green-50 text-green-700 px-2.5 py-1 rounded-md font-semibold">
                    In Stock
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                {formatRs(product.sellingPrice)}
              </p>

              {product.description && (
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  {product.description}
                </p>
              )}

              <div className="mt-auto space-y-3">
                {!isOOS ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-base"
                  >
                    📱 Order via WhatsApp
                  </a>
                ) : (
                  <a
                    href="/out-of-stock"
                    className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors border border-orange-600"
                  >
                    <Img src="/images/requestorder.svg" alt="Request" size={18} /> Request When
                    Available
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={copyLink}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-600 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    <Img src="/images/copylink.svg" alt="Copy" size={15} />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>

                  <Link
                    href="/"
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-2.5 rounded-xl transition-colors text-sm"
                  >
                     All Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed WhatsApp button */}
      {!isOOS && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-5 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.011L2 22l5.14-1.316A9.993 9.993 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.98 7.98 0 0 1-4.174-1.177l-.299-.178-3.051.782.82-3.027-.194-.314A8 8 0 1 1 12 20z" />
          </svg>
        </a>
      )}
    </div>
  );
}