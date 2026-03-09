"use client";

import { useMemo, useRef } from "react";
import type { BuilderDraft } from "@/lib/templates/builder";
import SidebarToolButton from "@/components/templates/design-editors/shared/SidebarToolButton";
import EmptyImagePlaceholder from "@/components/templates/design-editors/shared/EmptyImagePlaceholder";
import CountdownPreview from "@/components/templates/design-editors/shared/CountdownPreview";
import {
  createDefaultCountdownBlock,
  createDefaultHeroButtonBlock,
  createDefaultLinksBlock,
  getCountdownBlock,
  getFestiveBackgroundBlock,
  getHeroButtonBlock,
  getLinksBlock,
  isoToLocalDateTimeValue,
  readFileAsDataUrl,
} from "@/components/templates/design-editors/shared/editorUtils";

type Props = {
  templateKey: string;
  designKey: string;
  draft: BuilderDraft;
  setDraft: React.Dispatch<React.SetStateAction<BuilderDraft>>;
  submitLabel?: string;
};

export default function FestiveEditor({
  draft,
  setDraft,
  submitLabel = "Continue",
}: Props) {
  const festiveBgInputRef = useRef<HTMLInputElement | null>(null);

  const festiveBackgroundBlock = useMemo(
    () => getFestiveBackgroundBlock(draft.blocks),
    [draft.blocks],
  );
  const linksBlock = useMemo(() => getLinksBlock(draft.blocks), [draft.blocks]);
  const heroButtonBlock = useMemo(
    () => getHeroButtonBlock(draft.blocks),
    [draft.blocks],
  );
  const countdownBlock = useMemo(
    () => getCountdownBlock(draft.blocks),
    [draft.blocks],
  );

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
        blocks: [...prev.blocks, createDefaultHeroButtonBlock("Shop Now")],
      };
    });
  }

  function ensureCountdownBlock() {
    setDraft((prev) => {
      if (getCountdownBlock(prev.blocks)) return prev;
      return {
        ...prev,
        blocks: [...prev.blocks, createDefaultCountdownBlock()],
      };
    });
  }

  async function handleBrowseFestiveBackground(fileList: FileList | null) {
    if (!fileList?.length || !festiveBackgroundBlock) return;

    const file = fileList[0];
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    try {
      const url = await readFileAsDataUrl(file);

      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          if (
            block.id !== festiveBackgroundBlock.id ||
            block.type !== "festiveBackground"
          ) {
            return block;
          }

          return {
            ...block,
            data: {
              ...block.data,
              image: {
                ...block.data.image,
                url,
              },
            },
          };
        }),
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to read image.";
      alert(message);
    } finally {
      if (festiveBgInputRef.current) {
        festiveBgInputRef.current.value = "";
      }
    }
  }

  function updateLinksItem(
    itemId: string,
    field: "label" | "url",
    value: string,
  ) {
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
              {
                id: `link_${Math.random().toString(36).slice(2, 10)}`,
                label: "New Link",
                url: "#",
              },
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
    field: "buttonText" | "buttonUrl",
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

  function updateCountdownField(
    field: "targetIso" | "completedMessage",
    value: string,
  ) {
    setDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => {
        if (block.type !== "countdown") return block;

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

  const festiveBgUrl = festiveBackgroundBlock?.data.image.url || "";
  const navItems = linksBlock?.data.items ?? [];
  const heroButtonText = heroButtonBlock?.data.buttonText || "Shop Now";

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-neutral-200 bg-white p-4 shadow-sm xl:sticky xl:top-6 xl:h-[fit-content]">
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Left Toolbox
          </div>
          <h2 className="mt-2 text-lg font-semibold text-neutral-950">
            Festive Controls
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Edit the holiday layout content and festive background visually.
          </p>
        </div>

        <div className="space-y-3">
          <SidebarToolButton
            label="Background Image"
            icon="🖼️"
            onClick={() => festiveBgInputRef.current?.click()}
          />
          <SidebarToolButton
            label="Navigation Links"
            icon="🔗"
            onClick={() => {
              ensureLinksBlock();
              document
                .getElementById("festive-links-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          <SidebarToolButton
            label="Hero Button"
            icon="▣"
            onClick={() => {
              ensureHeroButtonBlock();
              document
                .getElementById("festive-button-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          <SidebarToolButton
            label="Countdown"
            icon="⏳"
            onClick={() => {
              ensureCountdownBlock();
              document
                .getElementById("festive-countdown-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>

        <input
          ref={festiveBgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleBrowseFestiveBackground(e.target.files)}
        />
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
                placeholder="Celebrate the Season"
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
                placeholder="Holiday Sale"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-neutral-900">
                Subtext
              </label>
              <input
                value={draft.subtext ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, subtext: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                placeholder="Huge discounts on gifts for the whole family!"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-900">
                Countdown Label
              </label>
              <input
                value={draft.countdownLabel ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    countdownLabel: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                placeholder="Sale Ends In:"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-neutral-200 bg-[#f5f1ee] p-4 shadow-sm sm:p-6">
          <div className="overflow-hidden rounded-[30px] bg-white">
            <div
              className="relative min-h-[1400px] bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: festiveBgUrl ? `url("${festiveBgUrl}")` : undefined,
                backgroundColor: festiveBgUrl ? undefined : "#f8f4ef",
              }}
            >
              {!festiveBgUrl ? (
                <div className="absolute inset-0">
                  <EmptyImagePlaceholder
                    title="Festive background image"
                    recommendedSize="recommended: 1600x2400"
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => festiveBgInputRef.current?.click()}
                className="absolute bottom-4 left-4 z-20"
                aria-label="Edit festive background image"
              >
                <img
                  src="/icons/edit_icon.webp"
                  alt="Edit"
                  className="h-10 w-10 rounded-full bg-white/90 p-1.5 shadow-sm"
                />
              </button>

              <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
                <div className="text-[22px] font-medium text-[#c76152]">
                  Your Logo
                </div>

                <div className="mx-auto mt-20 max-w-[900px] text-center">
                  <h1
                    className="text-[62px] leading-[0.95] text-[#2f6b53] sm:text-[84px] md:text-[96px]"
                    style={{ fontFamily: "var(--font-great-vibes)" }}
                  >
                    {draft.title || "Celebrate the Season"}
                  </h1>

                  <div className="mt-6 text-[48px] font-bold uppercase leading-none tracking-tight text-[#da2421] sm:text-[76px] md:text-[92px]">
                    {draft.subtitle || "Holiday Sale"}
                  </div>

                  <p className="mx-auto mt-8 max-w-[820px] text-[22px] leading-[1.35] text-[#6a6a6a] sm:text-[28px]">
                    {draft.subtext ||
                      "Huge discounts on gifts for the whole family!"}
                  </p>

                  <div className="mt-10">
                    <a
                      href={heroButtonBlock?.data.buttonUrl || "#"}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#d8221f] px-10 py-4 text-[18px] font-medium text-white shadow-sm transition hover:opacity-90 sm:text-[22px]"
                    >
                      {heroButtonText}
                    </a>
                  </div>

                  <div className="mx-auto mt-12 flex max-w-[620px] items-center justify-center gap-5 text-center">
                    <div className="h-px flex-1 bg-[#bfe2e5]" />
                    <div className="text-[26px] font-medium text-black sm:text-[34px]">
                      {draft.countdownLabel || "Sale Ends In:"}
                    </div>
                    <div className="h-px flex-1 bg-[#bfe2e5]" />
                  </div>

                  <div className="mx-auto mt-8 max-w-[560px]">
                    <CountdownPreview targetIso={countdownBlock?.data.targetIso} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div
            id="festive-links-panel"
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <div className="text-sm font-semibold text-neutral-900">
                Navigation Links
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                These links are available for festive layout navigation.
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
            id="festive-button-panel"
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <div className="text-sm font-semibold text-neutral-900">
                Hero Button
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Controls the main festive button.
              </div>
            </div>

            {heroButtonBlock ? (
              <div className="space-y-4">
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
                    placeholder="Shop Now"
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

        <section
          id="festive-countdown-panel"
          className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-4">
            <div className="text-sm font-semibold text-neutral-900">
              Countdown
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              Set when the holiday sale ends.
            </div>
          </div>

          {countdownBlock ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-900">
                  Target Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={isoToLocalDateTimeValue(countdownBlock.data.targetIso)}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateCountdownField(
                      "targetIso",
                      value ? new Date(value).toISOString() : "",
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-900">
                  Completed Message
                </label>
                <input
                  value={countdownBlock.data.completedMessage}
                  onChange={(e) =>
                    updateCountdownField("completedMessage", e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                  placeholder="Sale ended"
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={ensureCountdownBlock}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Add Countdown Block
            </button>
          )}
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