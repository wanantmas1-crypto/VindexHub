"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { feedbackMessages, orders, orderItems, reviews, serviceRequests } from "./db/schema";
import { checkoutSchema, feedbackSchema, reviewSchema, serviceRequestSchema } from "./validators";
import { getStripe, isStripeConfigured } from "./stripe";
import { createDownloadToken } from "./orders";
import { isPaystackConfigured, initializePaystackTransaction } from "./paystack";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
  orderId?: number;
  paymentPending?: boolean;
  checkoutRequestId?: string;
  downloadToken?: string;
};

export async function submitServiceRequest(_: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = serviceRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the form errors.", errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  await db.insert(serviceRequests).values({
    serviceId: data.serviceId,
    name: data.name,
    email: data.email,
    company: data.company || null,
    budget: data.budget || null,
    timeline: data.timeline || null,
    message: data.message,
    status: "new",
  });

  revalidatePath("/admin/requests");
  return { ok: true, message: "Your service request has been sent. We'll get back to you soon." };
}

export async function submitReview(_: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the review form errors.", errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  if (!data.productId && !data.serviceId) {
    return { ok: false, message: "Review must be linked to a product or service." };
  }

  await db.insert(reviews).values({
    productId: data.productId ?? null,
    serviceId: data.serviceId ?? null,
    authorName: data.authorName,
    authorEmail: data.authorEmail,
    rating: data.rating,
    comment: data.comment,
    status: "pending",
    verifiedBuyer: false,
  } as any);

  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
  return { ok: true, message: "Thank you! Your review was submitted and is pending moderation." };
}

export type OrderLookupState = {
  ok: boolean;
  message: string;
  order?: { id: number; email: string; totalCents: number; currency: string; status: string; downloadExpiresAt: string | null; downloadToken: string | null; receiptNumber: string | null };
  items?: Array<{ id: number; productName: string; quantity: number; unitPriceCents: number; licenseKey: string | null; downloadUrl: string | null }>;
};

export async function lookupOrder(_: OrderLookupState, formData: FormData): Promise<OrderLookupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const orderId = Number(formData.get("orderId"));
  if (!email || !Number.isFinite(orderId)) return { ok: false, message: "Enter a valid email and order ID." };

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order || order.email.toLowerCase() !== email) {
    return { ok: false, message: "Order not found. Check your email and order ID." };
  }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return {
    ok: true,
    message: "Order found.",
    order: { id: order.id, email: order.email, totalCents: order.totalCents, currency: order.currency, status: order.status, downloadExpiresAt: order.downloadExpiresAt, downloadToken: order.downloadToken, receiptNumber: (order as any).receiptNumber ?? null },
    items: items.map((i) => ({ id: i.id, productName: i.productName, quantity: i.quantity, unitPriceCents: i.unitPriceCents, licenseKey: i.licenseKey, downloadUrl: i.downloadUrl })),
  };
}

export async function createCheckout(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const email = String(formData.get("email") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const paymentMethod = String(formData.get("paymentMethod") ?? "");
    const itemsJson = String(formData.get("items") ?? "[]");
    const items = JSON.parse(itemsJson);
    const parsed = checkoutSchema.safeParse({ email, phone, paymentMethod: paymentMethod || undefined, items });
    if (!parsed.success) {
      return { ok: false, message: "Invalid checkout data.", errors: parsed.error.flatten().fieldErrors };
    }

    const dbProducts = await db.query.products.findMany();
    const selected = parsed.data.items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId && p.active);
      if (!product) throw new Error("Product not found");
      return { product, quantity: item.quantity };
    });

    const getPrice = (p: typeof selected[number]["product"]) =>
      p.offerPriceCents != null && p.offerPriceCents < p.priceCents ? p.offerPriceCents : p.priceCents;
    const totalCents = selected.reduce((sum, { product, quantity }) => sum + getPrice(product) * quantity, 0);
    const currency = selected[0]?.product.currency ?? "KES";
    const downloadToken = createDownloadToken();
    const stripe = getStripe();
    const paystack = isPaystackConfigured();
    const chosen = parsed.data.paymentMethod || (paystack ? "paystack" : stripe ? "stripe" : undefined);

    if (chosen === "paystack") {
      if (!paystack) return { ok: false, message: "Paystack is not configured yet. Please try again later." };

      const [order] = await db
        .insert(orders)
        .values({
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          totalCents,
          currency,
          status: "pending",
          paymentMethod: "paystack",
          downloadToken,
        })
        .returning();

      await db.insert(orderItems).values(
        selected.map(({ product, quantity }) => ({
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          unitPriceCents: getPrice(product),
          quantity,
          downloadUrl: product.downloadUrl,
        })),
      );

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const reference = `VINDEX-${order.id}-${downloadToken.slice(0, 8)}`;
      try {
        const init = await initializePaystackTransaction({
          email: parsed.data.email,
          amount: totalCents,
          currency,
          reference,
          callbackUrl: `${appUrl}/checkout/success?order=${order.id}&token=${downloadToken}`,
          metadata: { orderId: order.id, downloadToken },
        });
        await db.update(orders).set({ stripeSessionId: init.reference }).where(eq(orders.id, order.id));
        revalidatePath("/admin/orders");
        redirect(init.authorization_url);
      } catch (e: any) {
        if (typeof e === "object" && e && "digest" in e && String((e as any).digest).startsWith("NEXT_REDIRECT")) {
          throw e;
        }
        await db.update(orders).set({ status: "failed", paymentFailureReason: e?.message?.slice(0, 255) ?? "Paystack init failed" }).where(eq(orders.id, order.id));
        revalidatePath("/admin/orders");
        return { ok: false, message: e?.message || "Failed to initialize Paystack payment. Please try again." };
      }
    }

    if (chosen === "stripe" && stripe) {
      const [order] = await db
        .insert(orders)
        .values({
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          totalCents,
          currency,
          status: "pending",
          paymentMethod: "stripe",
          downloadToken,
        })
        .returning();

      await db.insert(orderItems).values(
        selected.map(({ product, quantity }) => ({
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          unitPriceCents: getPrice(product),
          quantity,
          downloadUrl: product.downloadUrl,
        })),
      );

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: parsed.data.email,
        allow_promotion_codes: true,
        line_items: selected.map(({ product, quantity }) => ({
          quantity,
          price_data: {
            currency: product.currency.toLowerCase(),
            unit_amount: getPrice(product),
            product_data: {
              name: product.name,
              description: product.description.slice(0, 300),
            },
          },
        })),
        metadata: { orderId: String(order.id), downloadToken },
        success_url: `${appUrl}/checkout/success?order=${order.id}&token=${downloadToken}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/checkout?canceled=1`,
      });

      await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
      revalidatePath("/admin/orders");
      if (session.url) redirect(session.url);
      return { ok: false, message: "Unable to start Stripe checkout." };
    }

    return {
      ok: false,
      message: "Online payments are not configured yet. Please contact support or try again later.",
    };
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error && String((error as any).digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error(error);
    return { ok: false, message: "Checkout failed. Please try again." };
  }
}

export async function submitFeedback(_: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = feedbackSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the form errors.", errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  await db.insert(feedbackMessages).values({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    subject: data.subject,
    message: data.message,
    urgency: data.urgency,
    status: "new",
  } as any);

  revalidatePath("/admin/feedback");
  return { ok: true, message: data.urgency === "alarm" ? "Your alarm has been sent. Our team will respond urgently." : "Thank you for your feedback. We'll get back to you soon." };
}
