import { getAdminStats } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const cards = [
    { label: "Products", value: stats.products },
    { label: "Services", value: stats.services },
    { label: "New Requests", value: stats.newRequests },
    { label: "Pending Reviews", value: stats.pendingReviews },
    { label: "Orders", value: stats.orders },
    { label: "Revenue", value: formatPrice(stats.revenueCents) },
  ];

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted">Overview of your store, services, and moderation queue.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="text-sm text-muted">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
