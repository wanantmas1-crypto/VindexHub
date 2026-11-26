import { getAllServiceRequests } from "@/lib/data";
import { setServiceRequestStatus } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statuses = ["new", "contacted", "in_progress", "completed", "closed"];

export default async function AdminRequestsPage() {
  const requests = await getAllServiceRequests();
  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Service Requests</h1>
      <p className="mt-1 text-muted">Track and update incoming service requests.</p>
      <div className="mt-6 space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">{req.name} <span className="text-muted font-normal">({req.email})</span></div>
                <div className="text-sm text-muted">Service #{req.serviceId} • {new Date(req.createdAt).toLocaleString()}</div>
              </div>
              <Badge variant={req.status === "new" ? "warning" : req.status === "completed" ? "success" : "default"}>{req.status}</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-3">
              <div><span className="font-medium text-text">Company:</span> {req.company || "-"}</div>
              <div><span className="font-medium text-text">Budget:</span> {req.budget || "-"}</div>
              <div><span className="font-medium text-text">Timeline:</span> {req.timeline || "-"}</div>
            </div>
            <p className="mt-3 text-sm whitespace-pre-wrap">{req.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <form key={status} action={setServiceRequestStatus}>
                  <input type="hidden" name="id" value={req.id} />
                  <input type="hidden" name="status" value={status} />
                  <Button type="submit" size="sm" variant="secondary">{status}</Button>
                </form>
              ))}
            </div>
          </div>
        ))}
        {requests.length === 0 && <p className="text-muted">No service requests yet.</p>}
      </div>
    </main>
  );
}
