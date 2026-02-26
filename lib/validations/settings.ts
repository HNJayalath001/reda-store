import { z } from "zod";

export const settingsSchema = z.object({
  siteName: z.string().min(1),
  whatsappNumber: z.string().min(1),
  bannerImages: z.array(z.string()).default([]),
  sliderImages: z.array(z.string()).default([]),
  address: z.string().default(""),
  email: z.string().email().or(z.literal("")).default(""),
  footerText: z.string().default(""),
});
