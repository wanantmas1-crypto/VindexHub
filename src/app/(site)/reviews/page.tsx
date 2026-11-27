import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Container } from "@/components/container";
import { getApprovedReviews } from "@/lib/data";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews(50);
  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div data-reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Customer Reviews</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Approved feedback from customers and clients.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <article key={review.id} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as any} className="hover-lift rounded-2xl border border-border bg-surface p-6 hover:border-primary/20">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"}`} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">“{review.comment}”</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {review.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{review.authorName}</div>
                  <div className="text-xs text-muted">{review.verifiedBuyer ? "Verified buyer" : "Client review"} • {new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );
}
