import { createStarterDraft, type BuilderDraft } from "@/lib/templates/builder";
import type { DesignPresetKey } from "@/lib/design-presets/designRegistry";
import { LAYOUT_PRESETS } from "./layoutRegistry";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildFallbackDraft(designKey: DesignPresetKey): BuilderDraft {
  switch (designKey) {
    case "blank":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Welcome",
              body: "",
            },
          },
        ],
      };

    case "elegant":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Welcome",
              body: "Share your message with a more polished, refined presentation.",
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
              heading: "Important Links",
              items: [],
            },
          },
          {
            id: makeId("contact"),
            type: "contact",
            label: "Contact",
            data: {
              heading: "Contact",
              name: "",
              email: "",
              phone: "",
            },
          },
        ],
      };

    case "minimal":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
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
        ],
      };

    case "startup":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Something New Is Coming",
              body: "Introduce your product, project, or launch with momentum.",
            },
          },
          {
            id: makeId("gallery"),
            type: "gallery",
            label: "Gallery",
            data: {
              heading: "Preview",
              items: [],
            },
          },
          {
            id: makeId("richText"),
            type: "richText",
            label: "Rich Text",
            data: {
              heading: "Why It Matters",
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
              buttonText: "Get Early Access",
              buttonUrl: "#",
            },
          },
        ],
      };

    case "gallery":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Featured Gallery",
              body: "Showcase your strongest visuals first.",
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
              heading: "Related Links",
              items: [],
            },
          },
        ],
      };

    case "portfolio":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Featured Work",
              body: "Present your work, links, and highlights in one place.",
            },
          },
          {
            id: makeId("richText"),
            type: "richText",
            label: "Rich Text",
            data: {
              heading: "About",
              body: "",
            },
          },
          {
            id: makeId("gallery"),
            type: "gallery",
            label: "Gallery",
            data: {
              heading: "Selected Work",
              items: [],
            },
          },
          {
            id: makeId("links"),
            type: "links",
            label: "Links",
            data: {
              heading: "Portfolio Links",
              items: [],
            },
          },
          {
            id: makeId("contact"),
            type: "contact",
            label: "Contact",
            data: {
              heading: "Contact",
              name: "",
              email: "",
              phone: "",
            },
          },
        ],
      };

    case "event":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Upcoming Event",
              body: "Share the details, schedule, and next steps clearly.",
            },
          },
          {
            id: makeId("countdown"),
            type: "countdown",
            label: "Countdown",
            data: {
              heading: "Countdown",
              targetIso: "",
              completedMessage: "The event is happening now.",
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
            id: makeId("contact"),
            type: "contact",
            label: "Contact",
            data: {
              heading: "Contact",
              name: "",
              email: "",
              phone: "",
            },
          },
        ],
      };

    case "fundraiser":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Support Our Mission",
              body: "Explain the cause, the goal, and how people can help.",
            },
          },
          {
            id: makeId("richText"),
            type: "richText",
            label: "Rich Text",
            data: {
              heading: "Our Goal",
              body: "",
            },
          },
          {
            id: makeId("cta"),
            type: "cta",
            label: "Call To Action",
            data: {
              heading: "Support Now",
              body: "",
              buttonText: "Donate Now",
              buttonUrl: "#",
            },
          },
          {
            id: makeId("contact"),
            type: "contact",
            label: "Contact",
            data: {
              heading: "Contact",
              name: "",
              email: "",
              phone: "",
            },
          },
        ],
      };

    case "community":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Community Update",
              body: "Keep your group informed and connected.",
            },
          },
          {
            id: makeId("richText"),
            type: "richText",
            label: "Rich Text",
            data: {
              heading: "Update",
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
          {
            id: makeId("contact"),
            type: "contact",
            label: "Contact",
            data: {
              heading: "Contact",
              name: "",
              email: "",
              phone: "",
            },
          },
        ],
      };

    case "product":
      return {
        title: "",
        slugSuggestion: "",
        blocks: [
          {
            id: makeId("announcement"),
            type: "announcement",
            label: "Announcement",
            data: {
              headline: "Featured Product",
              body: "Highlight your offer with a stronger showcase feel.",
            },
          },
          {
            id: makeId("gallery"),
            type: "gallery",
            label: "Gallery",
            data: {
              heading: "Product Highlights",
              items: [],
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
        ],
      };

    default:
      return createStarterDraft("");
  }
}

export function createLayoutDraft(
  templateKey: string,
  designKey: string,
): BuilderDraft {
  const preset = LAYOUT_PRESETS.find(
    (p) => p.template === templateKey && p.design === designKey,
  );

  if (!preset) {
    return buildFallbackDraft((designKey as DesignPresetKey) || "blank");
  }

  return {
    title: "",
    slugSuggestion: "",
    blocks: clone(preset.blocks),
  };
}