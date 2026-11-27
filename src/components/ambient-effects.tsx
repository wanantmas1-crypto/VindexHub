"use client";

import { useEffect, useRef } from "react";

function createAudioCtx() {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return Ctx ? new Ctx() : null;
}

function playClick(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.035, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

function playScroll(ctx: AudioContext, dir: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 2;
  osc.type = "triangle";
  const start = dir > 0 ? 320 : 420;
  const end = dir > 0 ? 420 : 320;
  osc.frequency.setValueAtTime(start, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.012, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function enabled() {
  try {
    const v = localStorage.getItem("vindex-sound");
    if (v === "off") return false;
    if (v === "on") return true;
  } catch {}
  return true;
}

export function AmbientEffects() {
  const ctxRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);
  const lastScrollRef = useRef(0);
  const lastScrollPlayRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll reveal
    const revealEls = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.revealed)"));
    const io = !reduced && "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add("revealed");
              io?.unobserve(e.target);
            }
          }
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
      : null;
    const observe = () => { revealEls().forEach((el) => io?.observe(el)); };
    observe();
    if (reduced) revealEls().forEach((el) => el.classList.add("revealed"));
    const mo = new MutationObserver(() => observe());
    mo.observe(document.body, { childList: true, subtree: true });

    // Audio unlock
    const unlock = () => {
      if (unlockedRef.current) return;
      const ctx = createAudioCtx();
      if (!ctx) return;
      ctxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      unlockedRef.current = true;
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    const onClick = (e: MouseEvent) => {
      if (!enabled() || !ctxRef.current) return;
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const clickable = t.closest("a,button,[role='button'],input[type='submit'],summary");
      if (clickable) playClick(ctxRef.current);
    };
    window.addEventListener("click", onClick, { capture: true });

    const onScroll = () => {
      if (!enabled() || !ctxRef.current) return;
      const y = window.scrollY;
      const dir = y - lastScrollRef.current;
      lastScrollRef.current = y;
      const now = Date.now();
      if (Math.abs(dir) < 30 || now - lastScrollPlayRef.current < 900) return;
      lastScrollPlayRef.current = now;
      playScroll(ctxRef.current, dir);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io?.disconnect();
      mo.disconnect();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("click", onClick, { capture: true } as any);
      window.removeEventListener("scroll", onScroll);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return null;
}