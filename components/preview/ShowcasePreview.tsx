"use client";

import type {
  BuilderDraft,
  CountdownBlock,
  CtaBlock,
  ImageBlock,
  LabelBlock,
  LinksBlock,
  ShowcaseBlock,
  TextStyle,
} from "@/lib/templates/builder";

function getShowcaseBlock(blocks: BuilderDraft["blocks"]) {
  return (
    blocks.find((block): block is ShowcaseBlock => block.type === "showcase") ||
    null
  );
}

function getLinksBlock(blocks: BuilderDraft["blocks"]) {
  return (
    blocks.find((block): block is LinksBlock => block.type === "links") || null
  );
}

function getHeroButtonBlock(blocks: BuilderDraft["blocks"]) {
  return blocks.find((block): block is CtaBlock => block.type === "cta") || null;
}

function getCountdownBlock(blocks: BuilderDraft["blocks"]) {
  return (
    blocks.find((block): block is CountdownBlock => block.type === "countdown") ||
    null
  );
}

function getLabelBlocks(blocks: BuilderDraft["blocks"]) {
  return blocks.filter((block): block is LabelBlock => block.type === "label");
}

function getImageBlocks(blocks: BuilderDraft["blocks"]) {
  return blocks.filter((block): block is ImageBlock => block.type === "image");
}

function getLabelStyle(style?: TextStyle): React.CSSProperties {
  return {
    fontFamily:
      style?.fontFamily && style.fontFamily !== "inherit"
        ? style.fontFamily
        : undefined,
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 700 : 400,
    fontStyle: style?.italic ? "italic" : "normal",
    textDecoration: style?.underline ? "underline" : "none",
    textAlign: style?.align ?? "left",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };
}

export default function ShowcasePreview({ draft }: { draft: BuilderDraft }) {
  const showcaseBlock = getShowcaseBlock(draft.blocks);
  const ctaBlock = getHeroButtonBlock(draft.blocks);
  const countdownBlock = getCountdownBlock(draft.blocks);
  const linksBlock = getLinksBlock(draft.blocks);
  const labelBlocks = getLabelBlocks(draft.blocks);
  const imageBlocks = getImageBlocks(draft.blocks);

  return (
    <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="flex flex-col justify-center">
          <div className="max-w-[280px]">
            {draft.title ? (
              <div
                className="text-[56px] leading-[0.92] text-neutral-900"
                style={{ fontFamily: '"Great Vibes", serif' }}
              >
                {draft.title}
              </div>
            ) : null}

            {draft.subtitle ? (
              <div
                className="mt-3 text-[24px] text-neutral-700"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                {draft.subtitle}
              </div>
            ) : null}

            {draft.description ? (
              <div className="mt-5 max-w-[250px] text-[14px] leading-6 text-neutral-600">
                {draft.description}
              </div>
            ) : null}

            {ctaBlock ? (
              <div className="mt-6">
                <a
                  href={ctaBlock.data.buttonUrl || "#"}
                  className="inline-flex rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {ctaBlock.data.buttonText || "Button"}
                </a>
              </div>
            ) : null}

            {countdownBlock ? (
              <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                  {countdownBlock.data.heading || "Countdown"}
                </div>
                <div className="mt-2 text-lg font-semibold text-neutral-900">
                  00 : 00 : 00
                </div>
              </div>
            ) : null}

            {labelBlocks.length > 0 ? (
              <div className="mt-8 space-y-3">
                {labelBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                  >
                    <div style={getLabelStyle(block.data.style)}>
                      {block.data.text || "Label"}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {linksBlock ? (
              <div className="mt-8 space-y-2">
                {linksBlock.data.items.slice(0, 4).map((item) => (
                  <a
                    key={item.id}
                    href={item.url || "#"}
                    className="block text-sm font-medium text-neutral-700"
                  >
                    {item.label || "Link"}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          {showcaseBlock ? (
            <div className="grid grid-cols-3 gap-3">
              {showcaseBlock.data.images.map((img, index) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
                >
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={`Showcase ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      Image {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-500">
              Showcase grid unavailable
            </div>
          )}

          {imageBlocks.length > 0 ? (
            <div className="mt-6 space-y-4">
              {imageBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div className="mb-3 text-sm font-semibold text-neutral-900">
                    Image Block {index + 1}
                  </div>

                  {block.data.image.url ? (
                    <img
                      src={block.data.image.url}
                      alt={block.data.image.alt || ""}
                      className="h-44 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-400">
                      Image placeholder
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}