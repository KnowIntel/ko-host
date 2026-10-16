import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { validateProgressTrackerAccess } from "@/lib/progressTracker/validateAccess";
import {
  authenticateProgressParticipant,
  createProgressParticipantSession,
} from "@/lib/progressTracker/participantSession";

export const dynamic = "force-dynamic";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function parseIdentity(value: unknown) {
  if (!isObject(value)) return null;

  const { micrositeId, blockId } = value;

  if (
    !isUuid(micrositeId) ||
    typeof blockId !== "string" ||
    !blockId.trim() ||
    blockId.length > 256
  ) {
    return null;
  }

  return { micrositeId, blockId };
}

function parseRevision(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) return null;

  return value;
}

function validateProgress(
  actuals: unknown,
  completedRows: unknown,
  configuration: {
    rows: Array<{ id: string }>;
    measurements: Array<{
      id: string;
      actualEnabled: boolean;
    }>;
  }
): boolean {
  if (!isObject(actuals) || !isObject(completedRows)) return false;

  const rowIds = new Set(configuration.rows.map((row) => row.id));

  const measurementIds = new Set(
    configuration.measurements
      .filter((measurement) => measurement.actualEnabled)
      .map((measurement) => measurement.id)
  );

  return (
    Object.entries(actuals).every(
      ([rowId, values]) =>
        rowIds.has(rowId) &&
        isObject(values) &&
        Object.entries(values).every(
          ([measurementId, value]) =>
            measurementIds.has(measurementId) &&
            (value === null ||
              (typeof value === "number" && Number.isFinite(value)))
        )
    ) &&
    Object.entries(completedRows).every(
      ([rowId, checked]) =>
        rowIds.has(rowId) && typeof checked === "boolean"
    )
  );
}

async function authorize(
  micrositeId: string,
  blockId: string,
  createSession = false
) {
  const access = await validateProgressTrackerAccess(micrositeId, blockId);

  if (!access.ok) {
    return {
      ok: false as const,
      response: jsonError(access.error, access.status),
    };
  }

  let session = await authenticateProgressParticipant(micrositeId);

  if (createSession && !session.ok && session.status === 401) {
    session = await createProgressParticipantSession(micrositeId);
  }

  if (!session.ok) {
    return {
      ok: false as const,
      response: jsonError(session.error, session.status),
    };
  }

  return {
    ok: true as const,
    participantId: session.participant.participantId,
    configuration: access.block.data,
  };
}

async function getState(
  micrositeId: string,
  blockId: string,
  participantId: string
) {
  return getSupabaseAdmin()
    .from("progress_tracker_states")
    .select("*")
    .eq("site_key", micrositeId)
    .eq("block_id", blockId)
    .eq("participant_id", participantId)
    .maybeSingle();
}

async function getHistory(stateId: string, limit = 20) {
  return getSupabaseAdmin()
    .from("progress_tracker_history")
    .select("id, session_number, snapshot, completed_at")
    .eq("state_id", stateId)
    .order("session_number", { ascending: false })
    .limit(limit);
}

/* -------------------------------------------------------------------------- */
/* GET — INITIALIZE AND LOAD PARTICIPANT STATE                                */
/* -------------------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  try {
    const micrositeId =
      request.nextUrl.searchParams.get("micrositeId") ?? "";
    const blockId =
      request.nextUrl.searchParams.get("blockId") ?? "";

    const identity = parseIdentity({ micrositeId, blockId });

    if (!identity) return jsonError("Invalid tracker identity.", 400);

    const auth = await authorize(micrositeId, blockId, true);

    if (!auth.ok) return auth.response;

    const supabase = getSupabaseAdmin();

    const initialTargets = Object.fromEntries(
      auth.configuration.rows.map((row) => [
        row.id,
        { ...row.targets },
      ])
    );

    const initialActuals = Object.fromEntries(
  auth.configuration.rows.map((row) => [
    row.id,
    Object.fromEntries(
      auth.configuration.measurements
        .filter(
          (measurement) =>
            measurement.presetValues !== false &&
            measurement.targetEnabled &&
            measurement.actualEnabled
        )
        .filter(
          (measurement) =>
            typeof row.targets[measurement.id] === "number"
        )
        .map((measurement) => [
          measurement.id,
          row.targets[measurement.id],
        ])
    ),
  ])
);

    const { error: initializeError } = await supabase
      .from("progress_tracker_states")
      .upsert(
        {
          site_key: micrositeId,
          block_id: blockId,
          participant_id: auth.participantId,
          current_targets: initialTargets,
          actuals: initialActuals,
          completed_rows: {},
          session_number: 1,
        },
        {
          onConflict: "site_key,block_id,participant_id",
          ignoreDuplicates: true,
        }
      );

    if (initializeError) {
      console.error("Tracker initialization failed:", initializeError);
      return jsonError("Unable to initialize tracker.", 500);
    }

    const { data: state, error: stateError } = await getState(
      micrositeId,
      blockId,
      auth.participantId
    );

    if (stateError || !state) {
      return jsonError("Unable to load tracker state.", 500);
    }

    const { data: reconciledState, error: reconcileError } =
  await supabase.rpc("reconcile_progress_tracker_state", {
    p_state_id: state.id,
    p_configuration: {
      rows: auth.configuration.rows,
      measurements: auth.configuration.measurements,
    },
  });

if (reconcileError || !reconciledState) {
  console.error("Tracker reconciliation failed:", reconcileError);
  return jsonError("Unable to reconcile tracker state.", 500);
}

    const { data: history, error: historyError } =
      await getHistory(state.id);

    if (historyError) {
      return jsonError("Unable to load tracker history.", 500);
    }

return NextResponse.json({
  participantId: auth.participantId,
  blockId,
  configuration: auth.configuration,
  state: reconciledState,
  history: history ?? [],
});
  } catch (error) {
    console.error("Tracker GET failed:", error);
    return jsonError("Unable to load tracker.", 500);
  }
}

/* -------------------------------------------------------------------------- */
/* PATCH — ATOMIC SAVE WITH REVISION CHECK                                    */
/* -------------------------------------------------------------------------- */

export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const identity = parseIdentity(body);

    if (!identity || !isObject(body)) {
      return jsonError("Invalid tracker request.", 400);
    }

    const {
      actuals,
      completedRows,
      sessionNumber,
      expectedUpdatedAt,
    } = body;

    const revision = parseRevision(expectedUpdatedAt);

    if (
      !Number.isSafeInteger(sessionNumber) ||
      (sessionNumber as number) < 1 ||
      !revision
    ) {
      return jsonError("Invalid tracker revision.", 400);
    }

    const auth = await authorize(
      identity.micrositeId,
      identity.blockId
    );

    if (!auth.ok) return auth.response;

    if (
      !validateProgress(
        actuals,
        completedRows,
        auth.configuration
      )
    ) {
      return jsonError(
        "Progress values do not match the published configuration.",
        400
      );
    }

    const { data: state, error: stateError } = await getState(
      identity.micrositeId,
      identity.blockId,
      auth.participantId
    );

    if (stateError || !state) {
      return jsonError("Tracker state not found.", 404);
    }

    const { data: savedState, error: saveError } =
      await getSupabaseAdmin().rpc(
        "save_progress_tracker_session",
        {
          p_state_id: state.id,
          p_session_number: sessionNumber,
          p_actuals: actuals,
          p_completed_rows: completedRows,
          p_expected_updated_at: revision,
        }
      );

    if (saveError) {
      const message = saveError.message ?? "";

      if (
        message.includes("Tracker state has changed") ||
        message.includes("Tracker session has changed")
      ) {
        return jsonError(
          "Tracker progress changed elsewhere. Reload before saving.",
          409
        );
      }

      console.error("Tracker atomic save failed:", saveError);
      return jsonError("Unable to save tracker progress.", 500);
    }

    return NextResponse.json({
      success: true,
      state: savedState,
    });
  } catch (error) {
    console.error("Tracker PATCH failed:", error);
    return jsonError("Unable to save tracker progress.", 500);
  }
}

/* -------------------------------------------------------------------------- */
/* POST — TRANSACTIONAL SESSION COMPLETION                                    */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const identity = parseIdentity(body);

    if (!identity || !isObject(body)) {
      return jsonError("Invalid tracker request.", 400);
    }

    const { completionKey, sessionNumber, expectedUpdatedAt } = body;
    const revision = parseRevision(expectedUpdatedAt);

    if (
      !isUuid(completionKey) ||
      !Number.isSafeInteger(sessionNumber) ||
      (sessionNumber as number) < 1 ||
      !revision
    ) {
      return jsonError("Invalid completion request.", 400);
    }

    const auth = await authorize(
      identity.micrositeId,
      identity.blockId
    );

    if (!auth.ok) return auth.response;

    const { data: state, error: stateError } = await getState(
      identity.micrositeId,
      identity.blockId,
      auth.participantId
    );

    if (stateError || !state) {
      return jsonError("Tracker state not found.", 404);
    }

    const supabase = getSupabaseAdmin();

    // Idempotent retries return the original completion.
    const { data: previous, error: previousError } = await supabase
      .from("progress_tracker_history")
      .select("id, session_number, snapshot, completed_at")
      .eq("state_id", state.id)
      .eq("completion_key", completionKey)
      .maybeSingle();

    if (previousError) {
      return jsonError("Unable to verify completion.", 500);
    }

    if (previous) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        completion: previous,
        state,
      });
    }

    if (
      state.session_number !== sessionNumber ||
      state.updated_at !== revision
    ) {
      return jsonError(
        "Tracker session changed. Reload before completing.",
        409
      );
    }

    const { data: completion, error: completionError } =
      await supabase.rpc("complete_progress_tracker_session", {
        p_state_id: state.id,
        p_completion_key: completionKey,
        p_configuration: {
          title: auth.configuration.title,
          rows: auth.configuration.rows,
          measurements: auth.configuration.measurements,
          progressionTrigger:
            auth.configuration.progressionTrigger,
        },
        p_session_number: sessionNumber,
        p_expected_updated_at: revision,
      });

    if (completionError) {
      console.error("Tracker completion failed:", completionError);

      return jsonError(
        "Unable to complete session. Ensure every row is checked.",
        409
      );
    }

    const { data: updatedState, error: reloadError } =
      await getState(
        identity.micrositeId,
        identity.blockId,
        auth.participantId
      );

    if (reloadError || !updatedState) {
      return jsonError(
        "Session completed, but updated progress could not be loaded.",
        500
      );
    }

    const { data: history, error: historyError } =
      await getHistory(state.id);

    if (historyError) {
      return jsonError(
        "Session completed, but history could not be loaded.",
        500
      );
    }

    return NextResponse.json({
      success: true,
      alreadyCompleted: false,
      completion,
      state: updatedState,
      history: history ?? [],
    });
  } catch (error) {
    console.error("Tracker POST failed:", error);
    return jsonError("Unable to complete tracker session.", 500);
  }
}