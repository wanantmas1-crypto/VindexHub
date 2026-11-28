type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

function prune(now: number) {
  if (store.size < 500) return;
  for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  prune(now);
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (entry.count >= limit) return { ok: false, remaining: 0, resetAt: entry.resetAt };
  entry.count += 1;
  return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(headers: Headers) {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") || "unknown";
}