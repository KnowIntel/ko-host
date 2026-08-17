import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function resolveSlugFromHost(hostname: string) {
  const clean = hostname
    .replace(/^https?:\/\//, "")
    .split(":")[0]
    .replace(/^www\./, "");

  if (clean.includes(".ko-host.com")) {
    return clean.replace(".ko-host.com", "");
  }

  return "";
}

async function resolveMicrositeId(
  supabase: any,
  micrositeId: string,
  hostname: string,
) {
  if (micrositeId) {
    return micrositeId;
  }

  if (!hostname) {
    return "";
  }

  const slug = resolveSlugFromHost(hostname);

  if (!slug) {
    return "";
  }

  const { data: siteRow, error: siteError } =
    await supabase
      .from("microsites")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

  if (siteError) {
    throw new Error(siteError.message);
  }

  return siteRow?.id ?? "";
}

/*
 * GET
 *
 * Returns the current shared state for every item
 * belonging to a particular Checklist block.
 *
 * Example response:
 *
 * {
 *   ok: true,
 *   items: {
 *     "item-1": true,
 *     "item-2": false
 *   }
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const supabase = getSupabaseAdmin();

    const micrositeId =
      await resolveMicrositeId(
        supabase,
        String(
          searchParams.get("micrositeId") ??
            "",
        ),
        String(
          searchParams.get("hostname") ??
            "",
        ),
      );

    const blockId = String(
      searchParams.get("blockId") ?? "",
    ).trim();

    if (!micrositeId || !blockId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing micrositeId/hostname or blockId",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } = await supabase
      .from("microsite_checklist_state")
      .select("item_id, checked")
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    const items: Record<string, boolean> =
      {};

    for (const row of data ?? []) {
      const itemId = String(
        row.item_id ?? "",
      );

      if (!itemId) {
        continue;
      }

      items[itemId] =
        Boolean(row.checked);
    }

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    console.error(
      "CHECKLIST STATE GET ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load checklist state",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * POST
 *
 * Last write wins.
 *
 * Any visitor checking or unchecking an item
 * overwrites the shared state for everyone.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = getSupabaseAdmin();

    const micrositeId =
      await resolveMicrositeId(
        supabase,
        String(
          body.micrositeId ?? "",
        ),
        String(
          body.hostname ?? "",
        ),
      );

    const blockId = String(
      body.blockId ?? "",
    ).trim();

    const itemId = String(
      body.itemId ?? "",
    ).trim();

    const checked =
      body.checked === true;

    if (
      !micrositeId ||
      !blockId ||
      !itemId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing micrositeId/hostname, blockId, or itemId",
        },
        {
          status: 400,
        },
      );
    }

    const { error } = await supabase
      .from(
        "microsite_checklist_state",
      )
      .upsert(
        {
          microsite_id: micrositeId,
          block_id: blockId,
          item_id: itemId,
          checked,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "microsite_id,block_id,item_id",
        },
      );

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      ok: true,
      itemId,
      checked,
    });
  } catch (error) {
    console.error(
      "CHECKLIST STATE POST ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to save checklist state",
      },
      {
        status: 500,
      },
    );
  }
}