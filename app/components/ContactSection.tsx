"use client";

interface ContactSectionProps {
  settings: {
    siteName?: string;
    whatsappNumber?: string;
    email?: string;
    instagramUrl?: string;
    facebookUrl?: string;
  } | null;
}

export function ContactSection({ settings }: ContactSectionProps) {
  const siteName = settings?.siteName || "Reda Store";
  const whatsapp = settings?.whatsappNumber || "+94721126526";
  const waClean = whatsapp.replace(/[^0-9]/g, "");

  const insta = settings?.instagramUrl || "#";
  const fb = settings?.facebookUrl || "#";

  return (
    <section className="bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 text-center">

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">
          Contact Us
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          Get in touch with {siteName}
        </p>

        {/* Contact Items */}
        <div className="flex flex-wrap items-center justify-center gap-8">

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${waClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition">
              📞
            </div>
            <span className="text-sm font-medium group-hover:text-green-400 transition">
              {whatsapp}
            </span>
          </a>

          {/* Email */}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition">
                ✉️
              </div>
              <span className="text-sm group-hover:text-blue-400 transition">
                {settings.email}
              </span>
            </a>
          )}

          {/* Instagram */}
          <a
            href={insta}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition">
              📷
            </div>
            <span className="text-sm group-hover:text-pink-400 transition">
              Instagram
            </span>
          </a>

          {/* Facebook */}
          <a
            href={fb}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition">
              f
            </div>
            <span className="text-sm group-hover:text-blue-400 transition">
              Facebook
            </span>
          </a>

        </div>
      </div>
    </section>
  );
}