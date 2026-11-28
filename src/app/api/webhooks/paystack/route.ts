import { NextResponse } from "next/server";
import crypto from "crypto";
import { fulfillPaidOrder } from "@/lib/fulfillment";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Paystack not configured" }, { status: 400 });

  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  const sigBuf = Buffer.from(signature || "", "utf8");
  const hashBuf = Buffer.from(hash, "utf8");
  if (!signature || sigBuf.length !== hashBuf.length || !crypto.timingSafeEqual(hashBuf, sigBuf)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try { event = JSON.parse(body); }
  catch { return NextResponse.json({ error: "Invalid payload" }, { status: 400 }); }

  if (event.event === "charge.success") {
    const data = event.data;
    const orderId = Number(data?.metadata?.orderId);
    const reference = String(data?.reference ?? "");
    if (Number.isFinite(orderId) && reference) {
      try {
        const tx = await verifyPaystackTransaction(reference);
        if (tx.status === "success") {
          await fulfillPaidOrder({
            orderId,
            paymentReference: tx.reference,
            paymentMethod: "paystack",
            expectedAmountCents: Number(tx.amount),
            expectedCurrency: String(tx.currency),
          });
        }
      } catch (e) {
        console.error("[paystack webhook]", e);
        return NextResponse.json({ error: "Verification failed" }, { status: 400 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
