"use client";

import { useActionState, useState } from "react";
import { saveProduct, deleteProduct, type AdminActionState } from "@/lib/admin-actions";
import type { Category } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatPrice, parseJsonArray } from "@/lib/utils";

type ProductRow = {
  id: number;
  categoryId: number | null;
  slug: string;
  name: string;
  description: string;
  features: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  fileUrl: string | null;
  downloadUrl: string | null;
  licenseType: string;
  version: string;
  active: boolean;
  createdAt: string;
  categoryName: string | null;
};

const initial: AdminActionState = { ok: false, message: "" };

export function ProductsManager({ initialProducts, categories }: { initialProducts: ProductRow[]; categories: Category[] }) {
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [state, action, pending] = useActionState(async (s: AdminActionState, fd: FormData) => {
    const res = await saveProduct(s, fd);
    if (res.ok) setEditing(null);
    return res;
  }, initial);

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      <p className="mt-1 text-muted">Add and manage software products.</p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form action={action} className="rounded-xl border border-border bg-surface p-5 space-y-3 h-fit">
          <h2 className="font-semibold">{editing ? "Edit Product" : "Add Product"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Input name="name" placeholder="Name" defaultValue={editing?.name} required />
          <Input name="slug" placeholder="Slug" defaultValue={editing?.slug} required />
          <select name="categoryId" defaultValue={editing?.categoryId ?? ""} className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm">
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Textarea name="description" placeholder="Description" defaultValue={editing?.description} required rows={4} />
          <Textarea name="features" placeholder="Features (one per line)" defaultValue={editing ? parseJsonArray<string>(editing.features).join("\n") : ""} rows={4} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="priceCents" type="number" min={0} placeholder="Price cents" defaultValue={editing?.priceCents} required />
            <Input name="currency" placeholder="USD" defaultValue={editing?.currency ?? "USD"} required />
          </div>
          <Input name="imageUrl" placeholder="Image URL" defaultValue={editing?.imageUrl ?? ""} />
          <Input name="downloadUrl" placeholder="Download URL / file path" defaultValue={editing?.downloadUrl ?? ""} />
          <Input name="licenseType" placeholder="License type" defaultValue={editing?.licenseType ?? "Standard License"} />
          <Input name="version" placeholder="Version" defaultValue={editing?.version ?? "1.0.0"} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> Active</label>
          {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : editing ? "Update" : "Create"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>}
          </div>
        </form>
        <div className="space-y-3">
          {initialProducts.map((product) => (
            <div key={product.id} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{product.name} {!product.active && <span className="text-xs text-muted">(inactive)</span>}</div>
                <div className="text-sm text-muted">{formatPrice(product.priceCents, product.currency)} • {product.slug}{product.categoryName ? ` • ${product.categoryName}` : ""}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(product)}>Edit</Button>
                <form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><Button variant="danger" size="sm" type="submit">Delete</Button></form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
