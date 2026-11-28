import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const ip = getClientIp(request.headers);
  const rl = rateLimit(`dl:${ip}`, 30, 10 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { itemId } = await params;
  const id = Number(itemId);
  const token = new URL(request.url).searchParams.get("token");
  if (!Number.isFinite(id) || !token) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const [item] = await db.select().from(orderItems).where(eq(orderItems.id, id)).limit(1);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [order] = await db.select().from(orders).where(eq(orders.id, item.orderId)).limit(1);
  if (!order || order.downloadToken !== token || order.status !== "paid") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (order.downloadExpiresAt && new Date(order.downloadExpiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Download link expired" }, { status: 410 });
  }
  if (!item.downloadUrl) return NextResponse.json({ error: "Download not available" }, { status: 404 });

  await db.update(orderItems).set({ downloadCount: (item.downloadCount ?? 0) + 1 }).where(eq(orderItems.id, id));
  return NextResponse.redirect(item.downloadUrl);
}
