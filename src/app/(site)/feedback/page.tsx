import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle, AlertTriangle, Clock } from "lucide-react";
import { Container } from "@/components/container";
import { getSiteSettings } from "@/lib/data";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = { title: "Feedback & Support" };

export default async function FeedbackPage() {
  const s = await getSiteSettings();
  const contacts = [
    s.contactEmail ? { icon: Mail, title: "Email", value: s.contactEmail, href: `mailto:${s.contactEmail}` } : null,
    s.contactPhone ? { icon: Phone, title: "Phone", value: s.contactPhone, href: `tel:${s.contactPhone.replace(/\s+/g, "")}` } : null,
    s.contactWhatsapp ? { icon: MessageCircle, title: "WhatsApp", value: s.contactWhatsapp, href: s.contactWhatsapp.startsWith("http") ? s.contactWhatsapp : `https://wa.me/${s.contactWhatsapp.replace(/[^\d]/g, "")}` } : null,
    s.contactAddress ? { icon: MapPin, title: "Location", value: s.contactAddress, href: null } : null,
  ].filter(Boolean) as { icon: any; title: string; value: string; href: string | null }[];
  const showContacts = s.showContacts && contacts.length > 0;

  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div data-reveal className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Feedback & Support</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Get Help or Raise an Alarm</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Have feedback, found an issue, or need urgent help? Send us a message. If something is critical, mark it as an <span className="font-medium text-text">Alarm</span> and we’ll prioritize it.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div data-reveal>
            <FeedbackForm />
          </div>

          <div className="space-y-4" data-reveal>
            {showContacts && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="font-semibold">Contact Channels</h2>
                <p className="mt-1 text-sm text-muted">Reach us directly through these channels.</p>
                <div className="mt-4 space-y-3">
                  {contacts.map((c, i) => {
                    const Icon = c.icon;
                    const content = (
                      <div className="flex items-start gap-3 rounded-xl border border-border bg-slate-50/60 p-3 dark:bg-slate-900/20">
                        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted">{c.title}</div>
                          <div className="text-sm text-text break-words">{c.value}</div>
                        </div>
                      </div>
                    );
                    return c.href ? <a key={i} href={c.href} className="block hover:opacity-90 transition">{content}</a> : <div key={i}>{content}</div>;
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300"><AlertTriangle className="h-4 w-4" /> Alarm Reports</div>
              <p className="mt-2 text-sm text-amber-900/80 dark:text-amber-200/80">Use <strong>Alarm</strong> urgency for critical issues like payment problems, missing access after payment, or security concerns.</p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-primary" /> Response</div>
              <p className="mt-2 text-sm text-muted">We review feedback regularly. Alarm reports are treated as high priority.</p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}