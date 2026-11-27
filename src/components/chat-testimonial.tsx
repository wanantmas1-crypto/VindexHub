"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageCircle, Send, Globe, Star, CheckCheck } from "lucide-react";
import { TypewriterText } from "./typewriter-text";

export type ReviewSource = "web" | "whatsapp" | "telegram" | "instagram" | "x";

export type Review = {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  screenshotUrl?: string | null;
  source?: string | null;
  verifiedBuyer: boolean;
  createdAt: Date | string;
};

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

export function styleFor(source: ReviewSource) {
  if (source === "whatsapp") {
    return {
      wrap: "bg-[#e7fce3] dark:bg-[#153a2b] border-[#cfe9c8] dark:border-[#1f513d]",
      header: "text-[#1f7a4d] dark:text-[#7dd3a7]",
      bubble: "bg-white dark:bg-[#1f2c34] text-slate-800 dark:text-slate-100",
      meta: "text-slate-500 dark:text-slate-400",
      label: "WhatsApp",
      Icon: MessageCircle,
      accent: "bg-[#25D366]",
    };
  }
  if (source === "telegram") {
    return {
      wrap: "bg-[#e8f4fd] dark:bg-[#162b3d] border-[#cfe3f3] dark:border-[#22445f]",
      header: "text-[#229ED9] dark:text-[#7cc4ff]",
      bubble: "bg-white dark:bg-[#1b3348] text-slate-800 dark:text-slate-100",
      meta: "text-slate-500 dark:text-slate-400",
      label: "Telegram",
      Icon: Send,
      accent: "bg-[#229ED9]",
    };
  }
  if (source === "instagram") {
    return {
      wrap: "bg-gradient-to-br from-[#fff1f2] via-[#fff7ed] to-[#f5f3ff] dark:from-[#3b1d2a] dark:via-[#2b2117] dark:to-[#251f3d] border-[#f5c2d4] dark:border-[#5c3550]",
      header: "text-[#c13584] dark:text-[#f9a8d4]",
      bubble: "bg-white/95 dark:bg-[#2a2235] text-slate-800 dark:text-slate-100",
      meta: "text-slate-500 dark:text-slate-400",
      label: "Instagram",
      Icon: InstagramIcon,
      accent: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
    };
  }
  if (source === "x") {
    return {
      wrap: "bg-slate-100 dark:bg-[#14171a] border-slate-300 dark:border-slate-700",
      header: "text-slate-900 dark:text-slate-100",
      bubble: "bg-white dark:bg-[#1e2732] text-slate-800 dark:text-slate-100",
      meta: "text-slate-500 dark:text-slate-400",
      label: "X",
      Icon: XIcon,
      accent: "bg-black dark:bg-white dark:text-black text-white",
    };
  }
  return {
    wrap: "bg-blue-50/70 dark:bg-slate-800/70 border-blue-100 dark:border-slate-700",
    header: "text-primary dark:text-blue-300",
    bubble: "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
    meta: "text-slate-500 dark:text-slate-400",
    label: "Web testimonial",
    Icon: Globe,
    accent: "bg-primary",
  };
}

export function ChatTestimonial({
  review,
  index,
  variant,
  startDelay,
  active = true,
  onComplete,
}: {
  review: Review;
  index: number;
  variant?: ReviewSource;
  startDelay?: number;
  active?: boolean;
  onComplete?: () => void;
}) {
  const source = (variant ?? (review.source as ReviewSource) ?? "web") as ReviewSource;
  const s = styleFor(source);
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle" | "incoming" | "typing" | "message">("idle");
  const delay = startDelay ?? index * 2200;

  useEffect(() => {
    if (!active) {
      setVisible(false);
      setPhase("idle");
      return;
    }
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      setPhase("message");
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  useEffect(() => {
    if (!visible || !active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("incoming"), 120 + delay));
    timers.push(setTimeout(() => setPhase("typing"), 700 + delay));
    timers.push(setTimeout(() => setPhase("message"), 1400 + delay));
    return () => timers.forEach(clearTimeout);
  }, [visible, active, delay]);

  // completion is driven by TypewriterText onComplete

  const Icon = s.Icon;
  const time = new Date(review.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div ref={ref} className={`hover-lift relative rounded-2xl border p-4 sm:p-5 transition-all duration-500 ${s.wrap} ${active ? "opacity-100" : "opacity-40"}`}>
      <div className={`flex items-center justify-between gap-3 text-xs font-semibold ${s.header}`}>
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${s.accent}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span>{s.label}</span>
        </div>
        <span className={`transition-all duration-300 ${phase === "incoming" || phase === "typing" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">1 new</span>
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text truncate">{review.authorName}</div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-300 text-slate-300 dark:fill-slate-600 dark:text-slate-600"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className={`relative max-w-full rounded-2xl rounded-tl-md px-4 py-3 shadow-sm ${s.bubble}`}>
          {(phase === "idle" || phase === "incoming") && (
            <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          )}
          {phase === "typing" && (
            <div className="flex items-center gap-1 h-5" aria-label="Typing">
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
            </div>
          )}
          {phase === "message" && (
            <div className="space-y-2">
              <p className="text-sm leading-6">
                <TypewriterText text={review.comment} speed={18} withSound onComplete={onComplete} />
              </p>
              {review.screenshotUrl && (
                <Image src={review.screenshotUrl} alt={`Screenshot shared by ${review.authorName}`} width={480} height={270} className="mt-2 max-h-56 w-full rounded-lg border border-border/60 object-cover" unoptimized />
              )}
            </div>
          )}
          <div className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${s.meta}`}>
            <span>{review.verifiedBuyer ? "Verified buyer" : "Client"} • {time}</span>
            {source !== "web" && source !== "x" && <CheckCheck className="h-3.5 w-3.5 text-sky-500" />}
          </div>
        </div>
      </div>
    </div>
  );
}