import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderItems, orders, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { createLicenseKey, downloadExpiryDate } from "@/lib/orders";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 400 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const orderId = Number(session.metadata?.orderId);
    if (Number.isFinite(orderId)) {
      const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
      if (order && order.status !== "paid") {
        await db.update(orders).set({
          status: "paid",
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
          downloadExpiresAt: downloadExpiryDate(7),
        }).where(eq(orders.id, orderId));

        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
        const allProducts = await db.select().from(products);
        for (const item of items) {
          if (!item.licenseKey) {
            const product = allProducts.find((p) => p.id === item.productId);
            await db.update(orderItems).set({
              licenseKey: createLicenseKey(product?.slug ?? "software"),
            }).where(eq(orderItems.id, item.id));
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
