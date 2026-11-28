import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/container";
import { db } from "@/lib/db";
import { orderItems, orders, receipts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { Download, ArrowLeft, Printer } from "lucide-react";

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
  const ref = receipt?.paymentReference ?? order.mpesaReceiptNumber ?? order.stripePaymentIntentId;

  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm print:border-0 print:shadow-none">
          {/* Letterhead */}
          <div className="h-2 bg-primary" />
          <div className="border-b border-border bg-slate-50/80 px-8 py-8 dark:bg-slate-900/30 sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold tracking-[0.2em] text-primary">VINDEX HUB</p>
                <p className="mt-1 text-xs text-muted">Digital Products • Services • Secure Payments</p>
                <h1 className="mt-5 text-3xl font-bold tracking-tight text-text">Official Receipt</h1>
                <p className="mt-1 text-sm text-muted">Receipt #{receiptNumber}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-5 py-4 text-sm sm:text-right">
                <div className="text-muted">vindexhub.com</div>
                <div className="text-muted">support@vindexhub.com</div>
                <div className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">{order.status}</div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 sm:px-10">
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoCard label="Billed To" lines={[order.email, order.phone || undefined].filter(Boolean) as string[]} />
              <InfoCard label="Payment" lines={[`Method: ${order.paymentMethod}`, `Order: #${order.id}`, ref ? `Ref: ${ref}` : undefined].filter(Boolean) as string[]} />
              <InfoCard label="Dates" lines={[`Issued: ${new Date(issuedAt).toLocaleString()}`, order.paidAt ? `Paid: ${new Date(order.paidAt).toLocaleString()}` : undefined].filter(Boolean) as string[]} />
            </div>

            <div className="mt-8 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-muted dark:bg-slate-900/40">
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Unit Price</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="px-4 py-4 font-medium text-text">{item.productName}</td>
                      <td className="px-4 py-4 text-muted">{item.quantity}</td>
                      <td className="px-4 py-4 text-muted">{formatPrice(item.unitPriceCents, order.currency)}</td>
                      <td className="px-4 py-4 text-right font-medium text-text">{formatPrice(item.unitPriceCents * item.quantity, order.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 ml-auto max-w-sm rounded-xl border border-border bg-slate-50/70 p-5 dark:bg-slate-900/30">
              <div className="flex justify-between text-sm text-muted"><span>Subtotal</span><span>{formatPrice(order.totalCents, order.currency)}</span></div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold text-text"><span>Total Paid</span><span className="text-primary">{formatPrice(order.totalCents, order.currency)}</span></div>
            </div>

            <div className="mt-8 border-t border-border pt-6 text-xs text-muted">
              <p className="font-medium text-text">Thank you for your purchase.</p>
              <p className="mt-1">This is an electronic receipt issued by Vindex Hub. Keep it for your records.</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 print:hidden">
              <a href={`/api/receipts/${order.id}?token=${token}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:opacity-90"><Download className="h-4 w-4" /> Download PDF</a>
              <Link href={`/checkout/success?order=${order.id}&token=${token}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-medium text-text hover:bg-slate-50 dark:hover:bg-slate-900/40"><ArrowLeft className="h-4 w-4" /> Back to order</Link>
              <Link href="/orders/lookup" className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-text hover:bg-slate-50 dark:hover:bg-slate-900/40">Order lookup</Link>
            </div>
          </div>
          <div className="border-t border-border px-8 py-4 text-xs text-muted sm:px-10 flex justify-between">
            <span>Vindex Hub • Official Receipt</span>
            <span>Build by Vindex Hub</span>
          </div>
        </div>
      </Container>
    </main>
  );
}

function InfoCard({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-slate-50/60 p-4 dark:bg-slate-900/20">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-2 space-y-1 text-sm text-text">
        {lines.map((l, i) => <div key={i} className={i === 0 ? "font-medium" : "text-muted"}>{l}</div>)}
      </div>
    </div>
  );
}