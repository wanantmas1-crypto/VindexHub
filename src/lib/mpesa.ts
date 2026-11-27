import "server-only";

const SANDBOX_BASE = "https://sandbox.safaricom.co.ke";
const PROD_BASE = "https://api.safaricom.co.ke";

function baseUrl() {
  const env = (process.env.MPESA_ENV ?? "sandbox").toLowerCase().trim();
  return env === "production" || env === "prod" || env === "live" ? PROD_BASE : SANDBOX_BASE;
}

export function getMpesaEnv() {
  const env = (process.env.MPESA_ENV ?? "sandbox").toLowerCase().trim();
  return env === "production" || env === "prod" || env === "live" ? "production" : "sandbox";
}

export function isMpesaConfigured() {
  return !!(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_SHORTCODE &&
    process.env.MPESA_PASSKEY
  );
}

export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  if (digits.startsWith("1") && digits.length === 9) return `254${digits}`;
  return null;
}

export function mpesaTimestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function getMpesaAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`M-Pesa auth failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("M-Pesa auth missing access_token");
  return data.access_token;
}

export type StkPushInput = {
  amount: number; // whole currency units (KES)
  phone: string; // 254...
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
};

export type StkPushResult = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
};

export async function initiateStkPush(input: StkPushInput): Promise<StkPushResult> {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = mpesaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  const token = await getMpesaAccessToken();

  const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(input.amount),
      PartyA: input.phone,
      PartyB: shortcode,
      PhoneNumber: input.phone,
      CallBackURL: input.callbackUrl,
      AccountReference: input.accountReference.slice(0, 12),
      TransactionDesc: input.transactionDesc.slice(0, 13),
    }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(data.errorMessage || data.ResponseDescription || `M-Pesa STK push failed (${res.status})`);
  }
  return data as StkPushResult;
}

export type MpesaStkCallback = {
  Body?: {
    stkCallback?: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item?: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
};

export function parseStkCallback(body: MpesaStkCallback) {
  const cb = body?.Body?.stkCallback;
  if (!cb) return null;
  const items = cb.CallbackMetadata?.Item ?? [];
  const get = (name: string) => items.find((i) => i.Name === name)?.Value;
  return {
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    amount: get("Amount") as number | undefined,
    receiptNumber: get("MpesaReceiptNumber") as string | undefined,
    phone: get("PhoneNumber") ? String(get("PhoneNumber")) : undefined,
    transactionDate: get("TransactionDate") ? String(get("TransactionDate")) : undefined,
  };
}
