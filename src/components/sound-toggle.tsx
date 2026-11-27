"use client";

import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function readSettings() {
  try {
    const on = localStorage.getItem("vindex-sound") !== "off";
    const raw = Number(localStorage.getItem("vindex-sound-volume"));
    const volume = Number.isFinite(raw) ? Math.min(100, Math.max(0, Math.round(raw * 100))) : 50;
    return { on, volume };
  } catch {
    return { on: true, volume: 50 };
  }
}

export function SoundToggle() {
  const [open, setOpen] = useState(false);
  const [on, setOn] = useState(true);
  const [volume, setVolume] = useState(50);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const s = readSettings();
    setOn(s.on);
    setVolume(s.volume);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const persist = (nextOn: boolean, nextVol: number) => {
    try {
      localStorage.setItem("vindex-sound", nextOn ? "on" : "off");
      localStorage.setItem("vindex-sound-volume", String(nextVol / 100));
    } catch {}
  };

  const Icon = !on || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Sound settings"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-slate-100 hover:text-text dark:hover:bg-slate-800"
        title="Sound settings"
      >
        <Icon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-surface p-4 shadow-xl z-50">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-text">Interface sounds</span>
            <button
              type="button"
              onClick={() => {
                const next = !on;
                setOn(next);
                persist(next, volume);
              }}
              className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"}`}
              aria-pressed={on}
              aria-label={on ? "Mute sounds" : "Enable sounds"}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted mb-2">
              <span>Volume</span>
              <span>{volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                const nextOn = v > 0 ? on : false;
                if (v > 0 && !on) setOn(true);
                persist(v > 0 ? (on || v > 0) : false, v);
              }}
              className="w-full accent-primary"
              aria-label="Sound volume"
            />
          </div>
          <p className="mt-3 text-[11px] leading-4 text-muted">Click and scroll sounds. Plays after first interaction.</p>
        </div>
      )}
    </div>
  );
}