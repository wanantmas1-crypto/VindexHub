"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/container";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

function QtyInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);
  return (
    <input
      type="number"
      min={1}
      max={10}
      value={draft}
      onChange={(e) => {
        const v = e.target.value;
        setDraft(v);
        if (v === "") return;
        const n = Number(v);
        if (Number.isFinite(n) && n >= 1) onCommit(Math.min(10, Math.floor(n)));
      }}
      onBlur={() => {
        const n = Number(draft);
        const next = Number.isFinite(n) && n >= 1 ? Math.min(10, Math.floor(n)) : 1;
        setDraft(String(next));
        onCommit(next);
      }}
      className="h-9 w-20 rounded-lg border border-border bg-bg px-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { document.title = "Cart | Vindex Hub"; }, []);
  if (!mounted) return <main className="py-14 sm:py-16"><Container><p className="text-muted">Loading cart...</p></Container></main>;

  const total = cartTotal(items);
  const currency = items[0]?.currency ?? "KES";

  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div data-reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Cart</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your Cart</h1>
          <p className="mt-2 text-muted">Guest checkout — no account required.</p>
        </div>
        {items.length === 0 ? (
          <div data-reveal className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <p className="mt-4 text-lg font-semibold text-text">Your cart is empty</p>
            <p className="mt-2 text-muted">Discover products built to save you time and help you get more done.</p>
            <Link href="/products" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition hover:opacity-90">
              Explore Shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={item.productId} data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as any} className="hover-lift flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={96} height={96} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-primary"><ShoppingBag className="h-6 w-6" /></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-semibold text-text">{item.name}</h2>
                        <p className="text-sm text-muted">{formatPrice(item.priceCents, item.currency)}</p>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-danger dark:hover:bg-red-950/30" aria-label="Remove item"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm text-muted">Qty</label>
                      <QtyInput value={item.quantity} onCommit={(n) => updateQuantity(item.productId, n)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div data-reveal className="h-fit rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-semibold text-lg">Order Summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-text">{formatPrice(total, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Tax</span>
                  <span className="text-muted">Calculated at checkout</span>
                </div>
              </div>
              <div className="mt-5 border-t border-border pt-4 flex items-center justify-between font-semibold text-text">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
              <Link href="/checkout" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition hover:opacity-90">Secure Checkout</Link>
              <p className="mt-3 text-center text-xs text-muted">Instant access after purchase • No account needed</p>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
