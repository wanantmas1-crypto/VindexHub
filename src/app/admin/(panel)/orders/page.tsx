import { getAllOrders } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <p className="mt-1 text-muted">Guest checkout orders and purchased items.</p>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">Order #{order.id} — {order.email}</div>
                <div className="text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={order.status === "paid" ? "success" : "warning"}>{order.status}</Badge>
                <span className="font-semibold">{formatPrice(order.totalCents, order.currency)}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between border-t border-border pt-2">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>{formatPrice(item.unitPriceCents * item.quantity, order.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
      </div>
    </main>
  );
}
