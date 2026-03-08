import type { BuilderDraft, MicrositeBlock } from "@/lib/templates/builder";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function withFreshIds(blocks: MicrositeBlock[]): MicrositeBlock[] {
  return blocks.map((block) => ({
    ...block,
    id: makeId(block.type),
  }));
}

/*
Design presets → default blocks

Blank design:
(no blocks)

Festive design:
1 Announcement
2 Countdown
3 Rich Text
4 RSVP
5 Gallery
6 Links

Showcase design:
1 Announcement
2 Gallery
3 Links

Modern design:
1 Announcement
2 Rich Text
3 CTA
4 Links

Elegant design:
1 Announcement
2 Rich Text
3 Gallery
4 Links

Business design:
1 Announcement
2 Rich Text
3 Links
*/

export function createLayoutDraft(
  templateKey: string,
  designKey: string,
): BuilderDraft {
  let blocks: MicrositeBlock[] = [];

  switch (designKey) {
    case "blank":
      blocks = [];
      break;

    case "gallery":
      // FESTIVE DESIGN
      blocks = [
        {
          id: makeId("announcement"),
          type: "announcement",
          label: "Announcement",
          data: {
            headline: "Welcome",
            body: "",
          },
        },
        {
          id: makeId("countdown"),
          type: "countdown",
          label: "Countdown",
          data: {
            heading: "Countdown",
            targetIso: "",
            completedMessage: "The event has started.",
          },
        },
        {
          id: makeId("richText"),
          type: "richText",
          label: "Rich Text",
          data: {
            heading: "Details",
            body: "",
          },
        },
        {
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
        },
        {
          id: makeId("gallery"),
          type: "gallery",
          label: "Gallery",
          data: {
            heading: "Gallery",
            items: [],
          },
        },
        {
          id: makeId("links"),
          type: "links",
          label: "Links",
          data: {
            heading: "Helpful Links",
            items: [],
          },
        },
      ];
      break;

    case "minimal":
      // SHOWCASE DESIGN
      blocks = [
        {
          id: makeId("announcement"),
          type: "announcement",
          label: "Announcement",
          data: {
            headline: "Welcome",
            body: "",
          },
        },
        {
          id: makeId("gallery"),
          type: "gallery",
          label: "Gallery",
          data: {
            heading: "Gallery",
            items: [],
          },
        },
        {
          id: makeId("links"),
          type: "links",
          label: "Links",
          data: {
            heading: "Helpful Links",
            items: [],
          },
        },
      ];
      break;

    case "modern":
      blocks = [
        {
          id: makeId("announcement"),
          type: "announcement",
          label: "Announcement",
          data: {
            headline: "Welcome",
            body: "",
          },
        },
        {
          id: makeId("richText"),
          type: "richText",
          label: "Rich Text",
          data: {
            heading: "Overview",
            body: "",
          },
        },
        {
          id: makeId("cta"),
          type: "cta",
          label: "Call To Action",
          data: {
            heading: "Take Action",
            body: "",
            buttonText: "Learn More",
            buttonUrl: "#",
          },
        },
        {
          id: makeId("links"),
          type: "links",
          label: "Links",
          data: {
            heading: "Helpful Links",
            items: [],
          },
        },
      ];
      break;

    case "elegant":
      blocks = [
        {
          id: makeId("announcement"),
          type: "announcement",
          label: "Announcement",
          data: {
            headline: "Welcome",
            body: "",
          },
        },
        {
          id: makeId("richText"),
          type: "richText",
          label: "Rich Text",
          data: {
            heading: "Details",
            body: "",
          },
        },
        {
          id: makeId("gallery"),
          type: "gallery",
          label: "Gallery",
          data: {
            heading: "Gallery",
            items: [],
          },
        },
        {
          id: makeId("links"),
          type: "links",
          label: "Links",
          data: {
            heading: "Helpful Links",
            items: [],
          },
        },
      ];
      break;

    case "classic":
      // BUSINESS DESIGN
      blocks = [
        {
          id: makeId("announcement"),
          type: "announcement",
          label: "Announcement",
          data: {
            headline: "Welcome",
            body: "",
          },
        },
        {
          id: makeId("richText"),
          type: "richText",
          label: "Rich Text",
          data: {
            heading: "Details",
            body: "",
          },
        },
        {
          id: makeId("links"),
          type: "links",
          label: "Links",
          data: {
            heading: "Helpful Links",
            items: [],
          },
        },
      ];
      break;

    default:
      blocks = [];
  }

  return {
    title: "",
    slugSuggestion: "",
    pageBackground: "none",
    blocks: withFreshIds(clone(blocks)),
  };
}