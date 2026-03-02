"use client";

import { useMemo, useState } from "react";

type Option = { id: string; label: string };
type Poll = {
  id: string;
  title: string;
  description: string | null;
  isMultiSelect: boolean;
  showResultsPublic: boolean;
  options: Option[];
};

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
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
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