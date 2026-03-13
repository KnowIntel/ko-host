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
    return "border-neutral-200 bg-neutral-50";
  }

  return "border-white/10 bg-white/5";
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
    return "rounded-lg border border-neutral-200 bg-white px-3 py-2";
  }

  return "rounded-lg border border-white/10 bg-white/5 px-3 py-2";
}

function getButtonClass(designKey?: string) {
  if (designKey === "showcase") {
    return "inline-flex rounded-full bg-neutral-900 px-4 py-2";
  }

  if (designKey === "festive") {
    return "inline-flex rounded-full bg-red-700 px-4 py-2";
  }

  if (designKey === "elegant") {
    return "inline-flex rounded-full border border-stone-400 bg-white/70 px-4 py-2 backdrop-blur-sm";
  }

  if (designKey === "business") {
    return "inline-flex rounded-xl bg-neutral-900 px-5 py-3";
  }

  if (designKey === "blank") {
    return "inline-flex rounded-xl bg-neutral-900 px-4 py-2";
  }

  return "inline-flex rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 shadow-lg";
}

function getDefaultTextColor(designKey?: string) {
  return isLightDesign(designKey) ? "#111827" : "#ffffff";
}

function getButtonTextStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  const base = getTextStyle(style);
  return {
    ...base,
    color: style?.color || (designKey === "elegant" ? "#44403c" : "#ffffff"),
  };
}

function getContainerTextStyle(
  style?: TextStyle,
  designKey?: string,
): React.CSSProperties {
  const base = getTextStyle(style);
  return {
    ...base,
    color: style?.color || getDefaultTextColor(designKey),
  };
}

function getAppearanceStyle(block: MicrositeBlock): React.CSSProperties {
  return {
    backgroundColor:
      block.appearance?.backgroundColor &&
      block.appearance.backgroundColor !== "transparent"
        ? block.appearance.backgroundColor
        : undefined,
    borderColor: block.appearance?.borderColor || undefined,
    borderWidth:
      typeof block.appearance?.borderWidth === "number"
        ? `${block.appearance.borderWidth}px`
        : undefined,
    borderStyle:
      typeof block.appearance?.borderWidth === "number" &&
      block.appearance.borderWidth > 0
        ? "solid"
        : undefined,
    borderRadius:
      typeof block.appearance?.borderRadius === "number"
        ? `${block.appearance.borderRadius}px`
        : undefined,
  };
}

function renderShape(block: Extract<MicrositeBlock, { type: "shape" }>) {
  const style = getAppearanceStyle(block);

  if (block.data.shapeType === "line") {
    return (
      <div className="flex h-full w-full items-center">
        <div
          className="w-full"
          style={{
            height: `${Math.max(2, block.appearance?.borderWidth || 4)}px`,
            backgroundColor:
              block.appearance?.borderColor || block.appearance?.backgroundColor || "#111827",
            borderRadius: "999px",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{
        ...style,
        borderRadius:
          block.data.shapeType === "circle"
            ? "9999px"
            : style.borderRadius || "16px",
        minHeight: "100%",
      }}
    />
  );
}

export default function BlockRenderer({
  block,
  designKey = "blank",
}: {
  block: MicrositeBlock;
  designKey?: string;
}) {
  const wrapperStyle = getAppearanceStyle(block);

  switch (block.type) {
    case "label":
      return (
        <div className="h-full w-full p-2" style={wrapperStyle}>
          <div style={getContainerTextStyle(block.data.style, designKey)}>
            {getLabelText(block)}
          </div>
        </div>
      );

    case "image":
      return block.data.image.url ? (
        <div className="h-full w-full overflow-hidden" style={wrapperStyle}>
          <img
            src={block.data.image.url}
            alt={block.data.image.alt || ""}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          className={[
            "flex h-full min-h-[120px] items-center justify-center border border-dashed text-sm",
            getPlaceholderClass(designKey),
          ].join(" ")}
          style={wrapperStyle}
        >
          Image
        </div>
      );

    case "cta":
      return (
        <div className="flex h-full items-center p-2" style={wrapperStyle}>
          <a
            href={block.data.buttonUrl || "#"}
            className={getButtonClass(designKey)}
            style={getButtonTextStyle(block.data.style, designKey)}
          >
            {block.data.buttonText || "Button"}
          </a>
        </div>
      );

    case "countdown":
      return (
        <div
          className={[
            "p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
          style={wrapperStyle}
        >
          {block.data.heading ? (
            <div
              className={["uppercase tracking-[0.14em]", getMutedTextClass(designKey)].join(" ")}
              style={getContainerTextStyle(block.data.style, designKey)}
            >
              {block.data.heading}
            </div>
          ) : null}

          <div
            className="mt-2"
            style={getContainerTextStyle(block.data.style, designKey)}
          >
            00 : 00 : 00
          </div>
        </div>
      );

    case "links":
      return (
        <div className="space-y-3 p-2" style={wrapperStyle}>
          {block.data.heading ? (
            <div style={getContainerTextStyle(block.data.style, designKey)}>
              {block.data.heading}
            </div>
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
                    ? "block"
                    : getLinkItemClass(designKey)
                }
                style={getContainerTextStyle(block.data.style, designKey)}
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
          className="grid h-full gap-2 p-2"
          style={{
            ...wrapperStyle,
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
            "p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
          style={wrapperStyle}
        >
          <div style={getContainerTextStyle(block.data.style, designKey)}>
            {block.data.question || "Poll"}
          </div>

          <div className="mt-3 space-y-2">
            {block.data.options.map((option: PollOption) => (
              <div
                key={option.id}
                className={[
                  "rounded-lg border px-3 py-2",
                  isLightDesign(designKey)
                    ? "border-neutral-200"
                    : "border-white/10",
                ].join(" ")}
                style={getContainerTextStyle(block.data.style, designKey)}
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
            "p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
          style={wrapperStyle}
        >
          <div style={getContainerTextStyle(block.data.style, designKey)}>
            {block.data.heading || "RSVP"}
          </div>

          <div className="mt-3 grid gap-2" style={getContainerTextStyle(block.data.style, designKey)}>
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
            "p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
          style={wrapperStyle}
        >
          <div style={getContainerTextStyle(block.data.style, designKey)}>
            FAQs
          </div>

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
                <div style={getContainerTextStyle(block.data.style, designKey)}>
                  {item.question}
                </div>
                <div className="mt-1" style={getContainerTextStyle(block.data.style, designKey)}>
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
            "p-4",
            getSoftSurfaceClass(designKey),
          ].join(" ")}
          style={wrapperStyle}
        >
          <div style={getContainerTextStyle(block.data.style, designKey)}>
            {block.data.subject || "Message Thread"}
          </div>

          <div className="mt-3" style={getContainerTextStyle(block.data.style, designKey)}>
            Anonymous: {block.data.allowAnonymous ? "On" : "Off"}
          </div>

          <div style={getContainerTextStyle(block.data.style, designKey)}>
            Approval: {block.data.requireApproval ? "Required" : "Not required"}
          </div>
        </div>
      );

    case "padding":
      return <div className="h-full w-full" />;

    case "showcase":
      return (
        <div className="grid h-full grid-cols-3 gap-2 p-2" style={wrapperStyle}>
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
        <div className="h-full w-full overflow-hidden" style={wrapperStyle}>
          <img
            src={block.data.image.url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          className={[
            "flex h-full min-h-[120px] items-center justify-center border border-dashed text-sm",
            getPlaceholderClass(designKey),
          ].join(" ")}
          style={wrapperStyle}
        >
          Background image
        </div>
      );

    case "shape":
      return renderShape(block);
  }
}