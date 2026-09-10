import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import puppeteer from "puppeteer";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SharePreviewRow = {
  id: string;
  slug: string;
  title: string | null;
  owner_clerk_user_id: string | null;

  share_preview_mode:
    | "auto"
    | "custom"
    | null;

  share_preview_auto_image_url:
    | string
    | null;

  share_preview_custom_image_url:
    | string
    | null;
};

function serializeMicrosite(
  site: SharePreviewRow,
) {
  const mode =
    site.share_preview_mode ===
    "custom"
      ? "custom"
      : "auto";

  const activeImageUrl =
    mode === "custom" &&
    site.share_preview_custom_image_url
      ? site.share_preview_custom_image_url
      : site.share_preview_auto_image_url ??
        null;

  return {
    id:
      site.id,

    slug:
      site.slug,

    title:
      site.title,

    share_preview_mode:
      mode,

    share_preview_auto_image_url:
      site.share_preview_auto_image_url ??
      null,

    share_preview_custom_image_url:
      site.share_preview_custom_image_url ??
      null,

    share_preview_image_url:
      activeImageUrl,
  };
}

/* ================================================================= */
/* POST */
/* ================================================================= */

export async function POST(
  req: Request,
  ctx: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  let browser:
    Awaited<
      ReturnType<
        typeof puppeteer.launch
      >
    > | null =
    null;

  try {
    const {
      id: micrositeId,
    } = await ctx.params;

    const {
      userId,
    } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const sb =
      getSupabaseAdmin() as any;

    /* ============================================================= */
    /* LOAD + VERIFY MICROSITE */
    /* ============================================================= */

    const {
      data: siteData,
      error: siteError,
    } = await sb
      .from("microsites")
      .select(`
        id,
        slug,
        title,
        owner_clerk_user_id,
        share_preview_mode,
        share_preview_auto_image_url,
        share_preview_custom_image_url
      `)
      .eq(
        "id",
        micrositeId,
      )
      .maybeSingle();

    if (
      siteError ||
      !siteData
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            siteError?.message ||
            "Microsite not found.",
        },
        {
          status: 404,
        },
      );
    }

    const site =
      siteData as SharePreviewRow;

    if (
      site.owner_clerk_user_id !==
      userId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !site.slug?.trim()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Microsite does not have a valid site name.",
        },
        {
          status: 400,
        },
      );
    }

    /* ============================================================= */
    /* PUBLIC URL */
    /* ============================================================= */

    /*
     * Production:
     * https://slug.ko-host.com
     *
     * Local development:
     * use the existing /s/[slug] route because the production
     * subdomain will not point at the local dev server.
     */
    const requestUrl =
      new URL(
        req.url,
      );

    const requestHost =
      requestUrl.host.toLowerCase();

    const isLocal =
      requestHost.includes(
        "localhost",
      ) ||
      requestHost.includes(
        "127.0.0.1",
      );

    const publicUrl =
      isLocal
        ? `${requestUrl.origin}/s/${encodeURIComponent(
            site.slug,
          )}`
        : `https://${site.slug}.ko-host.com`;

    /* ============================================================= */
    /* CAPTURE */
    /* ============================================================= */

    browser =
      await puppeteer.launch({
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ],
      });

    const page =
      await browser.newPage();

    /*
     * Open Graph's common large-image ratio:
     * 1200 × 630.
     *
     * Because fullPage is false, this captures exactly the
     * top 630px of the published microsite.
     */
    await page.setViewport({
      width:
        1200,

      height:
        630,

      deviceScaleFactor:
        1,
    });

    await page.goto(
      publicUrl,
      {
        waitUntil:
          "networkidle2",

        timeout:
          30000,
      },
    );

    /*
     * Give fonts, externally-hosted images, and builder
     * rendering a short opportunity to settle.
     */
    await new Promise<void>(
      (resolve) => {
        setTimeout(
          resolve,
          1500,
        );
      },
    );

    /*
     * Wait for document fonts when supported.
     */
    await page
      .evaluate(
        async () => {
          if (
            "fonts" in
            document
          ) {
            await (
              document as any
            ).fonts.ready;
          }
        },
      )
      .catch(
        () => undefined,
      );

    const screenshotBuffer =
      await page.screenshot({
        type:
          "jpeg",

        quality:
          88,

        fullPage:
          false,
      });

    await browser.close();

    browser =
      null;

    /* ============================================================= */
    /* STORE AUTO IMAGE */
    /* ============================================================= */

    const bucket =
      sb.storage.from(
        "microsite-thumbnails",
      );

    /*
     * Fixed path + upsert means regeneration replaces the
     * previous automatic preview instead of creating endless files.
     */
    const filePath =
      `share-previews/${micrositeId}/auto.jpg`;

    const {
      error: uploadError,
    } =
      await bucket.upload(
        filePath,
        screenshotBuffer,
        {
          contentType:
            "image/jpeg",

          upsert:
            true,

          cacheControl:
            "0",
        },
      );

    if (
      uploadError
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            uploadError.message ||
            "Failed to save auto-generated preview image.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      data:
        publicUrlData,
    } =
      bucket.getPublicUrl(
        filePath,
      );

    const baseImageUrl =
      publicUrlData
        ?.publicUrl ??
      "";

    if (
      !baseImageUrl
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to create the preview image URL.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * Add a version query so the dashboard and link-preview
     * crawlers do not keep displaying a cached older screenshot.
     */
    const versionedImageUrl =
      `${baseImageUrl}?v=${Date.now()}`;

    /* ============================================================= */
    /* SAVE DATABASE URL */
    /* ============================================================= */

    const {
      data:
        updatedData,
      error:
        updateError,
    } = await sb
      .from(
        "microsites",
      )
      .update({
        share_preview_auto_image_url:
          versionedImageUrl,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        micrositeId,
      )
      .eq(
        "owner_clerk_user_id",
        userId,
      )
      .select(`
        id,
        slug,
        title,
        owner_clerk_user_id,
        share_preview_mode,
        share_preview_auto_image_url,
        share_preview_custom_image_url
      `)
      .single();

    if (
      updateError ||
      !updatedData
    ) {
      return NextResponse.json(
        {
          ok: false,

          error:
            updateError?.message ||
            "Failed to save auto-generated preview.",
        },
        {
          status: 500,
        },
      );
    }

    const updatedSite =
      updatedData as SharePreviewRow;

    return NextResponse.json({
      ok:
        true,

      microsite:
        serializeMicrosite(
          updatedSite,
        ),
    });
  } catch (
    error
  ) {
    if (
      browser
    ) {
      await browser
        .close()
        .catch(
          () =>
            undefined,
        );
    }

    const message =
      error instanceof
        Error
        ? error.message
        : "Unexpected error.";

    return NextResponse.json(
      {
        ok: false,
        error:
          message,
      },
      {
        status: 500,
      },
    );
  }
}