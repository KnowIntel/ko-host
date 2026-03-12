"use client";

import { useState } from "react";

export default function PollWidget({ block }: any) {
  const [vote, setVote] = useState<number | null>(null);

  const options = block.data?.options || [];

  return (
    <div className="space-y-3">
      <div className="font-semibold">{block.data?.question}</div>

      {options.map((o: any, i: number) => (
        <button
          key={i}
          onClick={() => setVote(i)}
          className={`block w-full border rounded-lg p-2 ${
            vote === i ? "bg-neutral-900 text-white" : ""
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}