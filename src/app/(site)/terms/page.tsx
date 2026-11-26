import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = { title: "Terms & License" };

export default function TermsPage() {
  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Terms & License</h1>
        <p className="mt-4 leading-7 text-muted">
          By purchasing or using Vindex Hub products and services, you agree to these terms. Please review them before completing a purchase.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-muted">
          <section>
            <h2 className="text-base font-semibold text-text">Digital products</h2>
            <p className="mt-2">Software purchases include access to downloadable files and license keys as described on the product page. Licenses are provided according to the product&apos;s license type.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-text">Acceptable use</h2>
            <p className="mt-2">You may not redistribute, resell, or share licensed products except where explicitly permitted by the applicable license.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-text">Services</h2>
            <p className="mt-2">Custom service engagements are scoped, quoted, and delivered based on agreed requirements and timelines.</p>
          </section>
        </div>
      </Container>
    </main>
  );
}
