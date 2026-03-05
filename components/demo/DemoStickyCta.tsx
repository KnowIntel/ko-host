"use client";

import Link from "next/link";

export default function DemoStickyCta({
  templateKey,
  label = "Create this template",
}: {
  templateKey: string;
  label?: string;
}) {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] p-3 md:hidden">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-neutral-500">Demo</div>
            <div className="truncate text-sm font-semibold text-neutral-900">
              Ready to make yours?
            </div>
          </div>

          <Link
            href={`/create/${templateKey}`}
            className="shrink-0 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            {label}
          </Link>
        </div>
      </div>
    </div>
  );
}