export function getCanvasShellClass(designKey: string) {
  if (designKey === "modern") {
    return "rounded-[32px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-6 shadow-sm";
  }

  return "rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm";
}

export function panelCardClass(designKey: string) {
  return designKey === "modern"
    ? "rounded-xl border border-white/10 bg-black/20 p-4"
    : "rounded-xl border border-neutral-200 bg-white p-4";
}

export function panelTitleClass(designKey: string) {
  return designKey === "modern"
    ? "text-xs font-semibold uppercase tracking-[0.16em] text-white/60"
    : "text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500";
}

export function panelFieldClass(designKey: string) {
  return designKey === "modern"
    ? "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-white"
    : "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900";
}

export function panelButtonClass(designKey: string) {
  return designKey === "modern"
    ? "rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10"
    : "rounded-lg border border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-700 hover:bg-neutral-100";
}