import { NextResponse } from "next/server";
import crypto from "crypto";
import { fulfillPaidOrder } from "@/lib/fulfillment";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 400 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  if (!signature || hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success") {
    const data = event.data;
    const orderId = Number(data?.metadata?.orderId);
    if (Number.isFinite(orderId)) {
      await fulfillPaidOrder({
        orderId,
        paymentReference: data?.reference ?? null,
        paymentMethod: "paystack",
      });
    }
  }

  return NextResponse.json({ received: true });
}
