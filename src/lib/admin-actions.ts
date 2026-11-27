"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { categories, orderItems, products, projects, reviews, serviceRequests, services, siteSettings } from "./db/schema";
import { clearAdminSession, createAdminSession, requireAdminSession, verifyAdminCredentials } from "./auth";
import { categorySchema, productSchema, projectSchema, serviceSchema } from "./validators";
import { slugify } from "./utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export type AdminActionState = { ok: boolean; message: string };

function toJsonArray(value?: string) {
  if (!value) return "[]";
  const items = value
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(items);
}

export async function adminLogin(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!verifyAdminCredentials(email, password)) {
    return { ok: false, message: "Invalid email or password." };
  }

  await createAdminSession(email);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveProduct(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminSession();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid product data." };
  const data = parsed.data;
  const priceCents = Math.round(data.priceKes * 100);
  const offerPriceCentsRaw = data.offerPriceKes != null ? Math.round(data.offerPriceKes * 100) : null;
  const offerPriceCents =
    offerPriceCentsRaw != null && offerPriceCentsRaw < priceCents ? offerPriceCentsRaw : null;
  const values = {
    categoryId: data.categoryId ? Number(data.categoryId) : null,
    name: data.name,
    slug: data.slug || slugify(data.name),
    description: data.description,
    features: toJsonArray(data.features),
    priceCents,
    offerPriceCents,
    currency: data.currency.toUpperCase(),
    imageUrl: data.imageUrl || null,
    fileUrl: data.fileUrl || null,
    downloadUrl: data.downloadUrl || null,
    licenseType: data.licenseType,
    version: data.version,
    active: data.active,
  };

  if (id) await db.update(products).set(values).where(eq(products.id, id));
  else await db.insert(products).values(values);

  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true, message: id ? "Product updated." : "Product created." };
}

export async function deleteProduct(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  if (!id) return;
  try {
    const [hasOrders] = await db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.productId, id)).limit(1);
    const [hasReviews] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.productId, id)).limit(1);
    if (hasOrders || hasReviews) {
      await db.update(products).set({ active: false }).where(eq(products.id, id));
    } else {
      await db.delete(products).where(eq(products.id, id));
    }
  } catch (e) {
    console.error("[deleteProduct]", e);
    try { await db.update(products).set({ active: false }).where(eq(products.id, id)); } catch {}
  }
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function setProductActive(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  if (!id) return;
  await db.update(products).set({ active }).where(eq(products.id, id));
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function saveService(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminSession();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid service data." };
  const data = parsed.data;
  const values = {
    name: data.name,
    slug: data.slug || slugify(data.name),
    description: data.description,
    deliverables: toJsonArray(data.deliverables),
    startingPriceCents: Math.round(data.startingPriceKes * 100),
    currency: data.currency.toUpperCase(),
    active: data.active,
  };
  if (id) await db.update(services).set(values).where(eq(services.id, id));
  else await db.insert(services).values(values);
  revalidatePath("/services");
  revalidatePath("/admin/services");
  return { ok: true, message: id ? "Service updated." : "Service created." };
}

export async function deleteService(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  if (!id) return;
  try {
    const [hasRequests] = await db.select({ id: serviceRequests.id }).from(serviceRequests).where(eq(serviceRequests.serviceId, id)).limit(1);
    const [hasReviews] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.serviceId, id)).limit(1);
    if (hasRequests || hasReviews) {
      await db.update(services).set({ active: false }).where(eq(services.id, id));
    } else {
      await db.delete(services).where(eq(services.id, id));
    }
  } catch (e) {
    console.error("[deleteService]", e);
    try { await db.update(services).set({ active: false }).where(eq(services.id, id)); } catch {}
  }
  revalidatePath("/services");
  revalidatePath("/admin/services");
}

export async function setServiceActive(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  if (!id) return;
  await db.update(services).set({ active }).where(eq(services.id, id));
  revalidatePath("/services");
  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function saveProject(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminSession();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid project data." };
  const data = parsed.data;
  const values = {
    title: data.title,
    slug: data.slug || slugify(data.title),
    summary: data.summary,
    description: data.description,
    techStack: toJsonArray(data.techStack),
    imageUrl: data.imageUrl || null,
    demoUrl: data.demoUrl || null,
    repoUrl: data.repoUrl || null,
    featured: data.featured,
    active: data.active,
  };
  if (id) await db.update(projects).set(values).where(eq(projects.id, id));
  else await db.insert(projects).values(values);
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  revalidatePath("/");
  return { ok: true, message: id ? "Project updated." : "Project created." };
}

export async function deleteProject(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  if (id) await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function setProjectActive(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  if (!id) return;
  await db.update(projects).set({ active }).where(eq(projects.id, id));
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

const REVIEW_SOURCES = ["web", "whatsapp", "telegram", "instagram", "x"] as const;

export async function setReviewStatus(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || !["pending", "approved", "rejected"].includes(status)) return;
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  revalidatePath("/reviews");
  revalidatePath("/products");
  revalidatePath("/services");
  revalidatePath("/admin/reviews");
}

export async function setReviewSource(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const source = String(formData.get("source"));
  if (!id || !REVIEW_SOURCES.includes(source as any)) return;
  await db.update(reviews).set({ source }).where(eq(reviews.id, id));
  revalidatePath("/reviews");
  revalidatePath("/products");
  revalidatePath("/admin/reviews");
}

export async function saveReviewScreenshot(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const file = formData.get("screenshot");
  if (!id) return { ok: false, message: "Invalid review." };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Please select a screenshot to upload." };
  }
  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { ok: false, message: "Only PNG, JPG, or WEBP files are allowed." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, message: "Screenshot must be 4MB or smaller." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `review-${id}-${Date.now()}.${ext}`;

  let screenshotUrl: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/reviews/${filename}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    screenshotUrl = blob.url;
  } else {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "reviews");
    await mkdir(uploadDir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);
    screenshotUrl = `/uploads/reviews/${filename}`;
  }

  await db.update(reviews).set({ screenshotUrl }).where(eq(reviews.id, id));
  revalidatePath("/reviews");
  revalidatePath("/products");
  revalidatePath("/admin/reviews");
  return { ok: true, message: "Review screenshot uploaded." };
}

export async function createAdminReview(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminSession();
  const authorName = String(formData.get("authorName") || "").trim();
  const authorEmail = String(formData.get("authorEmail") || "").trim() || "admin@vindexhub.local";
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();
  const source = String(formData.get("source") || "web").trim();
  const status = String(formData.get("status") || "approved").trim();
  const verifiedBuyer = formData.get("verifiedBuyer") === "on";
  const productIdRaw = String(formData.get("productId") || "").trim();
  const serviceIdRaw = String(formData.get("serviceId") || "").trim();
  const productId = productIdRaw ? Number(productIdRaw) : null;
  const serviceId = serviceIdRaw ? Number(serviceIdRaw) : null;

  if (!authorName || !comment) return { ok: false, message: "Name and comment are required." };
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return { ok: false, message: "Rating must be 1-5." };
  if (!REVIEW_SOURCES.includes(source as any)) return { ok: false, message: "Invalid source." };
  if (!["pending", "approved", "rejected"].includes(status)) return { ok: false, message: "Invalid status." };

  await db.insert(reviews).values({
    productId: Number.isFinite(productId as any) ? productId : null,
    serviceId: Number.isFinite(serviceId as any) ? serviceId : null,
    authorName,
    authorEmail,
    rating,
    comment,
    source,
    status,
    verifiedBuyer,
  } as any);

  revalidatePath("/reviews");
  revalidatePath("/products");
  revalidatePath("/admin/reviews");
  return { ok: true, message: "Testimonial added." };
}

export async function setServiceRequestStatus(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id) return;
  await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, id));
  revalidatePath("/admin/requests");
}

export async function saveCategory(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminSession();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid category data." };
  const data = parsed.data;
  const values = {
    name: data.name,
    slug: data.slug || slugify(data.name),
    description: data.description || null,
    active: data.active,
  };
  if (id) await db.update(categories).set(values).where(eq(categories.id, id));
  else await db.insert(categories).values(values);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  return { ok: true, message: id ? "Category updated." : "Category created." };
}

export async function deleteCategory(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  if (id) await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
}

export async function saveSiteLogo(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminSession();
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Please select a logo image to upload." };
  }

  const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type)) {
    return { ok: false, message: "Only PNG, JPG, WEBP, or SVG files are allowed." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, message: "Logo must be 2MB or smaller." };
  }

  const ext = file.type === "image/svg+xml" ? "svg" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `logo-${Date.now()}.${ext}`;

  let logoUrl: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    logoUrl = blob.url;
  } else {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);
    logoUrl = `/uploads/${filename}`;
  }

  await db
    .insert(siteSettings)
    .values({ id: 1, logoUrl, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({ target: siteSettings.id, set: { logoUrl, updatedAt: new Date().toISOString() } });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Logo uploaded successfully." };
}
