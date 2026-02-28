import { useState } from "react";

/* ── Img ── */
export function Img({
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

/* ── WaIcon ── */
export function WaIcon({ cls = "w-5 h-5" }: { cls?: string }) {
  return (
    <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.011L2 22l5.14-1.316A9.993 9.993 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.98 7.98 0 0 1-4.174-1.177l-.299-.178-3.051.782.82-3.027-.194-.314A8 8 0 1 1 12 20z" />
    </svg>
  );
}

/* ── Stars ── */
export function Stars({ r, big }: { r: number; big?: boolean }) {
  return (
    <span className="inline-flex gap-px" suppressHydrationWarning>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`${big ? "text-xl" : "text-sm"} leading-none ${
            s <= r ? "text-yellow-400" : "text-gray-200"
          }`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/* ── StarPicker ── */
export function StarPicker({
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
          className={`text-3xl leading-none transition-colors ${
            s <= (hov || value) ? "text-yellow-400" : "text-gray-200"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
