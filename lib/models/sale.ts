import { ObjectId } from "mongodb";

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  qty: number;
  unitPrice: number;
  gettingPrice: number;
  subtotal: number;
}

export interface Sale {
  _id?: ObjectId;
  billNo: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: "flat" | "percent";
  discountAmount: number;
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: "cash" | "card" | "online";
  type: "SALE" | "RETURN";
  originalSaleId?: string;
  createdBy: string;
  createdAt: Date;
}
