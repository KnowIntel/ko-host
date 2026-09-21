import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type GenerateMicrositePreviewInput = {
  micrositeId: string;
  slug: string;
};

export async function generateMicrositePreview({
  micrositeId,
  slug,
}: GenerateMicrositePreviewInput) {
  const sb = getSupabaseAdmin() as any;

  let browser:
    Awaited<
      ReturnType<typeof puppeteer.launch>
    > | null = null;

  try {
    if (!micrositeId || !slug?.trim()) {
      throw new Error(
        "A valid microsite ID and slug are required.",
      );
    }

    const publicUrl =
      `https://${slug.trim()}.ko-host.com`;

    const executablePath =
      await chromium.executablePath();

    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],

      executablePath,

      headless: true,
    });

    const page =
      await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1,
    });

    await page.goto(publicUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1500);
    });

    await page
      .evaluate(async () => {
        if ("fonts" in document) {
          await (document as any).fonts.ready;
        }
      })
      .catch(() => undefined);

    const screenshotBuffer =
      await page.screenshot({
        type: "jpeg",
        quality: 88,
        fullPage: false,
      });

    await browser.close();
    browser = null;

    const bucket =
      sb.storage.from(
        "microsite-thumbnails",
      );

    const filePath =
      `share-previews/${micrositeId}/auto.jpg`;

    const { error: uploadError } =
      await bucket.upload(
        filePath,
        screenshotBuffer,
        {
          contentType: "image/jpeg",
          upsert: true,
          cacheControl: "0",
        },
      );

    if (uploadError) {
      throw new Error(
        uploadError.message ||
          "Failed to save microsite preview.",
      );
    }

    const { data: publicUrlData } =
      bucket.getPublicUrl(filePath);

    const baseImageUrl =
      publicUrlData?.publicUrl ?? "";

    if (!baseImageUrl) {
      throw new Error(
        "Unable to create microsite preview URL.",
      );
    }

    const versionedImageUrl =
      `${baseImageUrl}?v=${Date.now()}`;

    const { error: updateError } =
      await sb
        .from("microsites")
        .update({
          share_preview_auto_image_url:
            versionedImageUrl,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", micrositeId);

    if (updateError) {
      throw new Error(
        updateError.message ||
          "Failed to save microsite preview URL.",
      );
    }

    return versionedImageUrl;
  } finally {
    if (browser) {
      await browser
        .close()
        .catch(() => undefined);
    }
  }
}