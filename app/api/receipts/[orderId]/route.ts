// app/api/receipts/[orderId]/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function pdfEscape(value: string) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildReceiptPdf(params: {
  siteTitle: string;
  buyerName: string;
  buyerEmail: string;
  orderId: string;
  receiptNumber: string;
  purchasedAt: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
}) {
  const lines: string[] = [
    params.siteTitle,
    "Receipt",
    "",
    `Order ID: ${params.orderId}`,
    `Receipt #: ${params.receiptNumber}`,
    `Purchased: ${params.purchasedAt}`,
    `Buyer: ${params.buyerName || "-"}`,
    `Email: ${params.buyerEmail || "-"}`,
    "",
    "Items:",
    ...params.items.map(
      (item) =>
        `${item.name} x ${item.quantity} - $${item.lineTotal.toFixed(2)}`,
    ),
    "",
    `Subtotal: $${params.subtotal}`,
    `Tax: $${params.tax}`,
    `Discount: -$${params.discount}`,
    `Total: $${params.total}`,
    "",
    "Powered by Ko-Host",
  ];

  let y = 780;
  const content: string[] = ["BT", "/F1 12 Tf", "50 800 Td"];

  lines.forEach((line, index) => {
    if (index === 0) {
      content.push("/F1 18 Tf");
      content.push(`(${pdfEscape(line)}) Tj`);
      content.push("0 -24 Td");
      content.push("/F1 12 Tf");
      y -= 24;
      return;
    }

    content.push(`(${pdfEscape(line)}) Tj`);
    content.push("0 -18 Td");
    y -= 18;
  });

  content.push("ET");

  const stream = content.join("\n");
  const streamLength = Buffer.byteLength(stream, "utf8");

  const objects: string[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj",
  );
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
  );
  objects.push(
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj`,
  );

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${obj}\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");

  pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;

  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefStart}
%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";

    if (!orderId || !token) {
      return NextResponse.json(
        { ok: false, error: "Missing receipt parameters" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: cartRow, error } = await supabaseAdmin
      .from("cart_checkouts")
      .select("*")
      .eq("order_id", orderId)
      .eq("receipt_token", token)
      .eq("payment_status", "paid")
      .maybeSingle();

    if (error || !cartRow) {
      return NextResponse.json(
        { ok: false, error: "Receipt not found" },
        { status: 404 },
      );
    }

    const { data: microsite } = await supabaseAdmin
      .from("microsites")
      .select("title")
      .eq("slug", cartRow.slug)
      .maybeSingle();

    const items = Array.isArray(cartRow.cart_items)
      ? cartRow.cart_items.map((item: any) => ({
          name: item?.name || "Item",
          quantity: Number(item?.quantity || 1),
          lineTotal: Number(item?.price || 0) * Number(item?.quantity || 1),
        }))
      : [];

    const purchasedAt = new Date(
      cartRow.completed_at || cartRow.created_at || new Date().toISOString(),
    ).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    });

    const pdfBuffer = buildReceiptPdf({
      siteTitle: microsite?.title || cartRow.slug || "Ko-Host Site",
      buyerName: cartRow.buyer_name || "",
      buyerEmail: cartRow.buyer_email || "",
      orderId: cartRow.order_id || "",
      receiptNumber: cartRow.receipt_number || "",
      purchasedAt,
      items,
      subtotal: Number(cartRow.subtotal || 0).toFixed(2),
      tax: Number(cartRow.tax || 0).toFixed(2),
      discount: Number(cartRow.discount || 0).toFixed(2),
      total: Number(cartRow.total || 0).toFixed(2),
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${cartRow.receipt_number || cartRow.order_id || "order"}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to generate receipt" },
      { status: 500 },
    );
  }
}