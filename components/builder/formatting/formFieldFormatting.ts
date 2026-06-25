import type { MicrositeBlock } from "@/lib/templates/builder";

type FormFieldBlock = Extract<MicrositeBlock, { type: "form_field" }>;

export type FormFieldTextTarget = "placeholder" | "inputText";
export type FormFieldStyleTarget = "form" | "block";

function isFormFieldBlock(block: MicrositeBlock): block is FormFieldBlock {
  return block.type === "form_field";
}

function getTextStyleKey(target: FormFieldTextTarget) {
  return target === "placeholder" ? "placeholderStyle" : "inputStyle";
}

export function getFormFieldTextStyle(
  block: MicrositeBlock | null | undefined,
  target: FormFieldTextTarget,
) {
  if (!block || block.type !== "form_field") return {};

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return data[styleKey] ?? data.inputStyle ?? data.style ?? {};
}

export function applyFormFieldTextStylePatch(
  block: MicrositeBlock,
  target: FormFieldTextTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isFormFieldBlock(block)) return block;

  const data = block.data as any;
  const styleKey = getTextStyleKey(target);

  return {
    ...block,
    data: {
      ...data,
      [styleKey]: {
        ...(data[styleKey] ?? data.inputStyle ?? data.style ?? {}),
        ...patch,
      },

      // Renderer fallback for existing placeholder color wiring
      ...(target === "placeholder" && patch.color !== undefined
        ? { placeholderColor: patch.color }
        : {}),
    },
  };
}

export function applyFormFieldStylePatch(
  block: MicrositeBlock,
  target: FormFieldStyleTarget,
  patch: Record<string, any>,
): MicrositeBlock {
  if (!isFormFieldBlock(block)) return block;

  const data = block.data as any;

  if (target === "block") {
    return {
      ...block,
      appearance: {
        ...block.appearance,
        ...patch,
      },
    };
  }

  return {
    ...block,
    data: {
      ...data,
      inputStyle: {
        ...(data.inputStyle ?? data.style ?? {}),
        ...patch,
      },

      // Renderer fallback for existing field border wiring
      ...(patch.borderColor !== undefined
        ? { fieldBorderColor: patch.borderColor }
        : {}),
    },
  };
}