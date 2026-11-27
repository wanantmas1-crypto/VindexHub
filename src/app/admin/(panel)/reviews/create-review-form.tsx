"use client";

import { useActionState } from "react";
import { createAdminReview, type AdminActionState } from "@/lib/admin-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initial: AdminActionState = { ok: false, message: "" };

export function CreateReviewForm() {
  const [state, action, pending] = useActionState(createAdminReview, initial);
  return (
    <form action={action} className="rounded-xl border border-border bg-surface p-5 space-y-3">
      <h2 className="font-semibold">Add Testimonial Manually</h2>
      <p className="text-sm text-muted">Use this for WhatsApp, Instagram, X, Telegram, or web testimonials you received outside the site.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="authorName" placeholder="Author name" required />
        <Input name="authorEmail" type="email" placeholder="Author email (optional)" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="source" defaultValue="web" className="h-11 rounded-lg border border-border bg-surface px-3 text-sm">
          {["web","whatsapp","telegram","instagram","x"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="rating" defaultValue="5" className="h-11 rounded-lg border border-border bg-surface px-3 text-sm">
          {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} star{r>1?"s":""}</option>)}
        </select>
        <select name="status" defaultValue="approved" className="h-11 rounded-lg border border-border bg-surface px-3 text-sm">
          {["approved","pending","rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Textarea name="comment" placeholder="Testimonial message" rows={4} required />
      <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" name="verifiedBuyer" /> Verified buyer</label>
      {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Adding..." : "Add testimonial"}</Button>
    </form>
  );
}