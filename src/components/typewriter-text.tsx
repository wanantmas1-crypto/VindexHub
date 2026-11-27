"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  withSound?: boolean;
  onComplete?: () => void;
};

let sharedCtx: AudioContext | null = null;
function getCtx() {
  if (sharedCtx && sharedCtx.state !== "closed") return sharedCtx;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  sharedCtx = Ctx ? new Ctx() : null;
  return sharedCtx;
}

function soundSettings() {
  try {
    const on = localStorage.getItem("vindex-sound") !== "off";
    const raw = Number(localStorage.getItem("vindex-sound-volume"));
    const volume = Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : 0.7;
    return { on, volume };
  } catch {
    return { on: true, volume: 0.7 };
  }
}

function playTick() {
  const s = soundSettings();
  if (!s.on || s.volume <= 0) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(720 + Math.random() * 120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.025);
  gain.gain.setValueAtTime(0.022 * s.volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.035);
}

export function TypewriterText({ text, className, speed = 22, startDelay = 0, withSound = false, onComplete }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const doneCalledRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(text.length);
      setDone(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text.length]);

  useEffect(() => {
    if (!started || done) return;
    const timeout = setTimeout(() => {
      const id = window.setInterval(() => {
        setCount((c) => {
          const next = c + 1;
          if (withSound && next % 3 === 0) playTick();
          if (next >= text.length) {
            window.clearInterval(id);
            setDone(true);
            return text.length;
          }
          return next;
        });
      }, speed);
      return () => window.clearInterval(id);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [started, done, speed, startDelay, text.length, withSound]);

  useEffect(() => {
    if (!done || doneCalledRef.current) return;
    doneCalledRef.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const shown = text.slice(0, count);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {shown}
        <span
          className={`inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 rounded-full bg-current transition-opacity duration-300 ${
            done ? "animate-[cursor-blink_1.1s_steps(1)_infinite] opacity-70" : "opacity-100"
          }`}
        />
      </span>
    </span>
  );
}