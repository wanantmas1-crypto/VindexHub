"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { categories, feedbackMessages, orderItems, products, projects, reviews, serviceRequests, services, siteSettings } from "./db/schema";
import { clearAdminSession, createAdminSession, getAdminSession, requireAdminSession, verifyAdminCredentials } from "./auth";
import { categorySchema, productSchema, projectSchema, serviceSchema, siteContactsSchema } from "./validators";
import { slugify } from "./utils";
import { getClientIp, rateLimit } from "./rate-limit";
import { logAudit } from "./audit";
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

function randomId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function sniffImageType(buf: Buffer, mime: string) {
  if (buf.length < 4) return null;
  if (mime === "image/png" && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (mime === "image/jpeg" && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (mime === "image/webp" && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (mime === "image/gif" && buf.toString("ascii", 0, 3) === "GIF") return "gif";
  if (mime === "image/svg+xml") {
    const head = buf.toString("utf8", 0, Math.min(buf.length, 1024)).toLowerCase();
    if ((head.includes("<svg") || head.includes("<?xml")) && !head.includes("<script") && !head.includes("javascript:")) return "svg";
  }
  return null;
}

async function saveUploadedImage(file: File, folder: string, maxBytes = 5 * 1024 * 1024) {
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
  if (!allowed.includes(file.type)) throw new Error("Unsupported image type.");
  if (file.size > maxBytes) throw new Error("Image is too large.");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImageType(buf, file.type);
  if (!ext) throw new Error("Invalid image file content.");
  const filename = `${folder.replace(/\//g, "-")}-${Date.now()}-${randomId()}.${ext}`;
  const contentType = ext === "svg" ? "image/svg+xml" : ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${folder}/${filename}`, buf, { access: "public", contentType, addRandomSuffix: false });
    return blob.url;
  }
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buf);
  return `/uploads/${folder}/${filename}`;
}

export async function adminLogin(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const h = await headers();
  const ip = getClientIp(h);
  const rl = rateLimit(`admin-login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.ok) return { ok: false, message: "Too many login attempts. Please try again later." };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!verifyAdminCredentials(email, password)) {
    return { ok: false, message: "Invalid email or password." };
  }

  await createAdminSession(email);
  await logAudit({ actorEmail: email, action: "admin.login", ip });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function adminLogout() {
  const session = await getAdminSession().catch(() => null);
  const h = await headers();
  await logAudit({ actorEmail: session?.email, action: "admin.logout", ip: getClientIp(h) });
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveProduct(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const session = await requireAdminSession();
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid product data." };
  const data = parsed.data;
  const priceCents = Math.round(data.priceKes * 100);
  const offerPriceCentsRaw = data.offerPriceKes != null ? Math.round(data.offerPriceKes * 100) : null;
  const offerPriceCents =
    offerPriceCentsRaw != null && offerPriceCentsRaw < priceCents ? offerPriceCentsRaw : null;

  let imageUrl = data.imageUrl || null;
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    try { imageUrl = await saveUploadedImage(imageFile, "products", 5 * 1024 * 1024); }
    catch (e: any) { return { ok: false, message: e?.message || "Invalid image upload." }; }
  }

  const values = {
    categoryId: data.categoryId ? Number(data.categoryId) : null,
    name: data.name,
    slug: data.slug || slugify(data.name),
    description: data.description,
    features: toJsonArray(data.features),
    priceCents,
    offerPriceCents,
    currency: data.currency.toUpperCase(),
    imageUrl,
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
  const h = await headers();
  await logAudit({ actorEmail: session.email, action: id ? "product.update" : "product.create", targetType: "product", targetId: id ?? data.slug, ip: getClientIp(h) });
  return { ok: true, message: id ? "Product updated." : "Product created." };
}

export async function deleteProduct(formData: FormData) {
  const session = await requireAdminSession();
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
  const h = await headers();
  await logAudit({ actorEmail: session.email, action: "product.delete", targetType: "product", targetId: id, ip: getClientIp(h) });
}

export async function setProductActive(formData: FormData) {
  const session = await requireAdminSession();
  const id = Number(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  if (!id) return;
  await db.update(products).set({ active }).where(eq(products.id, id));
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/");
  const h = await headers();
  await logAudit({ actorEmail: session.email, action: active ? "product.show" : "product.hide", targetType: "product", targetId: id, ip: getClientIp(h) });
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
  let screenshotUrl: string;
  try { screenshotUrl = await saveUploadedImage(file, "reviews", 4 * 1024 * 1024); }
  catch (e: any) { return { ok: false, message: e?.message || "Invalid screenshot upload." }; }

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
  let logoUrl: string;
  try { logoUrl = await saveUploadedImage(file, "branding", 2 * 1024 * 1024); }
  catch (e: any) { return { ok: false, message: e?.message || "Invalid logo upload." }; }

  await db
    .insert(siteSettings)
    .values({ id: 1, logoUrl, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({ target: siteSettings.id, set: { logoUrl, updatedAt: new Date().toISOString() } });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Logo uploaded successfully." };
}

export async function saveSiteContacts(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminSession();
  const parsed = siteContactsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid contact settings." };
  const d = parsed.data;
  const values = {
    id: 1,
    contactEmail: d.contactEmail || null,
    contactPhone: d.contactPhone || null,
    contactWhatsapp: d.contactWhatsapp || null,
    contactAddress: d.contactAddress || null,
    showContacts: d.showContacts,
    updatedAt: new Date().toISOString(),
  };
  try {
    await db.insert(siteSettings).values(values as any).onConflictDoUpdate({ target: siteSettings.id, set: values as any });
  } catch (e: any) {
    const msg = String(e?.cause?.message || e?.message || e).toLowerCase();
    if (msg.includes("no column named contact_") || msg.includes("no column named show_contacts") || msg.includes("has no column named")) {
      for (const stmt of [
        "ALTER TABLE site_settings ADD COLUMN contact_email TEXT",
        "ALTER TABLE site_settings ADD COLUMN contact_phone TEXT",
        "ALTER TABLE site_settings ADD COLUMN contact_whatsapp TEXT",
        "ALTER TABLE site_settings ADD COLUMN contact_address TEXT",
        "ALTER TABLE site_settings ADD COLUMN show_contacts INTEGER NOT NULL DEFAULT 1",
      ]) {
        try { await db.run(sql.raw(stmt)); } catch (err: any) { const m = String(err?.cause?.message || err?.message || err).toLowerCase(); if (!m.includes("duplicate column")) throw err; }
      }
      await db.insert(siteSettings).values(values as any).onConflictDoUpdate({ target: siteSettings.id, set: values as any });
    } else throw e;
  }
  revalidatePath("/", "layout");
  revalidatePath("/feedback");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Contact settings saved." };
}

export async function setFeedbackStatus(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || !["new","in_review","resolved","closed"].includes(status)) return;
  await db.update(feedbackMessages).set({ status }).where(eq(feedbackMessages.id, id));
  revalidatePath("/admin/feedback");
}
