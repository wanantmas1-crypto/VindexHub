import Link from "next/link";
import { getAllOrders } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrdersLive } from "./orders-live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SP = { status?: string; q?: string };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const statusFilter = (sp.status || "all").toLowerCase();
  const q = (sp.q || "").trim().toLowerCase();
  const allOrders = await getAllOrders();

  const counts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const orders = allOrders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (!q) return true;
    const hay = [o.id, o.email, o.phone ?? "", o.paymentMethod ?? "", o.mpesaReceiptNumber ?? "", o.receiptNumber ?? "", o.status].join(" ").toLowerCase();
    return hay.includes(q);
  });

  const statuses = ["all", "paid", "pending", "failed", "cancelled"];

  return (
    <main>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-muted">Live order data from checkout. Filter, search, and monitor payment status.</p>
        </div>
        <OrdersLive />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statuses.filter((s) => s !== "all").map((s) => (
          <div key={s} className="rounded-xl border border-border bg-surface p-4">
            <div className="text-xs uppercase tracking-wide text-muted">{s}</div>
            <div className="mt-1 text-xl font-semibold">{counts[s] ?? 0}</div>
          </div>
        ))}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs uppercase tracking-wide text-muted">Total</div>
          <div className="mt-1 text-xl font-semibold">{allOrders.length}</div>
        </div>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/admin/orders">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search order ID, email, phone, receipt..." className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <select name="status" defaultValue={statusFilter} className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text">
          {statuses.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white">Filter</button>
        {(q || statusFilter !== "all") && <Link href="/admin/orders" className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm text-muted hover:text-text">Clear</Link>}
      </form>

      <div className="mt-4 text-sm text-muted">Showing {orders.length} of {allOrders.length} orders</div>

      <div className="mt-4 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Order #{order.id}</span>
                  <Badge variant={order.status === "paid" ? "success" : order.status === "pending" ? "warning" : order.status === "failed" ? "danger" : "default"}>{order.status}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted">{order.email}{order.phone ? ` • ${order.phone}` : ""}</div>
                <div className="mt-1 text-xs text-muted">
                  {new Date(order.createdAt).toLocaleString()} • {order.paymentMethod}
                  {order.mpesaReceiptNumber ? ` • Ref: ${order.mpesaReceiptNumber}` : ""}
                  {order.receiptNumber ? ` • Receipt: ${order.receiptNumber}` : ""}
                </div>
                {order.paymentFailureReason && <div className="mt-2 text-xs text-danger">Failure: {order.paymentFailureReason}</div>}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{formatPrice(order.totalCents, order.currency)}</div>
                {order.paidAt && <div className="text-xs text-muted">Paid {new Date(order.paidAt).toLocaleString()}</div>}
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 border-t border-border pt-2">
                  <span className="text-muted">{item.productName} × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.unitPriceCents * item.quantity, order.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">No orders match your filters.</div>}
      </div>
    </main>
  );
}