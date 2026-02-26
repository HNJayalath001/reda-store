export interface Settings {
  siteName: string;
  whatsappNumber: string;
  bannerImages: string[];
  sliderImages: string[];
  address: string;
  email: string;
  footerText: string;
}

export const defaultSettings: Settings = {
  siteName: "Reda Store",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "+94721126526",
  bannerImages: [],
  sliderImages: [],
  address: "Colombo, Sri Lanka",
  email: "info@redastore.lk",
  footerText: "© 2026 Reda Store. All rights reserved.",
};
