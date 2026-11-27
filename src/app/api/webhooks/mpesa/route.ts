import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseStkCallback } from "@/lib/mpesa";
import { fulfillPaidOrder } from "@/lib/fulfillment";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = parseStkCallback(body);
    if (!parsed) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.mpesaCheckoutRequestId, parsed.checkoutRequestId),
    });

    // Always acknowledge to Safaricom to avoid retries storms; we log unknown orders.
    if (!order) {
      console.warn("[mpesa] callback for unknown checkoutRequestId", parsed.checkoutRequestId);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (parsed.resultCode === 0) {
      await fulfillPaidOrder({
        orderId: order.id,
        paymentReference: parsed.receiptNumber ?? null,
        phone: parsed.phone ?? order.phone,
        paymentMethod: "mpesa",
      });
      await db.update(orders).set({ paymentFailureReason: null }).where(eq(orders.id, order.id));
    } else {
      // Known terminal failures. Unknown/non-terminal codes (e.g. 4999 "still processing") must not be marked failed.
      const terminalFailures = new Set([1, 1032, 1037, 2001, 1001, 1019, 1025, 9999]);
      const reason = `${parsed.resultCode}: ${parsed.resultDesc}`.slice(0, 255);
      const descLower = (parsed.resultDesc || "").toLowerCase();
      const terminal4999 = parsed.resultCode === 4999 && /wrong credential|invalid credential|authentication/.test(descLower);
      if (terminalFailures.has(parsed.resultCode) || terminal4999) {
        if (order.status === "pending") {
          await db.update(orders).set({ status: "failed", paymentFailureReason: reason }).where(eq(orders.id, order.id));
        }
      } else {
        // Keep pending for unknown/processing codes (e.g. 4999 still processing); store reason for visibility.
        if (order.status === "pending") {
          await db.update(orders).set({ paymentFailureReason: reason }).where(eq(orders.id, order.id));
        }
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("[mpesa] webhook error", error);
    // Return 200 to avoid aggressive retries for malformed payloads; Safaricom expects ResultCode/Desc.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
