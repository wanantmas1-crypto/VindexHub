"use client";

import { useActionState } from "react";
import Image from "next/image";
import { saveSiteLogo, type AdminActionState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";

const initial: AdminActionState = { ok: false, message: "" };

export function SettingsForm({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const [state, action, pending] = useActionState(saveSiteLogo, initial);

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
      <p className="mt-1 text-muted">Manage branding assets used across the website.</p>

      <div className="mt-6 max-w-xl rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Company Logo</h2>
        <p className="mt-1 text-sm text-muted">Upload a PNG, JPG, WEBP, or SVG logo (max 2MB). This logo appears in the site header.</p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40 p-2">
            <Image src={currentLogoUrl || "/vindex-logo.svg"} alt="Current logo" width={64} height={64} className="h-14 w-14 object-contain" unoptimized />
          </div>
          <div className="text-sm text-muted">
            <div>Current logo</div>
            <div className="break-all">{currentLogoUrl || "/vindex-logo.svg (default)"}</div>
          </div>
        </div>

        <form action={action} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Upload new logo</label>
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90" />
          </div>
          {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
          <Button type="submit" disabled={pending}>{pending ? "Uploading..." : "Upload Logo"}</Button>
        </form>
      </div>
    </main>
  );
}
