import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 leading-7 text-muted">
          We collect only the information needed to process orders, deliver digital products, and respond to service requests. This typically includes your email address, purchase details, and any information you submit through forms.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-muted">
          <section>
            <h2 className="text-base font-semibold text-text">Information we collect</h2>
            <p className="mt-2">Contact details you provide, order and payment metadata from our payment processor, and messages you send to us.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-text">How we use information</h2>
            <p className="mt-2">To fulfill purchases, provide downloads and license keys, respond to inquiries, improve our services, and meet legal obligations.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-text">Contact</h2>
            <p className="mt-2">For privacy-related questions, contact us through the service request form on our Services page.</p>
          </section>
        </div>
      </Container>
    </main>
  );
}
