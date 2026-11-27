import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/container";
import { db } from "@/lib/db";
import { orderItems, orders, receipts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const { token } = await searchParams;
  const id = Number(orderId);
  if (!Number.isFinite(id) || !token) notFound();

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order || order.downloadToken !== token) notFound();

  const [items, receipt] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.query.receipts.findFirst({ where: eq(receipts.orderId, id) }),
  ]);

  const receiptNumber = receipt?.receiptNumber ?? order.receiptNumber ?? `VXR-${order.id}`;
  const issuedAt = receipt?.issuedAt ?? order.paidAt ?? order.createdAt;

  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <div className="rounded-2xl border border-border bg-surface p-8 print:border-0 print:p-0 print:shadow-none">
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Vindex Hub</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">Receipt</h1>
              <p className="mt-1 text-sm text-muted">Receipt #{receiptNumber}</p>
            </div>
            <div className="text-sm text-muted sm:text-right">
              <div><span className="font-medium text-text">Status:</span> {order.status}</div>
              <div><span className="font-medium text-text">Issued:</span> {new Date(issuedAt).toLocaleString()}</div>
              {order.paidAt && <div><span className="font-medium text-text">Paid:</span> {new Date(order.paidAt).toLocaleString()}</div>}
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/40">
              <div className="font-medium text-text">Billed to</div>
              <div className="mt-2 text-muted">{order.email}</div>
              {order.phone && <div className="text-muted">{order.phone}</div>}
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/40">
              <div className="font-medium text-text">Payment</div>
              <div className="mt-2 text-muted">Method: <span className="text-text capitalize">{order.paymentMethod}</span></div>
              <div className="text-muted">Order ID: <span className="text-text">#{order.id}</span></div>
              {(receipt?.paymentReference ?? order.mpesaReceiptNumber) && (
                <div className="text-muted">Reference: <span className="font-mono text-text">{receipt?.paymentReference ?? order.mpesaReceiptNumber}</span></div>
              )}
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="py-3 pr-4 font-medium">Item</th>
                  <th className="py-3 pr-4 font-medium">Qty</th>
                  <th className="py-3 pr-4 font-medium">Unit</th>
                  <th className="py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="py-3 pr-4 text-text">{item.productName}</td>
                    <td className="py-3 pr-4 text-muted">{item.quantity}</td>
                    <td className="py-3 pr-4 text-muted">{formatPrice(item.unitPriceCents, order.currency)}</td>
                    <td className="py-3 text-right font-medium text-text">{formatPrice(item.unitPriceCents * item.quantity, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(order.totalCents, order.currency)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold text-text"><span>Total paid</span><span>{formatPrice(order.totalCents, order.currency)}</span></div>
          </div>

          <p className="mt-8 text-xs text-muted">This is an electronic receipt for your Vindex Hub purchase. Keep it for your records.</p>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <Link href={`/checkout/success?order=${order.id}&token=${token}`} className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:opacity-90">Back to order</Link>
            <Link href="/orders/lookup" className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-text hover:bg-slate-50 dark:hover:bg-slate-900/40">Order lookup</Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
