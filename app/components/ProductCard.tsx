"use client";

import { Product } from "../types";
import { formatRs, getYouTubeId } from "../utils";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const isOOS = product.stockQty <= 0 || product.isOutOfStock;
  const hasVideo = !!(product.videoUrl && getYouTubeId(product.videoUrl));

  return (
    <button
      onClick={onClick}
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
          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-200">
            📦
          </div>
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
          <p className="text-blue-600 font-bold text-xs">
            {formatRs(product.sellingPrice)}
          </p>
          {!isOOS && product.stockQty <= 5 && (
            <span className="text-[10px] text-orange-500 font-medium shrink-0">
              {product.stockQty} left
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
