export function getCanvasShellClass(designKey: string) {

  if (designKey === "modern") {
    return "rounded-[32px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] shadow-sm";
  }

  return "rounded-[32px] border border-neutral-200 bg-white shadow-sm";
}

/* ------------------------------------------------ */
/* PANEL CARDS */
/* ------------------------------------------------ */

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

/* ------------------------------------------------ */
/* EDITOR LAYOUT STRUCTURE */
/* ------------------------------------------------ */

export function builderWorkspaceClass() {

  return "flex w-full h-full min-h-[720px] gap-6";
}

export function builderLeftPanelClass() {

  return "w-[260px] shrink-0";
}

export function builderRightPanelClass() {

  return "w-[340px] shrink-0";
}

export function builderCanvasAreaClass() {

  return "flex-1 min-w-0 flex flex-col";
}

/* ------------------------------------------------ */
/* TOP EDITOR BAR */
/* ------------------------------------------------ */

export function editorTopBarClass(designKey: string) {

  return designKey === "modern"
    ? "sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0f1115] px-6 py-3"
    : "sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3";
}

export function editorTopButtonClass(designKey: string) {

  return designKey === "modern"
    ? "rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
    : "rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100";
}

/* ------------------------------------------------ */
/* BOTTOM BUILDER BAR */
/* ------------------------------------------------ */

export function editorBottomBarClass(designKey: string) {

  return designKey === "modern"
    ? "sticky bottom-0 z-40 border-t border-white/10 bg-[#0f1115] px-6 py-3"
    : "sticky bottom-0 z-40 border-t border-neutral-200 bg-white px-6 py-3";
}

export function bottomActionButtonClass(designKey: string) {

  return designKey === "modern"
    ? "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
    : "rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-900";
}

/* ------------------------------------------------ */
/* TOOLBOX CATEGORY BAR */
/* ------------------------------------------------ */

export function toolboxCategoryBarClass(designKey: string) {

  return designKey === "modern"
    ? "flex items-center gap-2 border-t border-white/10 bg-black/30 px-4 py-2"
    : "flex items-center gap-2 border-t border-neutral-200 bg-neutral-50 px-4 py-2";
}

export function toolboxCategoryButtonClass(active: boolean, designKey: string) {

  if (designKey === "modern") {
    return active
      ? "rounded-md bg-white px-3 py-1 text-sm text-black"
      : "rounded-md px-3 py-1 text-sm text-white/70 hover:bg-white/10";
  }

  return active
    ? "rounded-md bg-black px-3 py-1 text-sm text-white"
    : "rounded-md px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-100";
}