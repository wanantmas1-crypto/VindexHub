import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Search, ShoppingBag } from "lucide-react";
import { Container } from "@/components/container";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getActiveCategories, getActiveProducts } from "@/lib/data";
import { formatPrice, effectivePriceCents } from "@/lib/utils";

export const metadata: Metadata = { title: "Shop" };

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const { category, q, sort } = await searchParams;
  const selectedCategory = typeof category === "string" ? category : undefined;
  const query = typeof q === "string" ? q : undefined;
  const selectedSort = typeof sort === "string" ? sort : undefined;
  const [products, categories] = await Promise.all([
    getActiveProducts({ categorySlug: selectedCategory, q: query, sort: selectedSort }),
    getActiveCategories(),
  ]);

  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div data-reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Shop</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Products That Work for You</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Choose from practical, ready-to-use products built by our team. Purchase securely, get instant access, and start solving problems today.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted">
            {["Built by Vindex", "Instant access", "Secure checkout", "Promo codes supported"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <form data-reveal className="mt-8 grid gap-3 sm:grid-cols-[1fr_180px_auto]" action="/products">
          {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={query} placeholder="Search products..." className="h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <select name="sort" defaultValue={selectedSort ?? "newest"} className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
          <button className="btn-sheen h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">Search</button>
        </form>

        <div data-reveal className="mt-4 flex flex-wrap gap-2">
          <Link href={`/products${query || selectedSort ? `?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(selectedSort ? { sort: selectedSort } : {}) }).toString()}` : ""}`} className={`rounded-full px-4 py-2 text-sm font-medium border transition ${!selectedCategory ? "bg-primary text-white border-primary" : "bg-surface text-muted border-border hover:text-text hover:border-primary/30"}`}>All</Link>
          {categories.map((c) => {
            const params = new URLSearchParams({ category: c.slug, ...(query ? { q: query } : {}), ...(selectedSort ? { sort: selectedSort } : {}) });
            return (
              <Link key={c.id} href={`/products?${params.toString()}`} className={`rounded-full px-4 py-2 text-sm font-medium border transition ${selectedCategory === c.slug ? "bg-primary text-white border-primary" : "bg-surface text-muted border-border hover:text-text hover:border-primary/30"}`}>
                {c.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <article key={product.id} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as any} className="group hover-lift flex flex-col rounded-2xl border border-border bg-surface p-5 hover:border-primary/20 dark:hover:shadow-none">
              <div className="mb-4 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} width={800} height={600} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-primary"><ShoppingBag className="h-8 w-8" /></div>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {product.categoryName && <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{product.categoryName}</div>}
                  <h2 className="font-semibold text-lg leading-snug">{product.name}</h2>
                </div>
                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">{formatPrice(effectivePriceCents(product.priceCents, product.offerPriceCents), product.currency)}</span>
                  {product.offerPriceCents != null && product.offerPriceCents < product.priceCents && (
                    <div className="mt-1 text-xs text-muted line-through">{formatPrice(product.priceCents, product.currency)}</div>
                  )}
                </div>
              </div>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted line-clamp-3">{product.description}</p>
              <p className="mt-3 text-xs text-muted">Version {product.version} • {product.licenseType}</p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <AddToCartButton product={{ productId: product.id, slug: product.slug, name: product.name, priceCents: effectivePriceCents(product.priceCents, product.offerPriceCents), currency: product.currency, imageUrl: product.imageUrl }} />
                <Link href={`/products/${product.slug}`} className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-text transition hover:bg-slate-50 dark:hover:bg-slate-800 sm:w-auto">Details</Link>
              </div>
            </article>
          ))}
          {products.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
              <p className="font-medium text-text">No products found</p>
              <p className="mt-1 text-sm text-muted">Try a different search or category.</p>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
