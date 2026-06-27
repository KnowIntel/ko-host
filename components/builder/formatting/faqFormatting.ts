import type { MicrositeBlock } from "@/lib/templates/builder";

type FaqBlock = Extract<MicrositeBlock, { type: "faq" }>;

export type FaqTextTarget = "heading" | "question" | "answer";
export type FaqStyleTarget = "field" | "block";

function isFaqBlock(block: MicrositeBlock): block is FaqBlock {
  return block.type === "faq";
}

function getTextStyleKey(target: FaqTextTarget) {
  return target === "heading"
    ? "style"
    : target === "question"
      ? "questionStyle"
      : "answerStyle";
}

export function getFaqTextStyle(
  block: MicrositeBlock | null | undefined,
  target: FaqTextTarget,
) {
  if (!block || block.type !== "faq") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.style ?? {};
}

export function applyFaqTextStylePatch(
  block: MicrositeBlock,
  target: FaqTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isFaqBlock(block)) return block;

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...data,
      [styleKey]: {
        ...(data[styleKey] ?? {}),
        ...patch,
      },
    },
  };
}

export function applyFaqStylePatch(
  block: MicrositeBlock,
  target: FaqStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isFaqBlock(block)) return block;

  const data = block.data as any;

if (target === "block") {
  return {
    ...block,
    appearance: {
      ...block.appearance,
      ...patch,
    },
    data: {
      ...data,
      style: {
        ...(data.style ?? {}),
        ...patch,
      },
    },
  };
}

  return {
    ...block,
    data: {
      ...data,
      fieldStyle: {
        ...(data.fieldStyle ?? {}),
        ...patch,
      },
      sectionStyle: {
        ...(data.sectionStyle ?? {}),
        ...patch,
      },
    },
  };
}