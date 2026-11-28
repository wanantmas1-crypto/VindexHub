import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatPrice } from "./utils";

type ReceiptData = {
  receiptNumber: string;
  issuedAt: string;
  paidAt?: string | null;
  status: string;
  orderId: number;
  email: string;
  phone?: string | null;
  paymentMethod: string;
  reference?: string | null;
  currency: string;
  totalCents: number;
  items: { name: string; quantity: number; unitPriceCents: number }[];
};

type ReportData = {
  generatedAt: string;
  revenueCents: number;
  paidOrders: number;
  totalOrders: number;
  avgOrderCents: number;
  products: number;
  topProducts: { name: string; revenueCents: number; quantity: number }[];
  statusCounts: Record<string, number>;
  reviewCounts: { total: number; approved: number; pending: number; rejected: number };
  requestCounts: Record<string, number>;
  recentOrders: { id: number; email: string; status: string; totalCents: number; currency: string; createdAt: string }[];
};

const brand = rgb(0.11, 0.31, 0.85);
const dark = rgb(0.12, 0.14, 0.18);
const muted = rgb(0.42, 0.46, 0.52);
const line = rgb(0.88, 0.9, 0.93);
const soft = rgb(0.97, 0.98, 0.99);

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) current = test;
    else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, size) <= maxWidth) current = word;
      else {
        let chunk = "";
        for (const ch of word) {
          const t = chunk + ch;
          if (font.widthOfTextAtSize(t, size) <= maxWidth) chunk = t;
          else { if (chunk) lines.push(chunk); chunk = ch; }
        }
        current = chunk;
      }
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawRight(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color = dark) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: x - w, y, size, font, color });
}

function ensureSpace(doc: PDFDocument, page: PDFPage, y: number, need: number, margin = 50) {
  if (y - need >= margin) return { page, y };
  const p = doc.addPage([595.28, 841.89]);
  return { page: p, y: 791.89 };
}

function drawLetterhead(page: PDFPage, fonts: { regular: PDFFont; bold: PDFFont }, title: string, subtitle: string) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: brand });
  page.drawRectangle({ x: 40, y: height - 110, width: width - 80, height: 70, color: soft, borderColor: line, borderWidth: 1 });
  page.drawText("VINDEX HUB", { x: 56, y: height - 58, size: 18, font: fonts.bold, color: brand });
  page.drawText("Digital Products • Services • Secure Payments", { x: 56, y: height - 76, size: 9, font: fonts.regular, color: muted });
  page.drawText(title, { x: 56, y: height - 94, size: 13, font: fonts.bold, color: dark });

  const contact = ["vindexhub.com", "support@vindexhub.com", "Kenya • Global"];
  let cy = height - 58;
  for (const c of contact) { drawRight(page, c, width - 56, cy, fonts.regular, 9, muted); cy -= 13; }
  page.drawText(subtitle, { x: 40, y: height - 132, size: 9, font: fonts.regular, color: muted });
  page.drawLine({ start: { x: 40, y: height - 140 }, end: { x: width - 40, y: height - 140 }, thickness: 1, color: line });
  return height - 160;
}

function drawFooter(page: PDFPage, font: PDFFont, text: string) {
  const { width } = page.getSize();
  page.drawLine({ start: { x: 40, y: 42 }, end: { x: width - 40, y: 42 }, thickness: 1, color: line });
  page.drawText(text, { x: 40, y: 30, size: 8, font, color: muted });
  drawRight(page, "Build by Vindex Hub", width - 40, 30, font, 8, muted);
}

export async function generateReceiptPdf(data: ReceiptData) {
  const doc = await PDFDocument.create();
  let page = doc.addPage([595.28, 841.89]);
  const fonts = { regular: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) };
  let y = drawLetterhead(page, fonts, "OFFICIAL RECEIPT", `Receipt #${data.receiptNumber} • Generated for your records`);

  const boxY = y - 74;
  page.drawRectangle({ x: 40, y: boxY, width: 250, height: 64, color: soft, borderColor: line, borderWidth: 1 });
  page.drawRectangle({ x: 305, y: boxY, width: 250, height: 64, color: soft, borderColor: line, borderWidth: 1 });
  page.drawText("BILLED TO", { x: 52, y: boxY + 46, size: 8, font: fonts.bold, color: muted });
  page.drawText(data.email, { x: 52, y: boxY + 30, size: 10, font: fonts.regular, color: dark });
  if (data.phone) page.drawText(data.phone, { x: 52, y: boxY + 16, size: 9, font: fonts.regular, color: muted });
  page.drawText("PAYMENT DETAILS", { x: 317, y: boxY + 46, size: 8, font: fonts.bold, color: muted });
  page.drawText(`Order #${data.orderId} • ${data.status.toUpperCase()}`, { x: 317, y: boxY + 30, size: 10, font: fonts.regular, color: dark });
  page.drawText(`Method: ${data.paymentMethod}`, { x: 317, y: boxY + 16, size: 9, font: fonts.regular, color: muted });
  if (data.reference) page.drawText(`Ref: ${data.reference}`.slice(0, 42), { x: 317, y: boxY + 4, size: 8, font: fonts.regular, color: muted });

  y = boxY - 24;
  page.drawText(`Issued: ${new Date(data.issuedAt).toLocaleString()}`, { x: 40, y, size: 9, font: fonts.regular, color: muted });
  if (data.paidAt) page.drawText(`Paid: ${new Date(data.paidAt).toLocaleString()}`, { x: 300, y, size: 9, font: fonts.regular, color: muted });
  y -= 22;

  // table header
  page.drawRectangle({ x: 40, y: y - 6, width: 515, height: 22, color: rgb(0.94, 0.96, 1) });
  page.drawText("Item", { x: 48, y, size: 9, font: fonts.bold, color: dark });
  page.drawText("Qty", { x: 330, y, size: 9, font: fonts.bold, color: dark });
  page.drawText("Unit", { x: 380, y, size: 9, font: fonts.bold, color: dark });
  drawRight(page, "Total", 545, y, fonts.bold, 9, dark);
  y -= 24;

  for (const item of data.items) {
    const nameLines = wrapText(item.name, fonts.regular, 9, 270);
    const rowH = Math.max(20, nameLines.length * 12 + 8);
    ({ page, y } = ensureSpace(doc, page, y, rowH + 40));
    nameLines.forEach((l, i) => page.drawText(l, { x: 48, y: y - i * 12, size: 9, font: fonts.regular, color: dark }));
    page.drawText(String(item.quantity), { x: 330, y, size: 9, font: fonts.regular, color: muted });
    page.drawText(formatPrice(item.unitPriceCents, data.currency), { x: 380, y, size: 9, font: fonts.regular, color: muted });
    drawRight(page, formatPrice(item.unitPriceCents * item.quantity, data.currency), 545, y, fonts.regular, 9, dark);
    y -= rowH;
    page.drawLine({ start: { x: 40, y: y + 6 }, end: { x: 555, y: y + 6 }, thickness: 0.7, color: line });
  }

  ({ page, y } = ensureSpace(doc, page, y, 90));
  y -= 8;
  page.drawText("Subtotal", { x: 360, y, size: 9, font: fonts.regular, color: muted });
  drawRight(page, formatPrice(data.totalCents, data.currency), 545, y, fonts.regular, 9, dark);
  y -= 18;
  page.drawRectangle({ x: 350, y: y - 8, width: 205, height: 28, color: soft, borderColor: line, borderWidth: 1 });
  page.drawText("TOTAL PAID", { x: 360, y, size: 10, font: fonts.bold, color: dark });
  drawRight(page, formatPrice(data.totalCents, data.currency), 545, y, fonts.bold, 11, brand);

  y -= 44;
  ({ page, y } = ensureSpace(doc, page, y, 50));
  page.drawText("Thank you for your purchase.", { x: 40, y, size: 10, font: fonts.bold, color: dark });
  page.drawText("This is an electronic receipt issued by Vindex Hub. Keep it for your records.", { x: 40, y: y - 14, size: 8.5, font: fonts.regular, color: muted });

  const pages = doc.getPages();
  pages.forEach((p, i) => drawFooter(p, fonts.regular, `Receipt ${data.receiptNumber} • Page ${i + 1} of ${pages.length}`));
  return doc.save();
}

export async function generateAdminReportPdf(data: ReportData) {
  const doc = await PDFDocument.create();
  let page = doc.addPage([595.28, 841.89]);
  const fonts = { regular: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) };
  let y = drawLetterhead(page, fonts, "ADMIN ANALYTICS REPORT", `Generated ${new Date(data.generatedAt).toLocaleString()}`);

  const cards = [
    ["Revenue (Paid)", formatPrice(data.revenueCents)],
    ["Paid Orders", String(data.paidOrders)],
    ["Total Orders", String(data.totalOrders)],
    ["Avg. Order", formatPrice(data.avgOrderCents)],
  ];
  const cardW = 122;
  cards.forEach((c, i) => {
    const x = 40 + i * (cardW + 9);
    page.drawRectangle({ x, y: y - 52, width: cardW, height: 48, color: soft, borderColor: line, borderWidth: 1 });
    page.drawText(c[0], { x: x + 10, y: y - 18, size: 8, font: fonts.bold, color: muted });
    page.drawText(c[1].slice(0, 18), { x: x + 10, y: y - 36, size: 12, font: fonts.bold, color: dark });
  });
  y -= 74;

  const drawSection = (title: string) => {
    ({ page, y } = ensureSpace(doc, page, y, 30));
    page.drawText(title, { x: 40, y, size: 11, font: fonts.bold, color: brand });
    y -= 8;
    page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: line });
    y -= 16;
  };

  drawSection("Order Status Breakdown");
  for (const [k, v] of Object.entries(data.statusCounts)) {
    ({ page, y } = ensureSpace(doc, page, y, 16));
    page.drawText(`${k}: ${v}`, { x: 48, y, size: 9, font: fonts.regular, color: dark });
    y -= 14;
  }
  if (!Object.keys(data.statusCounts).length) { page.drawText("No order data.", { x: 48, y, size: 9, font: fonts.regular, color: muted }); y -= 14; }

  y -= 6;
  drawSection("Reviews & Requests");
  const rr = [
    `Reviews - Total: ${data.reviewCounts.total}, Approved: ${data.reviewCounts.approved}, Pending: ${data.reviewCounts.pending}, Rejected: ${data.reviewCounts.rejected}`,
    `Requests - ${Object.entries(data.requestCounts).map(([k, v]) => `${k}: ${v}`).join(", ") || "No data"}`,
  ];
  for (const r of rr) {
    for (const l of wrapText(r, fonts.regular, 9, 500)) {
      ({ page, y } = ensureSpace(doc, page, y, 14));
      page.drawText(l, { x: 48, y, size: 9, font: fonts.regular, color: dark }); y -= 13;
    }
    y -= 2;
  }

  y -= 6;
  drawSection("Top Products by Revenue");
  for (const p of data.topProducts) {
    ({ page, y } = ensureSpace(doc, page, y, 16));
    const left = `${p.name} (${p.quantity} sold)`;
    page.drawText(left.slice(0, 60), { x: 48, y, size: 9, font: fonts.regular, color: dark });
    drawRight(page, formatPrice(p.revenueCents), 545, y, fonts.bold, 9, dark);
    y -= 14;
  }
  if (!data.topProducts.length) { page.drawText("No paid product sales yet.", { x: 48, y, size: 9, font: fonts.regular, color: muted }); y -= 14; }

  y -= 6;
  drawSection("Recent Orders");
  for (const o of data.recentOrders) {
    ({ page, y } = ensureSpace(doc, page, y, 16));
    const left = `#${o.id} • ${o.email} • ${o.status} • ${new Date(o.createdAt).toLocaleDateString()}`;
    page.drawText(left.slice(0, 72), { x: 48, y, size: 8.5, font: fonts.regular, color: dark });
    drawRight(page, formatPrice(o.totalCents, o.currency), 545, y, fonts.regular, 8.5, dark);
    y -= 13;
  }
  if (!data.recentOrders.length) { page.drawText("No orders yet.", { x: 48, y, size: 9, font: fonts.regular, color: muted }); y -= 14; }

  const pages = doc.getPages();
  pages.forEach((p, i) => drawFooter(p, fonts.regular, `Vindex Hub Admin Report • Page ${i + 1} of ${pages.length}`));
  return doc.save();
}