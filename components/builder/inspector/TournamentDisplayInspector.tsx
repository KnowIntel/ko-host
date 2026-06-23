"use client";

import type { Dispatch, SetStateAction } from "react";

/**
 * Tournament Display inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "tournament_display"
 */
type TournamentDisplayStyleTarget =
  | "background"
  | "tournamentName"
  | "season"
  | "leftDivisionLabel"
  | "rightDivisionLabel"
  | "teamNames"
  | "record"
  | "score"
  | "status"
  | "finalsLabel"
  | "champion";

type TournamentDisplayInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  tournamentDisplayStyleTarget: TournamentDisplayStyleTarget;
  setTournamentDisplayStyleTarget: Dispatch<
    SetStateAction<TournamentDisplayStyleTarget>
  >;

  makeClientId: (prefix: string) => string;

  uploadImageToSelectedBlock: (...args: any[]) => Promise<any> | void;

  syncTournamentMatchesFromTeams: (teams: any[], matches: any[]) => any[];
  advanceTournamentWinners: (matches: any[]) => any[];

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;

  toolSetButtonClass: (position?: any) => string;
};

export function TournamentDisplayInspector({
  selectedBlock,
  updateSelectedBlock,
  tournamentDisplayStyleTarget,
  setTournamentDisplayStyleTarget,
  makeClientId,
  uploadImageToSelectedBlock,
  syncTournamentMatchesFromTeams,
  advanceTournamentWinners,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  toolSetButtonClass,
}: TournamentDisplayInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Tournament Display */}
    <div className={inspectorLabelClass()}>Tournament Display</div>

    <div className="mt-4">
  <div className={inspectorLabelClass()}>Style Target</div>

  <select
    value={tournamentDisplayStyleTarget}
    onChange={(e) =>
      setTournamentDisplayStyleTarget(
        e.target.value as
          | "background"
          | "tournamentName"
          | "season"
          | "leftDivisionLabel"
          | "rightDivisionLabel"
          | "teamNames"
          | "record"
          | "score"
          | "status"
          | "finalsLabel"
          | "champion",
      )
    }
    className={inspectorInputClass()}
  >
    <option value="background">Background</option>
    <option value="tournamentName">Tournament Name</option>
    <option value="season">Season</option>
    <option value="leftDivisionLabel">Left Division Label</option>
    <option value="rightDivisionLabel">Right Division Label</option>
    <option value="teamNames">Team Names</option>
    <option value="record">Record</option>
    <option value="score">Score</option>
    <option value="status">Status</option>
    <option value="finalsLabel">Finals Label</option>
    <option value="champion">Champion</option>
  </select>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Tournament Name</div>
      <input
        type="text"
        value={selectedBlock.data.tournamentName ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "tournament_display"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    tournamentName: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <div className={inspectorLabelClass()}>Season</div>
        <input
          type="text"
          value={selectedBlock.data.season ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "tournament_display"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      season: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div>
        <div className={inspectorLabelClass()}>Year</div>
        <input
          type="text"
          value={selectedBlock.data.year ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "tournament_display"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      year: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Display Mode</div>
      <select
        value={selectedBlock.data.displayMode ?? "bracket"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "tournament_display"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    displayMode: e.target.value as any,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="bracket">Bracket</option>
        <option value="standings">Standings</option>
        <option value="matchups">Matchups</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Bracket Layout</div>

      <select
        value={selectedBlock.data.bracketLayout ?? "single_elimination"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "tournament_display"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    bracketLayout: e.target.value as any,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="single_elimination">Single Elimination</option>
        <option value="double_elimination">Double Elimination</option>
        <option value="east_west">East / West</option>
        <option value="custom">Custom</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Design Style</div>

      <select
        value={(selectedBlock.data as any).designStyle ?? "style1"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "tournament_display"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    designStyle: e.target.value as "style1" | "style2" | "style3",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="style1">Style 1</option>
        <option value="style2">Style 2</option>
        <option value="style3">Style 3</option>
      </select>
    </div>

    <div className="mt-4">
  <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={Boolean((selectedBlock.data as any).autoGenerateBracket ?? true)}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  autoGenerateBracket: e.target.checked,
                },
              },
        )
      }
    />
    Auto-generate bracket from teams and seeds
  </label>
</div>

    {(selectedBlock.data.bracketLayout ?? "") === "east_west" ? (
      <div className="mt-4 space-y-3">
        <div>
          <div className={inspectorLabelClass()}>Left Division Label</div>
          <input
            type="text"
            value={selectedBlock.data.leftDivisionLabel ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        leftDivisionLabel: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Right Division Label</div>
          <input
            type="text"
            value={selectedBlock.data.rightDivisionLabel ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        rightDivisionLabel: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Finals Label</div>
          <input
            type="text"
            value={selectedBlock.data.finalsLabel ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        finalsLabel: e.target.value,
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>
        
        
<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className="text-sm font-semibold text-neutral-700">
    Display Options
  </div>

  {[
    ["leftDivision", "leftDivisionDisplayType", "Left Division"],
    ["rightDivision", "rightDivisionDisplayType", "Right Division"],
    ["championship", "championshipDisplayType", "Championship"],
  ].map(([target, key, label]) => (
    <div key={key} className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
      <div className={inspectorLabelClass()}>{label}</div>

      <select
        value={(selectedBlock.data as any)[key] ?? "text"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "tournament_display"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: e.target.value as "text" | "image",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="text">Text Label</option>
        <option value="image">Image / Frame</option>
      </select>

      {((selectedBlock.data as any)[key] ?? "text") === "image" ? (
        <div className="mt-3">
          {(selectedBlock.data as any)[`${target}ImageUrl`] ? (
            <img
              src={(selectedBlock.data as any)[`${target}ImageUrl`]}
              alt={`${label} image`}
              className="mb-3 h-16 w-full rounded-lg border border-neutral-200 bg-neutral-100 object-cover"
            />
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50"
              onClick={() =>
                void uploadImageToSelectedBlock(
                  selectedBlock.id,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  target,
                )
              }
            >
              Choose Image
            </button>

            {(selectedBlock.data as any)[`${target}ImageUrl`] ? (
              <button
                type="button"
                className="flex-1 inline-flex h-10 items-center justify-center rounded-xl border border-red-300 bg-red-50 px-3 text-sm font-medium text-red-600 hover:bg-red-100"
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "tournament_display"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            [`${target}ImageUrl`]: undefined,
                            [`${target}ImageStoragePath`]: undefined,
                            [`${target}ImageAlt`]: undefined,
                          },
                        },
                  )
                }
              >
                Remove
              </button>
            ) : null}
          </div>

          {target === "leftDivision" ? (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className={inspectorLabelClass()}>Horizontal Position</div>
                <div className="text-xs text-neutral-500">
                  {(selectedBlock.data as any).leftDivisionImageOffsetX ?? 0}px
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={220}
                value={(selectedBlock.data as any).leftDivisionImageOffsetX ?? 0}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "tournament_display"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            leftDivisionImageOffsetX: Number(e.target.value),
                          },
                        },
                  )
                }
                className="mt-2 w-full"
              />
            </div>
          ) : null}

          {target === "rightDivision" ? (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className={inspectorLabelClass()}>Horizontal Position</div>
                <div className="text-xs text-neutral-500">
                  {(selectedBlock.data as any).rightDivisionImageOffsetX ?? 0}px
                </div>
              </div>

              <input
                type="range"
                min={-220}
                max={0}
                value={(selectedBlock.data as any).rightDivisionImageOffsetX ?? 0}
                onChange={(e) =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "tournament_display"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            rightDivisionImageOffsetX: Number(e.target.value),
                          },
                        },
                  )
                }
                className="mt-2 w-full"
              />
            </div>
          ) : null}

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className={inspectorLabelClass()}>Image Size</div>
              <div className="text-xs text-neutral-500">
                {(selectedBlock.data as any)[`${target}ImageSize`] ?? 220}px
              </div>
            </div>

            <input
              type="range"
              min={60}
              max={420}
              value={(selectedBlock.data as any)[`${target}ImageSize`] ?? 220}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "tournament_display"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          [`${target}ImageSize`]: Number(e.target.value),
                        },
                      },
                )
              }
              className="mt-2 w-full"
            />
          </div>
        </div>
      ) : null}
    </div>
  ))}
</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className="text-sm font-semibold text-neutral-700">
    Champion Showcase
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Title</div>
    <input
      type="text"
      value={(selectedBlock.data as any).championTitle ?? selectedBlock.data.year ?? "2026"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  championTitle: e.target.value,
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Subtitle</div>
    <input
      type="text"
      value={(selectedBlock.data as any).championSubtitle ?? "NBA Champions"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  championSubtitle: e.target.value,
                },
              },
        )
      }
      className={inspectorInputClass()}
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Background Image</div>

    {(selectedBlock.data as any).championOverlayImageUrl ? (
      <img
        src={(selectedBlock.data as any).championOverlayImageUrl}
        alt="Champion showcase background"
        className="mb-3 h-20 w-full rounded-lg border border-neutral-200 bg-neutral-100 object-cover"
      />
    ) : null}

    <div className="flex gap-2">
      <button
        type="button"
        className="flex-1 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={() =>
          void uploadImageToSelectedBlock(
            selectedBlock.id,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            "championOverlay",
          )
        }
      >
        Choose Image
      </button>

      {(selectedBlock.data as any).championOverlayImageUrl ? (
        <button
          type="button"
          className="flex-1 inline-flex h-10 items-center justify-center rounded-xl border border-red-300 bg-red-50 px-3 text-sm font-medium text-red-600 hover:bg-red-100"
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "tournament_display"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      championOverlayImageUrl: undefined,
                      championOverlayImageStoragePath: undefined,
                      championOverlayImageAlt: undefined,
                    },
                  },
            )
          }
        >
          Remove
        </button>
      ) : null}
    </div>
  </div>

  <div className="mt-3">
    <div className="flex items-center justify-between">
      <div className={inspectorLabelClass()}>Image Opacity</div>
      <div className="text-xs text-neutral-500">
        {Math.round(((selectedBlock.data as any).championOverlayOpacity ?? 0.25) * 100)}%
      </div>
    </div>

    <input
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={(selectedBlock.data as any).championOverlayOpacity ?? 0.25}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  championOverlayOpacity: Number(e.target.value),
                },
              },
        )
      }
      className="mt-2 w-full"
    />
  </div>
  <div className="mt-3">
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Champion Logo Size</div>
    <div className="text-xs text-neutral-500">
      {(selectedBlock.data as any).championLogoSize ?? 224}px
    </div>
  </div>

  <input
    type="range"
    min={80}
    max={360}
    value={(selectedBlock.data as any).championLogoSize ?? 224}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                championLogoSize: Number(e.target.value),
              },
            },
      )
    }
    className="mt-2 w-full"
  />
</div>
</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className="text-sm font-semibold text-neutral-700">
    Block Position
  </div>

  <div className="mt-3">
    <div className="flex items-center justify-between">
      <div className={inspectorLabelClass()}>Horizontal Position</div>
      <div className="text-xs text-neutral-500">
        {(selectedBlock.data as any).contentOffsetX ?? 0}px
      </div>
    </div>

    <input
      type="range"
      min={-300}
      max={300}
      value={(selectedBlock.data as any).contentOffsetX ?? 0}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  contentOffsetX: Number(e.target.value),
                },
              },
        )
      }
      className="mt-2 w-full"
    />
  </div>

  <div className="mt-3">
    <div className="flex items-center justify-between">
      <div className={inspectorLabelClass()}>Vertical Position</div>
      <div className="text-xs text-neutral-500">
        {(selectedBlock.data as any).contentOffsetY ?? 0}px
      </div>
    </div>

    <input
      type="range"
      min={-300}
      max={300}
      value={(selectedBlock.data as any).contentOffsetY ?? 0}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  contentOffsetY: Number(e.target.value),
                },
              },
        )
      }
      className="mt-2 w-full"
    />
  </div>
</div>

      </div>
    ) : null}

    <div className="mt-4 grid grid-cols-2 gap-2">
{[
  ["showScores", "Scores"],
  ["showSeeds", "Seeds"],
  ["showRecords", "Records"],
  ["showStatusBadges", "Status"],
  ["showLeftDivisionLabel", "Left Division"],
  ["showRightDivisionLabel", "Right Division"],
  ["showSeasonYear", "Season / Year"],
  ["showTournamentName", "Tournament"],
].map(([key, label]) => (
        <label
          key={key}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
        >
          <input
            type="checkbox"
            checked={Boolean((selectedBlock.data as any)[key])}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        [key]: e.target.checked,
                      },
                    },
              )
            }
          />
          {label}
        </label>
      ))}
    </div>

<div className="mt-4">
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Logo Size</div>
    <div className="text-xs text-neutral-500">
      {(selectedBlock.data as any).logoSize ?? 32}px
    </div>
  </div>

  <input
    type="range"
    min={16}
    max={72}
    value={(selectedBlock.data as any).logoSize ?? 32}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                logoSize: Number(e.target.value),
              },
            },
      )
    }
    className="mt-2 w-full"
  />
</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className="text-sm font-semibold text-neutral-700">
    Matchup Column Widths
  </div>

  {[
    ["round1CardWidth", "1st Round Playoffs", 220],
    ["round2CardWidth", "Semi-Finals", 220],
    ["conferenceFinalCardWidth", "Conference Finals", 220],
    ["nbaFinalCardWidth", "NBA Finals", 260],
  ].map(([key, label, fallback]) => (
    <div key={key} className="mt-3">
      <div className="flex items-center justify-between">
        <div className={inspectorLabelClass()}>{label}</div>
        <div className="text-xs text-neutral-500">
          {(selectedBlock.data as any)[key] ?? fallback}px
        </div>
      </div>

      <input
        type="range"
        min={140}
        max={340}
        value={(selectedBlock.data as any)[key] ?? fallback}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "tournament_display"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    [key]: Number(e.target.value),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
    </div>
  ))}
</div>

<div className="mt-4">
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Column Spacing</div>
    <div className="text-xs text-neutral-500">
      {(selectedBlock.data as any).bracketColumnSpacing ?? 54}px
    </div>
  </div>

  <input
    type="range"
    min={12}
    max={110}
    value={(selectedBlock.data as any).bracketColumnSpacing ?? 54}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                bracketColumnSpacing: Number(e.target.value),
              },
            },
      )
    }
    className="mt-2 w-full"
  />
</div>


<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <label className="flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={Boolean((selectedBlock.data as any).matchCardShadowEnabled)}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  matchCardShadowEnabled: e.target.checked,
                },
              },
        )
      }
    />
    Matchup card shadow
  </label>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Shadow Blur</div>
    <input
      type="range"
      min={0}
      max={40}
      value={(selectedBlock.data as any).matchCardShadowBlur ?? 16}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  matchCardShadowBlur: Number(e.target.value),
                },
              },
        )
      }
      className="mt-2 w-full"
    />
  </div>

  <div className="mt-3 grid grid-cols-2 gap-2">
    <div>
      <div className={inspectorLabelClass()}>Shadow X</div>
      <input
        type="range"
        min={-30}
        max={30}
        value={(selectedBlock.data as any).matchCardShadowX ?? 0}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "tournament_display"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    matchCardShadowX: Number(e.target.value),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
    </div>

    <div>
      <div className={inspectorLabelClass()}>Shadow Y</div>
      <input
        type="range"
        min={-30}
        max={30}
        value={(selectedBlock.data as any).matchCardShadowY ?? 8}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "tournament_display"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    matchCardShadowY: Number(e.target.value),
                  },
                },
          )
        }
        className="mt-2 w-full"
      />
    </div>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Shadow Direction</div>
    <select
      value={(selectedBlock.data as any).matchCardShadowDirection ?? "down"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  matchCardShadowDirection: e.target.value as any,
                },
              },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="down">Down</option>
      <option value="up">Up</option>
      <option value="left">Left</option>
      <option value="right">Right</option>
      <option value="custom">Custom X/Y</option>
    </select>
  </div>
</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <label className="flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={Boolean((selectedBlock.data as any).matchCardBorderEnabled ?? true)}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  matchCardBorderEnabled: e.target.checked,
                },
              },
        )
      }
    />
    Matchup card border
  </label>

  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className="text-sm font-semibold text-neutral-700">
    Score Display
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>West Division Color</div>
    <input
      type="color"
      value={(selectedBlock.data as any).westScoreColor ?? "#34d399"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  westScoreColor: e.target.value,
                },
              },
        )
      }
      className="mt-2 h-10 w-full"
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>East Division Color</div>
    <input
      type="color"
      value={(selectedBlock.data as any).eastScoreColor ?? "#34d399"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  eastScoreColor: e.target.value,
                },
              },
        )
      }
      className="mt-2 h-10 w-full"
    />
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Score Frame</div>
    <select
      value={(selectedBlock.data as any).scoreFrameShape ?? "rectangle"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  scoreFrameShape: e.target.value as
                    | "circle"
                    | "rectangle"
                    | "square",
                },
              },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="circle">Circle</option>
      <option value="rectangle">Rectangle</option>
      <option value="square">Square</option>
    </select>
  </div>
</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Border Color</div>
    <input
      type="color"
      value={(selectedBlock.data as any).matchCardBorderColor ?? "#ffffff"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  matchCardBorderColor: e.target.value,
                },
              },
        )
      }
      className="mt-2 h-10 w-full"
    />
  </div>

  <div className="mt-3">
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>Card Radius</div>
    <div className="text-xs text-neutral-500">
      {(selectedBlock.data as any).matchCardRadius ?? 16}px
    </div>
  </div>

  <input
    type="range"
    min={0}
    max={40}
    value={(selectedBlock.data as any).matchCardRadius ?? 16}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                matchCardRadius: Number(e.target.value),
              },
            },
      )
    }
    className="mt-2 w-full"
  />
</div>

<div className="mt-3">
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>
      Horizontal Padding
    </div>

    <div className="text-xs text-neutral-500">
      {(selectedBlock.data as any).matchCardPaddingX ?? 12}px
    </div>
  </div>

  <input
    type="range"
    min={0}
    max={40}
    value={(selectedBlock.data as any).matchCardPaddingX ?? 12}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                matchCardPaddingX: Number(e.target.value),
              },
            },
      )
    }
    className="mt-2 w-full"
  />
</div>

<div className="mt-3">
  <div className="flex items-center justify-between">
    <div className={inspectorLabelClass()}>
      Vertical Padding
    </div>

    <div className="text-xs text-neutral-500">
      {(selectedBlock.data as any).matchCardPaddingY ?? 10}px
    </div>
  </div>

  <input
    type="range"
    min={0}
    max={40}
    value={(selectedBlock.data as any).matchCardPaddingY ?? 10}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                matchCardPaddingY: Number(e.target.value),
              },
            },
      )
    }
    className="mt-2 w-full"
  />
</div>
</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <label className="flex items-center gap-2 text-sm text-neutral-700">
    <input
      type="checkbox"
      checked={Boolean((selectedBlock.data as any).connectorLinesEnabled ?? true)}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  connectorLinesEnabled: e.target.checked,
                },
              },
        )
      }
    />
    Match connector lines
  </label>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Connector Color</div>
    <input
      type="color"
      value={(selectedBlock.data as any).connectorLineColor ?? "#ffffff"}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  connectorLineColor: e.target.value,
                },
              },
        )
      }
      className="mt-2 h-10 w-full"
    />
  </div>

  <div className="mt-3">
    <div className="flex items-center justify-between">
      <div className={inspectorLabelClass()}>Connector Thickness</div>
      <div className="text-xs text-neutral-500">
        {(selectedBlock.data as any).connectorLineThickness ?? 2}px
      </div>
    </div>

    <input
      type="range"
      min={1}
      max={8}
      value={(selectedBlock.data as any).connectorLineThickness ?? 2}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  connectorLineThickness: Number(e.target.value),
                },
              },
        )
      }
      className="mt-2 w-full"
    />
  </div>
</div>

    <div className="mt-4">
  <div className={inspectorLabelClass()}>Empty State Text</div>

  <input
    type="text"
    value={selectedBlock.data.emptyStateText ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                emptyStateText: e.target.value,
              },
            },
      )
    }
    className={inspectorInputClass()}
  />
</div>

    <div className="mt-5">
      <div className={inspectorLabelClass()}>Teams</div>

      <div className="mt-3 space-y-3">
        {selectedBlock.data.teams.map((team: any) => (
          <details
            key={team.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
<summary className="cursor-pointer list-none">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="truncate text-sm font-semibold text-neutral-800">
        {team.name || "Team"}
      </div>
      <div className="text-xs text-neutral-500">
        Seed {team.seed ?? "-"} • {team.record || "0-0"}
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-2">
      {team.imageUrl ? (
        <img
          src={team.imageUrl}
          alt={team.name || "Team logo"}
          className="h-10 w-10 rounded-lg border border-neutral-200 bg-white object-cover"
        />
      ) : null}

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          updateSelectedBlock((block: any) => {
            if (block.type !== "tournament_display") return block;

            const index = block.data.teams.findIndex(
              (entry: any) => entry.id === team.id,
            );

            if (index <= 0) return block;

            const teams = [...block.data.teams];

            [teams[index - 1], teams[index]] = [
              teams[index],
              teams[index - 1],
            ];

            return {
              ...block,
              data: {
                ...block.data,
                teams,
                matches: syncTournamentMatchesFromTeams(
                  teams,
                  block.data.matches,
                ),
              },
            };
          });
        }}
      >
        ▲
      </button>

      <button
        type="button"
        className={toolSetButtonClass("front")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          updateSelectedBlock((block: any) => {
            if (block.type !== "tournament_display") return block;

            const index = block.data.teams.findIndex(
              (entry: any) => entry.id === team.id,
            );

            if (index >= block.data.teams.length - 1) return block;

            const teams = [...block.data.teams];

            [teams[index], teams[index + 1]] = [
              teams[index + 1],
              teams[index],
            ];

            return {
              ...block,
              data: {
                ...block.data,
                teams,
                matches: syncTournamentMatchesFromTeams(
                  teams,
                  block.data.matches,
                ),
              },
            };
          });
        }}
      >
        ▼
      </button>
    </div>
  </div>
</summary>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Team Name</div>
  <input
    type="text"
    value={team.name}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                teams: block.data.teams.map((entry: any) =>
                  entry.id === team.id
                    ? { ...entry, name: e.target.value }
                    : entry,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
  />
</div>

<button
  type="button"
  className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50"
  onClick={() =>
    void uploadImageToSelectedBlock(
      selectedBlock.id,
      undefined,
      undefined,
      undefined,
      undefined,
      team.id,
    )
  }
>
  Browse Team Logo
</button>

<div className="mt-3">
  <div className={inspectorLabelClass()}>Division</div>

  <select
    value={(team as any).division ?? "west"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "tournament_display"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                teams: block.data.teams.map((entry: any) =>
                  entry.id === team.id
                    ? {
                        ...entry,
                        division: e.target.value as "west" | "east",
                      }
                    : entry,
                ),
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="west">West</option>
    <option value="east">East</option>
  </select>
</div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <div className={inspectorLabelClass()}>Seed</div>
                <input
                  type="number"
                  value={team.seed ?? 0}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "tournament_display"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              teams: block.data.teams.map((entry: any) =>
                                entry.id === team.id
                                  ? {
                                      ...entry,
                                      seed: Number(e.target.value),
                                    }
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
                <div className={inspectorLabelClass()}>Record</div>
                <input
                  type="text"
                  value={team.record ?? ""}
                  onChange={(e) =>
                    updateSelectedBlock((block: any) =>
                      block.type !== "tournament_display"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              teams: block.data.teams.map((entry: any) =>
                                entry.id === team.id
                                  ? { ...entry, record: e.target.value }
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

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "tournament_display") return block;

                    const index = block.data.teams.findIndex(
                      (entry: any) => entry.id === team.id,
                    );

                    if (index <= 0) return block;

                    const teams = [...block.data.teams];

                    [teams[index - 1], teams[index]] = [
                      teams[index],
                      teams[index - 1],
                    ];

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        teams,
                        matches: syncTournamentMatchesFromTeams(
                          teams,
                          block.data.matches,
                        ),
                      },
                    };
                  })
                }
              >
                ▲
              </button>

              <button
                type="button"
                className={toolSetButtonClass("front")}
                onClick={() =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "tournament_display") return block;

                    const index = block.data.teams.findIndex(
                      (entry: any) => entry.id === team.id,
                    );

                    if (index >= block.data.teams.length - 1) return block;

                    const teams = [...block.data.teams];

                    [teams[index], teams[index + 1]] = [
                      teams[index + 1],
                      teams[index],
                    ];

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        teams,
                        matches: syncTournamentMatchesFromTeams(
                          teams,
                          block.data.matches,
                        ),
                      },
                    };
                  })
                }
              >
                ▼
              </button>

              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block: any) => {
                    if (block.type !== "tournament_display") return block;

                    const teams = block.data.teams.filter(
                      (entry: any) => entry.id !== team.id,
                    );

                    return {
                      ...block,
                      data: {
                        ...block.data,
                        teams,
                        matches: syncTournamentMatchesFromTeams(
                          teams,
                          block.data.matches,
                        ),
                      },
                    };
                  })
                }
              >
                ×
              </button>
            </div>
          </details>
        ))}

        <button
          type="button"
          className={toolSetButtonClass("front")}
          onClick={() =>
            updateSelectedBlock((block: any) => {
              if (block.type !== "tournament_display") return block;

              const newTeam = {
                id: makeClientId("team"),
                name: "New Team",
                division: "west" as "west" | "east",
                seed: block.data.teams.length + 1,
                record: "0-0",
              };

              const teams = [...block.data.teams, newTeam];

              return {
                ...block,
                data: {
                  ...block.data,
                  teams,
                  matches: syncTournamentMatchesFromTeams(
                    teams,
                    block.data.matches,
                  ),
                },
              };
            })
          }
        >
          Add Team
        </button>
      </div>
    </div>


    <div className="mt-6">
      <div className={inspectorLabelClass()}>Rounds</div>

      <div className="mt-3 space-y-3">
        {((selectedBlock.data as any).rounds ?? []).map((round: any) => (
          <div
            key={round.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className={inspectorLabelClass()}>Round Name</div>

            <input
              type="text"
              value={round.title ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "tournament_display"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          rounds: ((block.data as any).rounds ?? []).map(
                            (entry: any) =>
                              entry.id === round.id
                                ? {
                                    ...entry,
                                    title: e.target.value,
                                  }
                                : entry,
                          ),
                        },
                      },
                )
              }
              className={inspectorInputClass()}
            />

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={toolSetButtonClass("remove")}
                onClick={() =>
                  updateSelectedBlock((block: any) =>
                    block.type !== "tournament_display"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            rounds: ((block.data as any).rounds ?? []).filter(
                              (entry: any) => entry.id !== round.id,
                            ),
                          },
                        },
                  )
                }
              >
                ×
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className={toolSetButtonClass("front")}
          onClick={() =>
            updateSelectedBlock((block: any) =>
              block.type !== "tournament_display"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      rounds: [
                        ...(((block.data as any).rounds ?? []) as any[]),
                        {
                          id: makeClientId("round"),
                          title: `Round ${
                            (((block.data as any).rounds ?? []) as any[])
                              .length + 1
                          }`,
                        },
                      ],
                    },
                  },
            )
          }
        >
          Add Round
        </button>
      </div>

<div className="mt-6">
  <div className={inspectorLabelClass()}>Matchups</div>

  <div className="mt-3 space-y-3">
{selectedBlock.data.matches.map((match: any) => (
  <details
    key={match.id}
    className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"
  >
<summary className="cursor-pointer list-none">
  <div className="mb-3 flex items-center justify-between gap-3">
    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
      {(match as any).roundTitle ?? "Round 1"}
    </div>

    <div className="text-xs text-neutral-400">
      Click to expand
    </div>
  </div>

  <div className="grid grid-cols-2 gap-2">
        <div>
          <div className={inspectorLabelClass()}>Team A</div>
          <select
            value={match.teamA ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        matches: block.data.matches.map((entry: any) =>
                          entry.id === match.id
                            ? { ...entry, teamA: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="">Select Team</option>
            {selectedBlock.data.teams.map((team: any) => (
              <option key={team.id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className={inspectorLabelClass()}>Team B</div>
          <select
            value={match.teamB ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        matches: block.data.matches.map((entry: any) =>
                          entry.id === match.id
                            ? { ...entry, teamB: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="">Select Team</option>
            {selectedBlock.data.teams.map((team: any) => (
              <option key={team.id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <div className={inspectorLabelClass()}>Score A</div>
          <input
            type="number"
            value={match.scoreA ?? 0}
            onChange={(e) =>
              updateSelectedBlock((block: any) => {
                if (block.type !== "tournament_display") return block;

                const matches = block.data.matches.map((entry: any) =>
                  entry.id === match.id
                    ? {
                        ...entry,
                        scoreA: Number(e.target.value),
                      }
                    : entry,
                );

                return {
                  ...block,
                  data: {
                    ...block.data,
                    matches: advanceTournamentWinners(matches),
                  },
                };
              })
            }
            className={inspectorInputClass()}
          />
        </div>

        <div>
          <div className={inspectorLabelClass()}>Score B</div>
          <input
            type="number"
            value={match.scoreB ?? 0}
            onChange={(e) =>
              updateSelectedBlock((block: any) => {
                if (block.type !== "tournament_display") return block;

                const matches = block.data.matches.map((entry: any) =>
                  entry.id === match.id
                    ? {
                        ...entry,
                        scoreB: Number(e.target.value),
                      }
                    : entry,
                );

                return {
                  ...block,
                  data: {
                    ...block.data,
                    matches: advanceTournamentWinners(matches),
                  },
                };
              })
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>
    </summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <div className={inspectorLabelClass()}>Game Date</div>
            <input
              type="date"
              value={match.gameDate ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "tournament_display"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          matches: block.data.matches.map((entry: any) =>
                            entry.id === match.id
                              ? { ...entry, gameDate: e.target.value }
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
            <div className={inspectorLabelClass()}>Game Time</div>
            <input
              type="time"
              value={match.gameTime ?? ""}
              onChange={(e) =>
                updateSelectedBlock((block: any) =>
                  block.type !== "tournament_display"
                    ? block
                    : {
                        ...block,
                        data: {
                          ...block.data,
                          matches: block.data.matches.map((entry: any) =>
                            entry.id === match.id
                              ? { ...entry, gameTime: e.target.value }
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

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Location</div>
          <input
            type="text"
            value={match.location ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        matches: block.data.matches.map((entry: any) =>
                          entry.id === match.id
                            ? { ...entry, location: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          />
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Round</div>
          <select
            value={(match as any).roundTitle ?? "Round 1"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        matches: block.data.matches.map((entry: any) =>
                          entry.id === match.id
                            ? { ...entry, roundTitle: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
{[
  "Round 1",
  ...(((selectedBlock.data as any).rounds ?? []) as any[])
    .map((round: any) => round.title)
    .filter((title: string) => title && title !== "Round 1"),
].map((title) => (
  <option key={title} value={title}>
    {title}
  </option>
))}
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Division</div>
          <select
            value={match.division ?? "custom"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        matches: block.data.matches.map((entry: any) =>
                          entry.id === match.id
                            ? { ...entry, division: e.target.value as any }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="custom">Custom</option>
            <option value="west">West</option>
            <option value="east">East</option>
            <option value="finals">Finals</option>
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Winner</div>
          <select
            value={match.winner ?? ""}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        matches: block.data.matches.map((entry: any) =>
                          entry.id === match.id
                            ? { ...entry, winner: e.target.value }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="">No Winner</option>
            {match.teamA ? <option value={match.teamA}>{match.teamA}</option> : null}
            {match.teamB ? <option value={match.teamB}>{match.teamB}</option> : null}
          </select>
        </div>

        <div className="mt-3">
          <div className={inspectorLabelClass()}>Status</div>
          <select
            value={match.status ?? "upcoming"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        matches: block.data.matches.map((entry: any) =>
                          entry.id === match.id
                            ? { ...entry, status: e.target.value as any }
                            : entry,
                        ),
                      },
                    },
              )
            }
            className={inspectorInputClass()}
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="final">Final</option>
            <option value="postponed">Postponed</option>
          </select>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            className={toolSetButtonClass("front")}
            onClick={() =>
              updateSelectedBlock((block: any) => {
                if (block.type !== "tournament_display") return block;
                const index = block.data.matches.findIndex(
                  (entry: any) => entry.id === match.id,
                );
                if (index <= 0) return block;
                const matches = [...block.data.matches];
                [matches[index - 1], matches[index]] = [
                  matches[index],
                  matches[index - 1],
                ];
                return { ...block, data: { ...block.data, matches } };
              })
            }
          >
            ▲
          </button>

          <button
            type="button"
            className={toolSetButtonClass("front")}
            onClick={() =>
              updateSelectedBlock((block: any) => {
                if (block.type !== "tournament_display") return block;
                const index = block.data.matches.findIndex(
                  (entry: any) => entry.id === match.id,
                );
                if (index >= block.data.matches.length - 1) return block;
                const matches = [...block.data.matches];
                [matches[index], matches[index + 1]] = [
                  matches[index + 1],
                  matches[index],
                ];
                return { ...block, data: { ...block.data, matches } };
              })
            }
          >
            ▼
          </button>

          <button
            type="button"
            className={toolSetButtonClass("remove")}
            onClick={() =>
              updateSelectedBlock((block: any) =>
                block.type !== "tournament_display"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        matches:
                          block.data.matches.length > 1
                            ? block.data.matches.filter(
                                (entry: any) => entry.id !== match.id,
                              )
                            : block.data.matches,
                      },
                    },
              )
            }
          >
            ×
          </button>
        </div>
  </details>
))}

    <button
      type="button"
      className={toolSetButtonClass("front")}
      onClick={() =>
        updateSelectedBlock((block: any) =>
          block.type !== "tournament_display"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  matches: [
                    ...block.data.matches,
                    {
                      id: makeClientId("match"),
                      teamA: "",
                      teamB: "",
                      scoreA: 0,
                      scoreB: 0,
                      status: "upcoming",
                      division: "custom",
                      roundTitle: "Round 1",
                      winner: "",
                    },
                  ],
                },
              },
        )
      }
    >
      Add Match
    </button>
  </div>
</div>
</div>
    </div>
  );
}