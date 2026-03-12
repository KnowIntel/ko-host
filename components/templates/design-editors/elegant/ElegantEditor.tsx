"use client";

import { useMemo } from "react";
import ToolboxPanel from "@/components/templates/design-editors/shared/ToolboxPanel";
import type {
  BuilderBlockType,
  BuilderDraft,
  CountdownBlock,
  CtaBlock,
  ImageBlock,
  LabelBlock,
  LinksBlock,
  TextStyle,
} from "@/lib/templates/builder";
import {
  addBlockToDraft,
  addNavigationLink,
  createDefaultCountdownBlock,
  createDefaultHeroButtonBlock,
  createDefaultImageBlock,
  createDefaultLabelBlock,
  createDefaultLinksBlock,
  getCountdownBlock,
  getHeroButtonBlock,
  getImageBlocks,
  getLinksBlock,
  readFileAsDataUrl,
  removeBlockFromDraft,
  removeNavigationLink,
  updateCountdownField,
  updateCtaBlockField,
  updateImageBlockAlt,
  updateImageBlockUrl,
  updateLabelBlockStyle,
  updateLabelBlockText,
  updateLinkItem,
  updateLinksHeading,
} from "@/components/templates/design-editors/shared/editorUtils";

const CANVAS_WIDTH = 1400;

type Props = {
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
};

type DraftWithVisuals = BuilderDraft & {
  backgroundImageUrl?: string | null;
  pageColor?: string | null;
  pageBackground?: string | null;
};

/* ----------------------------- */
/* Draft helpers                 */
/* ----------------------------- */

function coerceDraft(draft: BuilderDraft): DraftWithVisuals {
  return draft as DraftWithVisuals;
}

function getBackgroundImageUrl(draft: BuilderDraft) {
  return (
    coerceDraft(draft).pageBackground ||
    coerceDraft(draft).backgroundImageUrl ||
    ""
  );
}

function getPageColor(draft: BuilderDraft) {
  return coerceDraft(draft).pageColor || "#f7f2eb";
}

/* ----------------------------- */
/* Styling helpers               */
/* ----------------------------- */

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

function panelCardClass() {
  return "rounded-xl border border-white/10 bg-black/20 p-4";
}

function panelTitleClass() {
  return "text-xs font-semibold uppercase tracking-[0.16em] text-white/60";
}

function panelFieldClass() {
  return "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-white";
}

function panelButtonClass() {
  return "rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10";
}

export default function ElegantEditor({ draft, setDraft }: Props) {
  /* ----------------------------- */
  /* Derived blocks                */
  /* ----------------------------- */

  const ctaBlock = useMemo(
    () => getHeroButtonBlock(draft.blocks) as CtaBlock | null,
    [draft.blocks],
  );

  const countdownBlock = useMemo(
    () => getCountdownBlock(draft.blocks) as CountdownBlock | null,
    [draft.blocks],
  );

  const linksBlock = useMemo(
    () => getLinksBlock(draft.blocks) as LinksBlock | null,
    [draft.blocks],
  );

  const imageBlocks = useMemo(
    () => getImageBlocks(draft.blocks) as ImageBlock[],
    [draft.blocks],
  );

  const labelBlocks = useMemo(
    () =>
      draft.blocks.filter(
        (block): block is LabelBlock => block.type === "label",
      ),
    [draft.blocks],
  );

  const selectedLabel = labelBlocks[0];

  const selectedStyle: TextStyle = {
    fontFamily: selectedLabel?.data.style?.fontFamily ?? "Cormorant Garamond",
    fontSize: selectedLabel?.data.style?.fontSize ?? 18,
    bold: selectedLabel?.data.style?.bold ?? false,
    italic: selectedLabel?.data.style?.italic ?? false,
    underline: selectedLabel?.data.style?.underline ?? false,
    align: selectedLabel?.data.style?.align ?? "left",
  };

  const backgroundImageUrl = getBackgroundImageUrl(draft);
  const pageColor = getPageColor(draft);

  /* ----------------------------- */
  /* Editing actions               */
  /* ----------------------------- */

  function applyStylePatch(stylePatch: Partial<TextStyle>) {
    if (!selectedLabel) return;

    setDraft((prev) => ({
      ...prev,
      blocks: updateLabelBlockStyle(prev.blocks, selectedLabel.id, stylePatch),
    }));
  }

  function addBlock(type: BuilderBlockType) {
    let block;

    if (type === "cta") {
      block = createDefaultHeroButtonBlock("View Invitation");
    } else if (type === "countdown") {
      block = createDefaultCountdownBlock();
    } else if (type === "links") {
      block = createDefaultLinksBlock();
    } else if (type === "label") {
      block = createDefaultLabelBlock("New Label", {
        fontFamily: "Cormorant Garamond",
        fontSize: 18,
        bold: false,
        italic: false,
        underline: false,
        align: "left",
      });
    } else if (type === "image") {
      block = createDefaultImageBlock();
    } else {
      return;
    }

    setDraft((prev) => ({
      ...prev,
      blocks: addBlockToDraft(prev.blocks, block),
    }));
  }

  function bringBlockToFront(blockId: string) {
    setDraft((prev) => {
      const target = prev.blocks.find((block) => block.id === blockId);
      if (!target) return prev;

      return {
        ...prev,
        blocks: [
          ...prev.blocks.filter((block) => block.id !== blockId),
          target,
        ],
      };
    });
  }

  async function handleImageUpload(blockId: string, file: File | null) {
    if (!file) return;
    const url = await readFileAsDataUrl(file);

    setDraft((prev) => ({
      ...prev,
      blocks: updateImageBlockUrl(prev.blocks, blockId, url),
    }));
  }

  async function handleBackgroundImageUpload(file: File | null) {
    if (!file) return;
    const url = await readFileAsDataUrl(file);

    setDraft((prev) => ({
      ...(prev as DraftWithVisuals),
      pageBackground: url,
      backgroundImageUrl: url,
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
      {/* Left toolbox controls text styling and block insertion. */}
      <ToolboxPanel
        selectedFontFamily={selectedStyle.fontFamily ?? "inherit"}
        selectedFontSize={selectedStyle.fontSize ?? 16}
        selectedBold={selectedStyle.bold ?? false}
        selectedItalic={selectedStyle.italic ?? false}
        selectedUnderline={selectedStyle.underline ?? false}
        onFontFamilyChange={(value) => applyStylePatch({ fontFamily: value })}
        onFontSizeChange={(value) => applyStylePatch({ fontSize: value })}
        onBoldChange={(value) => applyStylePatch({ bold: value })}
        onItalicChange={(value) => applyStylePatch({ italic: value })}
        onUnderlineChange={(value) => applyStylePatch({ underline: value })}
        onAlignChange={(value) => applyStylePatch({ align: value })}
        onAddBlock={addBlock}
      />

      {/* Center canvas area uses only the native horizontal scrollbar. */}
      <div className="min-w-0">
        <div className="rounded-[32px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-6 shadow-sm">
          <div className="w-full overflow-x-auto overflow-y-visible pb-5">
            <div
              style={{
                width: `${CANVAS_WIDTH}px`,
                minWidth: `${CANVAS_WIDTH}px`,
              }}
            >
              <div className="flex min-h-[560px] flex-col px-6 py-8">
                <div
                  className="relative w-full overflow-hidden rounded-[28px] px-6 py-8"
                  style={{
                    minHeight: "560px",
                    backgroundColor: pageColor,
                    backgroundImage: backgroundImageUrl
                      ? `linear-gradient(rgba(255,255,255,0.18), rgba(255,255,255,0.18)), url(${backgroundImageUrl})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="relative z-10 max-w-[520px]">
                    {draft.title ? (
                      <div
                        className="text-[46px] leading-[0.96] text-stone-900"
                        style={{
                          fontFamily:
                            '"Cormorant Garamond", "Times New Roman", serif',
                        }}
                      >
                        {draft.title}
                      </div>
                    ) : null}

                    {draft.subtitle ? (
                      <div
                        className="mt-3 text-[28px] leading-none text-stone-700"
                        style={{
                          fontFamily:
                            '"Great Vibes", "Brush Script MT", cursive',
                        }}
                      >
                        {draft.subtitle}
                      </div>
                    ) : null}

                    {draft.description ? (
                      <div
                        className="mt-6 max-w-[420px] text-[15px] leading-7 text-stone-800"
                        style={{
                          fontFamily:
                            '"Cormorant Garamond", "Times New Roman", serif',
                          fontWeight: 700,
                        }}
                      >
                        {draft.description}
                      </div>
                    ) : null}

                    {ctaBlock ? (
                      <div className="mt-7">
                        <button
                          type="button"
                          className="rounded-full border border-stone-400 bg-white/70 px-6 py-2.5 text-sm font-medium text-stone-800 backdrop-blur-sm"
                        >
                          {ctaBlock.data.buttonText || "Button"}
                        </button>
                      </div>
                    ) : null}

                    {countdownBlock ? (
                      <div className="mt-7 rounded-2xl border border-stone-200 bg-white/70 px-5 py-4 backdrop-blur-sm">
                        <div className="text-xs uppercase tracking-[0.22em] text-stone-500">
                          {countdownBlock.data.heading || "Countdown"}
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-stone-800">
                          00 : 00 : 00
                        </div>
                      </div>
                    ) : null}

                    {labelBlocks.length > 0 ? (
                      <div className="mt-10 space-y-4">
                        {labelBlocks.map((block) => (
                          <div
                            key={block.id}
                            className="rounded-2xl border border-stone-200/80 bg-white/70 px-4 py-3 backdrop-blur-sm"
                          >
                            <div
                              className="text-stone-800"
                              style={getLabelStyle(block.data.style)}
                            >
                              {block.data.text || "Elegant label"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {linksBlock && linksBlock.data.items.length > 0 ? (
                      <div className="mt-8 rounded-2xl border border-stone-200 bg-white/70 px-5 py-4 backdrop-blur-sm">
                        {linksBlock.data.heading ? (
                          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-stone-500">
                            {linksBlock.data.heading}
                          </div>
                        ) : null}

                        <div className="space-y-2">
                          {linksBlock.data.items.slice(0, 4).map((item) => (
                            <div
                              key={item.id}
                              className="text-sm font-medium text-stone-800"
                            >
                              {item.label || "Link"}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {imageBlocks.length > 0 ? (
                      <div className="mt-8 space-y-4">
                        {imageBlocks.map((block, index) => (
                          <div
                            key={block.id}
                            className="rounded-2xl border border-stone-200 bg-white/70 p-4 backdrop-blur-sm"
                          >
                            <div className="mb-3 text-sm font-semibold text-stone-900">
                              Image {index + 1}
                            </div>

                            {block.data.image.url ? (
                              <img
                                src={block.data.image.url}
                                alt={block.data.image.alt || ""}
                                className="h-44 w-full rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-stone-300 text-sm text-stone-500">
                                Image placeholder
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right-side content controls for editing text, images, links, and blocks. */}
      <div className="space-y-4 rounded-[24px] border border-white/10 bg-[#111317] p-5 shadow-sm">
        <div className="text-sm font-semibold text-white">
          Elegant Content
        </div>

        <div className={panelCardClass()}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className={panelTitleClass()}>Background Image</div>

            {backgroundImageUrl ? (
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...(prev as DraftWithVisuals),
                    pageBackground: "",
                    backgroundImageUrl: "",
                  }))
                }
                className={panelButtonClass()}
              >
                Remove
              </button>
            ) : null}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              void handleBackgroundImageUpload(e.target.files?.[0] || null)
            }
            className="block w-full text-sm text-white/70"
          />

          {backgroundImageUrl ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              <img
                src={backgroundImageUrl}
                alt="Background preview"
                className="h-32 w-full object-cover"
              />
            </div>
          ) : (
            <div className="mt-3 flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/45">
              No background image selected
            </div>
          )}
        </div>

        <div className={panelCardClass()}>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Page Color
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={pageColor}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...(prev as DraftWithVisuals),
                  pageColor: e.target.value,
                }))
              }
              className="h-11 w-16 cursor-pointer rounded border border-white/10 bg-transparent"
            />
            <input
              value={pageColor}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...(prev as DraftWithVisuals),
                  pageColor: e.target.value,
                }))
              }
              className={panelFieldClass()}
            />
          </div>
        </div>

        {draft.title ? (
          <div className={panelCardClass()}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Title
            </div>
            <input
              value={draft.title || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {draft.subtitle ? (
          <div className={panelCardClass()}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Subtitle
            </div>
            <input
              value={draft.subtitle || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {draft.subtext ? (
          <div className={panelCardClass()}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Tagline
            </div>
            <input
              value={draft.subtext || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, subtext: e.target.value }))
              }
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {draft.description ? (
          <div className={panelCardClass()}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Description
            </div>
            <textarea
              value={draft.description || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={5}
              className={panelFieldClass()}
            />
          </div>
        ) : null}

        {ctaBlock ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Button</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringBlockToFront(ctaBlock.id)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      blocks: removeBlockFromDraft(prev.blocks, ctaBlock.id),
                    }))
                  }
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={ctaBlock.data.buttonText || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateCtaBlockField(
                    prev.blocks,
                    ctaBlock.id,
                    "buttonText",
                    e.target.value,
                  ),
                }))
              }
              className={panelFieldClass()}
            />
            <input
              value={ctaBlock.data.buttonUrl || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateCtaBlockField(
                    prev.blocks,
                    ctaBlock.id,
                    "buttonUrl",
                    e.target.value,
                  ),
                }))
              }
              className={`mt-3 ${panelFieldClass()}`}
              placeholder="https://"
            />
          </div>
        ) : null}

        {countdownBlock ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Countdown</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringBlockToFront(countdownBlock.id)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      blocks: removeBlockFromDraft(
                        prev.blocks,
                        countdownBlock.id,
                      ),
                    }))
                  }
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={countdownBlock.data.heading || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateCountdownField(
                    prev.blocks,
                    countdownBlock.id,
                    "heading",
                    e.target.value,
                  ),
                }))
              }
              className={panelFieldClass()}
            />

            <input
              type="datetime-local"
              value={countdownBlock.data.targetIso || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateCountdownField(
                    prev.blocks,
                    countdownBlock.id,
                    "targetIso",
                    e.target.value,
                  ),
                }))
              }
              className={`mt-3 ${panelFieldClass()}`}
            />
          </div>
        ) : null}

        {imageBlocks.map((block, index) => (
          <div key={block.id} className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Image {index + 1}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringBlockToFront(block.id)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      blocks: removeBlockFromDraft(prev.blocks, block.id),
                    }))
                  }
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            {block.data.image.url ? (
              <img
                src={block.data.image.url}
                alt={block.data.image.alt || ""}
                className="h-44 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/45">
                Image placeholder
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                void handleImageUpload(block.id, e.target.files?.[0] || null)
              }
              className="mt-3 w-full text-sm text-white/70"
            />

            <input
              value={block.data.image.alt || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateImageBlockAlt(
                    prev.blocks,
                    block.id,
                    e.target.value,
                  ),
                }))
              }
              className={`mt-3 ${panelFieldClass()}`}
            />
          </div>
        ))}

        {labelBlocks.length > 0 ? (
          <div className="space-y-4">
            {labelBlocks.map((block, index) => (
              <div key={block.id} className={panelCardClass()}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className={panelTitleClass()}>Label {index + 1}</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bringBlockToFront(block.id)}
                      className={panelButtonClass()}
                    >
                      Bring to front
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          blocks: removeBlockFromDraft(prev.blocks, block.id),
                        }))
                      }
                      className={panelButtonClass()}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <textarea
                  value={block.data.text}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      blocks: updateLabelBlockText(
                        prev.blocks,
                        block.id,
                        e.target.value,
                      ),
                    }))
                  }
                  rows={3}
                  className={panelFieldClass()}
                />
              </div>
            ))}
          </div>
        ) : null}

        {linksBlock ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Navigation Links</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringBlockToFront(linksBlock.id)}
                  className={panelButtonClass()}
                >
                  Bring to front
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      blocks: removeBlockFromDraft(prev.blocks, linksBlock.id),
                    }))
                  }
                  className={panelButtonClass()}
                >
                  Remove
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      blocks: addNavigationLink(prev.blocks),
                    }))
                  }
                  className={panelButtonClass()}
                >
                  Add Link
                </button>
              </div>
            </div>

            <input
              value={linksBlock.data.heading || ""}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  blocks: updateLinksHeading(
                    prev.blocks,
                    linksBlock.id,
                    e.target.value,
                  ),
                }))
              }
              className={`mb-3 ${panelFieldClass()}`}
            />

            {linksBlock.data.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 p-3"
              >
                <div>
                  <input
                    value={item.label || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateLinkItem(
                          prev.blocks,
                          item.id,
                          "label",
                          e.target.value,
                        ),
                      }))
                    }
                    className={panelFieldClass()}
                  />
                </div>

                <div className="mt-3">
                  <input
                    value={item.url || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        blocks: updateLinkItem(
                          prev.blocks,
                          item.id,
                          "url",
                          e.target.value,
                        ),
                      }))
                    }
                    className={panelFieldClass()}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      blocks: removeNavigationLink(prev.blocks, item.id),
                    }))
                  }
                  className={`mt-3 ${panelButtonClass()}`}
                >
                  Remove Link
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}