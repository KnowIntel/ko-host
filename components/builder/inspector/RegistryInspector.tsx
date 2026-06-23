"use client";

import type { Dispatch, SetStateAction } from "react";

/**
 * Registry inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "registry"
 */
type RegistryInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  registryLoadingMap: Record<string, boolean>;
  setRegistryLoadingMap: Dispatch<SetStateAction<Record<string, boolean>>>;

  getStoreMeta: (url: string) => any;
  makeClientId: (prefix: string) => string;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function RegistryInspector({
  selectedBlock,
  updateSelectedBlock,
  registryLoadingMap,
  setRegistryLoadingMap,
  getStoreMeta,
  makeClientId,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
  toolSetButtonClass,
}: RegistryInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Registry */}
    <div className={inspectorLabelClass()}>Registry</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "registry"
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

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Description</div>
      <textarea
        value={selectedBlock.data.description ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "registry"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    description: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4 space-y-3">
      {(selectedBlock.data.items ?? []).map((item: any, index: number) => {
        const normalizedUrl =
          typeof item.url === "string" ? item.url.trim() : "";
        const storeMeta = getStoreMeta(normalizedUrl);

        return (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Item {index + 1}
            </div>

            <div className="mt-3">
              <div className={inspectorLabelClass()}>Item Name</div>
              <input
                type="text"
                value={item.label ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "registry"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: (block.data.items ?? []).map((entry: any) =>
                              entry.id === item.id
                                ? { ...entry, label: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorInputClass()}
              />
            </div>

            {storeMeta?.logo ? (
              <div className="mt-4 flex items-center gap-2">
                <img
                  src={storeMeta.logo}
                  alt={storeMeta.name || "Store"}
                  className="h-5 w-5 rounded-sm object-contain"
                />
                <span className="text-xs text-neutral-500">
                  {storeMeta.name || item.store?.trim() || "Store detected"}
                </span>
              </div>
            ) : null}

            {item.imageUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <img
                  src={item.imageUrl}
                  alt={item.label || `Item ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
              </div>
            ) : null}
            <div className="mt-4">
              <div className={inspectorLabelClass()}>URL</div>
              <input
                type="text"
                value={item.url ?? ""}
                onChange={(e) => {
                  const url = e.target.value;

                  updateSelectedBlock((block: any) =>
                    block.type !== "registry"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: (block.data.items ?? []).map((entry: any) =>
                              entry.id === item.id
                                ? {
                                    ...entry,
                                    url,
                                    store: "",
                                    price: "",
                                    imageUrl: "",
                                  }
                                : entry,
                            ),
                          },
                        },
                  );

                  if (!(window as any).__registryTimers) {
                    (window as any).__registryTimers = {};
                  }

                  if ((window as any).__registryTimers[item.id]) {
                    clearTimeout((window as any).__registryTimers[item.id]);
                  }

                  (window as any).__registryTimers[item.id] = window.setTimeout(
                    async () => {
                      const trimmedUrl = url.trim();
                      if (!/^https?:\/\//i.test(trimmedUrl)) return;

                      try {
                        setRegistryLoadingMap((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }));

                        const { fetchRegistryMetadata } = await import(
                          "@/lib/utils/fetchRegistryMetadata"
                        );

                        const meta = await fetchRegistryMetadata(trimmedUrl);

                        updateSelectedBlock((block: any) => {
                          if (block.type !== "registry") return block;

                          return {
                            ...block,
                            data: {
                              ...block.data,
                              items: (block.data.items ?? []).map((entry: any) => {
                                if (entry.id !== item.id) return entry;

                                const currentLabel =
                                  typeof entry.label === "string"
                                    ? entry.label.trim()
                                    : "";
                                const currentStore =
                                  typeof entry.store === "string"
                                    ? entry.store.trim()
                                    : "";
                                const currentPrice =
                                  typeof entry.price === "string"
                                    ? entry.price.trim()
                                    : "";

                                return {
                                  ...entry,
                                  label: currentLabel || meta.title || "",
                                  store: meta.store || "",
                                  price: meta.price || "",
                                  imageUrl: meta.imageUrl || "",
                                };
                              }),
                            },
                          };
                        });
                      } catch {
                        // silent fail
                      } finally {
                        setRegistryLoadingMap((prev) => ({
                          ...prev,
                          [item.id]: false,
                        }));
                      }
                    },
                    600,
                  );
                }}
                className={inspectorInputClass()}
              />

              {registryLoadingMap[item.id] ? (
                <div className="mt-1 text-xs text-neutral-500">
                  Fetching item details...
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className={inspectorLabelClass()}>Store</div>
                <input
                  type="text"
                  value={item.store ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "registry"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              items: (block.data.items ?? []).map((entry: any) =>
                                entry.id === item.id
                                  ? { ...entry, store: e.target.value }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>

              <div>
                <div className={inspectorLabelClass()}>Price</div>
                <input
                  type="text"
                  value={item.price ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "registry"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              items: (block.data.items ?? []).map((entry: any) =>
                                entry.id === item.id
                                  ? { ...entry, price: e.target.value }
                                  : entry,
                              ),
                            },
                          },
                    )
                  }
                  className={inspectorInputClass()}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className={inspectorLabelClass()}>Note</div>
              <textarea
                value={item.note ?? ""}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "registry"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items: (block.data.items ?? []).map((entry: any) =>
                              entry.id === item.id
                                ? { ...entry, note: e.target.value }
                                : entry,
                            ),
                          },
                        },
                  )
                }
                className={inspectorTextareaClass()}
              />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "registry"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            items:
                              (block.data.items ?? []).length > 1
                                ? (block.data.items ?? []).filter(
                                    (entry: any) => entry.id !== item.id,
                                  )
                                : block.data.items ?? [],
                          },
                        },
                  )
                }
                title="Remove registry item"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={() =>
          updateSelectedBlock((block: any) =>
            block.type !== "registry"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    items: [
                      ...(block.data.items ?? []),
                      {
                        id: makeClientId("registryitem"),
                        label: "New Gift",
                        url: "#",
                        store: "",
                        price: "",
                        note: "",
                      },
                    ],
                  },
                },
          )
        }
      >
        Add Registry Item
      </button>
    </div>
    </div>
  );
}