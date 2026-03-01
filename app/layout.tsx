import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Reda Store",
    template: "%s | Reda Store",
  },
  description: "Quality electronic Parts & Accessories – Sri Lanka",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png", // optional
  },

  openGraph: {
    title: "Reda Store",
    description: "Quality electronic Parts & Accessories – Sri Lanka",
    url: "https://redastore.lk", // ✅ put your real domain here
    siteName: "Reda Store",
    locale: "en_LK",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}