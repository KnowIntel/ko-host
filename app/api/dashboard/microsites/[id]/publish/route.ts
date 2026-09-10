import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  publish: z.boolean(),
});

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
          "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const json =
    await req
      .json()
      .catch(
        () => null,
      );

  const parsed =
    BodySchema.safeParse(
      json,
    );

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid request",
      },
      {
        status: 400,
      },
    );
  }

  const publish =
    parsed.data.publish;

  const sb =
    getSupabaseAdmin();

  const {
    data: site,
    error: siteErr,
  } = await sb
    .from(
      "microsites",
    )
    .select(
      "id, slug, owner_clerk_user_id, paid_until, is_published, status",
    )
    .eq(
      "id",
      micrositeId,
    )
    .maybeSingle();

  if (
    siteErr ||
    !site
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Not found",
      },
      {
        status: 404,
      },
    );
  }

  if (
    site.owner_clerk_user_id !==
    userId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  if (publish) {
    const now =
      new Date();

    const paidActive =
      site.paid_until
        ? new Date(
            site.paid_until,
          ) > now
        : false;

    if (!paidActive) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Payment required to publish",
        },
        {
          status: 402,
        },
      );
    }
  }

  const nowIso =
    new Date().toISOString();

  const updatePayload:
    Record<
      string,
      unknown
    > = {
    is_published:
      publish,

    status:
      publish
        ? "published"
        : "draft",

    updated_at:
      nowIso,
  };

  if (publish) {
    updatePayload.published_at =
      nowIso;

    updatePayload.is_active =
      true;
  } else {
    updatePayload.published_at =
      null;
  }

  const {
    data: updated,
    error: upErr,
  } = await sb
    .from(
      "microsites",
    )
    .update(
      updatePayload,
    )
    .eq(
      "id",
      micrositeId,
    )
    .eq(
      "owner_clerk_user_id",
      userId,
    )
    .select(
      "id, slug, is_published, status, paid_until, published_at, updated_at",
    )
    .single();

  if (
    upErr ||
    !updated
  ) {
    console.error(
      "publish toggle failed",
      upErr,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          upErr?.message ||
          "Server error",
      },
      {
        status: 500,
      },
    );
  }

  /*
   * ================================================================
   * REFRESH AUTO SHARE PREVIEW
   * ================================================================
   *
   * Only run when publishing.
   *
   * This does not switch the owner away from a custom preview.
   * It simply refreshes the stored automatic screenshot so that
   * "Use Auto-Generated Image" always points to the latest publish.
   *
   * Preview generation is non-blocking from the user's perspective:
   * a screenshot failure must not undo an otherwise successful publish.
   */

  if (
    publish &&
    updated.slug
  ) {
    try {
      const requestUrl =
        new URL(
          req.url,
        );

      const regenerateUrl =
        `${requestUrl.origin}/api/dashboard/microsites/${micrositeId}/share-preview/regenerate`;

      /*
       * Forward the authenticated request cookies so the internal
       * dashboard endpoint sees the same Clerk session.
       */
      const cookieHeader =
        req.headers.get(
          "cookie",
        );

      const regenerateResponse =
        await fetch(
          regenerateUrl,
          {
            method:
              "POST",

            headers: {
              ...(cookieHeader
                ? {
                    cookie:
                      cookieHeader,
                  }
                : {}),
            },

            cache:
              "no-store",
          },
        );

      if (
        !regenerateResponse.ok
      ) {
        const regeneratePayload =
          await regenerateResponse
            .json()
            .catch(
              () => ({}),
            );

        console.error(
          "share preview regeneration failed after publish",
          {
            micrositeId,
            status:
              regenerateResponse.status,
            error:
              regeneratePayload?.error ??
              "Unknown error",
          },
        );
      }
    } catch (
      error
    ) {
      console.error(
        "share preview regeneration failed after publish",
        error,
      );
    }
  }

  return NextResponse.json(
    {
      ok: true,
      microsite:
        updated,
    },
    {
      status: 200,
    },
  );
}