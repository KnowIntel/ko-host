"use client";

import type { TextStyle } from "@/lib/templates/builder";

type PageTextKind = "title" | "subtitle" | "description" | "tagline";

function baseTextStyle(style?: TextStyle): React.CSSProperties {
  return {
    fontFamily:
      style?.fontFamily && style.fontFamily !== "inherit"
        ? style.fontFamily
        : undefined,
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : undefined,
    fontStyle: style?.italic ? "italic" : undefined,
    textDecoration: style?.underline ? "underline" : undefined,
    textAlign: style?.align ?? "left",
    color: style?.color || undefined,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.15,
  };
}

function splitTitle(value: string) {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 1) {
    return {
      firstPart: value,
      accentWord: "",
      head: value,
      tail: "",
    };
  }

  return {
    firstPart: words.slice(0, -1).join(" "),
    accentWord: words.slice(-1).join(" "),
    head: words.slice(0, -1).join(" "),
    tail: words.slice(-1).join(" "),
  };
}

function mergeStyle(
  defaults: React.CSSProperties,
  style?: TextStyle,
): React.CSSProperties {
  return {
    ...defaults,
    ...baseTextStyle(style),
  };
}

export function renderDesignAwarePageText(params: {
  designKey: string;
  kind: PageTextKind;
  value: string;
  style?: TextStyle;
  forCanvas?: boolean;
}) {
  const { designKey, kind, value, style, forCanvas = false } = params;
  const safeValue = value || "";
  const split = splitTitle(safeValue);

  if (designKey === "modern") {
    if (kind === "title") {
  return (
    <div className="space-y-1">
      <div
        style={mergeStyle(
          {
            fontSize: forCanvas ? "30px" : "22px",
            lineHeight: 1.02,
            color: "#ffffff",
            fontFamily:
              '"Poppins", "Inter", "Avenir Next", "Segoe UI", sans-serif',
            fontWeight: 600,
            whiteSpace: "nowrap",
            wordBreak: "normal",
            overflowWrap: "normal",
          },
          style,
        )}
      >
        {split.firstPart || safeValue}
      </div>

      {split.accentWord ? (
        <div
          className="bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent"
          style={mergeStyle(
            {
              fontSize: forCanvas ? "30px" : "22px",
              lineHeight: forCanvas ? 1.02 : 1.52,
              fontFamily:
                '"Poppins", "Inter", "Avenir Next", "Segoe UI", sans-serif',
              fontWeight: 600,
              whiteSpace: "nowrap",
              wordBreak: "normal",
              overflowWrap: "normal",
            },
            {
              ...style,
              color: undefined,
            },
          )}
        >
          {split.accentWord}
        </div>
      ) : null}
    </div>
  );
}

    if (kind === "subtitle") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "16px" : "9px",
              color: "#e5e7eb",
              fontFamily:
                '"DM Sans", "Inter", "Avenir Next", "Segoe UI", sans-serif',
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "14px" : "10px",
              lineHeight: forCanvas ? 1.5 : 1.4,
              color: "#e5e7eb",
              fontFamily:
                '"DM Sans", "Inter", "Avenir Next", "Segoe UI", sans-serif',
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        style={mergeStyle(
          {
            fontSize: forCanvas ? "13px" : "9px",
            color: "rgba(255,255,255,0.6)",
            fontFamily:
              '"DM Sans", "Inter", "Avenir Next", "Segoe UI", sans-serif',
          },
          style,
        )}
      >
        {safeValue}
      </div>
    );
  }

  if (designKey === "elegant") {
    if (kind === "title") {
      return (
        <div className="space-y-0">
          <div
            style={mergeStyle(
              {
                fontSize: forCanvas ? "12px" : "10px",
                textTransform: "uppercase",
                letterSpacing: "0.32em",
                color: "#737373",
                fontFamily:
                  '"Cormorant Garamond", "Times New Roman", serif',
              },
              style,
            )}
          >
            {split.head || safeValue}
          </div>

          {split.tail ? (
            <div
              style={mergeStyle(
                {
                  marginTop: "-0.05rem",
                  fontSize: forCanvas ? "46px" : "52px",
                  lineHeight: 0.9,
                  color: "#262626",
                  fontFamily:
                    '"Cormorant Garamond", "Times New Roman", serif',
                },
                style,
              )}
            >
              {split.tail}
            </div>
          ) : null}
        </div>
      );
    }

    if (kind === "subtitle") {
      return (
        <div
          style={mergeStyle(
            {
              marginTop: "-0.35rem",
              fontSize: forCanvas ? "24px" : "32px",
              lineHeight: 1,
              color: "#b48a68",
              fontFamily: '"Great Vibes", "Brush Script MT", cursive',
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "13px" : "10px",
              lineHeight: forCanvas ? 1.5 : 1.4,
              color: "#525252",
              fontFamily:
                '"Cormorant Garamond", "Times New Roman", serif',
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: forCanvas ? "0.12em" : "0.22em",
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        style={mergeStyle(
          {
            fontSize: forCanvas ? "13px" : "9px",
            color: "#44403c",
            fontFamily:
              '"Cormorant Garamond", "Times New Roman", serif',
          },
          style,
        )}
      >
        {safeValue}
      </div>
    );
  }

  if (designKey === "festive") {
    if (kind === "title") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "28px" : "22px",
              lineHeight: 1.2,
              color: "#000000",
              fontFamily: '"Great Vibes", "Brush Script MT", cursive',
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "subtitle") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "16px" : "12px",
              color: "#b91c1c",
              fontFamily:
                '"Cormorant Garamond", "Times New Roman", serif',
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "13px" : "10px",
              lineHeight: forCanvas ? 1.5 : 1.4,
              color: "#000000",
              fontFamily:
                '"Cormorant Garamond", "Times New Roman", serif',
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        style={mergeStyle(
          {
            fontSize: forCanvas ? "12px" : "9px",
            color: "#000000",
            fontFamily:
              '"Cormorant Garamond", "Times New Roman", serif',
            fontWeight: 500,
          },
          style,
        )}
      >
        {safeValue}
      </div>
    );
  }

  if (designKey === "business") {
    if (kind === "title") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "28px" : "20px",
              lineHeight: forCanvas ? 1.2 : 1.25,
              color: "#1f2e5a",
              fontFamily:
                '"DM Sans", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
              fontWeight: 600,
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "14px" : "11px",
              lineHeight: forCanvas ? 1.5 : 1.45,
              color: "#445174",
              fontFamily:
                '"Poppins", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        style={mergeStyle(
          {
            fontSize: forCanvas ? "13px" : "10px",
            color: "#445174",
            fontFamily:
              '"DM Sans", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
          },
          style,
        )}
      >
        {safeValue}
      </div>
    );
  }

  if (designKey === "showcase") {
  if (kind === "title") {
    return (
      <div
        className={forCanvas ? "text-[28px] font-semibold leading-tight text-neutral-900" : "text-[28px] font-semibold leading-tight text-neutral-900"}
        style={{
          ...baseTextStyle(style),
          whiteSpace: "nowrap",
          wordBreak: "normal",
          overflowWrap: "normal",
        }}
      >
        {safeValue}
      </div>
    );
  }
  if (kind === "subtitle") {
    return (
      <div
        className={forCanvas ? "text-[28px] font-bold leading-tight text-neutral-900" : "text-[28px] font-semibold leading-tight text-neutral-900"}
        style={{
          ...baseTextStyle(style),
          whiteSpace: "nowrap",
          wordBreak: "normal",
          overflowWrap: "normal",
        }}
      >
        {safeValue}
      </div>
    );
  }

    if (kind === "description") {
      return (
        <div
          style={mergeStyle(
            {
              fontSize: forCanvas ? "13px" : "10px",
              lineHeight: forCanvas ? 1.5 : 1.4,
              color: "#525252",
              fontFamily: '"Inter", "Segoe UI", sans-serif',
            },
            style,
          )}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        style={mergeStyle(
          {
            fontSize: forCanvas ? "13px" : "9px",
            color: "#404040",
            fontFamily: '"Inter", "Segoe UI", sans-serif',
          },
          style,
        )}
      >
        {safeValue}
      </div>
    );
  }

  return (
    <div
      style={mergeStyle(
        {
          fontSize: forCanvas ? "14px" : "10px",
          color: "#111827",
          fontFamily: '"Inter", "Segoe UI", sans-serif',
        },
        style,
      )}
    >
      {safeValue}
    </div>
  );
}