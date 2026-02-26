import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  sku: z.string(),
  qty: z.number().int().min(1),
  unitPrice: z.number().min(0),
  gettingPrice: z.number().min(0),
  subtotal: z.number().min(0),
});

export const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "At least one item required"),
  discount: z.number().min(0).default(0),
  discountType: z.enum(["flat", "percent"]).default("flat"),
  paymentMethod: z.enum(["cash", "card", "online"]),
});
