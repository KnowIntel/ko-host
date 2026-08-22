import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function formatBlockTypeLabel(blockType: string) {
  const labels: Record<string, string> = {
    label: "Text Label",
    text_fx: "Text Effects",
    rich_text: "Rich Text",

    image: "Image",
    image_carousel: "Image Carousel",
    gallery: "Gallery",
    video: "Video",
    audio: "Audio",

    icon: "Icon",
    frame: "Frame",
    shape: "Shape",
    wave: "Wave",

    cta: "Button",
    links: "Navigation Links",
    link_hub: "Link Hub",

    form_field: "Input Field",
    option_button: "Option Button",
    poll: "Poll",
    rsvp: "RSVP",
    enrollment_board: "Enrollment Board",
    faq: "FAQ",
    listing: "Listing",

    checklist: "Checklist",
    schedule_agenda: "Schedule / Agenda",
    calendar_event: "Calendar Event",
    timeline: "Timeline",
    map_location: "Map / Location",

    visitor_counter: "Visitor Counter",
    progress_bar: "Progress Meter",
    countdown: "Countdown",

    statistic_cards: "Statistic Cards",
    comparison_table: "Comparison Table",

    donation: "Donation",
    registry: "Registry",

    cart: "Cart",
    checkout: "Checkout",

    file_share: "File Share",
    spreadsheet: "Spreadsheet",

    post_board: "Post Board",
    thread: "Thread",

    content_panel: "Content Panel",
    process_flow: "Process Flow",

    circular_hub: "Circular Hub",
    data_pyramid: "Data Pyramid",
    formula_board: "Formula Board",

    story_cards: "Story Cards",
    interactive_hotspots: "Interactive Hotspots",

    tournament_display: "Tournament Display",
    speed_dating: "Speed Dating",

    spin_wheel: "Spin Wheel",
    pop_balloon: "Pop Balloon",
    puzzle: "Puzzle",

    highlight: "Highlight",
    summary: "Summary",
    bookmark: "Bookmark",
  };

  if (labels[blockType]) {
    return labels[blockType];
  }

  return String(blockType || "Block")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function getDraftBlockTypes(
  draft: unknown,
) {
  const blockTypes =
    new Set<string>();

  function collectBlocks(
    node: unknown,
  ) {
    if (
      !node ||
      typeof node !== "object"
    ) {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(
        (entry) =>
          collectBlocks(entry),
      );

      return;
    }

    const obj =
      node as Record<
        string,
        unknown
      >;

    /*
     * Current and legacy Ko-Host drafts can store
     * block arrays at different levels.
     *
     * Only inspect arrays explicitly named "blocks"
     * so nested config objects with their own "type"
     * properties are not mistakenly counted.
     */
    if (
      Array.isArray(
        obj.blocks,
      )
    ) {
      obj.blocks.forEach(
        (block: unknown) => {
          if (
            !block ||
            typeof block !==
              "object"
          ) {
            return;
          }

          const blockType =
            String(
              (
                block as Record<
                  string,
                  unknown
                >
              ).type ?? "",
            ).trim();

          if (blockType) {
            blockTypes.add(
              blockType,
            );
          }

          /*
           * Continue through the block in case a
           * legacy structure contains nested pages
           * or nested block collections.
           */
          collectBlocks(
            block,
          );
        },
      );
    }

    /*
     * Continue looking for legacy nested draft/page
     * structures.
     */
    Object.entries(
      obj,
    ).forEach(
      ([key, value]) => {
        if (key === "blocks") {
          return;
        }

        collectBlocks(
          value,
        );
      },
    );
  }

  collectBlocks(draft);

  return Array.from(
    blockTypes,
  );
}

export async function GET(
  req: Request,
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const demoSlug =
      String(
        searchParams.get("slug") ??
          "",
      )
        .trim()
        .toLowerCase();

    if (!demoSlug) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing demo slug",
        },
        {
          status: 400,
        },
      );
    }

    const supabase =
      getSupabaseAdmin();

    /*
     * ================================================================
     * FIND DEMO MICROSITE
     * ================================================================
     */

    const {
      data: microsite,
      error: micrositeError,
    } = await supabase
      .from("microsites")
      .select(
        "id, slug, draft",
      )
      .eq(
        "slug",
        demoSlug,
      )
      .maybeSingle();

    if (micrositeError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            micrositeError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!microsite) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Demo microsite not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * ================================================================
     * LOAD ALL MICROSITE PAGES
     * ================================================================
     *
     * We intentionally load every page because the Included list
     * should represent all unique blocks used throughout the
     * demo microsite, not just its home page.
     */

    const {
      data: pages,
      error: pagesError,
    } = await supabase
      .from("microsite_pages")
      .select(
        "id, slug, draft, display_order",
      )
      .eq(
        "microsite_id",
        microsite.id,
      )
      .order(
        "display_order",
        {
          ascending: true,
        },
      )
      .order(
        "created_at",
        {
          ascending: true,
        },
      );

    if (pagesError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            pagesError.message,
        },
        {
          status: 500,
        },
      );
    }

    /*
     * ================================================================
     * COLLECT UNIQUE BLOCK TYPES
     * ================================================================
     */

    const blockTypes =
      new Set<string>();

    /*
     * First use the actual page drafts.
     */
    if (
      Array.isArray(pages)
    ) {
      pages.forEach(
        (page: any) => {
          getDraftBlockTypes(
            page?.draft,
          ).forEach(
            (
              blockType: string,
            ) => {
              blockTypes.add(
                blockType,
              );
            },
          );
        },
      );
    }

/*
 * Also merge in microsites.draft.
 *
 * Some preset/demo microsites may keep their primary
 * published block data here even when microsite_pages
 * rows also exist.
 */
getDraftBlockTypes(
  microsite.draft,
).forEach(
  (
    blockType: string,
  ) => {
    blockTypes.add(
      blockType,
    );
  },
);

    /*
     * ================================================================
     * FRIENDLY UNIQUE LABELS
     * ================================================================
     */

    const features: string[] =
      Array.from(
        blockTypes,
      )
        .map(
          (
            blockType: string,
          ) =>
            formatBlockTypeLabel(
              blockType,
            ),
        )
        .filter(
          (
            feature: string,
          ) =>
            feature.length > 0,
        )
        .sort(
          (
            a: string,
            b: string,
          ) =>
            a.localeCompare(
              b,
              undefined,
              {
                sensitivity:
                  "base",
              },
            ),
        );

return NextResponse.json({
  ok: true,

  slug:
    demoSlug,

  micrositeId:
    microsite.id,

  pageCount:
    Array.isArray(pages)
      ? pages.length
      : 0,

  blockCount:
    blockTypes.size,

  hasMicrositeDraft:
    Boolean(
      microsite.draft,
    ),

  features,
});
  } catch (error) {
    console.error(
      "template demo features failed",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load demo features",
      },
      {
        status: 500,
      },
    );
  }
}