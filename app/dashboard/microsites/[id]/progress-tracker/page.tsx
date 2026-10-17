// app/dashboard/microsites/[id]/progress-tracker/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Tracker = { id: string; title: string; pageId: string | null; pageSlug: string | null };
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

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function valueText(value: unknown) {
  if (value === null || value === undefined) return "No data";
  if (typeof value === "string") return value || "No data";
  return JSON.stringify(value, null, 2) ?? "No data";
}

function DataPanel({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="text-sm font-semibold text-neutral-800">{label}</h3>
      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-neutral-700">
        {valueText(value)}
      </pre>
    </div>
  );
}

export default function ProgressTrackerManagementPage() {
  const params = useParams();
  const micrositeId = String(params?.id ?? "");
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrackerId, setSelectedTrackerId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");

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
      if (signal?.aborted) return;
      setError(cause instanceof Error ? cause.message : "Unable to load Progress Tracker data.");
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
  const states = useMemo(
    () => (payload?.states ?? []).filter((state) => state.block_id === trackerId),
    [payload, trackerId],
  );
  const history = useMemo(() => payload?.history ?? [], [payload]);
  const selectedState = states.find((state) => state.id === selectedStateId) ?? states[0] ?? null;
  const selectedHistory = useMemo(
    () => history.filter((item) => item.state_id === selectedState?.id),
    [history, selectedState?.id],
  );
  const historyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of history) counts.set(record.state_id, (counts.get(record.state_id) ?? 0) + 1);
    return counts;
  }, [history]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 text-neutral-900">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Link href={`/dashboard/microsites/${micrositeId}`} className="text-sm font-medium text-blue-700 hover:underline">
          ← Back to Manage Microsite
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Progress Tracker</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {payload?.microsite?.title || "Microsite"} · Owner management
            </p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-neutral-900 disabled:opacity-50">
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
        <p className="mt-3 text-xs text-neutral-500">Read-only overview. No progress or history can be changed here.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {loading && !payload && <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600">Loading tracker information…</div>}

      {payload && (
        <>
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Select tracker</h2>
            {trackers.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-600">No configured Progress Tracker blocks were found on this microsite.</p>
            ) : (
              <>
                <label htmlFor="tracker-choice" className="mt-4 block text-sm font-medium text-neutral-700">Tracker</label>
                <select id="tracker-choice" value={trackerId} onChange={(event) => {
                  setSelectedTrackerId(event.target.value);
                  setSelectedStateId("");
                }} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm sm:max-w-xl">
                  {trackers.map((tracker) => <option key={tracker.id} value={tracker.id}>{tracker.title} ({tracker.id})</option>)}
                </select>
                <p className="mt-2 break-all text-xs text-neutral-500">
                  Block ID: {trackerId}{selectedTracker?.pageSlug ? ` · Page: ${selectedTracker.pageSlug}` : ""}
                </p>
              </>
            )}
          </section>

          {selectedTracker && (
            <>
              <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Participants ({states.length})</h2>
                  <span className="text-xs text-neutral-500">Showing stored participant progress</span>
                </div>
                {states.length === 0 ? (
                  <p className="mt-4 text-sm text-neutral-600">No participant progress has been recorded for this tracker.</p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="border-b text-xs text-neutral-500">
                        <tr><th className="py-3 pr-4">Participant ID</th><th className="py-3 pr-4">Current session</th><th className="py-3 pr-4">Last updated</th><th className="py-3 pr-4">History records</th><th className="py-3">Details</th></tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {states.map((state) => (
                          <tr key={state.id} className={selectedState?.id === state.id ? "bg-blue-50" : ""}>
                            <td className="break-all py-3 pr-4 font-mono text-xs">{state.participant_id}</td>
                            <td className="py-3 pr-4">{state.session_number}</td>
                            <td className="py-3 pr-4">{dateLabel(state.updated_at)}</td>
                            <td className="py-3 pr-4">{historyCounts.get(state.id) ?? 0}</td>
                            <td className="py-3"><button type="button" onClick={() => setSelectedStateId(state.id)} className="font-medium text-blue-700 hover:underline">View details</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {selectedState && (
                <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">Participant details</h2>
                  <p className="mt-2 break-all text-xs text-neutral-500">Participant: {selectedState.participant_id} · State: {selectedState.id}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-neutral-50 p-4"><div className="text-xs text-neutral-500">Current session</div><div className="mt-1 text-xl font-semibold">{selectedState.session_number}</div></div>
                    <div className="rounded-xl bg-neutral-50 p-4"><div className="text-xs text-neutral-500">Last updated</div><div className="mt-1 text-sm font-medium">{dateLabel(selectedState.updated_at)}</div></div>
                    <div className="rounded-xl bg-neutral-50 p-4"><div className="text-xs text-neutral-500">Completed-session records loaded</div><div className="mt-1 text-xl font-semibold">{selectedHistory.length}</div></div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <DataPanel label="Current targets" value={selectedState.current_targets} />
                    <DataPanel label="Actual values" value={selectedState.actuals} />
                    <DataPanel label="Completed rows" value={selectedState.completed_rows} />
                  </div>
                  <h3 className="mt-8 text-base font-semibold">Completed-session history</h3>
                  {selectedHistory.length === 0 ? (
                    <p className="mt-3 text-sm text-neutral-600">No completed-session history returned for this participant.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {selectedHistory.map((record) => (
                        <details key={record.id} className="rounded-xl border border-neutral-200 p-4">
                          <summary className="cursor-pointer text-sm font-medium">Session {record.session_number} · {dateLabel(record.completed_at)}</summary>
                          <div className="mt-3"><DataPanel label="Historical snapshot" value={record.snapshot} /></div>
                        </details>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
          <p className="px-1 text-xs text-neutral-500">
            This view is limited to {payload.limits?.states ?? 200} state records and {payload.limits?.history ?? 1000} history records per API request. Counts and history may be incomplete when these limits are reached.
          </p>
        </>
      )}
    </main>
  );
}
