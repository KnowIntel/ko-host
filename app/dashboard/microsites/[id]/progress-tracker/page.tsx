// app/dashboard/microsites/[id]/progress-tracker/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Measurement = {
  id: string;
  label: string;
  unit?: string;
  visible: boolean;
  targetEnabled: boolean;
  actualEnabled: boolean;
};

type TrackerRow = {
  id: string;
  label: string;
};

type Tracker = {
  id: string;
  title: string;
  pageId: string | null;
  pageSlug: string | null;
  measurements: Measurement[];
  rows: TrackerRow[];
};

type ProgressState = {
  id: string;
  site_key: string;
  block_id: string;
  participant_id: string;
  current_targets: unknown;
  actuals: unknown;
  completed_rows: unknown;
  session_number: number;
  updated_at: string | null;
  created_at: string | null;
};

type HistoryRecord = {
  id: string;
  state_id: string;
  session_number: number;
  snapshot: unknown;
  completed_at: string | null;
};

type ApiPayload = {
  ok: boolean;
  error?: string;
  microsite?: { id: string; title: string | null };
  trackers?: Tracker[];
  states?: ProgressState[];
  history?: HistoryRecord[];
  limits?: { states: number; history: number };
};

type JsonMap = Record<string, unknown>;

function asMap(value: unknown): JsonMap {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonMap)
    : {};
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function valueLabel(value: unknown, unit?: string) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number" || typeof value === "string") {
    return `${value}${unit ? ` ${unit}` : ""}`;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "—";
}

function readableKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function namedValue(
  value: unknown,
  tracker: Tracker,
  depth = 0,
): React.ReactNode {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "object") return valueLabel(value);
  if (depth >= 5) return "Additional nested data";

  if (Array.isArray(value)) {
    return value.length ? (
      <ul className="list-disc space-y-1 pl-5">
        {value.map((item, index) => (
          <li key={index}>{namedValue(item, tracker, depth + 1)}</li>
        ))}
      </ul>
    ) : (
      "No entries"
    );
  }

  const entries = Object.entries(asMap(value));
  if (!entries.length) return "No entries";

  return (
    <div className="space-y-2">
      {entries.map(([key, entryValue]) => {
        const row = tracker.rows.find((item) => item.id === key);
        const measurement = tracker.measurements.find((item) => item.id === key);

        return (
          <div key={key} className="border-l-2 border-neutral-200 pl-3">
            <div className="text-xs font-semibold text-neutral-600">
              {row?.label ?? measurement?.label ?? readableKey(key)}
            </div>
            <div className="mt-1 text-sm text-neutral-800">
              {typeof entryValue === "object" && entryValue !== null
                ? namedValue(entryValue, tracker, depth + 1)
                : valueLabel(entryValue, measurement?.unit)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type ProgressTableProps = {
  tracker: Tracker;
  targets: unknown;
  actuals: unknown;
  completed: unknown;
};

function ProgressTable({ tracker, targets, actuals, completed }: ProgressTableProps) {
  const targetMap = asMap(targets);
  const actualMap = asMap(actuals);
  const completedMap = asMap(completed);
  const measurements = tracker.measurements.filter((item) => item.visible !== false);

  if (!tracker.rows.length) {
    return (
      <p className="text-sm text-neutral-500">
        No configured activities found for this tracker.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full min-w-[580px] text-left text-sm">
        <thead className="bg-neutral-50 text-xs text-neutral-600">
          <tr>
            <th className="px-3 py-3">Activity</th>
            {measurements.map((measurement) => (
              <th key={measurement.id} className="px-3 py-3">
                {measurement.label}
                {measurement.unit ? ` (${measurement.unit})` : ""}
              </th>
            ))}
            <th className="px-3 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {tracker.rows.map((row) => {
            const rowTargets = asMap(targetMap[row.id]);
            const rowActuals = asMap(actualMap[row.id]);
            const done = completedMap[row.id] === true;

            return (
              <tr key={row.id}>
                <td className="px-3 py-3 font-medium">{row.label}</td>
                {measurements.map((measurement) => (
                  <td key={measurement.id} className="px-3 py-3">
                    <div className="space-y-1">
                      {measurement.targetEnabled && (
                        <div>
                          <span className="text-xs text-neutral-500">Target: </span>
                          {valueLabel(rowTargets[measurement.id])}
                        </div>
                      )}
                      {measurement.actualEnabled && (
                        <div>
                          <span className="text-xs text-neutral-500">Actual: </span>
                          {valueLabel(rowActuals[measurement.id])}
                        </div>
                      )}
                      {!measurement.targetEnabled && !measurement.actualEnabled && "—"}
                    </div>
                  </td>
                ))}
                <td className="px-3 py-3">
                  <span className={done ? "font-medium text-green-700" : "text-neutral-500"}>
                    {done ? "Completed" : "Not completed"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HistoryDetails({ record, tracker }: { record: HistoryRecord; tracker: Tracker }) {
  const snapshot = asMap(record.snapshot);
  // Historical snapshots may use different field names; only interpret recognized structures.
  const targets = snapshot.current_targets ?? snapshot.targets;
  const actuals = snapshot.actuals;
  const completed = snapshot.completed_rows ?? snapshot.completedRows;
  const hasStructured =
    targets !== undefined && actuals !== undefined && completed !== undefined;

  return (
    <details className="rounded-xl border border-neutral-200 p-4">
      <summary className="cursor-pointer text-sm font-medium">
        Session {record.session_number} · {dateLabel(record.completed_at)}
      </summary>
      <div className="mt-4">
        {hasStructured ? (
          <ProgressTable
            tracker={tracker}
            targets={targets}
            actuals={actuals}
            completed={completed}
          />
        ) : (
          <div className="rounded-lg bg-neutral-50 p-4">
            {namedValue(record.snapshot, tracker)}
          </div>
        )}
      </div>
    </details>
  );
}

export default function ProgressTrackerManagementPage() {
  const params = useParams();
  const micrositeId = String(params?.id ?? "");
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrackerId, setSelectedTrackerId] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState<{ stateId: string; historyId: string | null } | null>(null);
  const [resetMessage, setResetMessage] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!micrositeId) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/dashboard/microsites/${encodeURIComponent(micrositeId)}/progress-tracker`,
        { cache: "no-store", signal },
      );
      const result = (await response.json().catch(() => ({}))) as ApiPayload;

      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Unable to load Progress Tracker data.");
      }
      if (!signal?.aborted) setPayload(result);
    } catch (cause) {
      if (!signal?.aborted) {
        setError(
          cause instanceof Error ? cause.message : "Unable to load Progress Tracker data.",
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [micrositeId]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const trackers = useMemo(() => payload?.trackers ?? [], [payload]);
  const trackerId = trackers.some((tracker) => tracker.id === selectedTrackerId)
    ? selectedTrackerId
    : (trackers[0]?.id ?? "");
  const selectedTracker = trackers.find((tracker) => tracker.id === trackerId);
  const selectedState = (payload?.states ?? []).find(
    (state) => state.block_id === trackerId,
  ) ?? null;
  const history = useMemo(() => payload?.history ?? [], [payload]);
  const selectedHistory = useMemo(
    () => history.filter((record) => record.state_id === selectedState?.id),
    [history, selectedState?.id],
  );
  const deleteCompletedHistory = useCallback(async () => {
    if (!resetConfirmation || !selectedState || !selectedTracker || resetting ||
        resetConfirmation.stateId !== selectedState.id) return;
    setResetting(true);
    setResetMessage("");
    setError("");
    try {
      const response = await fetch(
        `/api/dashboard/microsites/${encodeURIComponent(micrositeId)}/progress-tracker/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            stateId: selectedState.id,
            blockId: selectedTracker.id,
            ...(resetConfirmation.historyId ? { historyId: resetConfirmation.historyId } : {}),
          }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        deletedCount?: number;
      };
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Unable to delete completed-session history.");
      }
      setResetConfirmation(null);
      await load();
      setResetMessage(
        `${result.deletedCount ?? 0} completed-session record(s) deleted. Current progress was not changed.`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete completed-session history.");
    } finally {
      setResetting(false);
    }
  }, [micrositeId, selectedState, selectedTracker, resetting, resetConfirmation, load]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 text-neutral-900">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Link
          href={`/dashboard/microsites/${micrositeId}`}
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to Manage Microsite
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Progress Tracker</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {payload?.microsite?.title || "Microsite"} · Owner management
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-neutral-900 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          View current progress for each tracker without changing it. Owners can delete completed-session history for the selected tracker.
        </p>
      </div>

      {resetMessage && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {resetMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading && !payload && (
        <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600">
          Loading tracker information…
        </div>
      )}

      {payload && (
        <>
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Select tracker</h2>
            {trackers.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-600">
                No configured Progress Tracker blocks were found on this microsite.
              </p>
            ) : (
              <>
                <label
                  htmlFor="tracker-choice"
                  className="mt-4 block text-sm font-medium text-neutral-700"
                >
                  Tracker
                </label>
                <select
                  id="tracker-choice"
                  value={trackerId}
                  onChange={(event) => {
                    setSelectedTrackerId(event.target.value);
                    setResetConfirmation(null);
                    setResetMessage("");
                  }}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm sm:max-w-xl"
                >
                  {trackers.map((tracker) => (
                    <option key={tracker.id} value={tracker.id}>
                      {tracker.title} ({tracker.id})
                    </option>
                  ))}
                </select>
                <p className="mt-2 break-all text-xs text-neutral-500">
                  Block ID: {trackerId}
                  {selectedTracker?.pageSlug
                    ? ` · Page: ${selectedTracker.pageSlug}`
                    : ""}
                </p>
              </>
            )}
          </section>

          {selectedTracker && (
            <>
              {!selectedState && (
                <section className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
                  No progress has been recorded for this tracker yet.
                </section>
              )}

              {selectedState && (
                <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Tracker progress</h2>
                    <button
                      type="button"
                      onClick={() => { setResetConfirmation({ stateId: selectedState.id, historyId: null }); setResetMessage(""); }}
                      disabled={resetting || loading || selectedHistory.length === 0}
                      className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Clear All Completed Sessions
                    </button>
                  </div>
                  {resetConfirmation?.stateId === selectedState.id && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4" role="group" aria-label="Confirm history deletion">
                      <p className="text-sm font-semibold text-red-900">
                        {resetConfirmation.historyId ? "Delete this completed session?" : "Delete ALL completed sessions for this tracker?"}
                      </p>
                      <p className="mt-2 text-sm text-red-800">
                        This permanently deletes completed-session history records only.
                        The current incomplete session, targets, actual values, checkmarks, and session number stay unchanged.
                      </p>
                      <p className="mt-2 text-xs text-red-700">Tracker: {selectedTracker.title}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void deleteCompletedHistory()}
                          disabled={resetting || loading}
                          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {resetting ? "Deleting…" : "Confirm Delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setResetConfirmation(null)}
                          disabled={resetting}
                          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="mt-2 break-all text-xs text-neutral-500">
                    Tracker: {selectedTracker.title} · State: {selectedState.id}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-neutral-50 p-4">
                      <div className="text-xs text-neutral-500">Current session</div>
                      <div className="mt-1 text-xl font-semibold">
                        {selectedState.session_number}
                      </div>
                    </div>
                    <div className="rounded-xl bg-neutral-50 p-4">
                      <div className="text-xs text-neutral-500">Last updated</div>
                      <div className="mt-1 text-sm font-medium">
                        {dateLabel(selectedState.updated_at)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-neutral-50 p-4">
                      <div className="text-xs text-neutral-500">
                        Completed-session records loaded
                      </div>
                      <div className="mt-1 text-xl font-semibold">
                        {selectedHistory.length}
                      </div>
                    </div>
                  </div>
                  <h3 className="mb-3 mt-6 text-base font-semibold">
                    Current session progress
                  </h3>
                  <ProgressTable
                    tracker={selectedTracker}
                    targets={selectedState.current_targets}
                    actuals={selectedState.actuals}
                    completed={selectedState.completed_rows}
                  />
                  <h3 className="mt-8 text-base font-semibold">
                    Completed-session history
                  </h3>
                  {selectedHistory.length === 0 ? (
                    <p className="mt-3 text-sm text-neutral-600">
                      No completed-session history returned for this tracker.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {selectedHistory.map((record) => (
                        <div key={record.id} className="space-y-2">
                          <HistoryDetails record={record} tracker={selectedTracker} />
                          <button
                            type="button"
                            onClick={() => { setResetConfirmation({ stateId: selectedState.id, historyId: record.id }); setResetMessage(""); }}
                            disabled={resetting || loading}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete Session {record.session_number}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          <p className="px-1 text-xs text-neutral-500">
            This view is limited to {payload.limits?.states ?? 200} state records
            and {payload.limits?.history ?? 1000} history records per API request.
            Counts and history may be incomplete when these limits are reached.
          </p>
        </>
      )}
    </main>
  );
}
