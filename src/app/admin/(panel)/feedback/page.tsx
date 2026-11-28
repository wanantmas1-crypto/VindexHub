import Link from "next/link";
import { getAllFeedbackMessages } from "@/lib/data";
import { setFeedbackStatus } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SP = { status?: string; urgency?: string };

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const statusFilter = (sp.status || "all").toLowerCase();
  const urgencyFilter = (sp.urgency || "all").toLowerCase();
  const all = await getAllFeedbackMessages();
  const messages = all.filter((m) => (statusFilter === "all" || m.status === statusFilter) && (urgencyFilter === "all" || m.urgency === urgencyFilter));
  const statuses = ["new", "in_review", "resolved", "closed"];
  const urgencies = ["normal", "urgent", "alarm"];

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Feedback & Alarms</h1>
      <p className="mt-1 text-muted">Client feedback and issue reports. Treat <span className="font-medium text-danger">alarm</span> reports as high priority.</p>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/admin/feedback">
        <select name="status" defaultValue={statusFilter} className="h-11 rounded-xl border border-border bg-surface px-3 text-sm">
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="urgency" defaultValue={urgencyFilter} className="h-11 rounded-xl border border-border bg-surface px-3 text-sm">
          <option value="all">All urgencies</option>
          {urgencies.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white">Filter</button>
        {(statusFilter !== "all" || urgencyFilter !== "all") && <Link href="/admin/feedback" className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm text-muted hover:text-text">Clear</Link>}
      </form>

      <div className="mt-4 text-sm text-muted">Showing {messages.length} of {all.length} messages</div>

      <div className="mt-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-xl border bg-surface p-5 ${m.urgency === "alarm" ? "border-danger/40" : "border-border"}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{m.subject}</span>
                  <Badge variant={m.urgency === "alarm" ? "danger" : m.urgency === "urgent" ? "warning" : "default"}>{m.urgency}</Badge>
                  <Badge variant={m.status === "resolved" ? "success" : m.status === "new" ? "warning" : "default"}>{m.status}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted">{m.name} • {m.email}{m.phone ? ` • ${m.phone}` : ""}</div>
                <div className="mt-1 text-xs text-muted">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
              <form action={setFeedbackStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={m.id} />
                <select name="status" defaultValue={m.status} className="h-9 rounded-lg border border-border bg-surface px-2 text-sm">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button type="submit" variant="secondary" size="sm">Update</Button>
              </form>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-text/90">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">No feedback messages found.</div>}
      </div>
    </main>
  );
}