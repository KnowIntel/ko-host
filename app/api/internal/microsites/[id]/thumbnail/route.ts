import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: micrositeId } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const slug = String(body?.slug || "").trim();

    if (!micrositeId || !slug) {
      return NextResponse.json(
        { ok: false, error: "Missing micrositeId or slug" },
        { status: 400 },
      );
    }

    const origin = new URL(req.url).origin;
    const publicUrl = `${origin}/s/${slug}`;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1,
    });

    await page.goto(publicUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await new Promise((r) => setTimeout(r, 1500)); // allow fonts/render

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 80,
    });

    await browser.close();

    const supabaseAdmin = getSupabaseAdmin();

    const filePath = `thumbnails/${micrositeId}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("microsite-thumbnails")
      .upload(filePath, screenshotBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { ok: false, error: uploadError.message },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl: thumbnailUrl },
    } = supabaseAdmin.storage
      .from("microsite-thumbnails")
      .getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      thumbnailUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}