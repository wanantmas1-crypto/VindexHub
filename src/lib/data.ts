import "server-only";

import { desc, eq, sql, and } from "drizzle-orm";
import { db } from "./db";
import {
  categories,
  feedbackMessages,
  orderItems,
  orders,
  products,
  projects,
  reviews,
  serviceRequests,
  services,
  siteSettings,
} from "./db/schema";

function logDbError(fn: string, error: unknown) {
  console.error(`[data.${fn}]`, error);
}

export async function getFeaturedProjects() {
  try {
    return await db.select().from(projects).where(and(eq(projects.featured, true), eq(projects.active, true))).orderBy(desc(projects.createdAt)).limit(3);
  } catch (e) { logDbError("getFeaturedProjects", e); return []; }
}

export async function getProjects() {
  try {
    return await db.select().from(projects).where(eq(projects.active, true)).orderBy(desc(projects.createdAt));
  } catch (e) { logDbError("getProjects", e); return []; }
}

export async function getProjectBySlug(slug: string) {
  try {
    return await db.query.projects.findFirst({ where: and(eq(projects.slug, slug), eq(projects.active, true)) });
  } catch (e) { logDbError("getProjectBySlug", e); return undefined; }
}

export async function getSiteSettings() {
  const fallback = {
    id: 1, logoUrl: null, contactEmail: null, contactPhone: null, contactWhatsapp: null,
    contactAddress: null, showContacts: true, updatedAt: "",
  };
  try {
    const row = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
    return row ?? fallback;
  } catch (e) { logDbError("getSiteSettings", e); return fallback; }
}

export async function getAllFeedbackMessages() {
  try { return await db.select().from(feedbackMessages).orderBy(desc(feedbackMessages.createdAt)); }
  catch (e) { logDbError("getAllFeedbackMessages", e); return []; }
}

export async function getActiveCategories() {
  try {
    return await db.select().from(categories).where(eq(categories.active, true)).orderBy(desc(categories.createdAt));
  } catch (e) { logDbError("getActiveCategories", e); return []; }
}

export async function getAllCategories() {
  try {
    return await db.select().from(categories).orderBy(desc(categories.createdAt));
  } catch (e) { logDbError("getAllCategories", e); return []; }
}

export async function getActiveProducts(opts?: string | { categorySlug?: string; q?: string; sort?: string }) {
  try {
    const categorySlug = typeof opts === "string" ? opts : opts?.categorySlug;
    const q = typeof opts === "object" ? opts?.q?.toLowerCase().trim() : undefined;
    const sort = typeof opts === "object" ? opts?.sort : undefined;

    const rows = await db
      .select({
        id: products.id, categoryId: products.categoryId, slug: products.slug, name: products.name,
        description: products.description, features: products.features, screenshots: products.screenshots,
        systemRequirements: products.systemRequirements, changelog: products.changelog, faqs: products.faqs,
        priceCents: products.priceCents, offerPriceCents: products.offerPriceCents, currency: products.currency, imageUrl: products.imageUrl,
        fileUrl: products.fileUrl, downloadUrl: products.downloadUrl, licenseType: products.licenseType,
        version: products.version, active: products.active, createdAt: products.createdAt,
        categoryName: categories.name, categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.active, true))
      .orderBy(desc(products.createdAt));

    let filtered = rows;
    if (categorySlug) filtered = filtered.filter((p) => p.categorySlug === categorySlug);
    if (q) filtered = filtered.filter((p) => [p.name, p.description, p.categoryName ?? ""].join(" ").toLowerCase().includes(q));
    const eff = (p: any) => (p.offerPriceCents != null && p.offerPriceCents < p.priceCents ? p.offerPriceCents : p.priceCents);
    if (sort === "price-asc") filtered = [...filtered].sort((a, b) => eff(a) - eff(b));
    if (sort === "price-desc") filtered = [...filtered].sort((a, b) => eff(b) - eff(a));
    if (sort === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  } catch (e) { logDbError("getActiveProducts", e); return []; }
}

export async function getProductBySlug(slug: string) {
  try {
    const rows = await db
      .select({
        id: products.id, categoryId: products.categoryId, slug: products.slug, name: products.name,
        description: products.description, features: products.features, screenshots: products.screenshots,
        systemRequirements: products.systemRequirements, changelog: products.changelog, faqs: products.faqs,
        priceCents: products.priceCents, offerPriceCents: products.offerPriceCents, currency: products.currency, imageUrl: products.imageUrl,
        fileUrl: products.fileUrl, downloadUrl: products.downloadUrl, licenseType: products.licenseType,
        version: products.version, active: products.active, createdAt: products.createdAt,
        categoryName: categories.name, categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.active, true)))
      .limit(1);
    return rows[0];
  } catch (e) { logDbError("getProductBySlug", e); return undefined; }
}

export async function getProductById(id: number) {
  try { return await db.query.products.findFirst({ where: eq(products.id, id) }); }
  catch (e) { logDbError("getProductById", e); return undefined; }
}

export async function getActiveServices() {
  try { return await db.select().from(services).where(eq(services.active, true)).orderBy(desc(services.createdAt)); }
  catch (e) { logDbError("getActiveServices", e); return []; }
}

export async function getServiceBySlug(slug: string) {
  try { return await db.query.services.findFirst({ where: and(eq(services.slug, slug), eq(services.active, true)) }); }
  catch (e) { logDbError("getServiceBySlug", e); return undefined; }
}

export async function getApprovedReviews(limit = 12) {
  try { return await db.select().from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt)).limit(limit); }
  catch (e) { logDbError("getApprovedReviews", e); return []; }
}

export async function getApprovedReviewsForProduct(productId: number) {
  try {
    return await db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.status, "approved"))).orderBy(desc(reviews.createdAt));
  } catch (e) { logDbError("getApprovedReviewsForProduct", e); return []; }
}

export async function getApprovedReviewsForService(serviceId: number) {
  try {
    return await db.select().from(reviews).where(and(eq(reviews.serviceId, serviceId), eq(reviews.status, "approved"))).orderBy(desc(reviews.createdAt));
  } catch (e) { logDbError("getApprovedReviewsForService", e); return []; }
}

// Admin queries
export async function getAdminStats() {
  try {
    const [[productCount], [serviceCount], [requestCount], [pendingReviewCount], [orderCount], [revenue]] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(products),
        db.select({ count: sql<number>`count(*)` }).from(services),
        db.select({ count: sql<number>`count(*)` }).from(serviceRequests).where(eq(serviceRequests.status, "new")),
        db.select({ count: sql<number>`count(*)` }).from(reviews).where(eq(reviews.status, "pending")),
        db.select({ count: sql<number>`count(*)` }).from(orders),
        db.select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` }).from(orders).where(eq(orders.status, "paid")),
      ]);

    return {
      products: Number(productCount.count ?? 0),
      services: Number(serviceCount.count ?? 0),
      newRequests: Number(requestCount.count ?? 0),
      pendingReviews: Number(pendingReviewCount.count ?? 0),
      orders: Number(orderCount.count ?? 0),
      revenueCents: Number(revenue.total ?? 0),
    };
  } catch (e) { logDbError("getAdminStats", e); return { products: 0, services: 0, newRequests: 0, pendingReviews: 0, orders: 0, revenueCents: 0 }; }
}

export async function getAllProducts() {
  try {
    return await db
      .select({
        id: products.id, categoryId: products.categoryId, slug: products.slug, name: products.name,
        description: products.description, features: products.features, priceCents: products.priceCents,
        offerPriceCents: products.offerPriceCents, currency: products.currency, imageUrl: products.imageUrl, fileUrl: products.fileUrl,
        downloadUrl: products.downloadUrl, licenseType: products.licenseType, version: products.version,
        active: products.active, createdAt: products.createdAt, categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt));
  } catch (e) { logDbError("getAllProducts", e); return []; }
}
export async function getAllServices() {
  try { return await db.select().from(services).orderBy(desc(services.createdAt)); }
  catch (e) { logDbError("getAllServices", e); return []; }
}
export async function getAllProjects() {
  try { return await db.select().from(projects).orderBy(desc(projects.createdAt)); }
  catch (e) { logDbError("getAllProjects", e); return []; }
}
export async function getAllReviews() {
  try { return await db.select().from(reviews).orderBy(desc(reviews.createdAt)); }
  catch (e) { logDbError("getAllReviews", e); return []; }
}
export async function getAllServiceRequests() {
  try { return await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt)); }
  catch (e) { logDbError("getAllServiceRequests", e); return []; }
}
export async function getAllOrders() {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const items = await db.select().from(orderItems);
    return allOrders.map((order) => ({ ...order, items: items.filter((i) => i.orderId === order.id) }));
  } catch (e) { logDbError("getAllOrders", e); return []; }
}

export async function getAnalytics() {
  try {
    const [allOrders, items, allReviews, allRequests, allProducts] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(orderItems),
      db.select().from(reviews),
      db.select().from(serviceRequests),
      db.select().from(products),
    ]);

    const paidOrders = allOrders.filter((o) => o.status === "paid");
    const revenueCents = paidOrders.reduce((s, o) => s + o.totalCents, 0);
    const avgOrderCents = paidOrders.length ? Math.round(revenueCents / paidOrders.length) : 0;

    const productMap = new Map<number, { name: string; revenueCents: number; quantity: number }>();
    for (const item of items) {
      const order = allOrders.find((o) => o.id === item.orderId && o.status === "paid");
      if (!order) continue;
      const entry = productMap.get(item.productId) ?? { name: item.productName, revenueCents: 0, quantity: 0 };
      entry.revenueCents += item.unitPriceCents * item.quantity;
      entry.quantity += item.quantity;
      productMap.set(item.productId, entry);
    }
    const topProducts = [...productMap.entries()]
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 5);

    const statusCounts = allOrders.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; }, {});
    const reviewCounts = {
      total: allReviews.length,
      approved: allReviews.filter((r) => r.status === "approved").length,
      pending: allReviews.filter((r) => r.status === "pending").length,
      rejected: allReviews.filter((r) => r.status === "rejected").length,
    };
    const requestCounts = allRequests.reduce<Record<string, number>>((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; }, {});

    return {
      revenueCents, paidOrders: paidOrders.length, totalOrders: allOrders.length, avgOrderCents,
      products: allProducts.length, topProducts, statusCounts, reviewCounts, requestCounts,
      recentOrders: allOrders.slice(0, 5),
    };
  } catch (e) {
    logDbError("getAnalytics", e);
    return { revenueCents: 0, paidOrders: 0, totalOrders: 0, avgOrderCents: 0, products: 0, topProducts: [], statusCounts: {}, reviewCounts: { total: 0, approved: 0, pending: 0, rejected: 0 }, requestCounts: {}, recentOrders: [] };
  }
}
