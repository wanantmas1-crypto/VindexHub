import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  techStack: text("tech_stack").notNull().default("[]"),
  imageUrl: text("image_url"),
  demoUrl: text("demo_url"),
  repoUrl: text("repo_url"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").references(() => categories.id),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  features: text("features").notNull().default("[]"),
  screenshots: text("screenshots").notNull().default("[]"),
  systemRequirements: text("system_requirements"),
  changelog: text("changelog"),
  faqs: text("faqs").notNull().default("[]"),
  priceCents: integer("price_cents").notNull(),
  offerPriceCents: integer("offer_price_cents"),
  currency: text("currency").notNull().default("KES"),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  downloadUrl: text("download_url"),
  licenseType: text("license_type").notNull().default("Standard License"),
  version: text("version").notNull().default("1.0.0"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  deliverables: text("deliverables").notNull().default("[]"),
  startingPriceCents: integer("starting_price_cents").notNull(),
  currency: text("currency").notNull().default("KES"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const serviceRequests = sqliteTable("service_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id").references(() => services.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  budget: text("budget"),
  timeline: text("timeline"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  phone: text("phone"),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull().default("KES"),
  status: text("status").notNull().default("pending"), // pending | paid | failed | cancelled
  paymentMethod: text("payment_method").notNull().default("stripe"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  mpesaCheckoutRequestId: text("mpesa_checkout_request_id"),
  mpesaMerchantRequestId: text("mpesa_merchant_request_id"),
  mpesaReceiptNumber: text("mpesa_receipt_number"),
  paymentFailureReason: text("payment_failure_reason"),
  receiptNumber: text("receipt_number"),
  downloadToken: text("download_token"),
  downloadExpiresAt: text("download_expires_at"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  productName: text("product_name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull().default(1),
  downloadUrl: text("download_url"),
  licenseKey: text("license_key"),
  downloadCount: integer("download_count").notNull().default(0),
});

export const receipts = sqliteTable("receipts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id),
  receiptNumber: text("receipt_number").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone"),
  paymentMethod: text("payment_method").notNull(),
  paymentReference: text("payment_reference"),
  currency: text("currency").notNull().default("KES"),
  subtotalCents: integer("subtotal_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  status: text("status").notNull().default("issued"),
  issuedAt: text("issued_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  payload: text("payload").notNull().default("{}"),
});

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  logoUrl: text("logo_url"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id),
  serviceId: integer("service_id").references(() => services.id),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  status: text("status").notNull().default("pending"),
  verifiedBuyer: integer("verified_buyer", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Receipt = typeof receipts.$inferSelect;
export type Review = typeof reviews.$inferSelect;
