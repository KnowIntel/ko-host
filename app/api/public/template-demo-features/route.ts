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
  };

  if (labels[blockType]) {
    return labels[blockType];
  }

  return String(blockType || "Block")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractBlockTypesFromDraft(value: unknown) {
  const found = new Set<string>();

  function walk(node: unknown) {
    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (typeof node !== "object") {
      return;
    }

    const obj = node as Record<string, unknown>;

    if (
      typeof obj.type === "string" &&
      obj.type.trim()
    ) {
      found.add(obj.type.trim());
    }

    for (const value of Object.values(obj)) {
      walk(value);
    }
  }

  walk(value);

  return Array.from(found);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const demoSlug = String(
      searchParams.get("slug") ?? "",
    )
      .trim()
      .toLowerCase();

    if (!demoSlug) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing demo slug",
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: microsite, error: micrositeError } =
      await supabase
        .from("microsites")
        .select("*")
        .eq("slug", demoSlug)
        .maybeSingle();

    if (micrositeError) {
      return NextResponse.json(
        {
          ok: false,
          error: micrositeError.message,
        },
        { status: 500 },
      );
    }

    if (!microsite) {
      return NextResponse.json(
        {
          ok: false,
          error: "Demo microsite not found",
        },
        { status: 404 },
      );
    }

    /*
     * We deliberately inspect the microsite row broadly because
     * Ko-Host drafts may be stored under different JSON fields
     * depending on the current schema/version.
     */
    const possibleDrafts = [
      (microsite as any).published_draft,
      (microsite as any).publishedDraft,
      (microsite as any).draft,
      (microsite as any).content,
      (microsite as any).data,
    ].filter(Boolean);

    const blockTypes = new Set<string>();

    possibleDrafts.forEach((draft) => {
      extractBlockTypesFromDraft(draft).forEach(
        (type) => {
          /*
           * Do not include page-text pseudo-types if they appear
           * in nested draft structures.
           */
          if (
            type === "title" ||
            type === "subtitle" ||
            type === "subtitle_secondary" ||
            type === "tagline" ||
            type === "tagline_secondary" ||
            type === "description" ||
            type === "description_secondary"
          ) {
            return;
          }

          blockTypes.add(type);
        },
      );
    });

    const features = Array.from(blockTypes)
      .map(formatBlockTypeLabel)
      .sort((a, b) =>
        a.localeCompare(
          b,
          undefined,
          {
            sensitivity: "base",
          },
        ),
      );

    return NextResponse.json({
      ok: true,
      slug: demoSlug,
      features,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load demo features",
      },
      { status: 500 },
    );
  }
}