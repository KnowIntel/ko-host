"use client";

import { useEffect, useState } from "react";

/* ================= HELPERS ================= */

function getBrowserKey() {
  let key = localStorage.getItem("kohost_speed_dating_key");
  if (!key) {
    key = `bk_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("kohost_speed_dating_key", key);
  }
  return key;
}

/* ================= TYPES ================= */

type Message = {
  id: string;
  senderId: string;
  text?: string;
  createdAt: number;
};

type Session = {
  id: string;
  leftParticipant: any;
  rightParticipant: any;
};

/* ================= COMPONENT ================= */

export default function SpeedDatingChat() {
  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  /* ================= FETCH SESSION ================= */

  async function fetchSession() {
    const res = await fetch(
      `/api/speed-dating/session?browserKey=${getBrowserKey()}`,
    );
    const data = await res.json();

    if (data?.ok) {
      setSession(data.session);
      setParticipantId(data.participantId);
    }
  }

  /* ================= FETCH MESSAGES ================= */

  async function fetchMessages(sessionId: string) {
    const res = await fetch(
      `/api/speed-dating/messages?sessionId=${sessionId}`,
    );
    const data = await res.json();

    if (data?.ok) {
      setMessages(data.messages);
    }
  }

  /* ================= SEND ================= */

  async function sendMessage() {
    if (!input.trim() || !session || !participantId) return;

    await fetch("/api/speed-dating/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: session.id,
        senderId: participantId,
        text: input,
      }),
    });

    setInput("");
    fetchMessages(session.id);
  }

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!session) return;

    fetchMessages(session.id);
    const interval = setInterval(() => {
      fetchMessages(session.id);
    }, 1500);

    return () => clearInterval(interval);
  }, [session?.id]);

  /* ================= UI ================= */

  if (!session) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        Join a match to start chatting.
      </div>
    );
  }

  const other =
    session.leftParticipant?.id === participantId
      ? session.rightParticipant
      : session.leftParticipant;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-900">
          Chat with {other?.name || "Partner"}
        </div>
        <div className="text-xs text-neutral-400">Live</div>
      </div>

      {/* MESSAGES */}
      <div className="mb-3 h-48 overflow-auto space-y-2">
        {messages.map((m) => {
          const isMe = m.senderId === participantId;

          return (
            <div
              key={m.id}
              className={`flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                  isMe
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border px-3 text-sm h-10"
        />

        <button
          onClick={sendMessage}
          className="rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}