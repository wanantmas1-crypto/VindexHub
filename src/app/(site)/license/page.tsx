import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = { title: "License Terms" };

export default function LicensePage() {
  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">License Terms</h1>
        <p className="mt-4 leading-7 text-muted">
          Each software product includes a license that defines how it can be used. The specific license type is shown on the product page and in your purchase confirmation.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-muted">
          <section>
            <h2 className="text-base font-semibold text-text">License keys</h2>
            <p className="mt-2">Your purchase may include a license key for activation or verification. Keep it secure and do not share it publicly.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-text">Permitted use</h2>
            <p className="mt-2">Use the product according to the purchased license scope. Contact us if you need an extended or custom license.</p>
          </section>
        </div>
      </Container>
    </main>
  );
}
