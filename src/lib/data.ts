import "server-only";

import { desc, eq, sql, and } from "drizzle-orm";
import { db } from "./db";
import {
  categories,
  orderItems,
  orders,
  products,
  projects,
  reviews,
  serviceRequests,
  services,
  siteSettings,
} from "./db/schema";

export async function getFeaturedProjects() {
  return db.select().from(projects).where(eq(projects.featured, true)).orderBy(desc(projects.createdAt)).limit(3);
}

export async function getProjects() {
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectBySlug(slug: string) {
  return db.query.projects.findFirst({ where: eq(projects.slug, slug) });
}

export async function getSiteSettings() {
  const row = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
  return row ?? { id: 1, logoUrl: null, updatedAt: "" };
}

export async function getActiveCategories() {
  return db.select().from(categories).where(eq(categories.active, true)).orderBy(desc(categories.createdAt));
}

export async function getAllCategories() {
  return db.select().from(categories).orderBy(desc(categories.createdAt));
}

export async function getActiveProducts(opts?: string | { categorySlug?: string; q?: string; sort?: string }) {
  const categorySlug = typeof opts === "string" ? opts : opts?.categorySlug;
  const q = typeof opts === "object" ? opts?.q?.toLowerCase().trim() : undefined;
  const sort = typeof opts === "object" ? opts?.sort : undefined;

  const rows = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      slug: products.slug,
      name: products.name,
      description: products.description,
      features: products.features,
      screenshots: products.screenshots,
      systemRequirements: products.systemRequirements,
      changelog: products.changelog,
      faqs: products.faqs,
      priceCents: products.priceCents,
      currency: products.currency,
      imageUrl: products.imageUrl,
      fileUrl: products.fileUrl,
      downloadUrl: products.downloadUrl,
      licenseType: products.licenseType,
      version: products.version,
      active: products.active,
      createdAt: products.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.active, true))
    .orderBy(desc(products.createdAt));

  let filtered = rows;
  if (categorySlug) filtered = filtered.filter((p) => p.categorySlug === categorySlug);
  if (q) filtered = filtered.filter((p) => [p.name, p.description, p.categoryName ?? ""].join(" ").toLowerCase().includes(q));
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.priceCents - b.priceCents);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.priceCents - a.priceCents);
  if (sort === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      slug: products.slug,
      name: products.name,
      description: products.description,
      features: products.features,
      screenshots: products.screenshots,
      systemRequirements: products.systemRequirements,
      changelog: products.changelog,
      faqs: products.faqs,
      priceCents: products.priceCents,
      currency: products.currency,
      imageUrl: products.imageUrl,
      fileUrl: products.fileUrl,
      downloadUrl: products.downloadUrl,
      licenseType: products.licenseType,
      version: products.version,
      active: products.active,
      createdAt: products.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  return rows[0];
}

export async function getProductById(id: number) {
  return db.query.products.findFirst({ where: eq(products.id, id) });
}

export async function getActiveServices() {
  return db.select().from(services).where(eq(services.active, true)).orderBy(desc(services.createdAt));
}

export async function getServiceBySlug(slug: string) {
  return db.query.services.findFirst({ where: and(eq(services.slug, slug), eq(services.active, true)) });
}

export async function getApprovedReviews(limit = 12) {
  return db.select().from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt)).limit(limit);
}

export async function getApprovedReviewsForProduct(productId: number) {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));
}

export async function getApprovedReviewsForService(serviceId: number) {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.serviceId, serviceId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));
}

// Admin queries
export async function getAdminStats() {
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
}

export async function getAllProducts() {
  return db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      slug: products.slug,
      name: products.name,
      description: products.description,
      features: products.features,
      priceCents: products.priceCents,
      currency: products.currency,
      imageUrl: products.imageUrl,
      fileUrl: products.fileUrl,
      downloadUrl: products.downloadUrl,
      licenseType: products.licenseType,
      version: products.version,
      active: products.active,
      createdAt: products.createdAt,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}
export async function getAllServices() {
  return db.select().from(services).orderBy(desc(services.createdAt));
}
export async function getAllProjects() {
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}
export async function getAllReviews() {
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}
export async function getAllServiceRequests() {
  return db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
}
export async function getAllOrders() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const items = await db.select().from(orderItems);
  return allOrders.map((order) => ({
    ...order,
    items: items.filter((i) => i.orderId === order.id),
  }));
}

export async function getAnalytics() {
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

  const statusCounts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const reviewCounts = {
    total: allReviews.length,
    approved: allReviews.filter((r) => r.status === "approved").length,
    pending: allReviews.filter((r) => r.status === "pending").length,
    rejected: allReviews.filter((r) => r.status === "rejected").length,
  };

  const requestCounts = allRequests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    revenueCents,
    paidOrders: paidOrders.length,
    totalOrders: allOrders.length,
    avgOrderCents,
    products: allProducts.length,
    topProducts,
    statusCounts,
    reviewCounts,
    requestCounts,
    recentOrders: allOrders.slice(0, 5),
  };
}
