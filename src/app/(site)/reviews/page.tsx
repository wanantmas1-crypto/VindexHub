import type { Metadata } from "next";
import { Container } from "@/components/container";
import { getApprovedReviews } from "@/lib/data";
import { ChatTestimonial } from "@/components/chat-testimonial";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews(50);
  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div data-reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Customer Reviews</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Real feedback from customers and clients — delivered like live chat messages.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review, i) => (
            <ChatTestimonial key={review.id} review={review} index={i} />
          ))}
        </div>
      </Container>
    </main>
  );
}