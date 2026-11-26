"use client";

import { useActionState } from "react";
import { lookupOrder, type OrderLookupState } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const initial: OrderLookupState = { ok: false, message: "" };

export function OrderLookupForm() {
  const [state, action, pending] = useActionState(lookupOrder, initial);

  return (
    <div className="space-y-6">
      <form action={action} className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input name="email" type="email" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Order ID</label>
            <Input name="orderId" type="number" required min={1} />
          </div>
        </div>
        {state.message && !state.ok && <p className="text-sm text-danger">{state.message}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Looking up..." : "Find Order"}</Button>
      </form>

      {state.ok && state.order && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold">Order #{state.order.id}</h2>
          <p className="text-sm text-muted">{state.order.email} • {state.order.status} • {formatPrice(state.order.totalCents, state.order.currency)}</p>
          {state.order.downloadExpiresAt && <p className="mt-1 text-sm text-muted">Download access until {new Date(state.order.downloadExpiresAt).toLocaleString()}</p>}
          <div className="mt-4 space-y-3">
            {state.items?.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-4 text-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">{item.productName} × {item.quantity}</div>
                    {item.licenseKey && <div className="mt-1 font-mono text-xs">License: {item.licenseKey}</div>}
                  </div>
                  {item.downloadUrl && state.order?.downloadToken ? (
                    <a href={`/api/downloads/${item.id}?token=${state.order.downloadToken}`} className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:opacity-90">Download</a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
