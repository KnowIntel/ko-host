import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const micrositeId =
      searchParams.get("micrositeId")?.trim() ?? "";

    const blockId =
      searchParams.get("blockId")?.trim() ?? "";

    const sourceType =
      searchParams.get("sourceType")?.trim() ?? "";

    const countType =
      searchParams.get("countType")?.trim() ?? "";

    if (!micrositeId || !blockId) {
      return NextResponse.json(
        { error: "Missing ids." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    //
    // Enrollment Board
    //
    if (sourceType === "enrollment_records") {
      let query = supabase
        .from("enrollment_board_entries")
        .select("*", { count: "exact", head: true })
        .eq("microsite_id", micrositeId)
        .eq("block_id", blockId);

      if (countType === "active_enrollments") {
        query = query.eq("status", "active");
      }

      const { count } = await query;

      return NextResponse.json({
        count: count ?? 0,
      });
    }

    //
    // Calendar Events
    //
    if (sourceType === "calendar_events") {
      const { data } = await supabase
        .from("schedule_events")
        .select("id")
        .eq("microsite_id", micrositeId)
        .eq("block_id", blockId);

      return NextResponse.json({
        count: data?.length ?? 0,
      });
    }

    //
    // Post Board Discussions
    //
    if (sourceType === "post_board_discussions") {
      const { data } = await supabase
        .from("post_board_posts")
        .select("*")
        .eq("microsite_id", micrositeId)
        .eq("block_id", blockId);

      const count =
        data?.filter(
          (post: any) =>
            !post.parent_id &&
            !post.parentId,
        ).length ?? 0;

      return NextResponse.json({
        count,
      });
    }

    return NextResponse.json({
      count: 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed.",
      },
      { status: 500 },
    );
  }
}