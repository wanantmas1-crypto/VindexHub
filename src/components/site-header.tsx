import Link from "next/link";
import Image from "next/image";
import { Container } from "./container";
import { CartButton } from "./cart-button";
import { ThemeToggle } from "./theme-toggle";
import { SoundToggle } from "./sound-toggle";
import { getSiteSettings } from "@/lib/data";

const nav = [
  { href: "/products", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/reviews", label: "Reviews" },
  { href: "/projects", label: "Projects" },
  { href: "/feedback", label: "Feedback" },
];

export async function SiteHeader() {
  const settings = await getSiteSettings();
  const logoUrl = settings.logoUrl || "/vindex-logo.svg";
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-text">
          <Image src={logoUrl} alt="Vindex Hub logo" width={34} height={34} priority className="h-[34px] w-[34px] object-contain" unoptimized />
          <span><span className="text-primary">Vindex</span> Hub</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted hover:text-text transition">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <SoundToggle />
          <ThemeToggle />
          <CartButton />
        </div>
      </Container>
      <div className="border-t border-border md:hidden">
        <Container className="flex gap-4 overflow-x-auto py-2 text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-muted hover:text-text">
              {item.label}
            </Link>
          ))}
        </Container>
      </div>
    </header>
  );
}
