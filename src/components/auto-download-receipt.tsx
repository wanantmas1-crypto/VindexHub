"use client";

import { useEffect } from "react";

export function AutoDownloadReceipt({ orderId, token }: { orderId: number; token: string }) {
  useEffect(() => {
    const key = `receipt-downloaded-${orderId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const a = document.createElement("a");
    a.href = `/api/receipts/${orderId}?token=${encodeURIComponent(token)}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [orderId, token]);
  return null;
}
