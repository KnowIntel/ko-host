import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const text = searchParams.get("text") || "";
  const filename = searchParams.get("filename") || "qr-code.png";

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    text,
  )}&size=512&format=png`;

  const response = await fetch(qrUrl);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 },
    );
  }

  const imageBuffer = await response.arrayBuffer();

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}