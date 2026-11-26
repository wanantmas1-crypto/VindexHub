"use client";

import { useActionState } from "react";
import { submitReview, type ActionState } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initial: ActionState = { ok: false, message: "" };

export function ReviewForm({ productId, serviceId }: { productId?: number; serviceId?: number }) {
  const [state, action, pending] = useActionState(submitReview, initial);
  return (
    <form action={action} className="space-y-4">
      {productId ? <input type="hidden" name="productId" value={productId} /> : null}
      {serviceId ? <input type="hidden" name="serviceId" value={serviceId} /> : null}
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input name="authorName" required maxLength={100} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input name="authorEmail" type="email" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Rating</label>
        <select name="rating" className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="5">
          {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Review</label>
        <Textarea name="comment" required minLength={10} maxLength={1500} rows={4} />
      </div>
      {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Submitting..." : "Submit Review"}</Button>
    </form>
  );
}
