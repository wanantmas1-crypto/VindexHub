import "server-only";

export function isPaystackConfigured() {
  return !!process.env.PAYSTACK_SECRET_KEY;
}

export function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

type InitializeInput = {
  email: string;
  amount: number; // in subunits (cents)
  currency?: string; // KES, NGN, USD, etc.
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export async function initializePaystackTransaction(input: InitializeInput) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount),
      currency: (input.currency ?? "KES").toUpperCase(),
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as any;
  if (!res.ok || !data?.status) {
    throw new Error(data?.message || `Paystack initialize failed (${res.status})`);
  }
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${getPaystackSecretKey()}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as any;
  if (!res.ok || !data?.status) {
    throw new Error(data?.message || `Paystack verify failed (${res.status})`);
  }
  return data.data as { status: string; reference: string; amount: number; currency: string; metadata?: any };
}
