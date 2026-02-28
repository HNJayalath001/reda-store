"use client";

interface AboutSectionProps {
  siteName: string;
  instagramUrl?: string; // kept to avoid build error
  facebookUrl?: string;  // kept to avoid build error
}

const FEATURES = [
  { i: "⚡", t: "Fast Response", d: "Quick WhatsApp support" },
  { i: "💰", t: "Best Prices", d: "Competitive pricing" },
  { i: "🚚", t: "Island-wide", d: "Delivery across Sri Lanka" },
  { i: "🔒", t: "Trusted Seller", d: "100s of happy customers" },
  { i: "📱", t: "Easy Ordering", d: "Order directly via WhatsApp" },
  { i: "✅", t: "Quality Items", d: "Carefully selected products" },
];

export function AboutSection({ siteName }: AboutSectionProps) {
  return (
    <section className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">About Us</h2>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* LEFT SIDE */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="Logo"
                width={52}
                height={52}
                className="rounded-2xl shadow object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/logo.svg";
                }}
              />

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {siteName}
                </h3>
                <p className="text-blue-600 text-sm font-medium">
                  Electronics · Accessories · Wholesale & Retail
                </p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              {siteName} is a Sri Lanka based electronics store offering both
              retail and wholesale. We focus on quality tech products like
              mobile accessories, chargers, headphones, gadgets, and more —
              with friendly support and fair pricing.
            </p>

            <p className="text-gray-600 leading-relaxed text-sm">
              Ordering is simple: message us on WhatsApp, get a fast response,
              confirm stock, and receive island-wide delivery across Sri Lanka.
            </p>
          </div>

          {/* RIGHT SIDE FEATURES */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((x) => (
              <div
                key={x.t}
                className="bg-gray-50 rounded-xl p-3.5 border border-gray-100"
              >
                <p className="text-xl mb-1">{x.i}</p>
                <p className="font-semibold text-gray-900 text-xs">
                  {x.t}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}