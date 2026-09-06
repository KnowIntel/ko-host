"use client";

import {
  useMemo,
  useState,
} from "react";

type ButtonInspectorProps = {
  selectedBlock: any;

  updateSelectedBlock: any;

  CATEGORY_BUTTONS: any;

  openImagePicker: (
    options: any,
  ) => void;

  uploadBuilderImageFile: (
    file: File,
  ) => Promise<any>;

  inspectorCardClass:
    () => string;

  inspectorLabelClass:
    () => string;

  inspectorInputClass:
    () => string;

  inspectorTextareaClass:
    () => string;
};

export function ButtonInspector({
  selectedBlock,

  updateSelectedBlock,

  CATEGORY_BUTTONS,

  openImagePicker,

  uploadBuilderImageFile,

  inspectorCardClass,

  inspectorLabelClass,

  inspectorInputClass,

  inspectorTextareaClass,
}: ButtonInspectorProps) {
  const data =
    selectedBlock.data as any;

  const [
    iconSearch,
    setIconSearch,
  ] = useState("");

  const mediaType =
    data.buttonMediaType ??
    "image";

  const styleType =
    data.styleType ??
    "solid";

  const isMediaCircle =
    styleType ===
    "media_circle";

  const iconTools =
    useMemo(
      () =>
        (
          CATEGORY_BUTTONS
            .Icons ?? []
        ).filter(
          (tool: any) =>
            tool.kind ===
              "block" &&
            tool.type ===
              "icon",
        ),
      [CATEGORY_BUTTONS],
    );

  const filteredIconTools =
    useMemo(() => {
      const query =
        iconSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return iconTools;
      }

      return iconTools.filter(
        (tool: any) => {
          const label =
            String(
              tool.label ??
                "",
            ).toLowerCase();

          const iconName =
            String(
              tool.iconName ??
                "",
            ).toLowerCase();

          return (
            label.includes(
              query,
            ) ||
            iconName.includes(
              query,
            )
          );
        },
      );
    }, [
      iconSearch,
      iconTools,
    ]);

  function patchButtonData(
    patch:
      Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !==
        "cta"
          ? block
          : {
              ...block,

              data: {
                ...block.data,

                ...patch,
              },
            },
    );
  }

  return (
    <div
      className={
        inspectorCardClass()
      }
    >
      <div
        className={
          inspectorLabelClass()
        }
      >
        Button
      </div>

      {/* ============================================================ */}
      {/* STYLE */}
      {/* ============================================================ */}

<div className="mt-4">
  <div
    className={
      inspectorLabelClass()
    }
  >
    Button Style
  </div>

  <select
    value={
      data.styleType ??
      "solid"
    }
    onChange={(e) =>
      patchButtonData({
        styleType:
          e.target.value as
            | "solid"
            | "outline"
            | "soft"
            | "media_circle",
      })
    }
    className={
      inspectorInputClass()
    }
  >
    <option value="solid">
      Solid
    </option>

    <option value="outline">
      Outline
    </option>

    <option value="soft">
      Soft
    </option>

    <option value="media_circle">
      Media Circle
    </option>
  </select>
</div>

      {/* ============================================================ */}
      {/* BUTTON TEXT */}
      {/* ============================================================ */}

      {!isMediaCircle ? (
        <div className="mt-4">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Button Text
          </div>

          <input
            type="text"
            value={
              data.buttonText ??
              ""
            }
            onChange={(e) =>
              patchButtonData({
                buttonText:
                  e.target.value,
              })
            }
            className={
              inspectorInputClass()
            }
          />
        </div>
      ) : null}

      {/* ============================================================ */}
      {/* MEDIA TYPE */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Button Media
        </div>

        <div className="mt-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Media Type
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                patchButtonData({
                  buttonMediaType:
                    "image",
                })
              }
              className={[
                "rounded-xl border px-3 py-2 text-sm font-medium transition",

                mediaType ===
                "image"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              Image
            </button>

            <button
              type="button"
              onClick={() =>
                patchButtonData({
                  buttonMediaType:
                    "icon",
                })
              }
              className={[
                "rounded-xl border px-3 py-2 text-sm font-medium transition",

                mediaType ===
                "icon"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              Icon
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* IMAGE */}
        {/* ========================================================== */}

        {mediaType ===
        "image" ? (
          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Image
            </div>

            {data.buttonImageUrl ? (
              <div className="mt-2 flex min-h-24 items-center justify-center overflow-visible rounded-xl border border-neutral-200 bg-white p-4">
                <img
                  src={
                    data.buttonImageUrl
                  }
                  alt=""
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  openImagePicker({
                    multiple:
                      false,

                    onSelect:
                      async (
                        files:
                          File[],
                      ) => {
                        const file =
                          files[0];

                        if (!file) {
                          return;
                        }

                        const uploaded =
                          await uploadBuilderImageFile(
                            file,
                          );

                        patchButtonData({
                          buttonImageUrl:
                            uploaded.url,
                        });
                      },
                  })
                }
                className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 hover:border-neutral-900"
              >
                {data.buttonImageUrl
                  ? "Change Image"
                  : "Add Image"}
              </button>

              {data.buttonImageUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    patchButtonData({
                      buttonImageUrl:
                        "",
                    })
                  }
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ========================================================== */}
        {/* ICON */}
        {/* ========================================================== */}

        {mediaType ===
        "icon" ? (
          <>
            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Search Icons
              </div>

              <input
                type="text"
                value={
                  iconSearch
                }
                onChange={(e) =>
                  setIconSearch(
                    e.target.value,
                  )
                }
                placeholder="Search icons..."
                className={
                  inspectorInputClass()
                }
              />

              {iconSearch ? (
                <button
                  type="button"
                  onClick={() =>
                    setIconSearch(
                      "",
                    )
                  }
                  className="mt-2 text-xs font-medium text-neutral-500 hover:text-neutral-900"
                >
                  Clear search
                </button>
              ) : null}
            </div>

            <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2">
              {filteredIconTools.length >
              0 ? (
                <div className="grid grid-cols-1 gap-1">
                  {filteredIconTools.map(
                    (
                      tool: any,
                    ) => {
                      const iconName =
                        tool.iconName ??
                        "star";

                      const iconUrl =
                        `/media-icons/${iconName}.svg`;

                      const active =
                        data.buttonIconUrl ===
                        iconUrl;

                      return (
                        <button
                          key={
                            iconName
                          }
                          type="button"
                          onClick={() =>
                            patchButtonData({
                              buttonIconUrl:
                                iconUrl,
                            })
                          }
                          className={[
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",

                            active
                              ? "bg-neutral-900 text-white"
                              : "text-neutral-800 hover:bg-neutral-100",
                          ].join(
                            " ",
                          )}
                        >
                          <img
                            src={
                              iconUrl
                            }
                            alt=""
                            className="h-5 w-5 shrink-0 object-contain"
                          />

                          <span className="min-w-0 flex-1 truncate">
                            {
                              tool.label
                            }
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="px-3 py-4 text-center text-sm text-neutral-500">
                  No matching
                  icons
                </div>
              )}
            </div>

            <div className="mt-1 text-xs text-neutral-500">
              {
                filteredIconTools.length
              }{" "}
              {filteredIconTools.length ===
              1
                ? "icon"
                : "icons"}{" "}
              found
            </div>

{data.buttonIconUrl ? (
  <button
    type="button"
    onClick={() =>
      patchButtonData({
        buttonIconUrl:
          "",
      })
    }
    className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100"
  >
    Remove Icon
  </button>
) : null}


                        {/* ====================================================== */}
            {/* ICON COLOR */}
            {/* ====================================================== */}

            <div className="mt-4">
              <div
                className={
                  inspectorLabelClass()
                }
              >
                Icon Color
              </div>

              <input
                type="color"
                value={
                  data.buttonIconColor ??
                  "#111111"
                }
                onChange={(e) =>
                  patchButtonData({
                    buttonIconColor:
                      e.target.value,
                  })
                }
                className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white"
              />
            </div>
          </>
        ) : null}

        {/* ========================================================== */}
        {/* MEDIA SIZE */}
        {/* ========================================================== */}

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              {mediaType ===
              "icon"
                ? "Icon Size"
                : "Image Size"}
            </div>

            <div className="text-xs text-neutral-500">
              {Number(
                data.buttonImageSize ??
                  20,
              )}
              px
            </div>
          </div>

          <input
            type="range"
            min={8}
            max={160}
            step={1}
            value={
              Number(
                data.buttonImageSize ??
                  20,
              )
            }
            onChange={(e) =>
              patchButtonData({
                buttonImageSize:
                  Number(
                    e.target.value,
                  ),
              })
            }
            className="mt-2 w-full"
          />
        </div>

        {/* ========================================================== */}
        {/* MEDIA PLACEMENT */}
        {/* ========================================================== */}

        {!isMediaCircle ? (
          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Media Placement
            </div>

            <select
              value={
                data.buttonImagePlacement ??
                "before"
              }
              onChange={(e) =>
                patchButtonData({
                  buttonImagePlacement:
                    e.target.value,
                })
              }
              className={
                inspectorInputClass()
              }
            >
              <option value="before">
                Before Text
              </option>

              <option value="above">
                Above Text
              </option>

              <option value="after">
                After Text
              </option>
            </select>
          </div>
        ) : null}
      </div>

      {/* ============================================================ */}
      {/* PADDING */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Padding
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Horizontal
            </div>

            <div className="text-xs text-neutral-500">
              {Number(
                data.buttonPaddingX ??
                  20,
              )}
              px
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={80}
            step={1}
            value={
              Number(
                data.buttonPaddingX ??
                  20,
              )
            }
            onChange={(e) =>
              patchButtonData({
                buttonPaddingX:
                  Number(
                    e.target.value,
                  ),
              })
            }
            className="mt-2 w-full"
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Vertical
            </div>

            <div className="text-xs text-neutral-500">
              {Number(
                data.buttonPaddingY ??
                  8,
              )}
              px
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={80}
            step={1}
            value={
              Number(
                data.buttonPaddingY ??
                  8,
              )
            }
            onChange={(e) =>
              patchButtonData({
                buttonPaddingY:
                  Number(
                    e.target.value,
                  ),
              })
            }
            className="mt-2 w-full"
          />
        </div>
      </div>

      {/*
       * Keep your existing Link To and Button Link controls
       * beneath this section in DesignLayoutEditor until
       * we move those into this inspector in the next wiring pass.
       */}

             {/* ============================================================ */}
      {/* LINK TO */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Link To
        </div>

        <select
          value={
            data.linkType ??
            "url"
          }
          onChange={(e) =>
            patchButtonData({
              linkType:
                e.target.value as
                  | "url"
                  | "page"
                  | "bookmark",
            })
          }
          className={
            inspectorInputClass()
          }
        >
          <option value="url">
            Web Address
          </option>

          <option value="page">
            Site Page
          </option>

          <option value="bookmark">
            Bookmark
          </option>
        </select>
      </div>

      {/* ============================================================ */}
      {/* BUTTON LINK */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Button Link
        </div>

        {(
          data.linkType ??
          "url"
        ) === "url" ? (
          <input
            type="text"
            value={
              data.buttonUrl ??
              ""
            }
            onChange={(e) =>
              patchButtonData({
                buttonUrl:
                  e.target.value,
              })
            }
            placeholder="https://example.com"
            className={
              inspectorInputClass()
            }
          />
        ) : null}

        {data.linkType ===
        "page" ? (
          <div className="mt-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Page ID / URL
            </div>

            <input
              type="text"
              value={
                data.pageId ??
                ""
              }
              onChange={(e) =>
                patchButtonData({
                  pageId:
                    e.target.value,

                  buttonUrl:
                    e.target.value,
                })
              }
              placeholder="/about"
              className={
                inspectorInputClass()
              }
            />
          </div>
        ) : null}

        {data.linkType ===
        "bookmark" ? (
          <div className="mt-3">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Bookmark
            </div>

            <input
              type="text"
              value={
                data.bookmarkName ??
                ""
              }
              onChange={(e) => {
                const bookmarkName =
                  e.target.value;

                patchButtonData({
                  bookmarkName,

                  buttonUrl:
                    bookmarkName
                      ? bookmarkName.startsWith(
                          "#",
                        )
                        ? bookmarkName
                        : `#${bookmarkName}`
                      : "",
                });
              }}
              placeholder="section-name"
              className={
                inspectorInputClass()
              }
            />
          </div>
        ) : null}
      </div>

    </div>
  );
}