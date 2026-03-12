"use client";

import { useEffect, useState } from "react";

export default function CountdownWidget({ block }: any) {
  const target = new Date(block.data?.targetIso || Date.now()).getTime();

  const [time, setTime] = useState(target - Date.now());

  useEffect(() => {
    const i = setInterval(() => {
      setTime(target - Date.now());
    }, 1000);

    return () => clearInterval(i);
  }, [target]);

  if (time <= 0) return null;

  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const seconds = Math.floor((time / 1000) % 60);

  return (
    <div className="rounded-xl border p-6 text-center bg-white shadow-sm">
      <div className="text-sm text-neutral-500 mb-2">
        {block.data?.heading || "Countdown"}
      </div>

      <div className="text-3xl font-semibold">
        {days}d {hours}h {minutes}m {seconds}s
      </div>
    </div>
  );
}