import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Reda Store",
    template: "%s | Reda Store",
  },
  description: "Quality electronic Parts & Accessories – Sri Lanka",

  icons: {
    icon: "/favicon.ico",          // main favicon
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",      // optional (if you create it)
  },

  openGraph: {
    title: "Reda Store",
    description: "Quality Auto Parts & Accessories – Sri Lanka",
    url: "https://yourdomain.com", // change to your real domain
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
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}