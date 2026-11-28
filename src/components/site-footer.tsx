import Link from "next/link";
import { Container } from "./container";
import { getSiteSettings } from "@/lib/data";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const explore = [
  { href: "/products", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/reviews", label: "Reviews" },
  { href: "/projects", label: "Projects" },
  { href: "/feedback", label: "Feedback" },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds" },
];

export async function SiteFooter() {
  const s = await getSiteSettings();
  const contacts = [
    s.contactEmail ? { icon: Mail, label: s.contactEmail, href: `mailto:${s.contactEmail}` } : null,
    s.contactPhone ? { icon: Phone, label: s.contactPhone, href: `tel:${s.contactPhone.replace(/\s+/g, "")}` } : null,
    s.contactWhatsapp ? { icon: MessageCircle, label: "WhatsApp", href: s.contactWhatsapp.startsWith("http") ? s.contactWhatsapp : `https://wa.me/${s.contactWhatsapp.replace(/[^\d]/g, "")}` } : null,
    s.contactAddress ? { icon: MapPin, label: s.contactAddress, href: null } : null,
  ].filter(Boolean) as { icon: any; label: string; href: string | null }[];
  const showContacts = s.showContacts && contacts.length > 0;

  return (
    <footer className="border-t border-border/70 bg-surface/60 backdrop-blur-sm">
      <Container className="py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-base font-semibold tracking-tight"><span className="text-primary">Vindex</span> Hub</div>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <p className="text-sm text-muted hidden sm:block">Digital products & services</p>
            </div>
            {showContacts && (
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                {contacts.map((c, i) => {
                  const Icon = c.icon;
                  const inner = <><Icon className="h-3.5 w-3.5" /><span>{c.label}</span></>;
                  return c.href ? <a key={i} href={c.href} className="inline-flex items-center gap-1.5 hover:text-text transition">{inner}</a> : <span key={i} className="inline-flex items-center gap-1.5">{inner}</span>;
                })}
              </div>
            )}
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