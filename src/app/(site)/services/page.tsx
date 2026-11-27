import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/container";
import { getActiveServices } from "@/lib/data";
import { formatPrice, parseJsonArray } from "@/lib/utils";
import { ServiceRequestForm } from "@/components/service-request-form";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await getActiveServices();
  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-12">
          <div>
            <div data-reveal>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Services</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Professional Services</h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted">Professional services you can request directly. Tell us what you need and we’ll follow up.</p>
            </div>
            <div className="mt-10 space-y-6">
              {services.map((service, i) => (
                <article key={service.id} data-reveal style={{ "--reveal-delay": `${i * 90}ms` } as any} className="hover-lift rounded-2xl border border-border bg-surface p-6 hover:border-primary/20">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold">{service.name}</h2>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">From {formatPrice(service.startingPriceCents, service.currency)}</span>
                  </div>
                  <p className="mt-3 leading-7 text-muted">{service.description}</p>
                  <ul className="mt-5 grid gap-2.5 text-sm sm:grid-cols-2">
                    {parseJsonArray<string>(service.deliverables).map((d) => (
                      <li key={d} className="flex items-start gap-2 text-text">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
          <div>
            <div data-reveal className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Request a Service</h2>
              <p className="mt-1 text-sm leading-6 text-muted">No account required. We’ll respond by email.</p>
              <div className="mt-6">
                <ServiceRequestForm services={services} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
