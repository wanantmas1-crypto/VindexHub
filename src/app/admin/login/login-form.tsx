"use client";

import { useActionState } from "react";
import { adminLogin, type AdminActionState } from "@/lib/admin-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: AdminActionState = { ok: false, message: "" };

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(adminLogin, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input name="email" type="email" required defaultValue="admin@vindexhub.com" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <Input name="password" type="password" required defaultValue="Admin123!ChangeMe" />
      </div>
      {state.message && <p className="text-sm text-danger">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in..." : "Sign in"}</Button>
      <p className="text-xs text-muted">Demo credentials are prefilled for local development. Change them in <code>.env.local</code>.</p>
    </form>
  );
}
