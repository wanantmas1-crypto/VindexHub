import "server-only";

import { sql } from "drizzle-orm";
import { db } from "./db";
import { auditLogs } from "./db/schema";

export async function logAudit(entry: {
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | number | null;
  detail?: string | null;
  ip?: string | null;
}) {
  try {
    await db.insert(auditLogs).values({
      actorEmail: entry.actorEmail ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId != null ? String(entry.targetId) : null,
      detail: entry.detail ?? null,
      ip: entry.ip ?? null,
    } as any);
  } catch (e: any) {
    const msg = String(e?.cause?.message || e?.message || e).toLowerCase();
    if (msg.includes("no such table: audit_logs")) {
      try {
        await db.run(sql`CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          actor_email TEXT,
          action TEXT NOT NULL,
          target_type TEXT,
          target_id TEXT,
          detail TEXT,
          ip TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        await db.insert(auditLogs).values({
          actorEmail: entry.actorEmail ?? null,
          action: entry.action,
          targetType: entry.targetType ?? null,
          targetId: entry.targetId != null ? String(entry.targetId) : null,
          detail: entry.detail ?? null,
          ip: entry.ip ?? null,
        } as any);
      } catch (e2) { console.error("[audit]", e2); }
    } else {
      console.error("[audit]", e);
    }
  }
}