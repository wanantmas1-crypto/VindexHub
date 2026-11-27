import { defineConfig } from "drizzle-kit";

const url =
  process.env.TURSO_DATABASE_URL ??
  process.env.VINDEX_HUB_DB_TURSO_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "file:./dev.db";
const authToken =
  process.env.TURSO_AUTH_TOKEN ??
  process.env.VINDEX_HUB_DB_TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url,
    authToken,
  },
});
