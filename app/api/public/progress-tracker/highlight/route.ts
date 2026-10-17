// app/api/public/progress-tracker/highlight/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { validateProgressTrackerAccess } from "@/lib/progressTracker/validateAccess";
import { authenticateProgressParticipant, createProgressParticipantSession } from "@/lib/progressTracker/participantSession";

export const dynamic = "force-dynamic";

type JsonMap = Record<string, unknown>;
const asMap = (value: unknown): JsonMap =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonMap)
    : {};
const numeric = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export async function GET(request: NextRequest) {
  const micrositeId = request.nextUrl.searchParams.get("micrositeId") ?? "";
  const blockId = request.nextUrl.searchParams.get("blockId") ?? "";
  const dataPointId = request.nextUrl.searchParams.get("dataPointId") ?? "";
  if (!micrositeId || !blockId || !dataPointId || blockId.length > 256 || dataPointId.length > 256) {
    return NextResponse.json({ error: "Invalid tracker metric request." }, { status: 400 });
  }

  try {
    const access = await validateProgressTrackerAccess(micrositeId, blockId);
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
    let auth = await authenticateProgressParticipant(micrositeId);
    // Access has already been validated; mirror the Tracker GET session initialization.
    if (!auth.ok && auth.status === 401) {
      auth = await createProgressParticipantSession(micrositeId);
    }
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const supabase = getSupabaseAdmin();
    const participantId = auth.participant.participantId;
    const { data: state, error: stateError } = await supabase
      .from("progress_tracker_states")
      .select("id, session_number, actuals")
      .eq("site_key", micrositeId)
      .eq("block_id", blockId)
      .eq("participant_id", participantId)
      .maybeSingle();
    if (stateError) throw stateError;

    if (dataPointId === "session_number") {
      return NextResponse.json({ value: Number(state?.session_number ?? 1), total: 0 });
    }

    // Only the current participant's states contribute to the site total.
    const { data: ownStates, error: ownStatesError } = await supabase
      .from("progress_tracker_states")
      .select("id")
      .eq("site_key", micrositeId)
      .eq("participant_id", participantId);
    if (ownStatesError) throw ownStatesError;

    const ownStateIds = (ownStates ?? []).map((item) => item.id);
    const selectedStateId = state?.id;
    if (dataPointId === "completed_sessions" || dataPointId === "completed_sessions_percentage") {
      const selectedCount = selectedStateId
        ? await supabase.from("progress_tracker_history").select("id", { count: "exact", head: true }).eq("state_id", selectedStateId)
        : { count: 0, error: null };
      if (selectedCount.error) throw selectedCount.error;
      let total = 0;
      // Chunk state IDs to keep URL filters reasonably sized.
      for (let i = 0; i < ownStateIds.length; i += 100) {
        const { count, error } = await supabase.from("progress_tracker_history")
          .select("id", { count: "exact", head: true })
          .in("state_id", ownStateIds.slice(i, i + 100));
        if (error) throw error;
        total += count ?? 0;
      }
      const completed = selectedCount.count ?? 0;
      if (dataPointId === "completed_sessions_percentage") {
        return NextResponse.json({ value: total > 0 ? Math.round((completed / total) * 100) : 0, total: 100 });
      }
      return NextResponse.json({ value: completed, total });
    }

    const [kind, id] = dataPointId.split(":", 2);
    const rows = access.block.data.rows ?? [];
    const measurements = access.block.data.measurements ?? [];
    if (
      !id ||
      (kind === "row_max" && !rows.some((row) => row.id === id)) ||
      (kind === "measurement_max" && !measurements.some((measurement) => measurement.id === id && measurement.actualEnabled !== false)) ||
      (kind !== "row_max" && kind !== "measurement_max")
    ) {
      return NextResponse.json({ error: "Invalid tracker data point." }, { status: 400 });
    }

    let highest: number | null = null;
    const collect = (actuals: unknown) => {
      for (const [rowId, rawValues] of Object.entries(asMap(actuals))) {
        if (kind === "row_max" && rowId !== id) continue;
        if (!rows.some((row) => row.id === rowId)) continue;
        for (const [measurementId, rawValue] of Object.entries(asMap(rawValues))) {
          if (kind === "measurement_max" && measurementId !== id) continue;
          if (!measurements.some((measurement) => measurement.id === measurementId && measurement.actualEnabled !== false)) continue;
          const value = numeric(rawValue);
          if (value !== null) highest = highest === null ? value : Math.max(highest, value);
        }
      }
    };
    collect(state?.actuals);
    if (selectedStateId) {
      // History is paginated: the standard tracker GET limits history to 20 records.
      for (let offset = 0; ; offset += 500) {
        const { data: history, error } = await supabase.from("progress_tracker_history")
          .select("snapshot")
          .eq("state_id", selectedStateId)
          .order("session_number", { ascending: true })
          .range(offset, offset + 499);
        if (error) throw error;
        for (const entry of history ?? []) collect(asMap(entry.snapshot).actuals);
        if (!history || history.length < 500) break;
      }
    }
    return NextResponse.json({ value: highest ?? 0, total: 0 });
  } catch (error) {
    console.error("Progress Tracker Highlight metric failed:", error);
    return NextResponse.json({ error: "Unable to load tracker metric." }, { status: 500 });
  }
}
