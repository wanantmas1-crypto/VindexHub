import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";
import { Container } from "@/components/container";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";
import { AutoDownloadReceipt } from "@/components/auto-download-receipt";
import { PaymentSuccessSound } from "@/components/payment-success-sound";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { fulfillPaidOrder } from "@/lib/fulfillment";

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const params = await searchParams;
  const orderId = params.order;
  const token = params.token;
  const reference = typeof params.reference === "string" ? params.reference : typeof params.trxref === "string" ? params.trxref : undefined;
  const id = Number(orderId);
  let order = Number.isFinite(id) ? await db.query.orders.findFirst({ where: eq(orders.id, id) }) : null;
  const valid = order && typeof token === "string" && order.downloadToken === token;

  if (valid && order!.status === "pending" && order!.paymentMethod === "paystack" && reference) {
    try {
      const tx = await verifyPaystackTransaction(reference);
      if (tx.status === "success") {
        await fulfillPaidOrder({ orderId: order!.id, paymentReference: tx.reference, paymentMethod: "paystack" });
        order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
      }
    } catch (e) {
      console.error("[checkout/success] paystack verify failed", e);
    }
  }

  const items = valid && order ? await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)) : [];

  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <div className="rounded-2xl border border-border bg-surface p-8 sm:p-10">
          {valid ? (
            <>
              <ClearCartOnMount />
              {order!.status === "paid" && <PaymentSuccessSound />}
              {order!.status === "paid" && <AutoDownloadReceipt orderId={order!.id} token={token as string} />}
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${order!.status === "paid" ? "bg-green-50 text-success dark:bg-green-950/40" : "bg-amber-50 text-amber-600 dark:bg-amber-950/40"}`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-text">{order!.status === "paid" ? "Order Confirmed" : "Payment Pending"}</h1>
              <p className="mt-2 leading-7 text-muted">{order!.status === "paid" ? "Thanks for your purchase. Save this page or your order ID for access to downloads and license keys." : "We received your order. Downloads and license keys will be available after payment is confirmed."}</p>
              <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm dark:bg-slate-900/40">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div><span className="text-muted">Order ID:</span> <span className="font-medium text-text">#{order!.id}</span></div>
                  <div><span className="text-muted">Email:</span> <span className="font-medium text-text">{order!.email}</span></div>
                  <div><span className="text-muted">Status:</span> <span className="font-medium text-text capitalize">{order!.status}</span></div>
                  <div><span className="text-muted">Total:</span> <span className="font-medium text-text">{formatPrice(order!.totalCents, order!.currency)}</span></div>
                </div>
                {order!.downloadExpiresAt && <div className="mt-2"><span className="text-muted">Download access until:</span> <span className="font-medium text-text">{new Date(order!.downloadExpiresAt).toLocaleString()}</span></div>}
              </div>
              <h2 className="mt-8 font-semibold text-lg">Your Products</h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border p-4 text-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium text-text">{item.productName}</div>
                        <div className="text-muted">Qty {item.quantity} • {formatPrice(item.unitPriceCents, order!.currency)}</div>
                        {order!.status === "paid" && item.licenseKey && <div className="mt-2 rounded-md bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-text dark:bg-slate-800">License: {item.licenseKey}</div>}
                      </div>
                      {order!.status === "paid" && item.downloadUrl ? (
                        <a href={`/api/downloads/${item.id}?token=${token}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90"><Download className="h-4 w-4" />Download</a>
                      ) : (
                        <span className="text-muted">{order!.status === "paid" ? "Download pending" : "Available after payment"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link href={`/orders/${order!.id}/receipt?token=${token}`} className="text-primary hover:underline">View receipt</Link>
                <span className="text-muted">•</span>
                <a href={`/api/receipts/${order!.id}?token=${token}`} className="text-primary hover:underline">Download PDF receipt</a>
                <span className="text-muted">•</span>
                <span className="text-muted">Need help later? Use <Link href="/orders/lookup" className="text-primary hover:underline">Order Lookup</Link> with your email and order ID.</span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text">Order not found</h1>
              <p className="mt-2 text-muted">The order link is invalid or expired.</p>
            </>
          )}
          <Link href="/products" className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition hover:opacity-90">Continue browsing</Link>
        </div>
      </Container>
    </main>
  );
}
