"use client";

import { useEffect } from "react";

function getSettings() {
  try {
    const on = localStorage.getItem("vindex-sound") !== "off";
    const raw = Number(localStorage.getItem("vindex-sound-volume"));
    const volume = Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : 0.7;
    return { on, volume };
  } catch {
    return { on: true, volume: 0.7 };
  }
}

function playChime() {
  const s = getSettings();
  if (!s.on || s.volume <= 0) return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gain.gain.setValueAtTime(0.0001, now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.12 * s.volume, now + i * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.55);
  });

  setTimeout(() => { ctx.close().catch(() => {}); }, 1500);
}

export function PaymentSuccessSound() {
  useEffect(() => {
    const key = "vindex-payment-sound-played";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    // small delay to feel natural after load
    const t = setTimeout(playChime, 250);
    return () => clearTimeout(t);
  }, []);
  return null;
}