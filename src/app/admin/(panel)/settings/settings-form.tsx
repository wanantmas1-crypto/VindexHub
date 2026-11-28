"use client";

import { useActionState } from "react";
import Image from "next/image";
import { saveSiteLogo, saveSiteContacts, type AdminActionState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: AdminActionState = { ok: false, message: "" };

type Settings = {
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactAddress: string | null;
  showContacts: boolean;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [logoState, logoAction, logoPending] = useActionState(saveSiteLogo, initial);
  const [contactState, contactAction, contactPending] = useActionState(saveSiteContacts, initial);

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
      <p className="mt-1 text-muted">Manage branding and public contact information.</p>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Company Logo</h2>
          <p className="mt-1 text-sm text-muted">Upload a PNG, JPG, WEBP, or SVG logo (max 2MB). This logo appears in the site header.</p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40 p-2">
              <Image src={settings.logoUrl || "/vindex-logo.svg"} alt="Current logo" width={64} height={64} className="h-14 w-14 object-contain" unoptimized />
            </div>
            <div className="text-sm text-muted">
              <div>Current logo</div>
              <div className="break-all">{settings.logoUrl || "/vindex-logo.svg (default)"}</div>
            </div>
          </div>

          <form action={logoAction} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Upload new logo</label>
              <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90" />
            </div>
            {logoState.message && <p className={`text-sm ${logoState.ok ? "text-success" : "text-danger"}`}>{logoState.message}</p>}
            <Button type="submit" disabled={logoPending}>{logoPending ? "Uploading..." : "Upload Logo"}</Button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Public Contact Information</h2>
          <p className="mt-1 text-sm text-muted">These contacts are shown on the Feedback page and footer when enabled.</p>

          <form action={contactAction} className="mt-5 space-y-4">
            <Field label="Contact Email"><Input name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} placeholder="support@vindexhub.com" /></Field>
            <Field label="Contact Phone"><Input name="contactPhone" defaultValue={settings.contactPhone ?? ""} placeholder="+254..." /></Field>
            <Field label="WhatsApp (number or link)"><Input name="contactWhatsapp" defaultValue={settings.contactWhatsapp ?? ""} placeholder="+254... or https://wa.me/..." /></Field>
            <Field label="Address / Location"><Input name="contactAddress" defaultValue={settings.contactAddress ?? ""} placeholder="Nairobi, Kenya" /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showContacts" defaultChecked={settings.showContacts} /> Show contacts publicly</label>
            {contactState.message && <p className={`text-sm ${contactState.ok ? "text-success" : "text-danger"}`}>{contactState.message}</p>}
            <Button type="submit" disabled={contactPending}>{contactPending ? "Saving..." : "Save Contacts"}</Button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label>{children}</div>;
}