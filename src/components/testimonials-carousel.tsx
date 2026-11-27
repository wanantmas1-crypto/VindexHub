"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Globe, MessageCircle, Send } from "lucide-react";
import { ChatTestimonial, type Review, type ReviewSource, styleFor } from "./chat-testimonial";

const PLATFORMS: { key: ReviewSource; label: string }[] = [
  { key: "web", label: "Web" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "telegram", label: "Telegram" },
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X" },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function PlatformIcon({ source, className }: { source: ReviewSource; className?: string }) {
  if (source === "whatsapp") return <MessageCircle className={className} />;
  if (source === "telegram") return <Send className={className} />;
  if (source === "instagram") return <InstagramIcon className={className} />;
  if (source === "x") return <XIcon className={className} />;
  return <Globe className={className} />;
}

export function TestimonialsCarousel({ reviews }: { reviews: Review[] }) {
  const groups = useMemo(() => {
    const map: Record<ReviewSource, Review[]> = { web: [], whatsapp: [], telegram: [], instagram: [], x: [] };
    for (const r of reviews) {
      const s = (r.source as ReviewSource) || "web";
      (map[s] ?? map.web).push(r);
    }
    return PLATFORMS.map((p) => ({ ...p, items: map[p.key] }));
  }, [reviews]);

  const [active, setActive] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => { setVisibleCount(1); }, [active]);

  const slide = groups[active];
  const items = slide.items;
  const total = groups.length;

  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive((a) => (a - 1 + total) % total), [total]);

  const onDone = useCallback((idx: number) => {
    setVisibleCount((c) => (idx + 1 >= c ? Math.min(items.length, idx + 2) : c));
  }, [items.length]);

  const s = styleFor(slide.key);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {groups.map((g, i) => {
          const activeTab = i === active;
          return (
            <button
              key={g.key}
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]" : "bg-surface border border-border text-muted hover:text-text hover:border-primary/30"
              }`}
            >
              <PlatformIcon source={g.key} className="h-4 w-4" />
              <span>{g.label}</span>
              <span className={`text-xs ${activeTab ? "text-white/80" : "text-muted"}`}>{g.items.length}</span>
            </button>
          );
        })}
      </div>

      <div className={`mt-8 rounded-3xl border p-5 sm:p-8 transition-colors duration-500 ${s.wrap}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className={`inline-flex items-center gap-2 text-sm font-semibold ${s.header}`}>
              <PlatformIcon source={slide.key} className="h-4 w-4" />
              {slide.label} Testimonials
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text">What people say on {slide.label}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={prev} aria-label="Previous testimonials" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-text hover:border-primary/30 transition"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={next} aria-label="Next testimonials" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-text hover:border-primary/30 transition"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-10 text-center">
            <p className="font-medium text-text">No {slide.label} testimonials yet</p>
            <p className="mt-1 text-sm text-muted">Add one from the admin reviews panel and set its source to {slide.label}.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {items.slice(0, visibleCount).map((review, i) => (
              <ChatTestimonial
                key={`${slide.key}-${review.id}-${active}`}
                review={review}
                index={i}
                variant={slide.key}
                startDelay={0}
                active={true}
                onComplete={i === visibleCount - 1 ? () => onDone(i) : undefined}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between sm:justify-center gap-4">
          <button onClick={prev} aria-label="Previous" className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted"><ChevronLeft className="h-5 w-5" /></button>
          <div className="flex items-center gap-2">
            {groups.map((g, i) => (
              <button key={g.key} onClick={() => setActive(i)} aria-label={`Go to ${g.label}`} className={`h-2.5 rounded-full transition-all duration-300 ${i === active ? "w-8 bg-primary" : "w-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"}`} />
            ))}
          </div>
          <button onClick={next} aria-label="Next" className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
}