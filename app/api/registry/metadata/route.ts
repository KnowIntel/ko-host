// app\api\registry\metadata\route.ts
import { NextRequest, NextResponse } from "next/server";

function extractStoreFromUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();

    if (hostname.includes("aldi")) return "Aldi";
    if (hostname.includes("amazon")) return "Amazon";
    if (hostname.includes("apple")) return "Apple";
    if (hostname.includes("bestbuy")) return "Best Buy";
    if (hostname.includes("etsy")) return "Etsy";
    if (hostname.includes("jcpenney") || hostname.includes("jcp")) return "JCPenney";
    if (hostname.includes("lowes")) return "Lowe's";
    if (hostname.includes("macys")) return "Macy's";
    if (hostname.includes("oldnavy")) return "Old Navy";
    if (hostname.includes("sephora")) return "Sephora";
    if (hostname.includes("target")) return "Target";
    if (hostname.includes("temu")) return "Temu";
    if (hostname.includes("wayfair")) return "Wayfair";
    if (hostname.includes("crateandbarrel")) return "Crate & Barrel";
    if (hostname.includes("potterybarn")) return "Pottery Barn";

    return hostname.split(".")[0] || "";
  } catch {
    return "";
  }
}

function extractMetaContent(html: string, keys: string[]) {
  for (const key of keys) {
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    );
    const match = html.match(regex);
    if (match?.[1]) return match[1];
  }
  return "";
}

function extractTitle(html: string) {
  const ogTitle = extractMetaContent(html, ["og:title", "twitter:title"]);
  if (ogTitle) return ogTitle;

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return titleMatch?.[1]?.trim() || "";
}

function extractPrice(html: string) {
  const pricePatterns = [
    /content=["'](\$ ?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)["']/i,
    /\$ ?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/,
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) return match[1] || match[0];
  }

  return "";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    const html = await response.text();

    const title = extractTitle(html);
    const imageUrl = extractMetaContent(html, ["og:image", "twitter:image"]);
    const price = extractPrice(html);
    const store = extractStoreFromUrl(url);

    return NextResponse.json({
      title,
      store,
      price,
      imageUrl,
    });
  } catch {
    return NextResponse.json({
      title: "",
      store: extractStoreFromUrl(url),
      price: "",
      imageUrl: "",
    });
  }
}