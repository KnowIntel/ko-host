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
    site.share_preview_mode === "custom"
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

function getExtension(
  file:
    File,
) {
  const fromName =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    fromName === "jpg" ||
    fromName === "jpeg"
  ) {
    return "jpg";
  }

  if (
    fromName === "png"
  ) {
    return "png";
  }

  if (
    fromName === "webp"
  ) {
    return "webp";
  }

  if (
    file.type === "image/jpeg"
  ) {
    return "jpg";
  }

  if (
    file.type === "image/png"
  ) {
    return "png";
  }

  if (
    file.type === "image/webp"
  ) {
    return "webp";
  }

  return "";
}

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

  const sb =
    getSupabaseAdmin() as any;

  /* ================================================================ */
  /* VERIFY SITE OWNERSHIP */
  /* ================================================================ */

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

  /* ================================================================ */
  /* READ FILE */
  /* ================================================================ */

  const formData =
    await req.formData();

  const file =
    formData.get(
      "file",
    );

  if (
    !(file instanceof File)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Image file is required.",
      },
      {
        status: 400,
      },
    );
  }

  const extension =
    getExtension(
      file,
    );

  if (!extension) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Only JPG, PNG, and WebP images are supported.",
      },
      {
        status: 400,
      },
    );
  }

  const MAX_FILE_SIZE =
    10 * 1024 * 1024;

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Preview image must be 10 MB or smaller.",
      },
      {
        status: 400,
      },
    );
  }

  /* ================================================================ */
  /* UPLOAD */
  /* ================================================================ */

  const bytes =
    new Uint8Array(
      await file.arrayBuffer(),
    );

  const storagePath =
    [
      "share-previews",
      micrositeId,
      `custom-${Date.now()}.${extension}`,
    ].join("/");

const bucket =
  sb.storage.from(
    "microsite-thumbnails",
  );

  const {
    error: uploadError,
  } = await bucket.upload(
    storagePath,
    bytes,
    {
      contentType:
        file.type ||
        `image/${extension}`,

      upsert:
        false,
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
          "Failed to upload preview image.",
      },
      {
        status: 500,
      },
    );
  }

  const {
    data: publicUrlData,
  } =
    bucket.getPublicUrl(
      storagePath,
    );

  const publicUrl =
    publicUrlData
      ?.publicUrl ??
    "";

  if (!publicUrl) {
    await bucket
      .remove([
        storagePath,
      ])
      .catch(
        () => undefined,
      );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Failed to create preview image URL.",
      },
      {
        status: 500,
      },
    );
  }

  /* ================================================================ */
  /* UPDATE SITE */
  /* ================================================================ */

  const {
    data: updatedData,
    error: updateError,
  } = await sb
    .from("microsites")
    .update({
      share_preview_mode:
        "custom",

      share_preview_custom_image_url:
        publicUrl,

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
    await bucket
      .remove([
        storagePath,
      ])
      .catch(
        () => undefined,
      );

    return NextResponse.json(
      {
        ok: false,
        error:
          updateError?.message ||
          "Failed to save custom preview image.",
      },
      {
        status: 500,
      },
    );
  }

  /*
   * Remove the previous custom image from storage when it belongs
   * to this microsite's share-preview folder.
   */
  if (
    site.share_preview_custom_image_url
  ) {
    try {
      const previousUrl =
        new URL(
          site.share_preview_custom_image_url,
        );

const marker =
  "/storage/v1/object/public/microsite-thumbnails/";

      const markerIndex =
        previousUrl.pathname.indexOf(
          marker,
        );

      if (
        markerIndex >= 0
      ) {
        const previousPath =
          decodeURIComponent(
            previousUrl.pathname.slice(
              markerIndex +
                marker.length,
            ),
          );

        if (
          previousPath.startsWith(
            `share-previews/${micrositeId}/`,
          ) &&
          previousPath !==
            storagePath
        ) {
          await bucket.remove([
            previousPath,
          ]);
        }
      }
    } catch {
      /*
       * Do not fail the successful upload merely because
       * an old file could not be cleaned up.
       */
    }
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