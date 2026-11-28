"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useRef, useState } from "react";

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [bump, setBump] = useState(false);
  const prev = useRef(0);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  useEffect(() => {
    if (!mounted) return;
    if (count > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count, mounted]);

  return (
    <Link
      id="site-cart-button"
      href="/cart"
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text transition hover:bg-slate-100 dark:hover:bg-slate-800 ${bump ? "scale-110" : ""}`}
      aria-label={`Cart with ${count} items`}
      style={{ transition: "transform .2s cubic-bezier(.2,.8,.2,1), background-color .2s" }}
    >
      <ShoppingCart className={`h-4 w-4 transition-transform ${bump ? "-rotate-12" : ""}`} />
      {count > 0 && (
        <span className={`absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white transition-transform ${bump ? "scale-125" : ""}`}>
          {count}
        </span>
      )}
    </Link>
  );
}