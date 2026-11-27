import type { Metadata } from "next";
import { Container } from "@/components/container";
import { getApprovedReviews } from "@/lib/data";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews(60);
  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div data-reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Sweet Words from Real People</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Feedback from clients across the web, WhatsApp, Telegram, Instagram, and X — shared one message at a time.</p>
        </div>
        <TestimonialsCarousel reviews={reviews as any} />
      </Container>
    </main>
  );
}