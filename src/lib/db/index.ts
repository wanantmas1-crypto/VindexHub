import "server-only";

import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const isVercel = !!process.env.VERCEL;
const configuredUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
const url = configuredUrl ?? (isVercel ? "file:/tmp/vindex.db" : "file:./dev.db");
const authToken = process.env.TURSO_AUTH_TOKEN;

const globalForDb = globalThis as unknown as {
  client?: Client;
};

function makeClient(): Client {
  try {
    return createClient({ url, authToken });
  } catch (e) {
    console.error("[db] failed to create client", e);
    return createClient({ url: "file:/tmp/vindex-fallback.db" });
  }
}

const client = globalForDb.client ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
export { schema };
