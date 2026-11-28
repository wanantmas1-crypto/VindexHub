import Link from "next/link";
import { Container } from "./container";

const explore = [
  { href: "/products", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/reviews", label: "Reviews" },
  { href: "/projects", label: "Projects" },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface/60 backdrop-blur-sm">
      <Container className="py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-base font-semibold tracking-tight"><span className="text-primary">Vindex</span> Hub</div>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <p className="text-sm text-muted hidden sm:block">Digital products & services</p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted" aria-label="Footer navigation">
            {explore.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-text">{l.label}</Link>
            ))}
            <span className="hidden sm:inline h-4 w-px bg-border" />
            {legal.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-text">{l.label}</Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Vindex Hub. All rights reserved.</p>
          <p>Build by Vindex Hub</p>
        </div>
      </Container>
    </footer>
  );
}