import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().default(""),
  gettingPrice: z.number().min(0, "Getting price must be >= 0"),
  sellingPrice: z.number().min(0, "Selling price must be >= 0"),
  stockQty: z.number().int().min(0, "Stock must be >= 0"),
  isOutOfStock: z.boolean().default(false),
  imageFileIds: z.array(z.string()).max(5, "Maximum 5 images allowed").default([]),
  videoUrl: z.string().optional().default(""),
});

export const updateProductSchema = productSchema.partial();

export const PRODUCT_CATEGORIES = [
  "Engine",
  "Body",
  "Lights",
  "Tyres",
  "Brakes",
  "Suspension",
  "Electrical",
  "Filters",
  "Accessories",
  "Other",
];
