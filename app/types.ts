export interface Product {
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

export interface Settings {
  siteName?: string;
  whatsappNumber?: string;
  bannerImages?: string[];
  sliderImages?: string[];
  address?: string;
  email?: string;
  footerText?: string;
}

export interface FeedbackItem {
  _id: string;
  name: string;
  message: string;
  rating: number;
  createdAt: string;
}

export interface StockReq {
  _id: string;
  name: string;
  itemName: string;
}
