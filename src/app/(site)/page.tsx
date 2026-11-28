import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Sparkles, ShieldCheck, Zap, Code2, Wrench } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getActiveProducts } from "@/lib/data";
import { formatPrice, effectivePriceCents } from "@/lib/utils";
import { AddToCartButton } from "@/components/add-to-cart-button";

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-transparent">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/30" />
        <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-glow" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-glow" style={{ animationDelay: "2s" }} />

        <Container className="relative py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl" data-reveal>
            <Badge className="gap-1.5 px-3 py-1.5 backdrop-blur-sm bg-surface/70">
              <Sparkles className="h-3.5 w-3.5" />
              Vindex Hub Shop
            </Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.75rem] lg:leading-[1.08]">
              Buy ready-to-use products built to <span className="text-primary">solve real problems</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Browse our digital products, add to cart, and get secure access after payment. Need something else? Explore our portfolio or request a custom service.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#products" className="btn-sheen inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30">
                Shop Products
              </Link>
              <Link href="/projects" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface/80 px-6 text-sm font-semibold text-text backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-surface">
                <Code2 className="h-4 w-4" /> Portfolio
              </Link>
              <Link href="/services" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface/80 px-6 text-sm font-semibold text-text backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-surface">
                <Wrench className="h-4 w-4" /> Services
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-2 rounded-full bg-surface/60 px-3 py-1.5 backdrop-blur-sm"><ShieldCheck className="h-4 w-4 text-primary" />Secure payment</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-surface/60 px-3 py-1.5 backdrop-blur-sm"><Zap className="h-4 w-4 text-primary" />Instant access after payment</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-surface/60 px-3 py-1.5 backdrop-blur-sm"><ShoppingBag className="h-4 w-4 text-primary" />No account required</span>
            </div>
          </div>
        </Container>
      </section>

      <section id="products" className="py-16 sm:py-20 relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.06),_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.1),_transparent_60%)]" />
        <Container className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Products</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Products for Sale</h2>
              <p className="mt-2 text-muted">Choose a product, checkout securely, and download after confirmed payment.</p>
            </div>
            <Link href="/products" className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, i) => (
              <article key={product.id} data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as any} className="group hover-lift flex flex-col rounded-xl border border-border bg-surface p-3 hover:border-primary/20 dark:hover:shadow-none">
                <div className="mb-3 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={600} height={450} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center text-primary"><ShoppingBag className="h-7 w-7" /></div>
                  )}
                </div>
                {product.categoryName && <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">{product.categoryName}</div>}
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</h3>
                <p className="mt-1 flex-1 text-xs leading-5 text-muted line-clamp-2">{product.description}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-primary">{formatPrice(effectivePriceCents(product.priceCents, product.offerPriceCents), product.currency)}</span>
                  {product.offerPriceCents != null && product.offerPriceCents < product.priceCents && <span className="text-[11px] text-muted line-through">{formatPrice(product.priceCents, product.currency)}</span>}
                </div>
                <div className="mt-3 flex gap-2">
                  <AddToCartButton product={{ productId: product.id, slug: product.slug, name: product.name, priceCents: effectivePriceCents(product.priceCents, product.offerPriceCents), currency: product.currency, imageUrl: product.imageUrl }} size="sm" compact className="flex-1" />
                  <Link href={`/products/${product.slug}`} className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-3 text-xs font-medium text-text transition hover:bg-slate-50 dark:hover:bg-slate-800">View</Link>
                </div>
              </article>
            ))}
            {products.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                <p className="font-medium text-text">No products available yet</p>
                <p className="mt-1 text-sm text-muted">Check back soon for new products.</p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}
