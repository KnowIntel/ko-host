// components\builder\mutations\contentMutations.ts
import type {
  CarouselImageItem,
  MicrositeBlock,
} from "@/lib/templates/builder";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
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

/* -------------------------------------------------------------------------- */
/* TEXT FX */
/* -------------------------------------------------------------------------- */

export function updateTextFxBlockText(
  blocks: MicrositeBlock[],
  blockId: string,
  text: string,
) {
  return blocks.map((block) =>
    block.type === "text_fx" && block.id === blockId
      ? { ...block, data: { ...block.data, text } }
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
            items: block.data.items.filter((item) => item.id !== itemId),
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
      ? { ...block, data: { ...block.data, [field]: value } }
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
  field:
    | "subject"
    | "composerPlaceholder"
    | "postButtonText",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "thread" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
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
            ...block.data,
            [field]: value,
          },
        }
      : block,
  );
}

export function updateThreadPostButtonStyle(
  blocks: MicrositeBlock[],
  blockId: string,
  value: "solid" | "outline" | "soft",
) {
  return blocks.map((block) =>
    block.type === "thread" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            postButtonStyle: value,
          },
        }
      : block,
  );
}

export function updateThreadMaxVisibleMessages(
  blocks: MicrositeBlock[],
  blockId: string,
  value: number,
) {
  return blocks.map((block) =>
    block.type === "thread" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            maxVisibleMessages: value,
          },
        }
      : block,
  );
}

export function updateThreadMessage(
  blocks: MicrositeBlock[],
  blockId: string,
  messageId: string,
  field: "name" | "message",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "thread" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            messages: (block.data.messages ?? []).map((entry) =>
              entry.id === messageId ? { ...entry, [field]: value } : entry,
            ),
          },
        }
      : block,
  );
}

export function addThreadMessage(
  blocks: MicrositeBlock[],
  blockId: string,
) {
  return blocks.map((block) =>
    block.type === "thread" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            messages: [
              ...(block.data.messages ?? []),
              {
                id: makeId("threadmsg"),
                name: "Guest",
                message: "New message",
              },
            ],
          },
        }
      : block,
  );
}

export function removeThreadMessage(
  blocks: MicrositeBlock[],
  blockId: string,
  messageId: string,
) {
  return blocks.map((block) =>
    block.type === "thread" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            messages: (block.data.messages ?? []).filter(
              (entry) => entry.id !== messageId,
            ),
          },
        }
      : block,
  );
}

/* -------------------------------------------------------------------------- */
/* IMAGE CAROUSEL */
/* -------------------------------------------------------------------------- */

export function updateImageCarouselField(
  blocks: MicrositeBlock[],
  blockId: string,
  field:
    | "heading"
    | "scrollDirection",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "image_carousel" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            [field]: value,
          },
        }
      : block,
  );
}

export function updateImageCarouselNumericField(
  blocks: MicrositeBlock[],
  blockId: string,
  field: "intervalMs" | "visibleCount",
  value: number,
) {
  return blocks.map((block) =>
    block.type === "image_carousel" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            [field]: value,
          },
        }
      : block,
  );
}

export function updateImageCarouselToggle(
  blocks: MicrositeBlock[],
  blockId: string,
  field:
    | "autoRotate"
    | "showOverlay"
    | "showTitles"
    | "pauseOnHover"
    | "openLinksInNewTab",
  value: boolean,
) {
  return blocks.map((block) =>
    block.type === "image_carousel" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            [field]: value,
          },
        }
      : block,
  );
}

export function addImageCarouselItem(
  blocks: MicrositeBlock[],
  blockId: string,
) {
  const nextItem: CarouselImageItem = {
    id: makeId("carouselitem"),
    imageUrl: "",
    title: "New Slide",
    subtitle: "",
    href: "",
  };

  return blocks.map((block) =>
    block.type === "image_carousel" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            items: [...block.data.items, nextItem],
          },
        }
      : block,
  );
}

export function removeImageCarouselItem(
  blocks: MicrositeBlock[],
  blockId: string,
  itemId: string,
) {
  return blocks.map((block) =>
    block.type === "image_carousel" && block.id === blockId
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

export function updateImageCarouselItemField(
  blocks: MicrositeBlock[],
  blockId: string,
  itemId: string,
  field: "imageUrl" | "title" | "subtitle" | "href",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "image_carousel" && block.id === blockId
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

export function replaceImageCarouselItems(
  blocks: MicrositeBlock[],
  blockId: string,
  items: CarouselImageItem[],
) {
  return blocks.map((block) =>
    block.type === "image_carousel" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            items,
          },
        }
      : block,
  );
}
/* -------------------------------------------------------------------------- */
/* FORM FIELD */
/* -------------------------------------------------------------------------- */

export function updateFormField(
  blocks: MicrositeBlock[],
  blockId: string,
  field: "label" | "placeholder" | "fieldType" | "value" | "submitButtonText",
  value: string,
) {
  return blocks.map((block) =>
    block.type === "form_field" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            [field]: value,
          },
        }
      : block,
  );
}

export function updateFormFieldRequired(
  blocks: MicrositeBlock[],
  blockId: string,
  value: boolean,
) {
  return blocks.map((block) =>
    block.type === "form_field" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            required: value,
          },
        }
      : block,
  );
}