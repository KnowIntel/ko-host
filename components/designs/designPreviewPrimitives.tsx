"use client";

import type { TextStyle } from "@/lib/templates/builder";

type PageTextKind = "title" | "subtitle" | "description" | "tagline";

function baseTextStyle(style?: TextStyle): React.CSSProperties {
  return {
    fontFamily:
      style?.fontFamily && style.fontFamily !== "inherit"
        ? style.fontFamily
        : undefined,
    fontWeight: style?.bold ? 700 : undefined,
    fontStyle: style?.italic ? "italic" : undefined,
    textDecoration: style?.underline ? "underline" : undefined,
    textAlign: style?.align ?? "left",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.15,
  };
}

function splitTitle(value: string) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);
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
            className={forCanvas ? "text-[30px] leading-[1.02] text-white" : "text-[22px] leading-[1.02] text-white"}
            style={{
              ...baseTextStyle(style),
              fontFamily:
                style?.fontFamily && style.fontFamily !== "inherit"
                  ? style.fontFamily
                  : '"Poppins", "Inter", "Avenir Next", "Segoe UI", sans-serif',
              fontWeight: style?.bold ? 700 : 600,
            }}
          >
            {split.firstPart || safeValue}
          </div>

          {split.accentWord ? (
            <div
              className={forCanvas ? "text-[30px] leading-[1.02] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400" : "text-[22px] leading-[1.52] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400"}
              style={{
                ...baseTextStyle(style),
                fontFamily:
                  style?.fontFamily && style.fontFamily !== "inherit"
                    ? style.fontFamily
                    : '"Poppins", "Inter", "Avenir Next", "Segoe UI", sans-serif',
                fontWeight: style?.bold ? 700 : 600,
              }}
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
          className={forCanvas ? "text-[16px] text-gray-200" : "text-[9px] text-gray-200"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"DM Sans", "Inter", "Avenir Next", "Segoe UI", sans-serif',
          }}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          className={forCanvas ? "text-[14px] leading-6 text-gray-200" : "text-[10px] leading-4 text-gray-200"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"DM Sans", "Inter", "Avenir Next", "Segoe UI", sans-serif',
          }}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        className={forCanvas ? "text-[13px] text-white/60" : "text-[9px] text-white/60"}
        style={baseTextStyle(style)}
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
            className={forCanvas ? "text-[12px] uppercase tracking-[0.42em] text-neutral-500" : "text-[10px] uppercase tracking-[0.42em] text-neutral-500"}
            style={{
              ...baseTextStyle(style),
              fontFamily:
                style?.fontFamily && style.fontFamily !== "inherit"
                  ? style.fontFamily
                  : '"Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            {split.head || safeValue}
          </div>

          {split.tail ? (
            <div
              className={forCanvas ? "-mt-1 text-[46px] leading-[0.9] text-neutral-800" : "-mt-1 text-[52px] leading-[0.9] text-neutral-800"}
              style={{
                ...baseTextStyle(style),
                fontFamily:
                  style?.fontFamily && style.fontFamily !== "inherit"
                    ? style.fontFamily
                    : '"Cormorant Garamond", "Times New Roman", serif',
              }}
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
          className={forCanvas ? "-mt-1 text-[24px] leading-none text-[#b48a68]" : "-mt-1 text-[32px] leading-none text-[#b48a68]"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"Great Vibes", "Brush Script MT", cursive',
          }}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          className={forCanvas ? "text-[13px] font-bold uppercase tracking-[0.18em] leading-6 text-neutral-600" : "text-[10px] font-bold uppercase tracking-[0.28em] leading-4 text-neutral-600"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"Cormorant Garamond", "Times New Roman", serif',
          }}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        className={forCanvas ? "text-[13px] text-stone-700" : "text-[9px] text-stone-700"}
        style={baseTextStyle(style)}
      >
        {safeValue}
      </div>
    );
  }

  if (designKey === "festive") {
    if (kind === "title") {
      return (
        <div
          className={forCanvas ? "text-[28px] leading-tight text-black" : "text-[22px] leading-tight text-black"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"Great Vibes", "Brush Script MT", cursive',
          }}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "subtitle") {
      return (
        <div
          className={forCanvas ? "text-[16px] uppercase tracking-wide text-red-700" : "text-[12px] uppercase tracking-wide text-red-700"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"Cormorant Garamond", "Times New Roman", serif',
          }}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          className={forCanvas ? "text-[13px] leading-6 text-black" : "text-[10px] leading-4 text-black"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"Cormorant Garamond", "Times New Roman", serif',
          }}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        className={forCanvas ? "text-[12px] font-medium text-black" : "text-[9px] font-medium text-black"}
        style={baseTextStyle(style)}
      >
        {safeValue}
      </div>
    );
  }

  if (designKey === "business") {
    if (kind === "title") {
      return (
        <div
          className={forCanvas ? "text-[28px] font-semibold leading-[1.2] text-[#1f2e5a]" : "text-[20px] font-semibold leading-[1.25] text-[#1f2e5a]"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"DM Sans", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
          }}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          className={forCanvas ? "text-[14px] leading-6 text-[#445174]" : "text-[11px] leading-5 text-[#445174]"}
          style={{
            ...baseTextStyle(style),
            fontFamily:
              style?.fontFamily && style.fontFamily !== "inherit"
                ? style.fontFamily
                : '"Poppins", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
          }}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        className={forCanvas ? "text-[13px] text-[#445174]" : "text-[10px] text-[#445174]"}
        style={baseTextStyle(style)}
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
          style={baseTextStyle(style)}
        >
          {safeValue}
        </div>
      );
    }

    if (kind === "description") {
      return (
        <div
          className={forCanvas ? "text-[13px] leading-6 text-neutral-600" : "text-[10px] leading-4 text-neutral-600"}
          style={baseTextStyle(style)}
        >
          {safeValue}
        </div>
      );
    }

    return (
      <div
        className={forCanvas ? "text-[13px] text-neutral-700" : "text-[9px] text-neutral-700"}
        style={baseTextStyle(style)}
      >
        {safeValue}
      </div>
    );
  }

  return (
    <div
      className={forCanvas ? "text-[14px] text-neutral-900" : "text-[10px] text-neutral-900"}
      style={baseTextStyle(style)}
    >
      {safeValue}
    </div>
  );
}