"use client";

import { useState } from "react";
import type { MessageThreadBlock } from "@/lib/templates/builder";

type Props = {
  block: MessageThreadBlock;
};

export default function MessageThreadWidget({ block }: Props) {
  const [messages, setMessages] = useState(block.data.messages || []);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        name: name.trim() || "Guest",
        message: trimmedMessage,
      },
    ]);

    setMessage("");
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white">
      <div className="text-lg font-semibold">Message Thread</div>

      <div className="mt-4 space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
            No messages yet.
          </div>
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="text-sm font-semibold text-white/90">
                {item.name}
              </div>
              <div className="mt-1 text-sm leading-6 text-white/70">
                {item.message}
              </div>
            </div>
          ))
        )}
      </div>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35"
          placeholder="Your name"
        />

        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35"
          placeholder="Leave a message"
        />

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
        >
          Post Message
        </button>
      </form>
    </div>
  );
}