export type BuilderBlockType =
  | "announcement"
  | "links"
  | "contact"
  | "gallery"
  | "poll"
  | "rsvp"
  | "richText"
  | "faq"
  | "countdown"
  | "cta";

export type LinkItem = {
  id: string;
  label: string;
  url: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  caption?: string;
};

export type PollOption = {
  id: string;
  text: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type AnnouncementBlock = {
  id: string;
  type: "announcement";
  label: string;
  data: {
    headline: string;
    body: string;
  };
};

export type LinksBlock = {
  id: string;
  type: "links";
  label: string;
  data: {
    heading: string;
    items: LinkItem[];
  };
};

export type ContactBlock = {
  id: string;
  type: "contact";
  label: string;
  data: {
    heading: string;
    name: string;
    email: string;
    phone: string;
  };
};

export type GalleryBlock = {
  id: string;
  type: "gallery";
  label: string;
  data: {
    heading: string;
    items: GalleryItem[];
  };
};

export type PollBlock = {
  id: string;
  type: "poll";
  label: string;
  data: {
    question: string;
    options: PollOption[];
    allowMultiple: boolean;
  };
};

export type RsvpBlock = {
  id: string;
  type: "rsvp";
  label: string;
  data: {
    heading: string;
    eventDate: string;
    collectGuestCount: boolean;
    collectMealChoice: boolean;
    notesPlaceholder: string;
  };
};

export type RichTextBlock = {
  id: string;
  type: "richText";
  label: string;
  data: {
    heading: string;
    body: string;
  };
};

export type FaqBlock = {
  id: string;
  type: "faq";
  label: string;
  data: {
    heading: string;
    items: FaqItem[];
  };
};

export type CountdownBlock = {
  id: string;
  type: "countdown";
  label: string;
  data: {
    heading: string;
    targetIso: string;
    completedMessage: string;
  };
};

export type CtaBlock = {
  id: string;
  type: "cta";
  label: string;
  data: {
    heading: string;
    body: string;
    buttonText: string;
    buttonUrl: string;
  };
};

export type MicrositeBlock =
  | AnnouncementBlock
  | LinksBlock
  | ContactBlock
  | GalleryBlock
  | PollBlock
  | RsvpBlock
  | RichTextBlock
  | FaqBlock
  | CountdownBlock
  | CtaBlock;

export type BuilderDraft = {
  title: string;
  slugSuggestion: string;
  blocks: MicrositeBlock[];
};

export type LegacyDraftInput = {
  title?: string;
  slugSuggestion?: string;
  announcement?: string | { headline?: string; body?: string };
  links?: Array<{ label?: string; url?: string }>;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createBlock(type: BuilderBlockType): MicrositeBlock {
  switch (type) {
    case "announcement":
      return {
        id: makeId("announcement"),
        type: "announcement",
        label: "Announcement",
        data: {
          headline: "Welcome",
          body: "",
        },
      };

    case "links":
      return {
        id: makeId("links"),
        type: "links",
        label: "Links",
        data: {
          heading: "Helpful Links",
          items: [
            {
              id: makeId("link"),
              label: "",
              url: "",
            },
          ],
        },
      };

    case "contact":
      return {
        id: makeId("contact"),
        type: "contact",
        label: "Contact",
        data: {
          heading: "Contact",
          name: "",
          email: "",
          phone: "",
        },
      };

    case "gallery":
      return {
        id: makeId("gallery"),
        type: "gallery",
        label: "Gallery",
        data: {
          heading: "Gallery",
          items: [],
        },
      };

    case "poll":
      return {
        id: makeId("poll"),
        type: "poll",
        label: "Poll",
        data: {
          question: "What do you think?",
          options: [
            { id: makeId("poll_option"), text: "Option 1" },
            { id: makeId("poll_option"), text: "Option 2" },
          ],
          allowMultiple: false,
        },
      };

    case "rsvp":
      return {
        id: makeId("rsvp"),
        type: "rsvp",
        label: "RSVP",
        data: {
          heading: "RSVP",
          eventDate: "",
          collectGuestCount: true,
          collectMealChoice: false,
          notesPlaceholder: "Add a note",
        },
      };

    case "richText":
      return {
        id: makeId("richtext"),
        type: "richText",
        label: "Rich Text",
        data: {
          heading: "Details",
          body: "",
        },
      };

    case "faq":
      return {
        id: makeId("faq"),
        type: "faq",
        label: "FAQ",
        data: {
          heading: "FAQ",
          items: [
            {
              id: makeId("faq_item"),
              question: "",
              answer: "",
            },
          ],
        },
      };

    case "countdown":
      return {
        id: makeId("countdown"),
        type: "countdown",
        label: "Countdown",
        data: {
          heading: "Countdown",
          targetIso: "",
          completedMessage: "The wait is over.",
        },
      };

    case "cta":
      return {
        id: makeId("cta"),
        type: "cta",
        label: "Call To Action",
        data: {
          heading: "Take Action",
          body: "",
          buttonText: "Learn more",
          buttonUrl: "",
        },
      };
  }
}

export function createStarterDraft(title = ""): BuilderDraft {
  return {
    title,
    slugSuggestion: "",
    blocks: [
      createBlock("announcement"),
      createBlock("links"),
      createBlock("contact"),
    ],
  };
}

export function normalizeLegacyDraft(input: LegacyDraftInput | null | undefined): BuilderDraft {
  const safe = input ?? {};

  const blocks: MicrositeBlock[] = [];

  if (safe.announcement) {
    if (typeof safe.announcement === "string") {
      blocks.push({
        id: makeId("announcement"),
        type: "announcement",
        label: "Announcement",
        data: {
          headline: "Welcome",
          body: safe.announcement,
        },
      });
    } else {
      blocks.push({
        id: makeId("announcement"),
        type: "announcement",
        label: "Announcement",
        data: {
          headline: safe.announcement.headline ?? "Welcome",
          body: safe.announcement.body ?? "",
        },
      });
    }
  }

  if (safe.links?.length) {
    blocks.push({
      id: makeId("links"),
      type: "links",
      label: "Links",
      data: {
        heading: "Helpful Links",
        items: safe.links.map((item) => ({
          id: makeId("link"),
          label: item.label ?? "",
          url: item.url ?? "",
        })),
      },
    });
  }

  if (safe.contactName || safe.contactEmail || safe.contactPhone) {
    blocks.push({
      id: makeId("contact"),
      type: "contact",
      label: "Contact",
      data: {
        heading: "Contact",
        name: safe.contactName ?? "",
        email: safe.contactEmail ?? "",
        phone: safe.contactPhone ?? "",
      },
    });
  }

  if (blocks.length === 0) {
    blocks.push(...createStarterDraft(safe.title ?? "").blocks);
  }

  return {
    title: safe.title ?? "",
    slugSuggestion: safe.slugSuggestion ?? "",
    blocks,
  };
}

export function addBlock(
  draft: BuilderDraft,
  type: BuilderBlockType,
  index?: number,
): BuilderDraft {
  const nextBlock = createBlock(type);
  const nextBlocks = [...draft.blocks];

  if (typeof index === "number" && index >= 0 && index <= nextBlocks.length) {
    nextBlocks.splice(index, 0, nextBlock);
  } else {
    nextBlocks.push(nextBlock);
  }

  return {
    ...draft,
    blocks: nextBlocks,
  };
}

export function removeBlock(draft: BuilderDraft, blockId: string): BuilderDraft {
  return {
    ...draft,
    blocks: draft.blocks.filter((block) => block.id !== blockId),
  };
}

export function moveBlock(
  draft: BuilderDraft,
  fromIndex: number,
  toIndex: number,
): BuilderDraft {
  const nextBlocks = [...draft.blocks];
  if (
    fromIndex < 0 ||
    fromIndex >= nextBlocks.length ||
    toIndex < 0 ||
    toIndex >= nextBlocks.length
  ) {
    return draft;
  }

  const [moved] = nextBlocks.splice(fromIndex, 1);
  nextBlocks.splice(toIndex, 0, moved);

  return {
    ...draft,
    blocks: nextBlocks,
  };
}

export function updateBlock(
  draft: BuilderDraft,
  blockId: string,
  updater: (block: MicrositeBlock) => MicrositeBlock,
): BuilderDraft {
  return {
    ...draft,
    blocks: draft.blocks.map((block) =>
      block.id === blockId ? updater(block) : block,
    ),
  };
}

export function sanitizeBuilderDraft(draft: BuilderDraft): BuilderDraft {
  return {
    title: draft.title?.trim() ?? "",
    slugSuggestion: draft.slugSuggestion?.trim() ?? "",
    blocks: draft.blocks.map((block) => {
      switch (block.type) {
        case "announcement":
          return {
            ...block,
            data: {
              headline: block.data.headline.trim(),
              body: block.data.body.trim(),
            },
          };

        case "links":
          return {
            ...block,
            data: {
              heading: block.data.heading.trim(),
              items: block.data.items.map((item) => ({
                ...item,
                label: item.label.trim(),
                url: item.url.trim(),
              })),
            },
          };

        case "contact":
          return {
            ...block,
            data: {
              heading: block.data.heading.trim(),
              name: block.data.name.trim(),
              email: block.data.email.trim(),
              phone: block.data.phone.trim(),
            },
          };

        case "gallery":
          return {
            ...block,
            data: {
              heading: block.data.heading.trim(),
              items: block.data.items.map((item) => ({
                ...item,
                url: item.url.trim(),
                caption: item.caption?.trim() ?? "",
              })),
            },
          };

        case "poll":
          return {
            ...block,
            data: {
              question: block.data.question.trim(),
              options: block.data.options.map((option) => ({
                ...option,
                text: option.text.trim(),
              })),
              allowMultiple: block.data.allowMultiple,
            },
          };

        case "rsvp":
          return {
            ...block,
            data: {
              heading: block.data.heading.trim(),
              eventDate: block.data.eventDate.trim(),
              collectGuestCount: block.data.collectGuestCount,
              collectMealChoice: block.data.collectMealChoice,
              notesPlaceholder: block.data.notesPlaceholder.trim(),
            },
          };

        case "richText":
          return {
            ...block,
            data: {
              heading: block.data.heading.trim(),
              body: block.data.body.trim(),
            },
          };

        case "faq":
          return {
            ...block,
            data: {
              heading: block.data.heading.trim(),
              items: block.data.items.map((item) => ({
                ...item,
                question: item.question.trim(),
                answer: item.answer.trim(),
              })),
            },
          };

        case "countdown":
          return {
            ...block,
            data: {
              heading: block.data.heading.trim(),
              targetIso: block.data.targetIso.trim(),
              completedMessage: block.data.completedMessage.trim(),
            },
          };

        case "cta":
          return {
            ...block,
            data: {
              heading: block.data.heading.trim(),
              body: block.data.body.trim(),
              buttonText: block.data.buttonText.trim(),
              buttonUrl: block.data.buttonUrl.trim(),
            },
          };
      }
    }),
  };
}