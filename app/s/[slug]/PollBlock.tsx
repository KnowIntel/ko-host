"use client";

import { useEffect, useMemo, useState } from "react";

type Option = { id: string; label: string };
type Poll = {
  id: string;
  title: string;
  description: string | null;
  isMultiSelect: boolean;
  showResultsPublic: boolean;
  options: Option[];
};

type ResultRow = { optionId: string; label: string; count: number };

export default function PollBlock({
  micrositeSlug,
  poll,
}: {
  micrositeSlug: string;
  poll: Poll;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // honeypot
  const [company, setCompany] = useState("");

  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);

  const canSubmit = useMemo(() => {
    if (status === "submitting") return false;
    if (poll.isMultiSelect) return selected.length >= 1 && selected.length <= 10;
    return selected.length === 1;
  }, [selected, poll.isMultiSelect, status]);

  function toggle(optionId: string) {
    setErrorMsg(null);
    if (!poll.isMultiSelect) {
      setSelected([optionId]);
      return;
    }
    setSelected((prev) =>
      prev.includes(optionId) ? prev.filter((x) => x !== optionId) : [...prev, optionId]
    );
  }

  async function fetchResults() {
    if (!poll.showResultsPublic) return;
    setLoadingResults(true);
    try {
      const res = await fetch(
        `/api/public/poll/results?micrositeSlug=${encodeURIComponent(micrositeSlug)}&pollId=${encodeURIComponent(
          poll.id
        )}`,
        { method: "GET" }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // If results are hidden or fail, just don't show them
        setLoadingResults(false);
        return;
      }

      setResults(data.results ?? null);
      setTotalVotes(typeof data.total === "number" ? data.total : 0);
    } finally {
      setLoadingResults(false);
    }
  }

  // If results are public, we can show them even before voting (nice UX)
  useEffect(() => {
    if (poll.showResultsPublic) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.id]);

  async function submitVote() {
    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/public/poll/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          micrositeSlug,
          pollId: poll.id,
          optionIds: selected,
          company, // honeypot
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.error ||
          (res.status === 429 ? "Too many attempts. Try again soon." : "Something went wrong.");
        setStatus("error");
        setErrorMsg(msg);
        return;
      }

      setStatus("success");
      await fetchResults();
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  function percent(count: number) {
    if (!totalVotes) return 0;
    return Math.round((count / totalVotes) * 100);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-neutral-600">Poll</div>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{poll.title}</h3>
      {poll.description ? (
        <p className="mt-2 text-sm text-neutral-700">{poll.description}</p>
      ) : null}

      {/* honeypot hidden */}
      <label className="sr-only">
        Company
        <input value={company} onChange={(e) => setCompany(e.target.value)} />
      </label>

      {/* Results (if public) */}
      {poll.showResultsPublic ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-neutral-700">Results</div>
            <div className="text-xs text-neutral-600">
              {loadingResults ? "Updating..." : `${totalVotes} vote${totalVotes === 1 ? "" : "s"}`}
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            {(results ??
              poll.options.map((o) => ({ optionId: o.id, label: o.label, count: 0 }))
            ).map((r) => {
              const p = percent(r.count);
              return (
                <div key={r.optionId} className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-900">{r.label}</span>
                    <span className="text-neutral-700">
                      {r.count} ({p}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white border border-neutral-200 overflow-hidden">
                    <div
                      className="h-full bg-neutral-900"
                      style={{ width: `${p}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={fetchResults}
            className="mt-3 text-xs font-medium text-neutral-900 underline underline-offset-4"
          >
            Refresh results
          </button>
        </div>
      ) : null}

      {/* Voting UI */}
      {status === "success" ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Vote recorded. Thank you!
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-2">
            {poll.options.map((o) => {
              const isOn = selected.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggle(o.id)}
                  className={[
                    "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm",
                    isOn
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900",
                  ].join(" ")}
                >
                  <span>{o.label}</span>
                  <span className="text-xs opacity-80">{isOn ? "Selected" : ""}</span>
                </button>
              );
            })}
          </div>

          {status === "error" && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMsg ?? "Something went wrong."}
            </div>
          )}

          <button
            type="button"
            onClick={submitVote}
            disabled={!canSubmit}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "submitting" ? "Submitting..." : "Submit vote"}
          </button>

          <p className="mt-2 text-xs text-neutral-600">
            {poll.isMultiSelect ? "You can pick multiple options." : "Pick one option."}
          </p>
        </>
      )}
    </div>
  );
}