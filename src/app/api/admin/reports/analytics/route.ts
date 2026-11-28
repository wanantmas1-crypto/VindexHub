import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAnalytics } from "@/lib/data";
import { generateAdminReportPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const a = await getAnalytics();
  const pdf = await generateAdminReportPdf({
    generatedAt: new Date().toISOString(),
    revenueCents: a.revenueCents,
    paidOrders: a.paidOrders,
    totalOrders: a.totalOrders,
    avgOrderCents: a.avgOrderCents,
    products: a.products,
    topProducts: a.topProducts,
    statusCounts: a.statusCounts,
    reviewCounts: a.reviewCounts,
    requestCounts: a.requestCounts,
    recentOrders: a.recentOrders.map((o: any) => ({
      id: o.id,
      email: o.email,
      status: o.status,
      totalCents: o.totalCents,
      currency: o.currency,
      createdAt: o.createdAt,
    })),
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="vindex-hub-analytics-report-${date}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}