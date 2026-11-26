"use client";

import { useActionState } from "react";
import { submitServiceRequest, type ActionState } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/db/schema";

const initial: ActionState = { ok: false, message: "" };

export function ServiceRequestForm({ services }: { services: Service[] }) {
  const [state, action, pending] = useActionState(submitServiceRequest, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Service</label>
        <select name="serviceId" className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" required>
          <option value="">Select a service</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm font-medium">Name</label><Input name="name" required /></div>
        <div><label className="mb-1 block text-sm font-medium">Email</label><Input name="email" type="email" required /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm font-medium">Company (optional)</label><Input name="company" /></div>
        <div><label className="mb-1 block text-sm font-medium">Budget (optional)</label><Input name="budget" placeholder="e.g. $2,000 - $5,000" /></div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Timeline (optional)</label>
        <Input name="timeline" placeholder="e.g. 4-6 weeks" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Project details</label>
        <Textarea name="message" required minLength={10} rows={5} placeholder="Tell us what you need..." />
      </div>
      {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Sending..." : "Request Service"}</Button>
    </form>
  );
}
