import type {
  CountdownBlock,
  CtaBlock,
  FestiveBackgroundBlock,
  LinksBlock,
  MicrositeBlock,
  ShowcaseBlock,
} from "@/lib/templates/builder";

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Failed reading file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function createDefaultLinksBlock(): LinksBlock {
  return {
    id: makeId("links"),
    type: "links",
    label: "Links",
    data: {
      heading: "Navigation",
      items: [
        { id: makeId("link"), label: "Home", url: "#" },
        { id: makeId("link"), label: "Gallery", url: "#" },
        { id: makeId("link"), label: "About", url: "#" },
        { id: makeId("link"), label: "Contact", url: "#" },
      ],
    },
  };
}

export function createDefaultHeroButtonBlock(buttonText = "View Gallery"): CtaBlock {
  return {
    id: makeId("cta"),
    type: "cta",
    label: "Call To Action",
    data: {
      heading: "",
      body: "",
      buttonText,
      buttonUrl: "#",
    },
  };
}

export function createDefaultCountdownBlock(): CountdownBlock {
  return {
    id: makeId("countdown"),
    type: "countdown",
    label: "Countdown",
    data: {
      heading: "",
      targetIso: "",
      completedMessage: "Sale ended",
    },
  };
}

export function getShowcaseBlock(blocks: MicrositeBlock[]) {
  return (
    blocks.find((block): block is ShowcaseBlock => block.type === "showcase") || null
  );
}

export function getFestiveBackgroundBlock(blocks: MicrositeBlock[]) {
  return (
    blocks.find(
      (block): block is FestiveBackgroundBlock =>
        block.type === "festiveBackground",
    ) || null
  );
}

export function getLinksBlock(blocks: MicrositeBlock[]) {
  return blocks.find((block): block is LinksBlock => block.type === "links") || null;
}

export function getHeroButtonBlock(blocks: MicrositeBlock[]) {
  return blocks.find((block): block is CtaBlock => block.type === "cta") || null;
}

export function getCountdownBlock(blocks: MicrositeBlock[]) {
  return (
    blocks.find((block): block is CountdownBlock => block.type === "countdown") ||
    null
  );
}

export function isoToLocalDateTimeValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}