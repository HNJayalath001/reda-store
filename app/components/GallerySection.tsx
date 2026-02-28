"use client";

interface GallerySectionProps {
  sliderImages: string[];
  sliderIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onDot: (i: number) => void;
}

export function GallerySection({
  sliderImages,
  sliderIdx,
  onPrev,
  onNext,
  onDot,
}: GallerySectionProps) {
  const len = sliderImages.length;
  if (len === 0) return null;

  return (
    <section className="bg-white border-t border-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Gallery</h2>

        <div className="relative w-full h-52 sm:h-72 rounded-2xl overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/images/${sliderImages[sliderIdx]}`}
            alt="Gallery"
            className="w-full h-full object-cover"
          />

          {len > 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xl"
              >
                ‹
              </button>
              <button
                onClick={onNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xl"
              >
                ›
              </button>

              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {sliderImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onDot(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === sliderIdx ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
