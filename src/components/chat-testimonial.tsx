"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Bell, CheckCheck } from "lucide-react";
import { Star } from "lucide-react";
import { TypewriterText } from "./typewriter-text";

type Review = {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  verifiedBuyer: boolean;
  createdAt: Date | string;
};

type Variant = "whatsapp" | "telegram" | "notification";

const variants: Variant[] = ["whatsapp", "telegram", "notification"];

function styleFor(v: Variant) {
  if (v === "whatsapp") {
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
  if (v === "telegram") {
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
  return {
    wrap: "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700",
    header: "text-slate-700 dark:text-slate-200",
    bubble: "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
    meta: "text-slate-500 dark:text-slate-400",
    label: "New message",
    Icon: Bell,
    accent: "bg-primary",
  };
}

export function ChatTestimonial({ review, index }: { review: Review; index: number }) {
  const v = variants[index % variants.length];
  const s = styleFor(v);
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle" | "incoming" | "typing" | "message">("idle");

  useEffect(() => {
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
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("incoming"), 150 + index * 120));
    timers.push(setTimeout(() => setPhase("typing"), 900 + index * 120));
    timers.push(setTimeout(() => setPhase("message"), 1700 + index * 120));
    return () => timers.forEach(clearTimeout);
  }, [visible, index]);

  const Icon = s.Icon;
  const time = new Date(review.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div ref={ref} data-reveal style={{ "--reveal-delay": `${index * 90}ms` } as any}
      className={`hover-lift relative rounded-2xl border p-4 sm:p-5 ${s.wrap}`}>
      <div className={`flex items-center justify-between gap-3 text-xs font-semibold ${s.header}`}>
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${s.accent} text-white`}>
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
            <p className="text-sm leading-6">
              <TypewriterText text={review.comment} speed={18} withSound />
            </p>
          )}
          <div className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${s.meta}`}>
            <span>{review.verifiedBuyer ? "Verified buyer" : "Client"} • {time}</span>
            {v !== "notification" && <CheckCheck className="h-3.5 w-3.5 text-sky-500" />}
          </div>
        </div>
      </div>
    </div>
  );
}