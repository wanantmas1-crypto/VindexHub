import Link from "next/link";
import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="text-lg font-semibold tracking-tight"><span className="text-primary">Vindex</span> Hub</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Portfolio, digital products, and professional services built with quality and clarity.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-text">Explore</div>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
            <Link href="/projects" className="transition hover:text-text">Projects</Link>
            <Link href="/products" className="transition hover:text-text">Shop</Link>
            <Link href="/services" className="transition hover:text-text">Services</Link>
            <Link href="/reviews" className="transition hover:text-text">Reviews</Link>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-text">Legal</div>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
            <Link href="/privacy" className="transition hover:text-text">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-text">Terms & License</Link>
            <Link href="/refund-policy" className="transition hover:text-text">Refund Policy</Link>
          </div>
        </div>
      </Container>
      <Container className="border-t border-border py-5 text-sm text-muted">
        © {new Date().getFullYear()} Vindex Hub. All rights reserved.
      </Container>
    </footer>
  );
}
