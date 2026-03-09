"use client";

import { useMemo, useRef } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";
import SidebarToolButton from "@/components/templates/design-editors/shared/SidebarToolButton";
import EmptyImagePlaceholder from "@/components/templates/design-editors/shared/EmptyImagePlaceholder";
import {
  createDefaultHeroButtonBlock,
  createDefaultLinksBlock,
  getHeroButtonBlock,
  getLinksBlock,
  getShowcaseBlock,
  readFileAsDataUrl,
} from "@/components/templates/design-editors/shared/editorUtils";

type Props = {
  templateKey: string;
  designKey: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
  submitLabel?: string;
};

export default function ShowcaseEditor({
  draft,
  setDraft,
  submitLabel = "Continue",
}: Props) {
  const showcaseFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showcaseBlock = useMemo(() => getShowcaseBlock(draft.blocks), [draft.blocks]);
  const linksBlock = useMemo(() => getLinksBlock(draft.blocks), [draft.blocks]);
  const heroButtonBlock = useMemo(() => getHeroButtonBlock(draft.blocks), [draft.blocks]);

  function ensureLinksBlock() {
    setDraft((prev) => {
      if (getLinksBlock(prev.blocks)) return prev;
      return {
        ...prev,
        blocks: [...prev.blocks, createDefaultLinksBlock()],
      };
    });
  }

  function ensureHeroButtonBlock() {
    setDraft((prev) => {
      if (getHeroButtonBlock(prev.blocks)) return prev;
      return {
        ...prev,
        blocks: [...prev.blocks, createDefaultHeroButtonBlock("View Gallery")],
      };
    });
  }

  function updateShowcaseImage(blockId: string, imageId: string, url: string) {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.id !== blockId || block.type !== "showcase") return block;
        return {
          ...block,
          data: {
            ...block.data,
            images: block.data.images.map((img) =>
              img.id === imageId ? { ...img, url } : img,
            ),
          },
        };
      }),
    }));
  }

  async function handleBrowseShowcaseImage(
    blockId: string,
    imageId: string,
    fileList: FileList | null,
  ) {
    if (!fileList?.length) return;
    const file = fileList[0];
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    try {
      const url = await readFileAsDataUrl(file);
      updateShowcaseImage(blockId, imageId, url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to read image.";
      alert(message);
    } finally {
      const key = `${blockId}:${imageId}`;
      const input = showcaseFileInputRefs.current[key];
      if (input) input.value = "";
    }
  }

  function updateLinksItem(itemId: string, field: "label" | "url", value: string) {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.type !== "links") return block;
        return {
          ...block,
          data: {
            ...block.data,
            items: block.data.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item,
            ),
          },
        };
      }),
    }));
  }

  function addLinkItem() {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.type !== "links") return block;
        return {
          ...block,
          data: {
            ...block.data,
            items: [
              ...block.data.items,
              { id: `link_${Math.random().toString(36).slice(2, 10)}`, label: "New Link", url: "#" },
            ],
          },
        };
      }),
    }));
  }

  function removeLinkItem(itemId: string) {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.type !== "links") return block;
        return {
          ...block,
          data: {
            ...block.data,
            items: block.data.items.filter((item) => item.id !== itemId),
          },
        };
      }),
    }));
  }

  function updateHeroButtonField(
    field: "heading" | "buttonText" | "buttonUrl",
    value: string,
  ) {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.type !== "cta") return block;
        return {
          ...block,
          data: {
            ...block.data,
            [field]: value,
          },
        };
      }),
    }));
  }

  const showcaseImages = showcaseBlock?.data.images ?? [];
  const featuredImages = showcaseImages.slice(0, 2);
  const gridImages = showcaseImages.slice(2);
  const navItems = linksBlock?.data.items ?? [];
  const heroDescription =
    heroButtonBlock?.data.heading ||
    "Explore a collection of unique paintings created with passion.";
  const heroButtonText = heroButtonBlock?.data.buttonText || "View Gallery";

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-neutral-200 bg-white p-4 shadow-sm xl:sticky xl:top-6 xl:h-[fit-content]">
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Left Toolbox
          </div>
          <h2 className="mt-2 text-lg font-semibold text-neutral-950">
            Showcase Controls
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Edit the preset layout content that appears on the page canvas.
          </p>
        </div>

        <div className="space-y-3">
          <SidebarToolButton
            label="Showcase Images"
            icon="🖼️"
            onClick={() => {
              document
                .getElementById("showcase-images-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          <SidebarToolButton
            label="Navigation Links"
            icon="🔗"
            onClick={() => {
              ensureLinksBlock();
              document
                .getElementById("showcase-links-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          <SidebarToolButton
            label="Hero Button"
            icon="▣"
            onClick={() => {
              ensureHeroButtonBlock();
              document
                .getElementById("showcase-button-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>
      </aside>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-900">Title</label>
              <input
                value={draft.title}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                placeholder="Beautiful Art"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-900">
                Subtitle
              </label>
              <input
                value={draft.subtitle ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                placeholder="by a Freelancer"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-neutral-200 bg-[#f5f1ee] p-4 shadow-sm sm:p-6">
          <div className="overflow-hidden rounded-[30px] bg-[#f4f0ed]">
            <div className="min-h-[1200px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
              <header className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-[20px] font-medium text-[#5b4d50]">
                  Your Logo
                </div>

                <div className="flex flex-wrap items-center gap-5 text-[15px] text-[#4e4749]">
                  {navItems.length ? (
                    navItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.url || "#"}
                        className="transition hover:opacity-70"
                      >
                        {item.label || "Link"}
                      </a>
                    ))
                  ) : (
                    <>
                      <span>Home</span>
                      <span>Gallery</span>
                      <span>About</span>
                      <span>Contact</span>
                    </>
                  )}

                  <span className="text-neutral-300">|</span>

                  <button
                    type="button"
                    className="rounded-xl bg-[#decec4] px-5 py-2.5 text-[15px] font-medium text-[#4e4749]"
                  >
                    Get in Touch
                  </button>
                </div>
              </header>

              <section className="mb-10 grid gap-8 lg:grid-cols-[1fr_430px] lg:items-start">
                <div className="max-w-[520px] pt-8">
                  <h1
                    className="text-[64px] leading-[0.96] text-[#5b4d50] sm:text-[78px]"
                    style={{ fontFamily: "var(--font-great-vibes)" }}
                  >
                    {draft.title || "Beautiful Art"}
                  </h1>

                  <div
                    className="mt-5 text-[42px] leading-[1.02] text-[#5b4d50] sm:text-[54px]"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {draft.subtitle || "by a Freelancer"}
                  </div>

                  <p className="mt-7 max-w-[420px] text-[18px] leading-[1.5] text-[#61595b]">
                    {heroDescription}
                  </p>

                  <div className="mt-8">
                    <a
                      href={heroButtonBlock?.data.buttonUrl || "#"}
                      className="inline-flex items-center justify-center rounded-xl bg-[#decec4] px-8 py-3.5 text-[16px] font-medium text-[#4e4749] transition hover:opacity-90"
                    >
                      {heroButtonText}
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {featuredImages.map((img, index) => {
                    const inputKey = `${showcaseBlock?.id}:${img.id}`;
                    return (
                      <div
                        key={img.id}
                        className={[
                          "relative overflow-hidden bg-white shadow-[0_6px_18px_rgba(0,0,0,0.10)]",
                          index === 0 ? "mt-8" : "mt-0",
                          "aspect-[4/6]",
                        ].join(" ")}
                      >
                        {img.url ? (
                          <img
                            src={img.url}
                            alt={`Featured image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <EmptyImagePlaceholder
                            title="Featured image"
                            recommendedSize="recommended: 800x1200"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            showcaseFileInputRefs.current[inputKey]?.click()
                          }
                          className="absolute bottom-3 left-3 z-10"
                          aria-label={`Edit featured image ${index + 1}`}
                        >
                          <img
                            src="/icons/edit_icon.webp"
                            alt="Edit"
                            className="h-8 w-8 rounded-full bg-white/90 p-1 shadow-sm"
                          />
                        </button>

                        <input
                          ref={(node) => {
                            showcaseFileInputRefs.current[inputKey] = node;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            showcaseBlock
                              ? void handleBrowseShowcaseImage(
                                  showcaseBlock.id,
                                  img.id,
                                  e.target.files,
                                )
                              : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="showcase-images-panel" className="mb-16">
                <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                  {gridImages.map((img) => {
                    const inputKey = `${showcaseBlock?.id}:${img.id}`;
                    return (
                      <div
                        key={img.id}
                        className="relative aspect-[4/5] overflow-hidden bg-white shadow-[0_6px_18px_rgba(0,0,0,0.10)]"
                      >
                        {img.url ? (
                          <img
                            src={img.url}
                            alt="Showcase image"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <EmptyImagePlaceholder
                            title="Empty slot"
                            recommendedSize="recommended: 800x1000"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            showcaseFileInputRefs.current[inputKey]?.click()
                          }
                          className="absolute bottom-3 left-3 z-10"
                          aria-label="Edit showcase image"
                        >
                          <img
                            src="/icons/edit_icon.webp"
                            alt="Edit"
                            className="h-8 w-8 rounded-full bg-white/90 p-1 shadow-sm"
                          />
                        </button>

                        <input
                          ref={(node) => {
                            showcaseFileInputRefs.current[inputKey] = node;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            showcaseBlock
                              ? void handleBrowseShowcaseImage(
                                  showcaseBlock.id,
                                  img.id,
                                  e.target.files,
                                )
                              : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mt-10 text-center">
                <h2
                  className="text-[38px] text-[#4f4749] sm:text-[54px]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Interested in a custom painting?
                </h2>

                <div className="mt-6">
                  <button
                    type="button"
                    className="rounded-xl bg-[#decec4] px-8 py-3.5 text-[16px] font-medium text-[#4e4749]"
                  >
                    Get in Touch
                  </button>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div
            id="showcase-links-panel"
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <div className="text-sm font-semibold text-neutral-900">
                Navigation Links
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                These links appear in the top navigation bar of the Showcase page.
              </div>
            </div>

            {linksBlock ? (
              <div className="space-y-3">
                {linksBlock.data.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Link {index + 1}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={item.label}
                        onChange={(e) =>
                          updateLinksItem(item.id, "label", e.target.value)
                        }
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                        placeholder="Label"
                      />

                      <input
                        value={item.url}
                        onChange={(e) =>
                          updateLinksItem(item.id, "url", e.target.value)
                        }
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                        placeholder="https://"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLinkItem(item.id)}
                      className="mt-3 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Remove Link
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLinkItem}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                >
                  Add Link
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={ensureLinksBlock}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                Add Links Block
              </button>
            )}
          </div>

          <div
            id="showcase-button-panel"
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <div className="text-sm font-semibold text-neutral-900">
                Hero Button
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Controls the main button and description beneath the title.
              </div>
            </div>

            {heroButtonBlock ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Description
                  </label>
                  <textarea
                    value={heroButtonBlock.data.heading}
                    onChange={(e) =>
                      updateHeroButtonField("heading", e.target.value)
                    }
                    className="mt-2 min-h-[120px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                    placeholder="Explore a collection of unique paintings created with passion."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Button Text
                  </label>
                  <input
                    value={heroButtonBlock.data.buttonText}
                    onChange={(e) =>
                      updateHeroButtonField("buttonText", e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                    placeholder="View Gallery"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900">
                    Button URL
                  </label>
                  <input
                    value={heroButtonBlock.data.buttonUrl}
                    onChange={(e) =>
                      updateHeroButtonField("buttonUrl", e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                    placeholder="https://"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={ensureHeroButtonBlock}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                Add Hero Button Block
              </button>
            )}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}