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

export function createReceiptNumber(orderId: number) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return `VXR-${y}${m}${day}-${String(orderId).padStart(6, "0")}-${rand}`;
}
