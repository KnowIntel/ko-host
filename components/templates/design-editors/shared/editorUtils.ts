import type {
  BuilderBlockType,
  BuilderDraft,
  CountdownBlock,
  CtaBlock,
  FaqBlock,
  FestiveBackgroundBlock,
  GalleryBlock,
  ImageBlock,
  LabelBlock,
  LinksBlock,
  MicrositeBlock,
  PollBlock,
  RsvpBlock,
  ShowcaseBlock,
  TextStyle,
} from "@/lib/templates/builder";

import {
  createBlock,
  createDefaultTextStyle,
  updateTextStyle,
} from "@/lib/templates/builder";

import type { EditorSelection } from "@/components/templates/design-editors/shared/EditorSelection";

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
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
/* BLOCK CREATION */
/* -------------------------------------------------------------------------- */

export function createDefaultLinksBlock(): LinksBlock {
  return {
    ...createBlock("links"),
    data: {
      heading: "Navigation",
      items: [
        { id: makeId("link"), label: "Home", url: "#" },
        { id: makeId("link"), label: "Gallery", url: "#" },
        { id: makeId("link"), label: "About", url: "#" },
        { id: makeId("link"), label: "Contact", url: "#" },
      ],
    },
  } as LinksBlock;
}

export function createDefaultHeroButtonBlock(
  buttonText = "View Gallery",
): CtaBlock {
  return {
    ...createBlock("cta"),
    data: {
      heading: "",
      body: "",
      buttonText,
      buttonUrl: "#",
    },
  } as CtaBlock;
}

export function createDefaultCountdownBlock(): CountdownBlock {
  return {
    ...createBlock("countdown"),
    data: {
      heading: "",
      targetIso: "",
      completedMessage: "Sale ended",
    },
  } as CountdownBlock;
}

export function createDefaultLabelBlock(
  text = "New Label",
  style?: TextStyle,
): LabelBlock {
  return {
    ...createBlock("label"),
    data: {
      text,
      style: style ?? createDefaultTextStyle(),
    },
  } as LabelBlock;
}

export function createDefaultImageBlock(url = "", alt = ""): ImageBlock {
  return {
    ...createBlock("image"),
    data: {
      image: {
        id: makeId("img"),
        url,
        alt,
      },
    },
  } as ImageBlock;
}

export function createBlockFromType(
  type: BuilderBlockType,
): MicrositeBlock | null {
  try {
    return createBlock(type);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* BLOCK FINDERS */
/* -------------------------------------------------------------------------- */

export function getShowcaseBlock(blocks: MicrositeBlock[]) {
  return blocks.find((b): b is ShowcaseBlock => b.type === "showcase") || null;
}

export function getFestiveBackgroundBlock(blocks: MicrositeBlock[]) {
  return (
    blocks.find(
      (b): b is FestiveBackgroundBlock => b.type === "festiveBackground",
    ) || null
  );
}

export function getLinksBlock(blocks: MicrositeBlock[]) {
  return blocks.find((b): b is LinksBlock => b.type === "links") || null;
}

export function getHeroButtonBlock(blocks: MicrositeBlock[]) {
  return blocks.find((b): b is CtaBlock => b.type === "cta") || null;
}

export function getCountdownBlock(blocks: MicrositeBlock[]) {
  return blocks.find((b): b is CountdownBlock => b.type === "countdown") || null;
}

export function getLabelBlocks(blocks: MicrositeBlock[]) {
  return blocks.filter((b): b is LabelBlock => b.type === "label");
}

export function getImageBlocks(blocks: MicrositeBlock[]) {
  return blocks.filter((b): b is ImageBlock => b.type === "image");
}

/* -------------------------------------------------------------------------- */
/* BLOCK LIST OPERATIONS */
/* -------------------------------------------------------------------------- */

export function addBlockToDraft(
  blocks: MicrositeBlock[],
  block: MicrositeBlock,
) {
  return [...blocks, block];
}

export function addBlockTypeToDraft(
  blocks: MicrositeBlock[],
  type: BuilderBlockType,
) {
  const block = createBlockFromType(type);
  return block ? [...blocks, block] : blocks;
}

export function removeBlockFromDraft(
  blocks: MicrositeBlock[],
  blockId: string,
) {
  return blocks.filter((b) => b.id !== blockId);
}

/* -------------------------------------------------------------------------- */
/* LABEL */
/* -------------------------------------------------------------------------- */

export function updateLabelBlockText(
  blocks: MicrositeBlock[],
  blockId: string,
  text: string,
) {
  return blocks.map((block) =>
    block.type === "label" && block.id === blockId
      ? { ...block, data: { ...block.data, text } }
      : block,
  );
}

export function updateLabelBlockStyle(
  blocks: MicrositeBlock[],
  blockId: string,
  patch: Partial<TextStyle>,
) {
  return blocks.map((block) =>
    block.type === "label" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            style: updateTextStyle(block.data.style, patch),
          },
        }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* IMAGE */
/* -------------------------------------------------------------------------- */

export function updateImageBlockUrl(
  blocks: MicrositeBlock[],
  blockId: string,
  url: string,
) {
  return blocks.map((block) =>
    block.type === "image" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            image: { ...block.data.image, url },
          },
        }
      : block,
  );
}

export function updateImageBlockAlt(
  blocks: MicrositeBlock[],
  blockId: string,
  alt: string,
) {
  return blocks.map((block) =>
    block.type === "image" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            image: { ...block.data.image, alt },
          },
        }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* CTA */
/* -------------------------------------------------------------------------- */

export function updateCtaBlockField(
  blocks: MicrositeBlock[],
  blockId: string,
  field: "heading" | "body" | "buttonText" | "buttonUrl",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "cta" && block.id === blockId
      ? { ...block, data: { ...block.data, [field]: value } }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* COUNTDOWN */
/* -------------------------------------------------------------------------- */

export function updateCountdownField(
  blocks: MicrositeBlock[],
  blockId: string,
  field: "heading" | "targetIso" | "completedMessage",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "countdown" && block.id === blockId
      ? { ...block, data: { ...block.data, [field]: value } }
      : block,
  );
}

/* backward compatibility for older editors */
export function updateCountdownTarget(
  blocks: MicrositeBlock[],
  value: string,
) {
  return blocks.map((block) =>
    block.type === "countdown"
      ? { ...block, data: { ...block.data, targetIso: value } }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* LINKS */
/* -------------------------------------------------------------------------- */

export function updateLinksHeading(
  blocks: MicrositeBlock[],
  blockId: string,
  value: string,
) {
  return blocks.map((block) =>
    block.type === "links" && block.id === blockId
      ? { ...block, data: { ...block.data, heading: value } }
      : block,
  );
}

export function updateLinkItem(
  blocks: MicrositeBlock[],
  itemId: string,
  field: "label" | "url",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "links"
      ? {
          ...block,
          data: {
            ...block.data,
            items: block.data.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item,
            ),
          },
        }
      : block,
  );
}

export function addNavigationLink(
  blocks: MicrositeBlock[],
  blockId?: string,
) {
  return blocks.map((block) =>
    block.type === "links" && (!blockId || block.id === blockId)
      ? {
          ...block,
          data: {
            ...block.data,
            items: [
              ...block.data.items,
              { id: makeId("link"), label: "New Link", url: "#" },
            ],
          },
        }
      : block,
  );
}

export function removeNavigationLink(
  blocks: MicrositeBlock[],
  itemId: string,
) {
  return blocks.map((block) =>
    block.type === "links"
      ? {
          ...block,
          data: {
            ...block.data,
            items: block.data.items.filter((i) => i.id !== itemId),
          },
        }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* POLL */
/* -------------------------------------------------------------------------- */

export function updatePollQuestion(
  blocks: MicrositeBlock[],
  blockId: string,
  value: string,
) {
  return blocks.map((block) =>
    block.type === "poll" && block.id === blockId
      ? { ...block, data: { ...block.data, question: value } }
      : block,
  );
}

export function updatePollOptionText(
  blocks: MicrositeBlock[],
  blockId: string,
  optionId: string,
  value: string,
) {
  return blocks.map((block) =>
    block.type === "poll" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            options: block.data.options.map((option) =>
              option.id === optionId ? { ...option, text: value } : option,
            ),
          },
        }
      : block,
  );
}

export function addPollOption(
  blocks: MicrositeBlock[],
  blockId: string,
) {
  return blocks.map((block) =>
    block.type === "poll" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            options: [
              ...block.data.options,
              { id: makeId("opt"), text: "New Option" },
            ],
          },
        }
      : block,
  );
}

export function removePollOption(
  blocks: MicrositeBlock[],
  blockId: string,
  optionId: string,
) {
  return blocks.map((block) =>
    block.type === "poll" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            options: block.data.options.filter((option) => option.id !== optionId),
          },
        }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* RSVP */
/* -------------------------------------------------------------------------- */

export function updateRsvpHeading(
  blocks: MicrositeBlock[],
  blockId: string,
  value: string,
) {
  return blocks.map((block) =>
    block.type === "rsvp" && block.id === blockId
      ? { ...block, data: { ...block.data, heading: value } }
      : block,
  );
}

export function updateRsvpToggle(
  blocks: MicrositeBlock[],
  blockId: string,
  field:
    | "collectName"
    | "collectEmail"
    | "collectPhone"
    | "collectGuestCount"
    | "collectNotes",
  value: boolean,
) {
  return blocks.map((block) =>
    block.type === "rsvp" && block.id === blockId
      ? { ...block, data: { ...(block.data as any), [field]: value } }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ */
/* -------------------------------------------------------------------------- */

export function updateFaqItem(
  blocks: MicrositeBlock[],
  blockId: string,
  itemId: string,
  field: "question" | "answer",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "faq" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            items: block.data.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item,
            ),
          },
        }
      : block,
  );
}

export function addFaqItem(
  blocks: MicrositeBlock[],
  blockId: string,
) {
  return blocks.map((block) =>
    block.type === "faq" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            items: [
              ...block.data.items,
              {
                id: makeId("faq"),
                question: "Question",
                answer: "Answer",
              },
            ],
          },
        }
      : block,
  );
}

export function removeFaqItem(
  blocks: MicrositeBlock[],
  blockId: string,
  itemId: string,
) {
  return blocks.map((block) =>
    block.type === "faq" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            items: block.data.items.filter((item) => item.id !== itemId),
          },
        }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* GALLERY */
/* -------------------------------------------------------------------------- */

export function appendGalleryImages(
  blocks: MicrositeBlock[],
  blockId: string,
  urls: string[],
) {
  return blocks.map((block) =>
    block.type === "gallery" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            images: [
              ...block.data.images,
              ...urls.map((url) => ({
                id: makeId("galleryimg"),
                url,
              })),
            ],
          },
        }
      : block,
  );
}

export function updateGalleryGrid(
  blocks: MicrositeBlock[],
  blockId: string,
  value: number,
) {
  return blocks.map((block) =>
    block.type === "gallery" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            grid: value,
          },
        }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* THREAD */
/* -------------------------------------------------------------------------- */

export function updateThreadField(
  blocks: MicrositeBlock[],
  blockId: string,
  field: "subject",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "thread" && block.id === blockId
      ? {
          ...block,
          data: {
            ...(block.data as any),
            [field]: value,
          },
        }
      : block,
  );
}

export function updateThreadToggle(
  blocks: MicrositeBlock[],
  blockId: string,
  field: "allowAnonymous" | "requireApproval",
  value: boolean,
) {
  return blocks.map((block) =>
    block.type === "thread" && block.id === blockId
      ? {
          ...block,
          data: {
            ...(block.data as any),
            [field]: value,
          },
        }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* TEXT STYLE SELECTION ENGINE */
/* -------------------------------------------------------------------------- */

export function getSelectionTextStyle(
  draft: BuilderDraft,
  selection: EditorSelection,
): TextStyle {
  switch (selection.type) {
    case "page:title":
      return draft.titleStyle ?? createDefaultTextStyle();

    case "page:subtitle":
      return draft.subtitleStyle ?? createDefaultTextStyle();

    case "page:subtext":
      return draft.subtextStyle ?? createDefaultTextStyle();

    case "page:description":
      return draft.descriptionStyle ?? createDefaultTextStyle();

    case "page:countdownLabel":
      return draft.countdownLabelStyle ?? createDefaultTextStyle();

    case "block": {
      const block = draft.blocks.find((b) => b.id === selection.blockId);
      if (block?.type === "label") {
        return block.data.style ?? createDefaultTextStyle();
      }
      return createDefaultTextStyle();
    }

    default:
      return createDefaultTextStyle();
  }
}

export function applyStylePatchToSelection(
  draft: BuilderDraft,
  selection: EditorSelection,
  patch: Partial<TextStyle>,
): BuilderDraft {
  switch (selection.type) {
    case "page:title":
      return {
        ...draft,
        titleStyle: updateTextStyle(draft.titleStyle, patch),
      };

    case "page:subtitle":
      return {
        ...draft,
        subtitleStyle: updateTextStyle(draft.subtitleStyle, patch),
      };

    case "page:subtext":
      return {
        ...draft,
        subtextStyle: updateTextStyle(draft.subtextStyle, patch),
      };

    case "page:description":
      return {
        ...draft,
        descriptionStyle: updateTextStyle(draft.descriptionStyle, patch),
      };

    case "page:countdownLabel":
      return {
        ...draft,
        countdownLabelStyle: updateTextStyle(
          draft.countdownLabelStyle,
          patch,
        ),
      };

    case "block":
      return {
        ...draft,
        blocks: updateLabelBlockStyle(draft.blocks, selection.blockId, patch),
      };

    default:
      return draft;
  }
}