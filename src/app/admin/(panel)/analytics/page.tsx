import { getAnalytics } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const a = await getAnalytics();
  const maxRevenue = Math.max(1, ...a.topProducts.map((p) => p.revenueCents));

  return (
    <main>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted">Sales, product, review, and service request performance.</p>
        </div>
        <a href="/api/admin/reports/analytics" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:opacity-90">Download PDF Report</a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue (paid)" value={formatPrice(a.revenueCents)} />
        <Stat label="Paid Orders" value={String(a.paidOrders)} />
        <Stat label="Avg. Order Value" value={formatPrice(a.avgOrderCents)} />
        <Stat label="Products" value={String(a.products)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">Top Products by Revenue</h2>
          <div className="mt-4 space-y-4">
            {a.topProducts.length === 0 && <p className="text-sm text-muted">No paid product sales yet.</p>}
            {a.topProducts.map((p) => (
              <div key={p.productId}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted">{formatPrice(p.revenueCents)} • {p.quantity} sold</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${(p.revenueCents / maxRevenue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">Order Status</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(a.statusCounts).length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
            {Object.entries(a.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span className="capitalize">{status}</span>
                <Badge variant={status === "paid" ? "success" : status === "pending" ? "warning" : "default"}>{count}</Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">Reviews</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Total" value={a.reviewCounts.total} />
            <MiniStat label="Approved" value={a.reviewCounts.approved} />
            <MiniStat label="Pending" value={a.reviewCounts.pending} />
            <MiniStat label="Rejected" value={a.reviewCounts.rejected} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold">Service Requests</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(a.requestCounts).length === 0 && <p className="text-sm text-muted">No service requests yet.</p>}
            {Object.entries(a.requestCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span className="capitalize">{status.replace("_", " ")}</span>
                <Badge variant="default">{count}</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-semibold">Recent Orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {a.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-medium">#{o.id}</td>
                  <td className="py-2 pr-3 text-muted">{o.email}</td>
                  <td className="py-2 pr-3"><Badge variant={o.status === "paid" ? "success" : o.status === "pending" ? "warning" : "default"}>{o.status}</Badge></td>
                  <td className="py-2 pr-3">{formatPrice(o.totalCents, o.currency)}</td>
                  <td className="py-2 text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {a.recentOrders.length === 0 && (
                <tr><td className="py-3 text-muted" colSpan={5}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
