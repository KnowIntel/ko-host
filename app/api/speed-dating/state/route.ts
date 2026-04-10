import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();

  const { searchParams } = new URL(req.url);
  const micrositeId = searchParams.get("micrositeId");
  const blockId = searchParams.get("blockId");

  if (!micrositeId || !blockId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Participants
  const { data: participants } = await supabase
    .from("speed_dating_participants")
    .select("*")
    .eq("microsite_id", micrositeId)
    .eq("block_id", blockId)
    .neq("status", "skipped");

  const leftQueue =
    participants?.filter((p) => p.seeking === "women") || [];

  const rightQueue =
    participants?.filter((p) => p.seeking === "men") || [];

  // Active session
  const { data: session } = await supabase
    .from("speed_dating_sessions")
    .select("*")
    .eq("microsite_id", micrositeId)
    .eq("block_id", blockId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let timeRemaining = null;

  if (session?.ends_at) {
    const diff = new Date(session.ends_at).getTime() - Date.now();
    timeRemaining = Math.max(0, Math.floor(diff / 1000));
  }

  return NextResponse.json({
    leftQueue,
    rightQueue,
    activeSession: session || null,
    timeRemaining,
  });
}