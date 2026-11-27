"use client";

import { useActionState } from "react";
import { saveReviewScreenshot, type AdminActionState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";

const initial: AdminActionState = { ok: false, message: "" };

export function ReviewScreenshotForm({ reviewId }: { reviewId: number }) {
  const [state, action, pending] = useActionState(saveReviewScreenshot, initial);
  return (
    <form action={action} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="id" value={reviewId} />
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-muted">Review screenshot (optional)</label>
        <input name="screenshot" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:text-text" />
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>{pending ? "Uploading..." : "Upload screenshot"}</Button>
      {state.message && <p className={`text-xs sm:self-center ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
    </form>
  );
}