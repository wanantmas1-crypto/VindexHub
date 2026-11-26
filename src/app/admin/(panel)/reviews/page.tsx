import { getAllReviews } from "@/lib/data";
import { setReviewStatus } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Reviews Moderation</h1>
      <p className="mt-1 text-muted">Approve, reject, or keep reviews pending before they appear publicly.</p>
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">{review.authorName} <span className="text-muted font-normal">({review.authorEmail})</span></div>
                <div className="text-sm text-muted">Rating: {review.rating}/5 • {review.productId ? `Product #${review.productId}` : ""}{review.serviceId ? `Service #${review.serviceId}` : ""}</div>
              </div>
              <Badge variant={review.status === "approved" ? "success" : review.status === "rejected" ? "danger" : "warning"}>{review.status}</Badge>
            </div>
            <p className="mt-3 text-sm text-muted">{review.comment}</p>
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
