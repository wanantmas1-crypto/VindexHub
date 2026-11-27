import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = Number(url.searchParams.get("orderId"));
  const token = url.searchParams.get("token");
  if (!Number.isFinite(orderId) || !token) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order || order.downloadToken !== token) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    receiptNumber: order.receiptNumber,
    paidAt: order.paidAt,
  });
}
