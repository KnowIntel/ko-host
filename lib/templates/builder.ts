export type LinkItem = {
  id: string;
  label: string;
  url: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  caption: string;
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
    allowMultiple: boolean;
    options: PollOption[];
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

export type BuilderBlockType = MicrositeBlock["type"];

export type BuilderDraft = {
  title: string;
  slugSuggestion: string;
  pageBackground?: string;
  blocks: MicrositeBlock[];
};

type LegacyDraft = {
  title?: string;
  slugSuggestion?: string;
  pageBackground?: string;
  announcement?: string | { headline?: string; body?: string };
  links?: Array<{ label?: string; url?: string }>;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  blocks?: unknown[];
};

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function sanitizeLinkItem(value: unknown): LinkItem {
  const item = value as Partial<LinkItem> | undefined;
  return {
    id: cleanString(item?.id) || makeId("link"),
    label: cleanString(item?.label),
    url: cleanString(item?.url),
  };
}

function sanitizeGalleryItem(value: unknown): GalleryItem {
  const item = value as Partial<GalleryItem> | undefined;
  return {
    id: cleanString(item?.id) || makeId("gallery"),
    url: cleanString(item?.url),
    caption: cleanString(item?.caption),
  };
}

function sanitizePollOption(value: unknown): PollOption {
  const option = value as Partial<PollOption> | undefined;
  return {
    id: cleanString(option?.id) || makeId("poll_option"),
    text: cleanString(option?.text),
  };
}

function sanitizeFaqItem(value: unknown): FaqItem {
  const item = value as Partial<FaqItem> | undefined;
  return {
    id: cleanString(item?.id) || makeId("faq"),
    question: cleanString(item?.question),
    answer: cleanString(item?.answer),
  };
}

function createBlock(type: BuilderBlockType): MicrositeBlock {
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
          allowMultiple: false,
          options: [
            { id: makeId("poll_option"), text: "" },
            { id: makeId("poll_option"), text: "" },
          ],
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
        id: makeId("richText"),
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
            { id: makeId("faq"), question: "", answer: "" },
            { id: makeId("faq"), question: "", answer: "" },
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
          completedMessage: "The event has started.",
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
          buttonText: "Learn More",
          buttonUrl: "#",
        },
      };
  }
}

function sanitizeBlock(block: unknown): MicrositeBlock | null {
  const raw = block as Partial<MicrositeBlock> | undefined;
  const type = raw?.type;

  if (!type) return null;

  const baseId = cleanString(raw.id) || makeId(String(type));
  const baseLabel = cleanString(raw.label) || "Section";

  switch (type) {
    case "announcement":
      return {
        id: baseId,
        type: "announcement",
        label: baseLabel || "Announcement",
        data: {
          headline: cleanString(raw.data?.headline) || "Welcome",
          body: cleanString(raw.data?.body),
        },
      };

    case "links":
      return {
        id: baseId,
        type: "links",
        label: baseLabel || "Links",
        data: {
          heading: cleanString(raw.data?.heading) || "Helpful Links",
          items: ensureArray(raw.data?.items).map(sanitizeLinkItem),
        },
      };

    case "contact":
      return {
        id: baseId,
        type: "contact",
        label: baseLabel || "Contact",
        data: {
          heading: cleanString(raw.data?.heading) || "Contact",
          name: cleanString(raw.data?.name),
          email: cleanString(raw.data?.email),
          phone: cleanString(raw.data?.phone),
        },
      };

    case "gallery":
      return {
        id: baseId,
        type: "gallery",
        label: baseLabel || "Gallery",
        data: {
          heading: cleanString(raw.data?.heading) || "Gallery",
          items: ensureArray(raw.data?.items).map(sanitizeGalleryItem),
        },
      };

    case "poll":
      return {
        id: baseId,
        type: "poll",
        label: baseLabel || "Poll",
        data: {
          question: cleanString(raw.data?.question) || "What do you think?",
          allowMultiple: Boolean(raw.data?.allowMultiple),
          options: ensureArray(raw.data?.options).map(sanitizePollOption),
        },
      };

    case "rsvp":
      return {
        id: baseId,
        type: "rsvp",
        label: baseLabel || "RSVP",
        data: {
          heading: cleanString(raw.data?.heading) || "RSVP",
          eventDate: cleanString(raw.data?.eventDate),
          collectGuestCount:
            typeof raw.data?.collectGuestCount === "boolean"
              ? raw.data.collectGuestCount
              : true,
          collectMealChoice: Boolean(raw.data?.collectMealChoice),
          notesPlaceholder:
            cleanString(raw.data?.notesPlaceholder) || "Add a note",
        },
      };

    case "richText":
      return {
        id: baseId,
        type: "richText",
        label: baseLabel || "Rich Text",
        data: {
          heading: cleanString(raw.data?.heading) || "Details",
          body: cleanString(raw.data?.body),
        },
      };

    case "faq":
      return {
        id: baseId,
        type: "faq",
        label: baseLabel || "FAQ",
        data: {
          heading: cleanString(raw.data?.heading) || "FAQ",
          items: ensureArray(raw.data?.items).map(sanitizeFaqItem),
        },
      };

    case "countdown":
      return {
        id: baseId,
        type: "countdown",
        label: baseLabel || "Countdown",
        data: {
          heading: cleanString(raw.data?.heading) || "Countdown",
          targetIso: cleanString(raw.data?.targetIso),
          completedMessage:
            cleanString(raw.data?.completedMessage) ||
            "The event has started.",
        },
      };

    case "cta":
      return {
        id: baseId,
        type: "cta",
        label: baseLabel || "Call To Action",
        data: {
          heading: cleanString(raw.data?.heading) || "Take Action",
          body: cleanString(raw.data?.body),
          buttonText: cleanString(raw.data?.buttonText) || "Learn More",
          buttonUrl: cleanString(raw.data?.buttonUrl) || "#",
        },
      };

    default:
      return null;
  }
}

export function sanitizeBuilderDraft(input: BuilderDraft): BuilderDraft {
  return {
    title: cleanString(input.title),
    slugSuggestion: cleanString(input.slugSuggestion),
    pageBackground: cleanString(input.pageBackground) || "none",
    blocks: ensureArray(input.blocks)
      .map(sanitizeBlock)
      .filter(Boolean) as MicrositeBlock[],
  };
}

export function createStarterDraft(title = ""): BuilderDraft {
  return {
    title: cleanString(title),
    slugSuggestion: "",
    pageBackground: "none",
    blocks: [],
  };
}

export function normalizeLegacyDraft(input: LegacyDraft): BuilderDraft {
  if (Array.isArray(input.blocks)) {
    return sanitizeBuilderDraft({
      title: cleanString(input.title),
      slugSuggestion: cleanString(input.slugSuggestion),
      pageBackground: cleanString(input.pageBackground) || "none",
      blocks: input.blocks as MicrositeBlock[],
    });
  }

  const blocks: MicrositeBlock[] = [];

  if (input.announcement) {
    if (typeof input.announcement === "string") {
      blocks.push({
        id: makeId("announcement"),
        type: "announcement",
        label: "Announcement",
        data: {
          headline: "Welcome",
          body: cleanString(input.announcement),
        },
      });
    } else {
      blocks.push({
        id: makeId("announcement"),
        type: "announcement",
        label: "Announcement",
        data: {
          headline: cleanString(input.announcement.headline) || "Welcome",
          body: cleanString(input.announcement.body),
        },
      });
    }
  }

  if (Array.isArray(input.links) && input.links.length) {
    blocks.push({
      id: makeId("links"),
      type: "links",
      label: "Links",
      data: {
        heading: "Helpful Links",
        items: input.links.map((item) => ({
          id: makeId("link"),
          label: cleanString(item.label),
          url: cleanString(item.url),
        })),
      },
    });
  }

  if (input.contactName || input.contactEmail || input.contactPhone) {
    blocks.push({
      id: makeId("contact"),
      type: "contact",
      label: "Contact",
      data: {
        heading: "Contact",
        name: cleanString(input.contactName),
        email: cleanString(input.contactEmail),
        phone: cleanString(input.contactPhone),
      },
    });
  }

  return sanitizeBuilderDraft({
    title: cleanString(input.title),
    slugSuggestion: cleanString(input.slugSuggestion),
    pageBackground: cleanString(input.pageBackground) || "none",
    blocks,
  });
}

export function addBlock(
  draft: BuilderDraft,
  type: BuilderBlockType,
): BuilderDraft {
  return {
    ...draft,
    blocks: [...draft.blocks, createBlock(type)],
  };
}

export function removeBlock(draft: BuilderDraft, blockId: string): BuilderDraft {
  return {
    ...draft,
    blocks: draft.blocks.filter((block) => block.id !== blockId),
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