import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";
import { Container } from "@/components/container";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { order: orderId, token } = await searchParams;
  const id = Number(orderId);
  const order = Number.isFinite(id) ? await db.query.orders.findFirst({ where: eq(orders.id, id) }) : null;
  const valid = order && typeof token === "string" && order.downloadToken === token;
  const items = valid ? await db.select().from(orderItems).where(eq(orderItems.orderId, order!.id)) : [];

  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <div className="rounded-2xl border border-border bg-surface p-8 sm:p-10">
          {valid ? (
            <>
              <ClearCartOnMount />
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
              <h2 className="mt-8 font-semibold text-lg">Your Software</h2>
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
              <p className="mt-5 text-sm text-muted">Need help later? Use <Link href="/orders/lookup" className="text-primary hover:underline">Order Lookup</Link> with your email and order ID.</p>
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
