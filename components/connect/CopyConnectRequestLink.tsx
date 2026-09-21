"use client";

import { useState } from "react";

export default function CopyConnectRequestLink({
  path,
}: {
  path: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const url = new URL(
        path,
        window.location.origin,
      ).toString();

      await navigator.clipboard.writeText(url);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Failed to copy Connect request link:",
        error,
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}