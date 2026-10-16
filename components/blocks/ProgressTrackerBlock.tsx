
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CSSProperties } from "react";

import type {
  ProgressTrackerBlock as ProgressTrackerBlockType,
  TextStyle,
  BlockAppearance,
} from "@/lib/templates/builder";

type Props = {
  block: ProgressTrackerBlockType;
  micrositeId?: string | null;
  previewMode?: boolean;
  isBuilder?: boolean;
};

type ActualValues = Record<
  string,
  Record<string, number | null>
>;

type TargetValues = ActualValues;

type SessionState = {
  actuals: ActualValues;
  completedRows: Record<string, boolean>;
};

type PersistedState = {
  id: string;
  current_targets: TargetValues;
  actuals: ActualValues;
  completed_rows: Record<string, boolean>;
  session_number: number;
  updated_at: string;
};

type HistoryEntry = {
  id: string;
  session_number: number;
  completed_at: string;
  snapshot: {
    title?: string;
    rows?: Array<{ id: string; label: string }>;
    measurements?: Array<{
      id: string;
      label: string;
      unit?: string;
      targetEnabled?: boolean;
      actualEnabled?: boolean;
    }>;
    targets?: TargetValues;
    actuals?: ActualValues;
    completedRows?: Record<string, boolean>;
    sessionNumber?: number;
  };
};

type ApiResponse = {
  error?: string;
  state?: PersistedState;
  history?: HistoryEntry[];
  success?: boolean;
  alreadyCompleted?: boolean;
};

type SaveStatus =
  | "loading"
  | "saved"
  | "saving"
  | "unsaved"
  | "error"
  | "conflict";

function emptySession(): SessionState {
  return {
    actuals: {},
    completedRows: {},
  };
}

function parseNumber(value: string): number | null {
  if (value.trim() === "") return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function cloneSession(value: SessionState): SessionState {
  return {
    actuals: Object.fromEntries(
      Object.entries(value.actuals).map(([rowId, values]) => [
        rowId,
        { ...values },
      ])
    ),
    completedRows: { ...value.completedRows },
  };
}

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isFinite(date.getTime())
    ? date.toLocaleString()
    : value;
}

function getErrorMessage(
  response: ApiResponse,
  fallback: string
): string {
  return typeof response.error === "string"
    ? response.error
    : fallback;
}

async function apiRequest(
  method: "GET" | "PATCH" | "POST",
  micrositeId: string,
  blockId: string,
  body?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<ApiResponse> {
  const endpoint = "/api/progress-tracker";

  const url =
    method === "GET"
      ? `${endpoint}?${new URLSearchParams({
          micrositeId,
          blockId,
        }).toString()}`
      : endpoint;

  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers:
      method === "GET"
        ? undefined
        : { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const result = (await response.json()) as ApiResponse;

  if (!response.ok) {
    const error = new Error(
      getErrorMessage(result, "Tracker request failed.")
    ) as Error & { status?: number };

    error.status = response.status;

    throw error;
  }

  return result;
}

function toTrackerTextCss(
  style?: TextStyle
): CSSProperties {
  return {
    fontFamily: style?.fontFamily || undefined,
    fontSize: style?.fontSize ?? undefined,
    color: style?.color || undefined,
    fontWeight: style?.bold ? 700 : undefined,
    fontStyle: style?.italic ? "italic" : undefined,
    textDecoration:
      [
        style?.underline ? "underline" : "",
        style?.strike ? "line-through" : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined,
    textAlign: style?.align || undefined,
  };
}

/**
 * Converts saved appearance properties into CSS.
 *
 * The appearance object is deliberately handled as a
 * dictionary so optional properties can be supported
 * without assuming every property exists in the type.
 */
function toTrackerAppearanceCss(
  appearance?: Partial<BlockAppearance>
): CSSProperties {
  if (!appearance) return {};

  const values = appearance as Record<string, unknown>;
  const css: CSSProperties = {};

  const stringValue = (key: string): string | undefined => {
    const value = values[key];

    return typeof value === "string" && value.trim()
      ? value
      : undefined;
  };

  const cssLength = (
    key: string
  ): string | number | undefined => {
    const value = values[key];

    if (typeof value === "number") return value;

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    return undefined;
  };

  const background =
    stringValue("backgroundColor") ??
    stringValue("background");

  if (background) {
    css.backgroundColor = background;
  }

  const color = stringValue("color");

  if (color) {
    css.color = color;
  }

  const borderColor = stringValue("borderColor");

  if (borderColor) {
    css.borderColor = borderColor;
    css.borderStyle = "solid";
  }

  const borderWidth = cssLength("borderWidth");

  if (borderWidth !== undefined) {
    css.borderWidth = borderWidth;
    css.borderStyle = "solid";
  }

  const borderStyle = stringValue("borderStyle");

  if (
    borderStyle === "solid" ||
    borderStyle === "dashed" ||
    borderStyle === "dotted" ||
    borderStyle === "double" ||
    borderStyle === "none"
  ) {
    css.borderStyle = borderStyle;
  }

  const borderRadius = cssLength("borderRadius");

  if (borderRadius !== undefined) {
    css.borderRadius = borderRadius;
  }

  const padding = cssLength("padding");

  if (padding !== undefined) {
    css.padding = padding;
  }

  const opacity = values.opacity;

  if (
    typeof opacity === "number" &&
    Number.isFinite(opacity)
  ) {
    css.opacity = opacity;
  }

  const boxShadow = stringValue("boxShadow");

  if (boxShadow) {
    css.boxShadow = boxShadow;
  }

  return css;
}

export default function ProgressTrackerBlock({
  block,
  micrositeId,
  previewMode = false,
  isBuilder = false,
}: Props) {
  const persistenceEnabled =
    Boolean(micrositeId) &&
    !previewMode &&
    !isBuilder;

  const {
    title,
    titleStyle,
    imageUrl,
    showImage,
    showHistory,
    measurements,
    rows,
  } = block.data;

  const [session, setSession] =
    useState<SessionState>(emptySession);

  const [targets, setTargets] =
    useState<TargetValues>({});

  const [sessionNumber, setSessionNumber] = useState(1);

  const [updatedAt, setUpdatedAt] = useState("");

  const [history, setHistory] =
    useState<HistoryEntry[]>([]);

  const [historyExpanded, setHistoryExpanded] =
    useState(false);

  const [status, setStatus] =
    useState<SaveStatus>(
      persistenceEnabled ? "loading" : "saved"
    );

  const [errorMessage, setErrorMessage] = useState("");

  const [completing, setCompleting] = useState(false);

  const [previewCompleted, setPreviewCompleted] =
    useState(false);

  const [ready, setReady] = useState(!persistenceEnabled);

  const sessionRef = useRef(session);
  const updatedAtRef = useRef(updatedAt);
  const sessionNumberRef = useRef(sessionNumber);

  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const completingRef = useRef(false);
  const versionRef = useRef(0);
  const loadedRef = useRef(false);
  const conflictRef = useRef(false);
  const completionKeyRef = useRef<string | null>(null);

  const mountedRef = useRef(true);

  const requestContextRef = useRef({
    micrositeId,
    blockId: block.id,
  });

  const visibleMeasurements = useMemo(
    () =>
      measurements.filter(
        (measurement) => measurement.visible
      ),
    [measurements]
  );

  const initialTargets = useMemo<TargetValues>(
    () =>
      Object.fromEntries(
        rows.map((row) => [
          row.id,
          { ...row.targets },
        ])
      ),
    [rows]
  );

  const completedCount = rows.filter(
    (row) => session.completedRows[row.id]
  ).length;

  const allRowsChecked =
    rows.length > 0 &&
    completedCount === rows.length;

  const completionPercent = rows.length
    ? Math.round((completedCount / rows.length) * 100)
    : 0;

  /*
   * TEXT FORMATTING
   */

  const titleCss: CSSProperties = {
    ...toTrackerTextCss(titleStyle),
    textAlign: titleStyle?.align || "left",
  };

  const rowLabelCss = toTrackerTextCss(
    block.data.rowLabelStyle
  );

  const measurementLabelCss = toTrackerTextCss(
    block.data.measurementLabelStyle
  );

  const targetLabelCss = toTrackerTextCss(
    block.data.targetLabelStyle
  );

  const actualLabelCss = toTrackerTextCss(
    block.data.actualLabelStyle
  );

  const sessionInfoCss = toTrackerTextCss(
    block.data.sessionInfoStyle
  );

  const completionStatusCss = toTrackerTextCss(
    block.data.completionStatusStyle
  );

  const buttonTextCss = toTrackerTextCss(
    block.data.buttonTextStyle
  );

  const historyTextCss = toTrackerTextCss(
    block.data.historyTextStyle
  );

  /*
   * APPEARANCE FORMATTING
   */

  const containerCss = toTrackerAppearanceCss(
    block.data.containerStyle
  );

  const rowCss = toTrackerAppearanceCss(
    block.data.rowStyle
  );

  const measurementFieldCss = toTrackerAppearanceCss(
    block.data.measurementFieldStyle
  );

  const targetFieldCss = toTrackerAppearanceCss(
    block.data.targetFieldStyle
  );

  const actualFieldCss = toTrackerAppearanceCss(
    block.data.actualFieldStyle
  );

  const progressIndicatorCss = toTrackerAppearanceCss(
    block.data.progressIndicatorStyle
  );

  const buttonCss = toTrackerAppearanceCss(
    block.data.buttonStyle
  );

  const historyContainerCss = toTrackerAppearanceCss(
    block.data.historyContainerStyle
  );

  /*
   * PERSISTENCE
   */

  const applyState = useCallback(
    (state: PersistedState) => {
      const nextSession: SessionState = {
        actuals: state.actuals ?? {},
        completedRows: state.completed_rows ?? {},
      };

      sessionRef.current = nextSession;
      updatedAtRef.current = state.updated_at;
      sessionNumberRef.current = state.session_number;

      setSession(nextSession);
      setTargets(state.current_targets ?? {});
      setSessionNumber(state.session_number);
      setUpdatedAt(state.updated_at);

      dirtyRef.current = false;
      conflictRef.current = false;
      loadedRef.current = true;

      setStatus("saved");
      setErrorMessage("");
    },
    []
  );

  const reload = useCallback(
    async (signal?: AbortSignal) => {
      if (!persistenceEnabled || !micrositeId) return;

      setReady(false);
      setStatus("loading");
      setErrorMessage("");

      const result = await apiRequest(
        "GET",
        micrositeId,
        block.id,
        undefined,
        signal
      );

      if (!result.state) {
        throw new Error(
          "Tracker state was not returned."
        );
      }

      if (signal?.aborted) return;

      applyState(result.state);
      setHistory(result.history ?? []);
      setReady(true);
      completionKeyRef.current = null;
    },
    [
      persistenceEnabled,
      micrositeId,
      block.id,
      applyState,
    ]
  );

  useEffect(() => {
    mountedRef.current = true;

    const controller = new AbortController();

    requestContextRef.current = {
      micrositeId,
      blockId: block.id,
    };

    dirtyRef.current = false;
    savingRef.current = false;
    completingRef.current = false;
    conflictRef.current = false;
    loadedRef.current = false;
    versionRef.current = 0;
    completionKeyRef.current = null;

    const initialSession = emptySession();

    sessionRef.current = initialSession;
    updatedAtRef.current = "";
    sessionNumberRef.current = 1;

    setSession(initialSession);
    setTargets(initialTargets);
    setSessionNumber(1);
    setUpdatedAt("");
    setHistory([]);
    setHistoryExpanded(false);
    setPreviewCompleted(false);
    setCompleting(false);
    setErrorMessage("");

    if (!persistenceEnabled) {
      loadedRef.current = true;
      setReady(true);
      setStatus("saved");
    } else {
      setReady(false);
      setStatus("loading");

      void reload(controller.signal).catch((error) => {
        if (controller.signal.aborted) return;

        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load tracker."
        );
      });
    }

    return () => {
      controller.abort();
      mountedRef.current = false;
    };
  }, [
    block.id,
    micrositeId,
    persistenceEnabled,
    initialTargets,
    reload,
  ]);

  function updateSession(
    updater: (previous: SessionState) => SessionState
  ) {
    if (
      !ready ||
      completingRef.current ||
      conflictRef.current
    ) {
      return;
    }

    const next = updater(sessionRef.current);

    sessionRef.current = next;
    versionRef.current += 1;

    setSession(next);
    setPreviewCompleted(false);

    if (persistenceEnabled) {
      dirtyRef.current = true;
      setStatus("unsaved");
    }
  }

  function updateActual(
    rowId: string,
    measurementId: string,
    value: string
  ) {
    updateSession((previous) => ({
      ...previous,
      completedRows: {
        ...previous.completedRows,
        [rowId]: false,
      },
      actuals: {
        ...previous.actuals,
        [rowId]: {
          ...(previous.actuals[rowId] ?? {}),
          [measurementId]: parseNumber(value),
        },
      },
    }));
  }

  function toggleRow(
    rowId: string,
    checked: boolean
  ) {
    updateSession((previous) => ({
      ...previous,
      completedRows: {
        ...previous.completedRows,
        [rowId]: checked,
      },
    }));
  }

  const saveProgress = useCallback(
    async (): Promise<boolean> => {
      if (
        !persistenceEnabled ||
        !micrositeId ||
        !loadedRef.current
      ) {
        return true;
      }

      if (conflictRef.current) return false;
      if (savingRef.current) return false;
      if (!dirtyRef.current) return true;

      savingRef.current = true;
      setStatus("saving");

      const snapshot = cloneSession(
        sessionRef.current
      );

      const snapshotVersion = versionRef.current;
      const revision = updatedAtRef.current;
      const currentSessionNumber =
        sessionNumberRef.current;

      try {
        const result = await apiRequest(
          "PATCH",
          micrositeId,
          block.id,
          {
            micrositeId,
            blockId: block.id,
            actuals: snapshot.actuals,
            completedRows: snapshot.completedRows,
            sessionNumber: currentSessionNumber,
            expectedUpdatedAt: revision,
          }
        );

        if (!result.state) {
          throw new Error(
            "Saved state was not returned."
          );
        }

        if (!mountedRef.current) return false;

        updatedAtRef.current =
          result.state.updated_at;

        setUpdatedAt(result.state.updated_at);

        if (
          versionRef.current === snapshotVersion
        ) {
          dirtyRef.current = false;
          setStatus("saved");
        } else {
          dirtyRef.current = true;
          setStatus("unsaved");
        }

        setErrorMessage("");
        return true;
      } catch (error) {
        if (!mountedRef.current) return false;

        const typedError = error as Error & {
          status?: number;
        };

        if (typedError.status === 409) {
          conflictRef.current = true;
          setStatus("conflict");
        } else {
          setStatus("error");
        }

        setErrorMessage(
          typedError.message ||
            "Unable to save tracker progress."
        );

        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [persistenceEnabled, micrositeId, block.id]
  );

  /*
   * AUTOMATIC SAVE
   */

  useEffect(() => {
    if (
      !persistenceEnabled ||
      !ready ||
      !dirtyRef.current ||
      completing
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!savingRef.current) {
        void saveProgress();
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    session,
    persistenceEnabled,
    ready,
    completing,
    saveProgress,
  ]);

  /*
   * SESSION COMPLETION
   */

  async function completeSession() {
    if (
      !ready ||
      !allRowsChecked ||
      completingRef.current ||
      conflictRef.current
    ) {
      return;
    }

    if (!persistenceEnabled || !micrositeId) {
      setPreviewCompleted(true);
      return;
    }

    completingRef.current = true;
    setCompleting(true);

    try {
      while (savingRef.current) {
        await new Promise<void>((resolve) =>
          window.setTimeout(resolve, 50)
        );
      }

      if (dirtyRef.current) {
        const saved = await saveProgress();

        if (!saved) return;
      }

      while (dirtyRef.current) {
        const saved = await saveProgress();

        if (!saved) return;
      }

      if (!completionKeyRef.current) {
        completionKeyRef.current =
          crypto.randomUUID();
      }

      const result = await apiRequest(
        "POST",
        micrositeId,
        block.id,
        {
          micrositeId,
          blockId: block.id,
          completionKey: completionKeyRef.current,
          sessionNumber: sessionNumberRef.current,
          expectedUpdatedAt: updatedAtRef.current,
        }
      );

      if (!result.state) {
        throw new Error(
          "Completed state was not returned."
        );
      }

      if (!mountedRef.current) return;

      applyState(result.state);
      setHistory(result.history ?? []);
      setHistoryExpanded(true);
      completionKeyRef.current = null;
    } catch (error) {
      if (!mountedRef.current) return;

      const typedError = error as Error & {
        status?: number;
      };

      if (typedError.status === 409) {
        conflictRef.current = true;
        setStatus("conflict");
      } else {
        setStatus("error");
      }

      setErrorMessage(
        typedError.message ||
          "Unable to complete session."
      );
    } finally {
      completingRef.current = false;

      if (mountedRef.current) {
        setCompleting(false);
      }
    }
  }

  const editingDisabled =
    !ready ||
    completing ||
    conflictRef.current ||
    previewCompleted;

  const statusLabel: Record<SaveStatus, string> = {
    loading: "Loading progress...",
    saved: "All changes saved",
    saving: "Saving...",
    unsaved: "Unsaved changes",
    error: "Save failed",
    conflict: "Progress changed elsewhere",
  };

  /*
   * RENDER
   */

  return (
    <div
      className="w-full space-y-4 rounded-xl p-4"
      style={containerCss}
    >
      {/* TITLE */}

      <h3
        className="text-lg font-semibold"
        style={titleCss}
      >
        {title}
      </h3>

      {/* IMAGE */}

      {showImage && imageUrl && (
        <img
          src={imageUrl}
          alt={title || "Tracker image"}
          className="max-h-56 w-full rounded-lg object-contain"
        />
      )}

      {/* SESSION INFORMATION */}

      {persistenceEnabled && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 text-xs"
          style={sessionInfoCss}
          aria-live="polite"
        >
          <span>
            Session {sessionNumber}
          </span>

          <span
            className={
              status === "error" ||
              status === "conflict"
                ? "text-red-600"
                : "opacity-70"
            }
          >
            {statusLabel[status]}
          </span>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {errorMessage && (
        <div
          role="alert"
          className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{errorMessage}</p>

          {persistenceEnabled && (
            <button
              type="button"
              className="rounded border border-red-300 px-3 py-1 text-xs font-medium"
              style={{
                ...buttonCss,
                ...buttonTextCss,
              }}
              onClick={() => {
                if (
                  savingRef.current ||
                  completingRef.current
                ) {
                  return;
                }

                void reload().catch((error) => {
                  setStatus("error");

                  setErrorMessage(
                    error instanceof Error
                      ? error.message
                      : "Unable to reload progress."
                  );
                });
              }}
            >
              Reload saved progress
            </button>
          )}
        </div>
      )}

      {/* TRACKER TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">
                ROW
              </th>

              {visibleMeasurements.map(
                (measurement) => (
                  <th
                    key={measurement.id}
                    className="p-2 text-center"
                    style={measurementFieldCss}
                  >
                    <div
                      style={measurementLabelCss}
                    >
                      {measurement.label}
                    </div>

                    {measurement.unit && (
                      <div
                        className="text-xs font-normal opacity-70"
                        style={measurementLabelCss}
                      >
                        {measurement.unit}
                      </div>
                    )}

                    {measurement.targetEnabled &&
                      measurement.actualEnabled && (
                        <div className="text-xs font-normal opacity-70">
                          <span
                            style={targetLabelCss}
                          >
                            Target
                          </span>

                          {" / "}

                          <span
                            style={actualLabelCss}
                          >
                            Actual
                          </span>
                        </div>
                      )}
                  </th>
                )
              )}

              <th className="p-2 text-center">
                ✓
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const checked = Boolean(
                session.completedRows[row.id]
              );

              return (
                <tr
                  key={row.id}
                  className={`border-b ${
                    checked
                      ? "bg-green-50/50"
                      : ""
                  }`}
                  style={rowCss}
                >
                  {/* ROW LABEL */}

                  <td
                    className="p-2 font-medium"
                    style={rowLabelCss}
                  >
                    {row.label}
                  </td>

                  {/* MEASUREMENT CELLS */}

                  {visibleMeasurements.map(
                    (measurement) => {
                      const target =
                        targets[row.id]?.[
                          measurement.id
                        ] ??
                        row.targets[
                          measurement.id
                        ];

                      const savedActual =
                        session.actuals[row.id]?.[
                          measurement.id
                        ];

                      const actual =
                        savedActual !== undefined
                          ? savedActual
                          : measurement.presetValues !==
                                false &&
                              measurement.targetEnabled &&
                              measurement.actualEnabled
                            ? target
                            : null;

                      return (
                        <td
                          key={measurement.id}
                          className="p-2 text-center"
                          style={measurementFieldCss}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {/* TARGET VALUE */}

                            {measurement.targetEnabled && (
                              <span
                                className="text-xs opacity-70"
                                style={{
                                  ...targetFieldCss,
                                  ...targetLabelCss,
                                }}
                              >
                                {target ?? "—"}
                              </span>
                            )}

                            {/* ACTUAL INPUT */}

                            {measurement.actualEnabled && (
                              <input
                                type="number"
                                step="any"
                                inputMode="decimal"
                                aria-label={`${row.label} ${measurement.label} actual`}
                                className="w-20 max-w-full rounded border px-2 py-1 text-center text-sm"
                                style={{
                                  ...actualFieldCss,
                                  ...actualLabelCss,
                                }}
                                value={actual ?? ""}
                                disabled={
                                  editingDisabled
                                }
                                onChange={(event) =>
                                  updateActual(
                                    row.id,
                                    measurement.id,
                                    event.target.value
                                  )
                                }
                              />
                            )}
                          </div>
                        </td>
                      );
                    }
                  )}

                  {/* COMPLETION CHECKBOX */}

<td className="p-2 text-center align-bottom">
  <div className="flex h-[34px] items-center justify-center">
    <input
      type="checkbox"
      aria-label={`Complete ${row.label}`}
      className="h-[30px] w-[30px] cursor-pointer accent-green-600"
      checked={checked}
      disabled={editingDisabled}
      onChange={(event) =>
        toggleRow(
          row.id,
          event.target.checked
        )
      }
    />
  </div>
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* COMPLETION PROGRESS */}

      <div className="space-y-3">
        <div
          className="flex items-center justify-between text-xs"
          style={completionStatusCss}
        >
          <span>
            {completedCount} of {rows.length} rows
            complete
          </span>

          <span>
            {completionPercent}%
          </span>
        </div>

        <div
          className="h-2 overflow-hidden rounded-full bg-gray-200"
          style={progressIndicatorCss}
        >
          <div
            className="h-full bg-green-600 transition-all"
            style={{
              width: `${completionPercent}%`,
            }}
          />
        </div>

        {/* COMPLETE SESSION BUTTON */}

        <button
          type="button"
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            ...buttonCss,
            ...buttonTextCss,
          }}
          disabled={
            !allRowsChecked ||
            editingDisabled ||
            completing ||
            (persistenceEnabled &&
              status === "loading")
          }
          onClick={() =>
            void completeSession()
          }
        >
          {completing
            ? "Completing session..."
            : previewCompleted
              ? "Session Completed ✓"
              : "Complete Session"}
        </button>
      </div>

      {/* HISTORY */}

      {showHistory && (
        <div
          className="border-t pt-3"
          style={historyContainerCss}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between text-left text-sm font-semibold"
            style={historyTextCss}
            onClick={() =>
              setHistoryExpanded(
                (previous) => !previous
              )
            }
            aria-expanded={historyExpanded}
          >
            <span>
              Session History
              {persistenceEnabled
                ? ` (${history.length})`
                : ""}
            </span>

            <span aria-hidden="true">
              {historyExpanded
                ? "−"
                : "+"}
            </span>
          </button>

          {historyExpanded && (
            <div
              className="mt-3 space-y-3"
              style={historyTextCss}
            >
              {history.length === 0 ? (
                <p className="text-xs opacity-60">
                  No completed sessions yet.
                </p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                      <span>
                        Session{" "}
                        {entry.session_number}
                      </span>

                      <span className="font-normal opacity-70">
                        {formatDate(
                          entry.completed_at
                        )}
                      </span>
                    </div>

                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th
                              className="p-1 text-left"
                              style={rowLabelCss}
                            >
                              Row
                            </th>

                            {(
                              entry.snapshot
                                .measurements ?? []
                            )
                              .filter(
                                (measurement) =>
                                  measurement.targetEnabled ||
                                  measurement.actualEnabled
                              )
                              .map(
                                (measurement) => (
                                  <th
                                    key={
                                      measurement.id
                                    }
                                    className="p-1 text-center"
                                    style={
                                      measurementLabelCss
                                    }
                                  >
                                    {
                                      measurement.label
                                    }
                                  </th>
                                )
                              )}
                          </tr>
                        </thead>

                        <tbody>
                          {(
                            entry.snapshot.rows ??
                            []
                          ).map((row) => (
                            <tr
                              key={row.id}
                              className="border-b"
                              style={rowCss}
                            >
                              <td
                                className="p-1"
                                style={rowLabelCss}
                              >
                                {row.label}
                              </td>

                              {(
                                entry.snapshot
                                  .measurements ??
                                []
                              )
                                .filter(
                                  (measurement) =>
                                    measurement.targetEnabled ||
                                    measurement.actualEnabled
                                )
                                .map(
                                  (measurement) => {
                                    const target =
                                      entry.snapshot
                                        .targets?.[
                                        row.id
                                      ]?.[
                                        measurement.id
                                      ];

                                    const actual =
                                      entry.snapshot
                                        .actuals?.[
                                        row.id
                                      ]?.[
                                        measurement.id
                                      ];

                                    return (
                                      <td
                                        key={
                                          measurement.id
                                        }
                                        className="p-1 text-center"
                                        style={
                                          measurementFieldCss
                                        }
                                      >
                                        {measurement.targetEnabled && (
                                          <span
                                            className="opacity-60"
                                            style={{
                                              ...targetFieldCss,
                                              ...targetLabelCss,
                                            }}
                                          >
                                            {target ??
                                              "—"}
                                          </span>
                                        )}

                                        {measurement.targetEnabled &&
                                          measurement.actualEnabled &&
                                          " / "}

                                        {measurement.actualEnabled && (
                                          <span
                                            style={{
                                              ...actualFieldCss,
                                              ...actualLabelCss,
                                            }}
                                          >
                                            {actual ??
                                              "—"}
                                          </span>
                                        )}
                                      </td>
                                    );
                                  }
                                )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
