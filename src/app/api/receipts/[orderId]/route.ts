import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderItems, orders, receipts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateReceiptPdf } from "@/lib/pdf";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const ip = getClientIp(request.headers);
  const rl = rateLimit(`receipt:${ip}`, 30, 10 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { orderId } = await params;
  const id = Number(orderId);
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!Number.isFinite(id) || !token) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order || order.downloadToken !== token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [items, receipt] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.query.receipts.findFirst({ where: eq(receipts.orderId, id) }),
  ]);

  const receiptNumber = receipt?.receiptNumber ?? order.receiptNumber ?? `VXR-${order.id}`;
  const issuedAt = receipt?.issuedAt ?? order.paidAt ?? order.createdAt;
  const ref = receipt?.paymentReference ?? order.mpesaReceiptNumber ?? order.stripePaymentIntentId ?? null;

  const pdf = await generateReceiptPdf({
    receiptNumber,
    issuedAt,
    paidAt: order.paidAt,
    status: order.status,
    orderId: order.id,
    email: order.email,
    phone: order.phone,
    paymentMethod: order.paymentMethod,
    reference: ref,
    currency: order.currency,
    totalCents: order.totalCents,
    items: items.map((i) => ({ name: i.productName, quantity: i.quantity, unitPriceCents: i.unitPriceCents })),
  });

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${receiptNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}