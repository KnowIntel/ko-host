// app/dashboard/microsites/[id]/progress-tracker/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type JsonMap = Record<string, unknown>;
type TrackerState = {
  id: string;
  site_key: string;
  block_id: string;
  participant_id: string;
  current_targets: JsonMap;
  actuals: JsonMap;
  completed_rows: JsonMap;
  session_number: number;
  updated_at: string;
  created_at: string;
};
type TrackerHistory = {
  id: string;
  state_id: string;
  session_number: number;
  snapshot: JsonMap;
  completed_at: string;
};
type ApiData = {
  ok: boolean;
  error?: string;
  microsite?: { id: string; title: string };
  states?: TrackerState[];
  history?: TrackerHistory[];
  limits?: { states: number; history: number };
};

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function JsonDetails({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <summary className="cursor-pointer text-sm font-medium text-neutral-700">{label}</summary>
      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all text-xs text-neutral-700">
        {JSON.stringify(value ?? {}, null, 2)}
      </pre>
    </details>
  );
}

export default function ProgressTrackerManagementPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/dashboard/microsites/${encodeURIComponent(id)}/progress-tracker`,
        { cache: "no-store" },
      );
      const result: ApiData = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to load participant progress.");
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load participant progress.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const states = useMemo(() => data?.states ?? [], [data]);
  const history = useMemo(() => data?.history ?? [], [data]);
  const blockIds = useMemo(
    () => Array.from(new Set(states.map((state) => state.block_id))).sort(),
    [states],
  );
  const filtered = useMemo(
    () => states.filter((state) =>
      (selectedBlock === "all" || state.block_id === selectedBlock) &&
      (!search.trim() || state.participant_id.toLowerCase().includes(search.trim().toLowerCase())),
    ),
    [states, selectedBlock, search],
  );
  const historyByState = useMemo(() => {
    const grouped = new Map<string, TrackerHistory[]>();
    for (const entry of history) {
      const items = grouped.get(entry.state_id) ?? [];
      items.push(entry);
      grouped.set(entry.state_id, items);
    }
    return grouped;
  }, [history]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link href={`/dashboard/microsites/${id}`} className="text-sm font-medium text-blue-700 hover:underline">
        ← Back to Microsite Dashboard
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Progress Tracker Management</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {data?.microsite?.title || "Microsite"} · Review participant progress and completed sessions.
          </p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error ? <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Tracker blocks with participant data</div>
          <div className="mt-2 text-2xl font-semibold">{blockIds.length}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Participant tracker records</div>
          <div className="mt-2 text-2xl font-semibold">{states.length}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Completed sessions loaded</div>
          <div className="mt-2 text-2xl font-semibold">{history.length}</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-neutral-700">
            Tracker block
            <select value={selectedBlock} onChange={(e) => setSelectedBlock(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm">
              <option value="all">All tracker blocks</option>
              {blockIds.map((blockId) => <option key={blockId} value={blockId}>{blockId}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-neutral-700">
            Search participant ID
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter participant UUID"
              className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Showing {filtered.length} of {states.length} participant records. The API currently loads up to {data?.limits?.states ?? 200} records and {data?.limits?.history ?? 1000} history entries.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {loading && !data ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">Loading tracker records...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">No participant tracker records match your filters.</div>
        ) : filtered.map((state) => {
          const entries = historyByState.get(state.id) ?? [];
          const completedCount = Object.values(state.completed_rows ?? {}).filter((value) => value === true).length;
          return (
            <section key={state.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-neutral-900">Participant {state.participant_id}</h2>
                  <p className="mt-1 break-all text-xs text-neutral-500">Tracker: {state.block_id}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Session {state.session_number}</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-3">
                <div>Completed rows: <strong>{completedCount}</strong></div>
                <div>History entries loaded: <strong>{entries.length}</strong></div>
                <div>Updated: <strong>{dateLabel(state.updated_at)}</strong></div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <JsonDetails label="Current targets" value={state.current_targets} />
                <JsonDetails label="Actual values" value={state.actuals} />
                <JsonDetails label="Completed rows" value={state.completed_rows} />
              </div>
              <details className="mt-4 rounded-xl border border-neutral-200 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-neutral-900">Session history ({entries.length} loaded)</summary>
                <div className="mt-4 space-y-3">
                  {entries.length === 0 ? <p className="text-sm text-neutral-500">No completed sessions in the loaded history.</p> :
                    entries.map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-neutral-200 p-3">
                        <div className="mb-3 text-sm font-medium text-neutral-800">Session {entry.session_number} · {dateLabel(entry.completed_at)}</div>
                        <JsonDetails label="Completed session snapshot" value={entry.snapshot} />
                      </div>
                    ))}
                </div>
              </details>
            </section>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-neutral-500">This page is read-only. Reset controls will be added after the reset operation is implemented and verified.</p>
    </main>
  );
}
