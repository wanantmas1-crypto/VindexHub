import Image from "next/image";
import { getAllReviews } from "@/lib/data";
import { setReviewStatus, setReviewSource } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewScreenshotForm } from "./review-screenshot-form";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Reviews Moderation</h1>
      <p className="mt-1 text-muted">Approve, reject, or keep reviews pending before they appear publicly. You can also attach a screenshot.</p>
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">{review.authorName} <span className="text-muted font-normal">({review.authorEmail})</span></div>
                <div className="text-sm text-muted">Rating: {review.rating}/5 • {(review as any).source ?? "web"} • {review.productId ? `Product #${review.productId}` : ""}{review.serviceId ? `Service #${review.serviceId}` : ""}</div>
              </div>
              <Badge variant={review.status === "approved" ? "success" : review.status === "rejected" ? "danger" : "warning"}>{review.status}</Badge>
            </div>
            <p className="mt-3 text-sm text-muted">{review.comment}</p>
            {review.screenshotUrl && (
              <div className="mt-3">
                <Image src={review.screenshotUrl} alt={`Review screenshot from ${review.authorName}`} width={640} height={360} className="max-h-56 w-auto rounded-lg border border-border object-cover" unoptimized />
              </div>
            )}
            <ReviewScreenshotForm reviewId={review.id} />
            <form action={setReviewSource} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={review.id} />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Testimonial source</label>
                <select name="source" defaultValue={(review as any).source ?? "web"} className="h-9 rounded-lg border border-border bg-bg px-2 text-sm text-text">
                  {["web", "whatsapp", "telegram", "instagram", "x"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Button type="submit" size="sm" variant="secondary">Save source</Button>
            </form>
            <div className="mt-4 flex gap-2">
              {["approved", "pending", "rejected"].map((status) => (
                <form key={status} action={setReviewStatus}>
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="status" value={status} />
                  <Button type="submit" size="sm" variant={status === "approved" ? "primary" : status === "rejected" ? "danger" : "secondary"}>
                    {status}
                  </Button>
                </form>
              ))}
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
      </div>
    </main>
  );
}