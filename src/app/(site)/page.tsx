import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code2, ShoppingBag, Wrench, Star, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getActiveProducts, getActiveServices, getApprovedReviews, getFeaturedProjects } from "@/lib/data";
import { formatPrice, parseJsonArray } from "@/lib/utils";
import { AddToCartButton } from "@/components/add-to-cart-button";

export default async function HomePage() {
  const [projects, products, services, reviews] = await Promise.all([
    getFeaturedProjects(),
    getActiveProducts(),
    getActiveServices(),
    getApprovedReviews(3),
  ]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-950 dark:via-bg dark:to-bg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.10),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_50%)]" />
        <Container className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <Badge className="gap-1.5 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Company • Portfolio • Software • Services
            </Badge>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Software built to solve real problems —{" "}
              <span className="text-primary">ready when you are</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Vindex Hub is where we showcase what we build. Explore proven projects, get ready-to-use software you can start using today, or partner with us for a custom solution tailored to your business.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition hover:opacity-90">
                Shop Software
              </Link>
              <Link href="/projects" className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-semibold text-text transition hover:bg-slate-50 dark:hover:bg-slate-800">
                See Our Work
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Instant access</span>
              <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />No account required</span>
              <span className="inline-flex items-center gap-2"><Code2 className="h-4 w-4 text-primary" />Built by Vindex</span>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Code2, title: "Proven Work", desc: "Projects we’ve shipped" },
                { icon: ShoppingBag, title: "Ready Software", desc: "Buy and use today" },
                { icon: Wrench, title: "Custom Build", desc: "Tailored to your needs" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-semibold">{title}</div>
                  <div className="text-sm text-muted">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/90 p-6 shadow-xl shadow-slate-200/40 backdrop-blur dark:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-text">Featured Software</div>
                <div className="text-sm text-muted">Ready to download and use</div>
              </div>
              <Link href="/products" className="text-sm font-medium text-primary hover:underline">Browse all</Link>
            </div>
            <div className="mt-5 space-y-4">
              {products.slice(0, 2).map((product) => (
                <div key={product.id} className="flex items-center gap-4 rounded-xl border border-border bg-bg/50 p-4 transition hover:border-primary/30">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={72} height={72} className="h-[72px] w-[72px] rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-text">{product.name}</div>
                    <div className="mt-0.5 text-sm text-muted">{formatPrice(product.priceCents, product.currency)}</div>
                  </div>
                  <Link href={`/products/${product.slug}`} className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium text-text transition hover:bg-slate-50 dark:hover:bg-slate-800">View</Link>
                </div>
              ))}
              {products.length === 0 && <p className="text-sm text-muted">No featured software yet.</p>}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Portfolio</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Featured Projects</h2>
              <p className="mt-2 text-muted">A selection of work we’ve built and shipped.</p>
            </div>
            <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">All projects <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <article key={project.id} className="group overflow-hidden rounded-2xl border border-border bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none">
                {project.imageUrl ? (
                  <Image src={project.imageUrl} alt={project.title} width={800} height={500} className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-slate-100 dark:bg-slate-800 text-muted"><Code2 className="h-8 w-8" /></div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{project.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {parseJsonArray<string>(project.techStack).slice(0, 3).map((tech) => (
                      <span key={tech} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{tech}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-surface/50 py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Products</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Software Built for Results</h2>
              <p className="mt-2 text-muted">Practical tools crafted to save you time and streamline work.</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Browse all software <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <article key={product.id} className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} width={800} height={500} className="mb-4 h-44 w-full rounded-xl object-cover" />
                ) : (
                  <div className="mb-4 flex h-44 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShoppingBag className="h-8 w-8" /></div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-lg leading-snug">{product.name}</h3>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">{formatPrice(product.priceCents, product.currency)}</span>
                </div>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted line-clamp-3">{product.description}</p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <AddToCartButton product={{ productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, currency: product.currency, imageUrl: product.imageUrl }} />
                  <Link href={`/products/${product.slug}`} className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-text transition hover:bg-slate-50 dark:hover:bg-slate-800 sm:w-auto">Details</Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Services</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Need something custom?</h2>
            <p className="mt-2 text-muted">Professional services you can request directly.</p>
            <div className="mt-8 space-y-4">
              {services.slice(0, 3).map((service) => (
                <div key={service.id} className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted">{service.description}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-muted">From {formatPrice(service.startingPriceCents, service.currency)}</span>
                  </div>
                </div>
              ))}
              <Link href="/services" className="inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary hover:underline">View all services <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">What clients say</h2>
            <p className="mt-2 text-muted">Approved reviews from customers and clients.</p>
            <div className="mt-8 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">“{review.comment}”</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{review.authorName}</div>
                      <div className="text-xs text-muted">{review.verifiedBuyer ? "Verified buyer" : "Client review"}</div>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
