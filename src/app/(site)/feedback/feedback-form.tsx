"use client";

import { useActionState } from "react";
import { submitFeedback, type ActionState } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initial: ActionState = { ok: false, message: "" };

export function FeedbackForm() {
  const [state, action, pending] = useActionState(submitFeedback, initial);
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={state.errors?.name?.[0]}>
          <Input name="name" required placeholder="Your name" />
        </Field>
        <Field label="Email" error={state.errors?.email?.[0]}>
          <Input name="email" type="email" required placeholder="you@example.com" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone (optional)" error={state.errors?.phone?.[0]}>
          <Input name="phone" placeholder="+254..." />
        </Field>
        <Field label="Urgency" error={state.errors?.urgency?.[0]}>
          <select name="urgency" defaultValue="normal" className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm">
            <option value="normal">Normal - feedback/question</option>
            <option value="urgent">Urgent - needs quick attention</option>
            <option value="alarm">Alarm - critical issue</option>
          </select>
        </Field>
      </div>
      <Field label="Subject" error={state.errors?.subject?.[0]}>
        <Input name="subject" required placeholder="What is this about?" />
      </Field>
      <Field label="Message" error={state.errors?.message?.[0]}>
        <Textarea name="message" rows={6} required placeholder="Describe the issue, feedback, or alarm in detail..." />
      </Field>
      {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Sending..." : "Send Feedback"}</Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}