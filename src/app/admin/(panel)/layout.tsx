import Link from "next/link";
import { adminLogout } from "@/lib/admin-actions";
import { LayoutDashboard, Package, Wrench, FolderKanban, Star, Inbox, ShoppingCart, LogOut, Tags, Settings, BarChart3 } from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/requests", label: "Requests", icon: Inbox },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/40 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-surface lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/admin" className="font-semibold"><span className="text-primary">Vindex</span> Admin</Link>
          <Link href="/" className="text-xs text-muted hover:text-text lg:hidden">Site</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-4">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text whitespace-nowrap">
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-3 pb-4 lg:block">
          <form action={adminLogout}>
            <button className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </form>
          <Link href="/" className="mt-1 inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text">View site</Link>
        </div>
      </aside>
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
