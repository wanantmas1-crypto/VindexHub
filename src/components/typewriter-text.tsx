"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
};

export function TypewriterText({ text, className, speed = 22, startDelay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

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
  }, [started, done, speed, startDelay, text.length]);

  const shown = text.slice(0, count);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {shown}
        <span
          className={`inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 rounded-full bg-primary transition-opacity duration-300 ${
            done ? "animate-[cursor-blink_1.1s_steps(1)_infinite]" : "opacity-100"
          }`}
        />
      </span>
    </span>
  );
}