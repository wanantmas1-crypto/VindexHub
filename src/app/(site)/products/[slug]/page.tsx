import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getProductBySlug, getApprovedReviewsForProduct } from "@/lib/data";
import { formatPrice, parseJsonArray } from "@/lib/utils";
import { ReviewForm } from "@/components/review-form";
import { Star, ShieldCheck, Download, KeyRound, CheckCircle2, Package } from "lucide-react";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product", description: product?.description };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const reviews = await getApprovedReviewsForProduct(product.id);
  const features = parseJsonArray<string>(product.features);
  const screenshots = parseJsonArray<string>((product as any).screenshots);
  const faqs = parseJsonArray<{ q: string; a: string }>((product as any).faqs);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} width={1200} height={800} className="rounded-2xl border border-border object-cover shadow-sm" />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-border bg-primary/10 text-primary">
                <Package className="h-12 w-12" />
              </div>
            )}
            {screenshots.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {screenshots.slice(0, 4).map((src, i) => (
                  <Image key={i} src={src} alt={`${product.name} screenshot ${i + 1}`} width={600} height={400} className="rounded-xl border border-border object-cover" />
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {product.categoryName && <Badge>{product.categoryName}</Badge>}
              <Badge variant="muted">{product.licenseType}</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-3xl font-bold text-primary">{formatPrice(product.priceCents, product.currency)}</p>
            <p className="mt-5 leading-7 text-muted">{product.description}</p>
            <div className="mt-4 text-sm text-muted">Version {product.version} • Ready for immediate use</div>
            {features.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-text">What you get</h2>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-8 rounded-2xl border border-border bg-slate-50 p-5 dark:bg-slate-900/40">
              <AddToCartButton product={{ productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, currency: product.currency, imageUrl: product.imageUrl }} />
              <div className="mt-5 grid gap-3 text-sm text-muted sm:grid-cols-3">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout</div>
                <div className="flex items-center gap-2"><Download className="h-4 w-4 text-primary" /> Instant download</div>
                <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> License key included</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {(product as any).systemRequirements && (
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-semibold">System Requirements</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{(product as any).systemRequirements}</p>
            </section>
          )}
          {(product as any).changelog && (
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-semibold">Changelog</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{(product as any).changelog}</p>
            </section>
          )}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold">Purchase Confidence</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              {["Secure payment processing", "Instant digital delivery", "License key for your purchase"].map((item) => (
                <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{item}</li>
              ))}
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><span><Link href="/refund-policy" className="text-primary hover:underline">Refund policy</Link> and <Link href="/license" className="text-primary hover:underline">license terms</Link></span></li>
            </ul>
          </section>
        </div>

        {faqs.length > 0 && (
          <section className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <div className="mt-6 space-y-5">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-border pb-5 last:border-0 last:pb-0">
                  <div className="font-medium text-text">{faq.q}</div>
                  <p className="mt-2 text-sm leading-6 text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Customer Reviews</h2>
            <p className="mt-1 text-sm text-muted">{reviews.length ? `${avg.toFixed(1)} / 5 from ${reviews.length} review(s)` : "Be the first to share your experience with this software."}</p>
            <div className="mt-5 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{review.comment}</p>
                  <div className="mt-3 text-sm font-medium">{review.authorName} {review.verifiedBuyer && <span className="text-xs font-normal text-success">(Verified buyer)</span>}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Leave a Review</h2>
            <p className="mt-1 text-sm text-muted">Reviews are moderated before appearing publicly.</p>
            <div className="mt-5 rounded-2xl border border-border bg-surface p-6">
              <ReviewForm productId={product.id} />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
