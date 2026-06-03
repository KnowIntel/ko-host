import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const micrositeId = searchParams.get("micrositeId")?.trim() ?? "";
    const blockId = searchParams.get("blockId")?.trim() ?? "";

    if (!micrositeId || !blockId) {
      return NextResponse.json(
        { error: "Missing micrositeId or blockId." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const { count: activeCount, error: activeError } = await supabase
      .from("enrollment_board_entries")
      .select("id", { count: "exact", head: true })
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .eq("status", "active");

    if (activeError) {
      return NextResponse.json(
        { error: "Failed to load active enrollment count." },
        { status: 500 },
      );
    }

    const { count: totalSubmissions, error: totalError } = await supabase
      .from("enrollment_board_entries")
      .select("id", { count: "exact", head: true })
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId);

    if (totalError) {
      return NextResponse.json(
        { error: "Failed to load total enrollment count." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      activeCount: activeCount ?? 0,
      totalSubmissions: totalSubmissions ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected enrollment count error.",
      },
      { status: 500 },
    );
  }
}