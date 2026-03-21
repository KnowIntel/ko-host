"use client";

import { useState } from "react";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!message.trim()) {
      setState("error");
      setFeedback("Please enter a message.");
      return;
    }

    try {
      setState("sending");
      setFeedback("");
      setTicketId("");

      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setState("error");
        setFeedback(data?.error || "Failed to send support request.");
        return;
      }

      setState("sent");
      setFeedback("Your message was sent successfully.");
      setTicketId(data?.ticketId || "");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setState("error");
      setFeedback("Unexpected error. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Support</h1>

      <p className="mt-4 text-sm text-neutral-600">
        Need help? Send us a message and we’ll get back to you.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-neutral-800">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-800">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-800">Message</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue..."
            className="mt-2 min-h-[160px] w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-900 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {state === "sending" ? "Sending..." : "Send Message"}
        </button>
      </form>

      {feedback ? (
        <div className="mt-4 space-y-1">
          <p
            className={`text-sm ${
              state === "sent" ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {feedback}
          </p>
          {ticketId ? (
            <p className="text-xs text-neutral-500">Ticket ID: {ticketId}</p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-6 text-xs text-neutral-500">
        Or email us directly at support@ko-host.com
      </p>
    </main>
  );
}