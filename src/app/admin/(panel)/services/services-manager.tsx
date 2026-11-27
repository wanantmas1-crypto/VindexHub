"use client";

import { useActionState, useState } from "react";
import { saveService, deleteService, type AdminActionState } from "@/lib/admin-actions";
import type { Service } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatPrice, parseJsonArray } from "@/lib/utils";

const initial: AdminActionState = { ok: false, message: "" };

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const [editing, setEditing] = useState<Service | null>(null);
  const [state, action, pending] = useActionState(async (s: AdminActionState, fd: FormData) => {
    const res = await saveService(s, fd);
    if (res.ok) setEditing(null);
    return res;
  }, initial);

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Services</h1>
      <p className="mt-1 text-muted">Manage catalogue services users can request.</p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form action={action} className="rounded-xl border border-border bg-surface p-5 space-y-3 h-fit">
          <h2 className="font-semibold">{editing ? "Edit Service" : "Add Service"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Input name="name" placeholder="Name" defaultValue={editing?.name} required />
          <Input name="slug" placeholder="Slug" defaultValue={editing?.slug} required />
          <Textarea name="description" placeholder="Description" defaultValue={editing?.description} required rows={4} />
          <Textarea name="deliverables" placeholder="Deliverables (one per line)" defaultValue={editing ? parseJsonArray<string>(editing.deliverables).join("\n") : ""} rows={4} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="startingPriceCents" type="number" min={0} placeholder="Starting price cents" defaultValue={editing?.startingPriceCents} required />
            <Input name="currency" defaultValue={editing?.currency ?? "KES"} required />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> Active</label>
          {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : editing ? "Update" : "Create"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>}
          </div>
        </form>
        <div className="space-y-3">
          {initialServices.map((service) => (
            <div key={service.id} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{service.name} {!service.active && <span className="text-xs text-muted">(inactive)</span>}</div>
                <div className="text-sm text-muted">From {formatPrice(service.startingPriceCents, service.currency)}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(service)}>Edit</Button>
                <form action={deleteService}><input type="hidden" name="id" value={service.id} /><Button variant="danger" size="sm" type="submit">Delete</Button></form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
