"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, CreditCard } from "lucide-react";
import { Container } from "@/components/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { createCheckout, type ActionState } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";

const initial: ActionState = { ok: false, message: "" };

function CheckoutContent() {
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [state, action, pending] = useActionState(createCheckout, initial);
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  useEffect(() => setMounted(true), []);
  useEffect(() => { document.title = "Checkout | Vindex Hub"; }, []);

  if (!mounted) return <main className="py-14 sm:py-16"><Container><p className="text-muted">Loading...</p></Container></main>;
  const total = cartTotal(items);
  const currency = items[0]?.currency ?? "KES";

  return (
    <main className="py-14 sm:py-16">
      <Container className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Checkout</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Secure Checkout</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Pay securely with Paystack (M-Pesa, card, or bank, depending on availability). You’ll get download access only after payment is confirmed.</p>

          {items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8">
              <p className="font-medium text-text">Your cart is empty.</p>
              <Link href="/products" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Browse products <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <form action={action} className="mt-8 rounded-2xl border border-border bg-surface p-6 space-y-5">
              <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity })))} />
              <input type="hidden" name="paymentMethod" value="paystack" />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">Email address</label>
                <Input name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">Phone number (optional)</label>
                <Input name="phone" type="tel" placeholder="07XXXXXXXX" />
              </div>
              {canceled && <p className="text-sm text-warning">Checkout was canceled. Your cart is still here.</p>}
              {state.message && !state.ok && <p className="text-sm text-danger">{state.message}</p>}
              <Button type="submit" disabled={pending || items.length === 0} className="w-full sm:w-auto">
                <Lock className="h-4 w-4" />
                {pending ? "Redirecting to Paystack..." : `Pay ${formatPrice(total, currency)}`}
              </Button>
              <p className="text-xs text-muted flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />Secure payment via Paystack. Download access is granted only after confirmed payment.</p>
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
