import "server-only";

import { randomUUID, randomBytes } from "crypto";

export function createDownloadToken() {
  return randomUUID();
}

export function createLicenseKey(productSlug: string) {
  const prefix = productSlug.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase().padEnd(4, "X");
  const part = () => randomBytes(2).toString("hex").toUpperCase();
  return `VX-${prefix}-${part()}-${part()}-${part()}`;
}

export function downloadExpiryDate(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
