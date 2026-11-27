"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

export function SoundToggle() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    try { setOn(localStorage.getItem("vindex-sound") !== "off"); } catch {}
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !on;
        setOn(next);
        try { localStorage.setItem("vindex-sound", next ? "on" : "off"); } catch {}
      }}
      aria-pressed={on}
      aria-label={on ? "Mute interface sounds" : "Enable interface sounds"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-slate-100 hover:text-text dark:hover:bg-slate-800"
      title={on ? "Sound on" : "Sound off"}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}