"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
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
  offerPriceCents: number | null;
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
  const router = useRouter();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [state, action, pending] = useActionState(async (s: AdminActionState, fd: FormData) => {
    const res = await saveProduct(s, fd);
    if (res.ok) { setEditing(null); router.refresh(); }
    return res;
  }, initial);

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      <p className="mt-1 text-muted">Add and manage products.</p>
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
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="priceKes" type="number" min={0} step="0.01" placeholder="Price (KES)" defaultValue={editing ? editing.priceCents / 100 : ""} required />
            <Input name="offerPriceKes" type="number" min={0} step="0.01" placeholder="Offer price (KES)" defaultValue={editing?.offerPriceCents != null ? editing.offerPriceCents / 100 : ""} />
            <Input name="currency" placeholder="KES" defaultValue={editing?.currency ?? "KES"} required />
          </div>
          <p className="text-xs text-muted -mt-1">Enter prices in KES. Offer price is optional; if set lower than price, it becomes the active sale price.</p>
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
                <div className="text-sm text-muted">
                  {product.offerPriceCents != null && product.offerPriceCents < product.priceCents ? (
                    <><span className="font-medium text-primary">{formatPrice(product.offerPriceCents, product.currency)}</span> <span className="line-through">{formatPrice(product.priceCents, product.currency)}</span></>
                  ) : (
                    formatPrice(product.priceCents, product.currency)
                  )}{" "}
                  • {product.slug}{product.categoryName ? ` • ${product.categoryName}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(product)}>Edit</Button>
                <form action={async (fd) => { setDeletingId(product.id); await deleteProduct(fd); setDeletingId(null); router.refresh(); }}><input type="hidden" name="id" value={product.id} /><Button variant="danger" size="sm" type="submit" disabled={deletingId === product.id}>{deletingId === product.id ? "Deleting..." : "Delete"}</Button></form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
