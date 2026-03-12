"use client";

import { useEffect, useMemo, useRef } from "react";
import ToolboxPanel from "@/components/templates/design-editors/shared/ToolboxPanel";

import type {
  BuilderBlockType,
  BuilderDraft,
  CountdownBlock,
  CtaBlock,
  ImageBlock,
  LabelBlock,
  LinksBlock,
  ShowcaseBlock,
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
  getLinksBlock,
  getShowcaseBlock,
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
  templateKey: string;
  designKey?: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
  submitLabel?: string;
};

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

export default function ShowcaseEditor({ draft, setDraft }: Props) {
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const stickyScrollRef = useRef<HTMLDivElement | null>(null);
  const isSyncingRef = useRef<"main" | "sticky" | null>(null);

  useEffect(() => {
    const main = mainScrollRef.current;
    const sticky = stickyScrollRef.current;

    if (!main || !sticky) return;

    const syncFromMain = () => {
      if (isSyncingRef.current === "sticky") return;
      isSyncingRef.current = "main";
      sticky.scrollLeft = main.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingRef.current = null;
      });
    };

    const syncFromSticky = () => {
      if (isSyncingRef.current === "main") return;
      isSyncingRef.current = "sticky";
      main.scrollLeft = sticky.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingRef.current = null;
      });
    };

    main.addEventListener("scroll", syncFromMain, { passive: true });
    sticky.addEventListener("scroll", syncFromSticky, { passive: true });

    sticky.scrollLeft = main.scrollLeft;

    return () => {
      main.removeEventListener("scroll", syncFromMain);
      sticky.removeEventListener("scroll", syncFromSticky);
    };
  }, []);

  const showcaseBlock = useMemo(
    () => getShowcaseBlock(draft.blocks) as ShowcaseBlock | null,
    [draft.blocks],
  );

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

  const labelBlocks = useMemo(
    () =>
      draft.blocks.filter(
        (block): block is LabelBlock => block.type === "label",
      ),
    [draft.blocks],
  );

  const imageBlocks = useMemo(
    () =>
      draft.blocks.filter(
        (block): block is ImageBlock => block.type === "image",
      ),
    [draft.blocks],
  );

  const selectedLabel = labelBlocks[0];

  const selectedStyle: TextStyle = {
    fontFamily: selectedLabel?.data.style?.fontFamily ?? "inherit",
    fontSize: selectedLabel?.data.style?.fontSize ?? 16,
    bold: selectedLabel?.data.style?.bold ?? false,
    italic: selectedLabel?.data.style?.italic ?? false,
    underline: selectedLabel?.data.style?.underline ?? false,
    align: selectedLabel?.data.style?.align ?? "left",
  };

  function applyStylePatch(stylePatch: Partial<TextStyle>) {
    if (!selectedLabel) return;

    setDraft((prev) => ({
      ...prev,
      blocks: updateLabelBlockStyle(prev.blocks, selectedLabel.id, stylePatch),
    }));
  }

  function addBlock(type: BuilderBlockType) {
    let block;

    if (type === "cta") block = createDefaultHeroButtonBlock("View Gallery");
    else if (type === "countdown") block = createDefaultCountdownBlock();
    else if (type === "links") block = createDefaultLinksBlock();
    else if (type === "label") block = createDefaultLabelBlock("New Label");
    else if (type === "image") block = createDefaultImageBlock();
    else return;

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
        blocks: [...prev.blocks.filter((block) => block.id !== blockId), target],
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

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
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

      <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm">
        <div
          ref={mainScrollRef}
          className="w-full overflow-x-auto overflow-y-visible pb-5"
        >
          <div
            className="min-w-0"
            style={{
              width: `${CANVAS_WIDTH}px`,
              minWidth: `${CANVAS_WIDTH}px`,
            }}
          >
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
                      <button
                        type="button"
                        className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
                      >
                        {ctaBlock.data.buttonText || "Button"}
                      </button>
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
                        <div
                          key={item.id}
                          className="text-sm font-medium text-neutral-700"
                        >
                          {item.label || "Link"}
                        </div>
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

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            void handleImageUpload(
                              block.id,
                              e.target.files?.[0] || null,
                            )
                          }
                          className="mt-3 w-full text-sm"
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
                          placeholder="Alt text"
                          className="mt-3 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              blocks: removeBlockFromDraft(prev.blocks, block.id),
                            }))
                          }
                          className="mt-3 text-xs text-red-500"
                        >
                          Remove Image Block
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-3 z-10 mt-2">
          <div className="rounded-full border border-neutral-200 bg-white px-3 py-2 shadow-sm">
            <div
              ref={stickyScrollRef}
              className="overflow-x-auto overflow-y-hidden"
            >
              <div
                style={{
                  width: `${CANVAS_WIDTH}px`,
                  height: "1px",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-[24px] border border-white/10 bg-[#111317] p-5 shadow-sm">
        <div className="text-sm font-semibold text-white">
          Showcase Content
        </div>

        <div className={panelCardClass()}>
          <div className={panelTitleClass()}>Title</div>
          <input
            value={draft.title || ""}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, title: e.target.value }))
            }
            className={`mt-3 ${panelFieldClass()}`}
          />
        </div>

        <div className={panelCardClass()}>
          <div className={panelTitleClass()}>Subtitle</div>
          <input
            value={draft.subtitle || ""}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, subtitle: e.target.value }))
            }
            className={`mt-3 ${panelFieldClass()}`}
          />
        </div>

        <div className={panelCardClass()}>
          <div className={panelTitleClass()}>Description</div>
          <textarea
            value={draft.description || ""}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={4}
            className={`mt-3 ${panelFieldClass()}`}
          />
        </div>

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
                      blocks: removeBlockFromDraft(prev.blocks, countdownBlock.id),
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
                  rows={3}
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

            <div className="space-y-3">
              {linksBlock.data.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 p-3"
                >
                  <input
                    value={item.label}
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
                    placeholder="Label"
                    className={panelFieldClass()}
                  />

                  <input
                    value={item.url}
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
                    placeholder="URL"
                    className={`mt-3 ${panelFieldClass()}`}
                  />

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
          </div>
        ) : null}

        {imageBlocks.length > 0 ? (
          <div className="space-y-4">
            {imageBlocks.map((block, index) => (
              <div
                key={block.id}
                className={panelCardClass()}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className={panelTitleClass()}>
                    Image Block {index + 1}
                  </div>
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
                    className="h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/45">
                    Image placeholder
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    void handleImageUpload(
                      block.id,
                      e.target.files?.[0] || null,
                    )
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
                  placeholder="Alt text"
                  className={`mt-3 ${panelFieldClass()}`}
                />
              </div>
            ))}
          </div>
        ) : null}

        {showcaseBlock ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
            Showcase block detected
          </div>
        ) : null}
      </div>
    </div>
  );
}