"use client";

import type { RefObject } from "react";

type SitePage = {
  id: string;
  slug: string;
  title?: string | null;
  display_order?: number | null;
};

type LinksInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  makeClientId: (prefix: string) => string;

  pages?: SitePage[];
  currentSiteSlug: string;

  linksHeadingInputRef: RefObject<HTMLInputElement | null>;
  linksItemLabelInputRefs: RefObject<
    Record<string, HTMLInputElement | null>
  >;
  linksItemUrlInputRefs: RefObject<
    Record<string, HTMLInputElement | null>
  >;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

function getPageDisplayLabel(page: SitePage) {
  const slug = String(page.slug ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  const rawTitle = String(page.title ?? "").trim();

  const slugLabel =
    slug === "home"
      ? "Home"
      : slug
          .replace(/[-_]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/\b\w/g, (char) => char.toUpperCase());

  /*
   * Protect against older secondary pages that may
   * incorrectly still carry "Home" as their title.
   */
  if (
    rawTitle &&
    !(
      rawTitle.toLowerCase() === "home" &&
      slug !== "home"
    )
  ) {
    return rawTitle;
  }

  return slugLabel || "Untitled Page";
}

export function LinksInspector({
  selectedBlock,
  updateSelectedBlock,
  makeClientId,

  pages,
  currentSiteSlug,

  linksHeadingInputRef,
  linksItemLabelInputRefs,
  linksItemUrlInputRefs,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: LinksInspectorProps) {
  const siteBaseUrl = `https://${currentSiteSlug}.ko-host.com`;

  function updateLinkItem(
    itemId: string,
    patch: Record<string, any>,
  ) {
    updateSelectedBlock((block: any) =>
      block.type !== "links"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              items: block.data.items.map(
                (entry: any) =>
                  entry.id === itemId
                    ? {
                        ...entry,
                        ...patch,
                      }
                    : entry,
              ),
            },
          },
    );
  }

  function normalizeFullUrl(value: unknown) {
    const raw = String(value ?? "").trim();

    if (
      raw.startsWith("http://") ||
      raw.startsWith("https://")
    ) {
      return raw;
    }

    if (!raw || raw === "#" || raw === "/") {
      return siteBaseUrl;
    }

    if (raw.startsWith("/")) {
      return `${siteBaseUrl}${raw}`;
    }

    return raw;
  }

  return (
    <div
      id="inspector-links"
      className={inspectorCardClass()}
    >
      <div className={inspectorLabelClass()}>
        Links
      </div>

      {/* HEADING */}

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Heading
        </div>

        <input
          ref={linksHeadingInputRef}
          type="text"
          value={selectedBlock.data.heading ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "links"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      heading: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      {/* LINK ITEMS */}

      <div className="mt-4 space-y-3">
        {selectedBlock.data.items.map(
          (item: any, index: number) => {
            const linkType =
              item.linkType === "page"
                ? "page"
                : "url";

            const resolvedUrl =
              normalizeFullUrl(item.url);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="mb-3 text-xs font-semibold text-neutral-500">
                  Link {index + 1}
                </div>

                {/* LABEL */}

                <div className={inspectorLabelClass()}>
                  Label
                </div>

                <input
                  ref={(el) => {
                    linksItemLabelInputRefs.current[
                      item.id
                    ] = el;
                  }}
                  type="text"
                  value={item.label}
                  onChange={(e) =>
                    updateLinkItem(item.id, {
                      label: e.target.value,
                    })
                  }
                  className={inspectorInputClass()}
                />

                {/* LINK TYPE */}

                <div className="mt-4">
                  <div className={inspectorLabelClass()}>
                    Link To
                  </div>

                  <select
                    value={linkType}
                    onChange={(e) => {
                      const nextLinkType =
                        e.target.value === "page"
                          ? "page"
                          : "url";

                      updateLinkItem(item.id, {
                        linkType: nextLinkType,

                        /*
                         * Make sure the URL is represented as
                         * a full URL regardless of mode.
                         */
                        url: resolvedUrl,
                      });
                    }}
                    className={inspectorInputClass()}
                  >
                    <option value="url">
                      Web Address
                    </option>

                    <option value="page">
                      Site Page
                    </option>
                  </select>
                </div>

                {/* SITE PAGE */}

                {linkType === "page" ? (
                  <div className="mt-4">
                    <div
                      className={
                        inspectorLabelClass()
                      }
                    >
                      Site Page
                    </div>

                    <select
                      value={item.pageId ?? ""}
                      onChange={(e) => {
                        const nextPageId =
                          e.target.value;

                        const selectedPage =
                          (pages ?? []).find(
                            (page) =>
                              page.id ===
                              nextPageId,
                          );

                        const selectedPageSlug =
                          String(
                            selectedPage?.slug ??
                              "",
                          )
                            .trim()
                            .toLowerCase()
                            .replace(
                              /^\/+|\/+$/g,
                              "",
                            );

                        const nextUrl =
                          !selectedPageSlug ||
                          selectedPageSlug ===
                            "home"
                            ? siteBaseUrl
                            : `${siteBaseUrl}/${selectedPageSlug}`;

                        updateLinkItem(
                          item.id,
                          {
                            linkType: "page",
                            pageId: nextPageId,

                            url: nextPageId
                              ? nextUrl
                              : siteBaseUrl,
                          },
                        );
                      }}
                      className={
                        inspectorInputClass()
                      }
                    >
                      <option value="">
                        Select a page...
                      </option>

                      {(pages ?? []).map(
                        (page) => (
                          <option
                            key={page.id}
                            value={page.id}
                          >
                            {getPageDisplayLabel(
                              page,
                            )}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                ) : null}

                {/* URL — ALWAYS VISIBLE */}

                <div className="mt-4">
                  <div className={inspectorLabelClass()}>
                    URL
                  </div>

                  <input
                    ref={(el) => {
                      linksItemUrlInputRefs.current[
                        item.id
                      ] = el;
                    }}
                    type="text"
                    value={resolvedUrl}
                    disabled={linkType === "page"}
                    onChange={(e) =>
                      updateLinkItem(item.id, {
                        url: e.target.value,
                      })
                    }
                    placeholder={siteBaseUrl}
                    className={[
                      "mt-2 h-10 w-full rounded-xl border px-3 text-sm outline-none",

                      linkType === "page"
                        ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-500"
                        : "border-neutral-300 bg-white text-neutral-900",
                    ].join(" ")}
                  />

                  {linkType === "page" ? (
                    <div className="mt-1 text-[11px] leading-4 text-neutral-500">
                      This address is generated
                      automatically from the
                      selected site page.
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] leading-4 text-neutral-500">
                      Enter the full web address
                      for this link.
                    </div>
                  )}
                </div>

                {/* REMOVE */}

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className={toolSetButtonClass(
                      "remove",
                    )}
                    onClick={() =>
                      updateSelectedBlock(
                        (block: any) =>
                          block.type !== "links"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,

                                  items:
                                    block.data
                                      .items
                                      .length > 1
                                      ? block.data.items.filter(
                                          (
                                            entry: any,
                                          ) =>
                                            entry.id !==
                                            item.id,
                                        )
                                      : block.data
                                          .items,
                                },
                              },
                      )
                    }
                    title="Remove link"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          },
        )}

        {/* ADD LINK */}

        <button
          type="button"
          className={toolSetButtonClass("front")}
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "links"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,

                      items: [
                        ...block.data.items,

                        {
                          id: makeClientId("link"),
                          label: "New Link",

                          /*
                           * New links begin as editable
                           * Web Address links pointing to
                           * the microsite home page.
                           */
                          url: siteBaseUrl,
                          linkType: "url",
                          pageId: "",
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Link
        </button>
      </div>
    </div>
  );
}