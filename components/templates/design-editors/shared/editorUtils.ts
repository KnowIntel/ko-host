/* -------------------------------------------------------------------------- */
/* COMPATIBILITY LAYER */
/* -------------------------------------------------------------------------- */

import {
  createBlock,
  type BuilderBlockType,
  type BuilderDraft,
  type CountdownBlock,
  type CtaBlock,
  type ImageBlock,
  type LabelBlock,
  type LinksBlock,
  type MicrositeBlock,
  type ShowcaseBlock,
  type TextStyle,
} from "@/lib/templates/builder";

export * from "@/components/builder/mutations/blockMutations";
export * from "@/components/builder/mutations/appearanceMutations";
export * from "@/components/builder/mutations/contentMutations";

/* -------------------------------------------------------------------------- */
/* FILE UTILITIES */
/* -------------------------------------------------------------------------- */

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isFormFieldBlock(block: any) {
  return block?.type === "form_field";
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error(`Failed reading file: ${file.name}`));

    reader.readAsDataURL(file);
  });
}

/* -------------------------------------------------------------------------- */
/* LEGACY / COMPAT HELPERS
/* -------------------------------------------------------------------------- */

export function addBlockToDraft(
  blocks: MicrositeBlock[],
  blockOrType: MicrositeBlock | BuilderBlockType,
) {
  const block =
    typeof blockOrType === "string" ? createBlock(blockOrType) : blockOrType;

  return [...blocks, block];
}

export function createDefaultCountdownBlock(): CountdownBlock {
  return createBlock("countdown") as CountdownBlock;
}

export function createDefaultHeroButtonBlock(
  buttonText = "Button",
): CtaBlock {
  const block = createBlock("cta") as CtaBlock;
  return {
    ...block,
    data: {
      ...block.data,
      buttonText,
    },
  };
}

export function createDefaultImageBlock(): ImageBlock {
  return createBlock("image") as ImageBlock;
}

export function createDefaultLabelBlock(text = "New Label"): LabelBlock {
  const block = createBlock("label") as LabelBlock;
  return {
    ...block,
    data: {
      ...block.data,
      text,
    },
  };
}

export function createDefaultLinksBlock(): LinksBlock {
  return createBlock("links") as LinksBlock;
}

export function getCountdownBlock(
  blocks: MicrositeBlock[],
): CountdownBlock | null {
  return (
    blocks.find(
      (block): block is CountdownBlock => block.type === "countdown",
    ) ?? null
  );
}

export function getHeroButtonBlock(blocks: MicrositeBlock[]): CtaBlock | null {
  return (
    blocks.find((block): block is CtaBlock => block.type === "cta") ?? null
  );
}

export function getLinksBlock(blocks: MicrositeBlock[]): LinksBlock | null {
  return (
    blocks.find((block): block is LinksBlock => block.type === "links") ?? null
  );
}

export function getShowcaseBlock(
  blocks: MicrositeBlock[],
): ShowcaseBlock | null {
  return (
    blocks.find(
      (block): block is ShowcaseBlock => block.type === "showcase",
    ) ?? null
  );
}

export function updateLabelBlockStyle(
  blocks: MicrositeBlock[],
  blockId: string,
  stylePatch: Partial<TextStyle>,
) {
  return blocks.map((block) =>
    block.type === "label" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            style: {
              ...(block.data.style ?? {}),
              ...stylePatch,
            },
          },
        }
      : block,
  );
}

export function updateImageCarouselItemField(
  blocks: MicrositeBlock[],
  blockId: string,
  itemId: string,
  field:
    | "title"
    | "subtitle"
    | "imageUrl"
    | "href"
    | "positionX"
    | "positionY"
    | "zoom"
    | "rotation",
  value: string | number,
) {
  return blocks.map((block) =>
    block.id === blockId && block.type === "image_carousel"
      ? {
          ...block,
          data: {
            ...block.data,
            items: block.data.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    [field]: value,
                  }
                : item,
            ),
          },
        }
      : block,
  );
}

export function sanitizeDraftForEditor(draft: BuilderDraft): BuilderDraft {
  return {
    ...draft,
    blocks: Array.isArray(draft.blocks)
      ? draft.blocks.map((block) => {
          // 🔥 CART SAFE GUARD
          if (block.type === "cart") {
            return {
              ...block,
              data: {
                heading: block.data?.heading ?? "Cart",
                taxRate: typeof block.data?.taxRate === "number" ? block.data.taxRate : 0,
                discount: typeof block.data?.discount === "number" ? block.data.discount : 0,
                buttonText: block.data?.buttonText ?? "Checkout",
                style: block.data?.style ?? {},
              },
            };
          }

          // 🔥 LISTING SAFE GUARD (fix your earlier errors)
          if (block.type === "listing") {
            return {
              ...block,
              data: {
                ...block.data,
                price: typeof block.data?.price === "number" ? block.data.price : 0,
                addToCart: Boolean(block.data?.addToCart),
              },
            };
          }

          return block;
        })
      : [],
  };
}