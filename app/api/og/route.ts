import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({}, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = await res.text();

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const priceMatch =
      html.match(/\$\s?\d+(?:\.\d{2})?/) ||
      html.match(/USD\s?\d+(?:\.\d{2})?/);

    return NextResponse.json({
      title: titleMatch?.[1] || "",
      price: priceMatch?.[0] || "",
    });
  } catch {
    return NextResponse.json({});
  }
}