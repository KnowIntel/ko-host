"use client";

import type {
  MicrositeBlock,
  LinkItem,
  PollOption,
  FaqItem,
  TextStyle,
} from "@/lib/templates/builder";

function getLabelText(block: Extract<MicrositeBlock, { type: "label" }>) {
  return block.data.text || "Label";
}

function getTextStyle(style?: TextStyle): React.CSSProperties {
  return {
    fontFamily:
      style?.fontFamily && style.fontFamily !== "inherit"
        ? style.fontFamily
        : "inherit",
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: style?.underline ? "underline" : "none",
    textAlign: style?.align ?? "left",
    color: style?.color || undefined,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.2,
  };
}

function isLightDesign(designKey?: string) {
  return (
    designKey === "showcase" ||
    designKey === "festive" ||
    designKey === "elegant" ||
    designKey === "business" ||
    designKey === "blank"
  );
}

function getSoftSurfaceClass(designKey?: string) {
  if (isLightDesign(designKey)) {
    return "border-neutral-200 bg-neutral-50 text-neutral-900";
  }

  return "border-white/10 bg-white/5 text-white";
}

function getPlaceholderClass(designKey?: string) {
  if (isLightDesign(designKey)) {
    return "border-neutral-300 text-neutral-400";
  }

  return "border-white/15 text-white/50";
}

function getMutedTextClass(designKey?: string) {
  if (isLightDesign(designKey)) {
    return "text-neutral-500";
  }

  return "text-white/60";
}

function getLinkItemClass(designKey?: string) {
  if (isLightDesign(designKey)) {
    return "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800";
  }

  return "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white";
}

function getButtonClass(designKey?: string) {
  if (designKey === "showcase") {
    return "inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white";
  }

  if (designKey === "festive") {
    return "inline-flex rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white";
  }

  if (designKey === "elegant") {
    return "inline-flex rounded-full border border-stone-400 bg-white/70 px-4 py-2 text-sm font-medium text-stone-800";
  }

  if (designKey === "business") {
    return "inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white";
  }

  if (designKey === "blank") {
    return "inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white";
  }

  return "inline-flex rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg";
}

export default function BlockRenderer({
  block,
  designKey = "blank",
}: {
  block: MicrositeBlock;
  designKey?: string;
}) {
  switch (block.type) {
    case "label":
      return (
        <div className="h-full w-full" style={getTextStyle(block.data.style)}>
          {getLabelText(block)}
        </div>
      );

    case "image":
      return block.data.image.url ? (
        <img
          src={block.data.image.url}
          alt={block.data.image.alt || ""}
          className="h-full w-full rounded-xl object-cover"
        />
      ) : (
        <div
          className={[
            "flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed text-sm",
            getPlaceholderClass(designKey),
          ].join(" ")}
        >
          Image
        </div>
      );

    case "cta":
      return (
        <div className="flex h-full items-center">
          <a
            href={block.data.buttonUrl || "#"}
            className={getButtonClass(designKey)}
          >
            {block.data.buttonText || "Button"}
          </a>
        </div>
      );

    case "countdown":
      return (
        <div
          className={[
            "rounded-xl border p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
        >
          {block.data.heading ? (
            <div
              className={[
                "text-xs uppercase tracking-[0.14em]",
                getMutedTextClass(designKey),
              ].join(" ")}
            >
              {block.data.heading}
            </div>
          ) : null}
          <div className="mt-2 text-lg font-semibold">00 : 00 : 00</div>
        </div>
      );

    case "links":
      return (
        <div className="space-y-3">
          {block.data.heading ? (
            <div className="text-sm font-semibold">{block.data.heading}</div>
          ) : null}

          <div
            className={
              designKey === "business"
                ? "grid h-full grid-cols-2 gap-2"
                : designKey === "showcase"
                  ? "space-y-2"
                  : "grid gap-2"
            }
          >
            {block.data.items.map((item: LinkItem) => (
              <a
                key={item.id}
                href={item.url || "#"}
                className={
                  designKey === "showcase"
                    ? "block text-sm font-medium text-neutral-700"
                    : getLinkItemClass(designKey)
                }
              >
                {item.label || "Link"}
              </a>
            ))}
          </div>
        </div>
      );

    case "gallery":
      return (
        <div
          className="grid h-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.max(
              1,
              Number(block.data.grid) || 3,
            )}, minmax(0, 1fr))`,
          }}
        >
          {(block.data.images.length
            ? block.data.images
            : Array.from({ length: Math.max(1, Number(block.data.grid) || 3) })
          )
            .slice(0, 12)
            .map((image: any, index) => (
              <div
                key={image?.id || index}
                className={[
                  "min-h-[72px] rounded-lg border",
                  isLightDesign(designKey)
                    ? "border-neutral-200 bg-white"
                    : "border-white/10 bg-white/5",
                ].join(" ")}
                style={
                  image?.url
                    ? {
                        backgroundImage: `url(${image.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
            ))}
        </div>
      );

    case "poll":
      return (
        <div
          className={[
            "rounded-xl border p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
        >
          <div className="text-sm font-semibold">
            {block.data.question || "Poll"}
          </div>
          <div className="mt-3 space-y-2">
            {block.data.options.map((option: PollOption) => (
              <div
                key={option.id}
                className={[
                  "rounded-lg border px-3 py-2 text-sm",
                  isLightDesign(designKey)
                    ? "border-neutral-200"
                    : "border-white/10",
                ].join(" ")}
              >
                {option.text || "Option"}
              </div>
            ))}
          </div>
        </div>
      );

    case "rsvp":
      return (
        <div
          className={[
            "rounded-xl border p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
        >
          <div className="text-sm font-semibold">
            {block.data.heading || "RSVP"}
          </div>
          <div
            className={[
              "mt-3 grid gap-2 text-sm",
              getMutedTextClass(designKey),
            ].join(" ")}
          >
            {block.data.collectName ? <div>Name</div> : null}
            {block.data.collectEmail ? <div>Email</div> : null}
            {block.data.collectPhone ? <div>Phone</div> : null}
            {block.data.collectGuestCount ? <div>Guest Count</div> : null}
            {block.data.collectNotes ? <div>Notes</div> : null}
          </div>
        </div>
      );

    case "faq":
      return (
        <div
          className={[
            "rounded-xl border p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
        >
          <div className="text-sm font-semibold">FAQs</div>
          <div className="mt-3 space-y-2">
            {block.data.items.map((item: FaqItem) => (
              <div
                key={item.id}
                className={[
                  "rounded-lg border p-3",
                  isLightDesign(designKey)
                    ? "border-neutral-200 bg-white"
                    : "border-white/10 bg-white/5",
                ].join(" ")}
              >
                <div className="text-sm font-medium">{item.question}</div>
                <div
                  className={[
                    "mt-1 text-sm",
                    getMutedTextClass(designKey),
                  ].join(" ")}
                >
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "thread":
      return (
        <div
          className={[
            "rounded-xl border p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
        >
          <div className="text-sm font-semibold">
            {block.data.subject || "Message Thread"}
          </div>
          <div className={["mt-3 text-sm", getMutedTextClass(designKey)].join(" ")}>
            Anonymous: {block.data.allowAnonymous ? "On" : "Off"}
          </div>
          <div className={["text-sm", getMutedTextClass(designKey)].join(" ")}>
            Approval: {block.data.requireApproval ? "Required" : "Not required"}
          </div>
        </div>
      );

    case "padding":
      return <div className="h-full w-full" />;

    case "showcase":
      return (
        <div className="grid h-full grid-cols-3 gap-2">
          {(block.data.images.length
            ? block.data.images
            : Array.from({ length: 9 })
          )
            .slice(0, 9)
            .map((image: any, index) => (
              <div
                key={image?.id || index}
                className={[
                  "aspect-square rounded-lg border",
                  isLightDesign(designKey)
                    ? "border-neutral-200 bg-neutral-100"
                    : "border-white/10 bg-white/5",
                ].join(" ")}
                style={
                  image?.url
                    ? {
                        backgroundImage: `url(${image.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
            ))}
        </div>
      );

    case "festiveBackground":
      return block.data.image.url ? (
        <img
          src={block.data.image.url}
          alt=""
          className="h-full w-full rounded-xl object-cover"
        />
      ) : (
        <div
          className={[
            "flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed text-sm",
            getPlaceholderClass(designKey),
          ].join(" ")}
        >
          Background image
        </div>
      );
  }
}