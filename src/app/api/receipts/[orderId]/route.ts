import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderItems, orders, receipts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
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
  const ref = receipt?.paymentReference ?? order.mpesaReceiptNumber ?? order.stripePaymentIntentId ?? "";
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const rows = items.map((item) => `<tr>
    <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb">${esc(item.productName)}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb">${item.quantity}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb">${esc(formatPrice(item.unitPriceCents, order.currency))}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${esc(formatPrice(item.unitPriceCents * item.quantity, order.currency))}</td>
  </tr>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${esc(receiptNumber)}</title></head>
  <body style="font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 16px;color:#111">
    <div style="display:flex;justify-content:space-between;gap:16px;border-bottom:2px solid #e5e7eb;padding-bottom:16px">
      <div><div style="color:#0f766e;font-weight:700;letter-spacing:.04em">VINDEX HUB</div><h1 style="margin:8px 0 4px">Receipt</h1><div style="color:#555">Receipt #${esc(receiptNumber)}</div></div>
      <div style="text-align:right;color:#555;font-size:14px"><div><strong>Status:</strong> ${esc(order.status)}</div><div><strong>Issued:</strong> ${esc(new Date(issuedAt).toLocaleString())}</div>${order.paidAt ? `<div><strong>Paid:</strong> ${esc(new Date(order.paidAt).toLocaleString())}</div>` : ""}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;font-size:14px">
      <div style="background:#f8fafc;padding:14px;border-radius:10px"><div style="font-weight:600;margin-bottom:6px">Billed to</div><div>${esc(order.email)}</div>${order.phone ? `<div>${esc(order.phone)}</div>` : ""}</div>
      <div style="background:#f8fafc;padding:14px;border-radius:10px"><div style="font-weight:600;margin-bottom:6px">Payment</div><div>Method: ${esc(order.paymentMethod)}</div><div>Order ID: #${order.id}</div>${ref ? `<div>Reference: ${esc(ref)}</div>` : ""}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:24px;font-size:14px">
      <thead><tr><th style="text-align:left;padding:10px 8px;border-bottom:1px solid #e5e7eb">Item</th><th style="text-align:left;padding:10px 8px;border-bottom:1px solid #e5e7eb">Qty</th><th style="text-align:left;padding:10px 8px;border-bottom:1px solid #e5e7eb">Unit</th><th style="text-align:right;padding:10px 8px;border-bottom:1px solid #e5e7eb">Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:20px;margin-left:auto;max-width:260px;font-size:14px">
      <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Subtotal</span><span>${esc(formatPrice(order.totalCents, order.currency))}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid #e5e7eb;font-weight:700"><span>Total paid</span><span>${esc(formatPrice(order.totalCents, order.currency))}</span></div>
    </div>
    <p style="margin-top:28px;color:#666;font-size:12px">This is an electronic receipt for your Vindex Hub purchase. Keep it for your records.</p>
  </body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="receipt-${receiptNumber}.html"`,
    },
  });
}
