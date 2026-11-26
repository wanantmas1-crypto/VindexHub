"use client";

import { useActionState, useState } from "react";
import { saveCategory, deleteCategory, type AdminActionState } from "@/lib/admin-actions";
import type { Category } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initial: AdminActionState = { ok: false, message: "" };

export function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [state, action, pending] = useActionState(async (s: AdminActionState, fd: FormData) => {
    const res = await saveCategory(s, fd);
    if (res.ok) setEditing(null);
    return res;
  }, initial);

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Software Categories</h1>
      <p className="mt-1 text-muted">Organize software products into categories.</p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form action={action} className="rounded-xl border border-border bg-surface p-5 space-y-3 h-fit">
          <h2 className="font-semibold">{editing ? "Edit Category" : "Add Category"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Input name="name" placeholder="Category name" defaultValue={editing?.name} required />
          <Input name="slug" placeholder="Slug" defaultValue={editing?.slug} required />
          <Textarea name="description" placeholder="Description (optional)" defaultValue={editing?.description ?? ""} rows={3} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> Active</label>
          {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : editing ? "Update" : "Create"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>}
          </div>
        </form>
        <div className="space-y-3">
          {initialCategories.map((category) => (
            <div key={category.id} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{category.name} {!category.active && <span className="text-xs text-muted">(inactive)</span>}</div>
                <div className="text-sm text-muted">{category.slug}{category.description ? ` • ${category.description}` : ""}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(category)}>Edit</Button>
                <form action={deleteCategory}><input type="hidden" name="id" value={category.id} /><Button variant="danger" size="sm" type="submit">Delete</Button></form>
              </div>
            </div>
          ))}
          {initialCategories.length === 0 && <p className="text-muted">No categories yet.</p>}
        </div>
      </div>
    </main>
  );
}
