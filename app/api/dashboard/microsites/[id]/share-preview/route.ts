import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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
/* GET */
/* ================================================================= */

export async function GET(
  _req: Request,
  ctx: {
    params: Promise<{
      id: string;
    }>;
  },
) {
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

  /*
   * Cast locally because these are newly-added database columns
   * and the project's generated Supabase TypeScript definitions
   * may not have been regenerated yet.
   */
  const sb =
    getSupabaseAdmin() as any;

  const {
    data,
    error,
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
    error ||
    !data
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Microsite not found.",
      },
      {
        status: 404,
      },
    );
  }

  const site =
    data as SharePreviewRow;

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

  return NextResponse.json({
    ok: true,

    microsite:
      serializeMicrosite(
        site,
      ),
  });
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

  const body =
    await req
      .json()
      .catch(
        () => ({}),
      );

  const requestedMode =
    String(
      body?.mode ??
        "",
    );

  if (
    requestedMode !==
      "auto" &&
    requestedMode !==
      "custom"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid preview mode.",
      },
      {
        status: 400,
      },
    );
  }

  const sb =
    getSupabaseAdmin() as any;

  /*
   * ================================================================
   * VERIFY SITE + OWNERSHIP
   * ================================================================
   */

  const {
    data,
    error,
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
    error ||
    !data
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Microsite not found.",
      },
      {
        status: 404,
      },
    );
  }

  const site =
    data as SharePreviewRow;

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

  /*
   * ================================================================
   * CUSTOM MODE REQUIRES CUSTOM IMAGE
   * ================================================================
   */

  if (
    requestedMode ===
      "custom" &&
    !site.share_preview_custom_image_url
  ) {
    return NextResponse.json(
      {
        ok: false,

        error:
          "Upload a custom preview image before selecting Custom.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * ================================================================
   * UPDATE MODE
   * ================================================================
   */

  const {
    data: updatedData,
    error: updateError,
  } = await sb
    .from("microsites")
    .update({
      share_preview_mode:
        requestedMode,

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
          "Failed to update share preview.",
      },
      {
        status: 500,
      },
    );
  }

  const updatedSite =
    updatedData as SharePreviewRow;

  return NextResponse.json({
    ok: true,

    microsite:
      serializeMicrosite(
        updatedSite,
      ),
  });
}