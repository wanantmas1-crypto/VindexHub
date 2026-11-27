import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { orderItems, orders, products, receipts } from "./db/schema";
import { createLicenseKey, createReceiptNumber, downloadExpiryDate } from "./orders";

export type FulfillPaymentInput = {
  orderId: number;
  paymentReference?: string | null;
  phone?: string | null;
  paymentMethod?: string | null;
};

/**
 * Marks an order as paid and issues licenses/receipt. Idempotent and transactional.
 * Only call after payment has been confirmed by the payment provider.
 */
export async function fulfillPaidOrder(input: FulfillPaymentInput) {
  return await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
    if (!order) throw new Error("Order not found");

    // Idempotency: if already paid, ensure receipt exists and return.
    if (order.status === "paid") {
      const existingReceipt = await tx.query.receipts.findFirst({ where: eq(receipts.orderId, order.id) });
      return { order, alreadyPaid: true, receiptId: existingReceipt?.id ?? null };
    }

    if (order.status !== "pending") {
      throw new Error(`Order cannot be fulfilled from status ${order.status}`);
    }

    const paidAt = new Date().toISOString();
    const receiptNumber = order.receiptNumber ?? createReceiptNumber(order.id);
    const downloadExpiresAt = order.downloadExpiresAt ?? downloadExpiryDate(7);

    await tx
      .update(orders)
      .set({
        status: "paid",
        paidAt,
        downloadExpiresAt,
        receiptNumber,
        mpesaReceiptNumber: input.paymentReference ?? order.mpesaReceiptNumber,
        phone: input.phone ?? order.phone,
        paymentMethod: input.paymentMethod ?? order.paymentMethod,
      })
      .where(and(eq(orders.id, order.id), eq(orders.status, "pending")));

    // Re-read to ensure we won the status transition (guards against races).
    const updated = await tx.query.orders.findFirst({ where: eq(orders.id, order.id) });
    if (!updated || updated.status !== "paid") {
      const existingReceipt = await tx.query.receipts.findFirst({ where: eq(receipts.orderId, order.id) });
      return { order: updated ?? order, alreadyPaid: true, receiptId: existingReceipt?.id ?? null };
    }

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const allProducts = await tx.select().from(products);
    for (const item of items) {
      if (!item.licenseKey) {
        const product = allProducts.find((p) => p.id === item.productId);
        await tx
          .update(orderItems)
          .set({ licenseKey: createLicenseKey(product?.slug ?? "software") })
          .where(eq(orderItems.id, item.id));
      }
    }

    const existingReceipt = await tx.query.receipts.findFirst({ where: eq(receipts.orderId, order.id) });
    let receiptId = existingReceipt?.id ?? null;
    if (!existingReceipt) {
      const [receipt] = await tx
        .insert(receipts)
        .values({
          orderId: order.id,
          receiptNumber,
          email: updated.email,
          phone: updated.phone,
          paymentMethod: updated.paymentMethod,
          paymentReference: updated.mpesaReceiptNumber ?? input.paymentReference ?? null,
          currency: updated.currency,
          subtotalCents: updated.totalCents,
          totalCents: updated.totalCents,
          status: "issued",
          issuedAt: paidAt,
          payload: JSON.stringify({
            orderId: order.id,
            items: items.map((i) => ({
              productName: i.productName,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents,
              lineTotalCents: i.unitPriceCents * i.quantity,
            })),
          }),
        })
        .returning();
      receiptId = receipt.id;
    }

    return { order: updated, alreadyPaid: false, receiptId };
  });
}
