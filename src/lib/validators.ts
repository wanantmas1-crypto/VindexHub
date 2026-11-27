import { z } from "zod";

export const serviceRequestSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  company: z.string().max(120).optional().or(z.literal("")),
  budget: z.string().max(120).optional().or(z.literal("")),
  timeline: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10, "Please provide more detail").max(2000),
});

export const reviewSchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  serviceId: z.coerce.number().int().positive().optional(),
  authorName: z.string().min(2, "Name is required").max(100),
  authorEmail: z.string().email("Valid email is required"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1500),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  description: z.string().max(500).optional().or(z.literal("")),
  active: z.coerce.boolean().default(true),
});

export const productSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional().or(z.literal("")),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  description: z.string().min(10).max(5000),
  features: z.string().optional().or(z.literal("")),
  priceCents: z.coerce.number().int().min(0),
  offerPriceCents: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(0).optional(),
  ),
  currency: z.string().min(3).max(3).default("KES"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  fileUrl: z.string().optional().or(z.literal("")),
  downloadUrl: z.string().optional().or(z.literal("")),
  licenseType: z.string().min(2).max(120).default("Standard License"),
  version: z.string().min(1).max(50).default("1.0.0"),
  active: z.coerce.boolean().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  description: z.string().min(10).max(5000),
  deliverables: z.string().optional().or(z.literal("")),
  startingPriceCents: z.coerce.number().int().min(0),
  currency: z.string().min(3).max(3).default("KES"),
  active: z.coerce.boolean().default(true),
});

export const projectSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  summary: z.string().min(10).max(300),
  description: z.string().min(10).max(5000),
  techStack: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  paymentMethod: z.enum(["mpesa", "stripe"]).optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(10),
      }),
    )
    .min(1),
});
