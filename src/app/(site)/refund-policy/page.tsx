import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Refund Policy</h1>
        <p className="mt-4 leading-7 text-muted">
          We want you to be confident in your purchase. If you experience an issue with a digital product, contact us and we&apos;ll work with you to resolve it.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-muted">
          <section>
            <h2 className="text-base font-semibold text-text">Digital downloads</h2>
            <p className="mt-2">Because digital products are delivered instantly, refunds are handled case by case. If a file is defective, inaccessible, or materially different from its description, please reach out promptly.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-text">Services</h2>
            <p className="mt-2">Service refunds or adjustments depend on the agreed scope, work completed, and contract terms.</p>
          </section>
        </div>
      </Container>
    </main>
  );
}
