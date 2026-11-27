"use client";

import { Suspense, useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { createCheckout, type ActionState } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";

const initial: ActionState = { ok: false, message: "" };

function CheckoutContent() {
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [state, action, pending] = useActionState(createCheckout, initial);
  const [pollStatus, setPollStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const canceled = searchParams.get("canceled") === "1";
  const clearedRef = useRef(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { document.title = "Checkout | Vindex Hub"; }, []);

  useEffect(() => {
    if (state.ok && state.paymentPending && !clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
  }, [state.ok, state.paymentPending, clearCart]);

  useEffect(() => {
    if (!state.ok || !state.paymentPending || !state.orderId || !state.downloadToken) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 60; // ~5 minutes at 5s
    setPollStatus("pending");

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/orders/status?orderId=${state.orderId}&token=${state.downloadToken}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.status === "paid") {
          setPollStatus("paid");
          router.push(`/checkout/success?order=${state.orderId}&token=${state.downloadToken}`);
          return;
        }
        if (data.status === "failed" || data.status === "cancelled") {
          setPollStatus(data.status);
          return;
        }
      } catch {}
      if (!cancelled && attempts < maxAttempts) {
        setTimeout(poll, 5000);
      } else if (!cancelled) {
        setPollStatus("timeout");
      }
    };

    const t = setTimeout(poll, 4000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [state.ok, state.paymentPending, state.orderId, state.downloadToken, router]);

  if (!mounted) return <main className="py-14 sm:py-16"><Container><p className="text-muted">Loading...</p></Container></main>;
  const total = cartTotal(items);
  const currency = items[0]?.currency ?? "KES";
  const awaitingPayment = state.ok && state.paymentPending;

  return (
    <main className="py-14 sm:py-16">
      <Container className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Checkout</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Secure Checkout</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Enter your email and M-Pesa phone number. You&apos;ll receive an STK prompt on your phone to confirm payment - no account required.</p>

          {awaitingPayment ? (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {pollStatus === "paid" ? <CheckCircle2 className="h-6 w-6" /> : <Loader2 className="h-6 w-6 animate-spin" />}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-text">
                {pollStatus === "paid" ? "Payment confirmed" : pollStatus === "failed" ? "Payment failed" : pollStatus === "timeout" ? "Waiting for confirmation" : "Check your phone"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                {pollStatus === "paid"
                  ? "Redirecting to your order..."
                  : pollStatus === "failed"
                  ? "The M-Pesa payment was not completed. You can try again with a new checkout."
                  : pollStatus === "timeout"
                  ? "We haven't received confirmation yet. If you completed payment, use Order Lookup in a moment."
                  : state.message}
              </p>
              {state.orderId && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/40">
                  <div><span className="text-muted">Order ID:</span> <span className="font-medium text-text">#{state.orderId}</span></div>
                  <div className="mt-1"><span className="text-muted">Status:</span> <span className="font-medium text-text capitalize">{pollStatus ?? "pending"}</span></div>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/orders/lookup" className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-text hover:bg-slate-50 dark:hover:bg-slate-900/40">Order Lookup</Link>
                {(pollStatus === "failed" || pollStatus === "timeout") && (
                  <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white hover:opacity-90">Back to products</Link>
                )}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8">
              <p className="font-medium text-text">Your cart is empty.</p>
              <Link href="/products" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Browse software <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <form action={action} className="mt-8 rounded-2xl border border-border bg-surface p-6 space-y-5">
              <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity })))} />
              <input type="hidden" name="paymentMethod" value="mpesa" />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">Email address</label>
                <Input name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">M-Pesa phone number</label>
                <Input name="phone" type="tel" required placeholder="07XXXXXXXX or 2547XXXXXXXX" />
                <p className="mt-1.5 text-xs text-muted">You&apos;ll receive an STK prompt on this phone to confirm payment.</p>
              </div>
              {canceled && <p className="text-sm text-warning">Checkout was canceled. Your cart is still here.</p>}
              {state.message && !state.ok && <p className="text-sm text-danger">{state.message}</p>}
              <Button type="submit" disabled={pending || items.length === 0} className="w-full sm:w-auto">
                <Lock className="h-4 w-4" />
                {pending ? "Sending STK..." : `Pay ${formatPrice(total, currency)} with M-Pesa`}
              </Button>
              <p className="text-xs text-muted flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Secure M-Pesa payment. You only get download access after payment is confirmed.</p>
            </form>
          )}
        </div>
        <div className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-lg">Summary</h2>
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-4 text-sm">
                <span className="text-muted">{item.name} × {item.quantity}</span>
                <span className="font-medium text-text">{formatPrice(item.priceCents * item.quantity, item.currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4 flex justify-between font-semibold text-text">
            <span>Total</span>
            <span>{formatPrice(total, currency)}</span>
          </div>
        </div>
      </Container>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="py-14"><Container><p className="text-muted">Loading checkout...</p></Container></main>}>
      <CheckoutContent />
    </Suspense>
  );
}
