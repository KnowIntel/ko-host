"use client";

import { useEffect, useMemo, useRef } from "react";
import ToolboxPanel from "@/components/templates/design-editors/shared/ToolboxPanel";
import type {
  BuilderBlockType,
  BuilderDraft,
  CountdownBlock,
  CtaBlock,
  FestiveBackgroundBlock,
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
  getFestiveBackgroundBlock,
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
  templateKey: string;
  designKey?: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
  submitLabel?: string;
};

type DraftWithVisuals = BuilderDraft & {
  backgroundImageUrl?: string | null;
  pageBackground?: string | null;
  pageColor?: string | null;
};

function coerceDraft(draft: BuilderDraft): DraftWithVisuals {
  return draft as DraftWithVisuals;
}

function getBackgroundImageUrl(draft: BuilderDraft) {
  return coerceDraft(draft).pageBackground || coerceDraft(draft).backgroundImageUrl || "";
}

function getPageColor(draft: BuilderDraft) {
  return coerceDraft(draft).pageColor || "#f8f1ea";
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

function panelShellClass() {
  return "space-y-4 rounded-[24px] border border-white/10 bg-[#111317] p-5 shadow-sm";
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

export default function FestiveEditor({ draft, setDraft }: Props) {
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

  const festiveBackground = useMemo(
    () =>
      getFestiveBackgroundBlock(draft.blocks) as FestiveBackgroundBlock | null,
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
    () => getImageBlocks(draft.blocks) as ImageBlock[],
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

  const backgroundImageUrl = getBackgroundImageUrl(draft);
  const pageColor = getPageColor(draft);

  function applyStylePatch(stylePatch: Partial<TextStyle>) {
    if (!selectedLabel) return;

    setDraft((prev) => ({
      ...prev,
      blocks: updateLabelBlockStyle(prev.blocks, selectedLabel.id, stylePatch),
    }));
  }

  function addBlock(type: BuilderBlockType) {
    let block;

    if (type === "cta") block = createDefaultHeroButtonBlock("Shop Now");
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

      <div className="min-w-0">
        <div className="rounded-[32px] border border-neutral-800 bg-[linear-gradient(180deg,#0f1115_0%,#171a21_100%)] p-6 shadow-sm">
          <div
            ref={mainScrollRef}
            className="w-full overflow-x-hidden overflow-y-visible pb-5"
          >
            <div
              style={{
                width: `${CANVAS_WIDTH}px`,
                minWidth: `${CANVAS_WIDTH}px`,
              }}
            >
              <div className="relative overflow-hidden rounded-[28px] border border-neutral-200">
                <div
                  className="relative h-[640px] w-full"
                  style={{
                    backgroundColor: pageColor,
                    backgroundImage: backgroundImageUrl
                      ? `url(${backgroundImageUrl})`
                      : festiveBackground?.data.image.url
                        ? `url(${festiveBackground.data.image.url})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {!backgroundImageUrl && !festiveBackground?.data.image.url ? (
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8f1ea_0%,#f3e5d8_100%)]" />
                  ) : null}

                  <div className="absolute inset-0 bg-black/10" />

                  <div className="absolute inset-0 flex items-center justify-center px-8">
                    <div className="max-w-[720px] text-center">
                      {draft.title ? (
                        <div
                          className="text-[52px] leading-[0.95] text-black"
                          style={{ fontFamily: '"Great Vibes", serif' }}
                        >
                          {draft.title}
                        </div>
                      ) : null}

                      {draft.subtitle ? (
                        <div
                          className="mt-4 text-[24px] text-red-700"
                          style={{ fontFamily: '"Cormorant Garamond", serif' }}
                        >
                          {draft.subtitle}
                        </div>
                      ) : null}

                      {draft.description ? (
                        <div className="mx-auto mt-5 max-w-[520px] text-[16px] leading-7 text-black">
                          {draft.description}
                        </div>
                      ) : null}

                      {ctaBlock ? (
                        <div className="mt-6">
                          <button
                            type="button"
                            className="rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white"
                          >
                            {ctaBlock.data.buttonText || "Button"}
                          </button>
                        </div>
                      ) : null}

                      {countdownBlock ? (
                        <div className="mt-8 space-y-3">
                          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-black">
                            {countdownBlock.data.heading || "Countdown"}
                          </div>
                          <div className="text-3xl font-bold tracking-[0.2em] text-black">
                            00 : 00 : 00
                          </div>
                        </div>
                      ) : null}

                      {labelBlocks.length > 0 ? (
                        <div className="mx-auto mt-8 max-w-[520px] space-y-3">
                          {labelBlocks.map((block) => (
                            <div
                              key={block.id}
                              className="rounded-xl bg-white/75 px-4 py-3"
                            >
                              <div style={getLabelStyle(block.data.style)}>
                                {block.data.text || "Label"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {linksBlock && linksBlock.data.items.length > 0 ? (
                        <div className="mx-auto mt-8 max-w-[520px] rounded-2xl bg-white/75 px-5 py-4">
                          {linksBlock.data.heading ? (
                            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-700">
                              {linksBlock.data.heading}
                            </div>
                          ) : null}

                          <div className="space-y-2">
                            {linksBlock.data.items.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                className="text-sm font-medium text-neutral-800"
                              >
                                {item.label || "Link"}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-3 z-10 mt-2">
            <div className="rounded-full border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md">
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
      </div>

      <div className={panelShellClass()}>
        <div className="text-sm font-semibold text-white">Festive Content</div>

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
              placeholder="#f8f1ea"
            />
          </div>
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
            rows={4}
            value={draft.description || ""}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
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

        {festiveBackground ? (
          <div className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Preset Background Block</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bringBlockToFront(festiveBackground.id)}
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
                        festiveBackground.id,
                      ),
                    }))
                  }
                  className={panelButtonClass()}
                >
                  Remove
                </button>
              </div>
            </div>

            {festiveBackground.data.image.url ? (
              <img
                src={festiveBackground.data.image.url}
                alt=""
                className="h-40 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/45">
                Background placeholder
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                void handleImageUpload(
                  festiveBackground.id,
                  e.target.files?.[0] || null,
                )
              }
              className="mt-3 w-full text-sm text-white/70"
            />
          </div>
        ) : null}

        {imageBlocks.map((block, index) => (
          <div key={block.id} className={panelCardClass()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className={panelTitleClass()}>Image Block {index + 1}</div>
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
              placeholder="Alt text"
              className={`mt-3 ${panelFieldClass()}`}
            />
          </div>
        ))}

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

            <div className="mb-3">
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
                className={panelFieldClass()}
              />
            </div>

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
      </div>
    </div>
  );
}