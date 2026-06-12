"use client";

import type { CSSProperties } from "react";
import type { MicrositeBlock } from "@/lib/templates/builder";

type Props = {
  block: Extract<MicrositeBlock, { type: "tournament_display" }>;
  designKey?: string;
};

type TournamentTeamLike = {
  id?: string;
  name?: string;
  seed?: number;
  wins?: number;
  losses?: number;
  record?: string;
  imageUrl?: string;
  color?: string;
};

type TournamentMatchLike = {
  id?: string;
  roundTitle?: string;
  division?: "east" | "west" | "finals" | "custom";
  teamA?: string;
  teamB?: string;
  scoreA?: number;
  scoreB?: number;
  winner?: string;
  gameDate?: string;
  gameTime?: string;
  location?: string;
  status?: "upcoming" | "live" | "final" | "postponed";
};

type TournamentDisplayStyles = {
  backgroundStyle?: CSSProperties;
  tournamentNameStyle?: CSSProperties;
  seasonStyle?: CSSProperties;
  leftDivisionLabelStyle?: CSSProperties;
  rightDivisionLabelStyle?: CSSProperties;
  teamNameStyle?: CSSProperties;
  recordStyle?: CSSProperties;
  scoreStyle?: CSSProperties;
  statusStyle?: CSSProperties;
  finalsLabelStyle?: CSSProperties;
  championStyle?: CSSProperties;
};

type TournamentDisplayOptions = {
  showScores: boolean;
  showSeeds: boolean;
  showRecords: boolean;
  showStatusBadges: boolean;
  showLeftDivisionLabel: boolean;
  showRightDivisionLabel: boolean;
  showSeasonYear: boolean;
  showTournamentName: boolean;
  logoSize: number;
  matchCardShadowEnabled: boolean;
  matchCardShadowBlur: number;
  matchCardShadowX: number;
  matchCardShadowY: number;
  matchCardShadowDirection: "down" | "up" | "left" | "right" | "custom";
  matchCardBorderEnabled: boolean;
  matchCardBorderColor: string;
  matchCardRadius: number;
matchCardPaddingX: number;
matchCardPaddingY: number;
matchCardColumnWidth: number;
bracketColumnSpacing: number;
  connectorLinesEnabled: boolean;
  connectorLineColor: string;
  connectorLineThickness: number;
};

export default function TournamentDisplayBlock({ block }: Props) {
  const data = block.data as any;
  const teams = Array.isArray(data.teams) ? data.teams : [];
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const displayMode = data.displayMode ?? "bracket";

  const styles: TournamentDisplayStyles = {
    backgroundStyle: getTextStyle(data.style),
    tournamentNameStyle: getTextStyle(data.tournamentNameStyle),
    seasonStyle: getTextStyle(data.seasonStyle),
    leftDivisionLabelStyle: getTextStyle(data.leftDivisionLabelStyle),
    rightDivisionLabelStyle: getTextStyle(data.rightDivisionLabelStyle),
    teamNameStyle: getTextStyle(data.teamNameStyle),
    recordStyle: getTextStyle(data.recordStyle),
    scoreStyle: getTextStyle(data.scoreStyle),
    statusStyle: getTextStyle(data.statusStyle),
    finalsLabelStyle: getTextStyle(data.finalsLabelStyle),
    championStyle: getTextStyle(data.championStyle),
  };

const options: TournamentDisplayOptions = {
  showScores: data.showScores !== false,
  showSeeds: data.showSeeds !== false,
  showRecords: data.showRecords !== false,
  showStatusBadges: data.showStatusBadges !== false,
  showLeftDivisionLabel: data.showLeftDivisionLabel !== false,
  showRightDivisionLabel: data.showRightDivisionLabel !== false,
  showSeasonYear: data.showSeasonYear !== false,
  showTournamentName: data.showTournamentName !== false,
  logoSize:
    typeof data.logoSize === "number" && Number.isFinite(data.logoSize)
      ? Math.max(16, Math.min(72, data.logoSize))
      : 32,
  matchCardShadowEnabled: Boolean(data.matchCardShadowEnabled),
  matchCardShadowBlur:
    typeof data.matchCardShadowBlur === "number" ? data.matchCardShadowBlur : 16,
  matchCardShadowX:
    typeof data.matchCardShadowX === "number" ? data.matchCardShadowX : 0,
  matchCardShadowY:
    typeof data.matchCardShadowY === "number" ? data.matchCardShadowY : 8,
  matchCardShadowDirection:
    data.matchCardShadowDirection === "up" ||
    data.matchCardShadowDirection === "left" ||
    data.matchCardShadowDirection === "right" ||
    data.matchCardShadowDirection === "custom"
      ? data.matchCardShadowDirection
      : "down",
  matchCardBorderEnabled: data.matchCardBorderEnabled !== false,
  matchCardBorderColor:
    typeof data.matchCardBorderColor === "string"
      ? data.matchCardBorderColor
      : "#ffffff",
      matchCardRadius:
  typeof data.matchCardRadius === "number"
    ? data.matchCardRadius
    : 16,

    matchCardColumnWidth:
  typeof data.matchCardColumnWidth === "number"
    ? Math.max(140, Math.min(320, data.matchCardColumnWidth))
    : 220,

bracketColumnSpacing:
  typeof data.bracketColumnSpacing === "number"
    ? Math.max(12, Math.min(110, data.bracketColumnSpacing))
    : 54,

matchCardPaddingX:
  typeof data.matchCardPaddingX === "number"
    ? data.matchCardPaddingX
    : 12,

matchCardPaddingY:
  typeof data.matchCardPaddingY === "number"
    ? data.matchCardPaddingY
    : 10,
  connectorLinesEnabled: data.connectorLinesEnabled !== false,
  connectorLineColor:
    typeof data.connectorLineColor === "string"
      ? data.connectorLineColor
      : "#ffffff",
  connectorLineThickness:
    typeof data.connectorLineThickness === "number"
      ? Math.max(1, Math.min(8, data.connectorLineThickness))
      : 2,
};

const appearance = block.appearance as any;

const rootStyle: CSSProperties = {
  ...styles.backgroundStyle,
  backgroundColor:
    appearance?.backgroundColor === "transparent" ||
    data.style?.backgroundColor === "transparent"
      ? "transparent"
      : appearance?.backgroundColor ||
        data.style?.backgroundColor ||
        undefined,
  borderColor: appearance?.borderColor || undefined,
  borderWidth:
    typeof appearance?.borderWidth === "number"
      ? appearance.borderWidth
      : undefined,
  borderRadius:
    typeof appearance?.borderRadius === "number"
      ? appearance.borderRadius
      : undefined,
  transform: `translate(${data.contentOffsetX ?? 0}px, ${
    data.contentOffsetY ?? 0
  }px)`,
};

  return (
    <div
className={[
  "h-full w-full overflow-auto rounded-2xl border p-4 text-white",
  appearance?.backgroundColor === "transparent" ||
  data.style?.backgroundColor === "transparent"
    ? ""
    : "bg-black/20",
].join(" ")}
      style={rootStyle}
    >
<div className="mb-4">
  {options.showTournamentName ? (
    <div className="text-lg font-semibold" style={styles.tournamentNameStyle}>
      {data.tournamentName || "Tournament Display"}
    </div>
  ) : null}

  {options.showSeasonYear ? (
    <div className="text-xs opacity-70" style={styles.seasonStyle}>
      {[data.season, data.year].filter(Boolean).join(" • ")}
    </div>
  ) : null}
</div>

      {displayMode === "standings" ? (
        <Standings teams={teams} styles={styles} options={options} />
      ) : displayMode === "matchups" ? (
        <Matchups
          matches={matches}
          teams={teams}
          styles={styles}
          options={options}
        />
      ) : (
<Bracket
  matches={matches}
  teams={teams}
  finalsImageUrl={(data as any).finalsImageUrl}
  leftDivisionImageUrl={(data as any).leftDivisionImageUrl}
  rightDivisionImageUrl={(data as any).rightDivisionImageUrl}
  leftDivisionDisplayType={(data as any).leftDivisionDisplayType ?? "text"}
  rightDivisionDisplayType={(data as any).rightDivisionDisplayType ?? "text"}
  finalsDisplayType={(data as any).finalsDisplayType ?? "text"}
  championshipDisplayType={(data as any).championshipDisplayType ?? "text"}
  designStyle={data.designStyle ?? "style1"}
  bracketLayout={data.bracketLayout}
  leftDivisionLabel={data.leftDivisionLabel}
  rightDivisionLabel={data.rightDivisionLabel}
  finalsLabel={data.finalsLabel}
  emptyStateText={data.emptyStateText}
  styles={styles}
  options={options}
/>
      )}
    </div>
  );
}

function Bracket({
  matches,
  teams,
  finalsImageUrl,
  leftDivisionImageUrl,
  rightDivisionImageUrl,
  leftDivisionDisplayType,
  rightDivisionDisplayType,
  finalsDisplayType,
  championshipDisplayType,
  designStyle,
  bracketLayout,
  leftDivisionLabel,
  rightDivisionLabel,
  finalsLabel,
  emptyStateText,
  styles,
  options,
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
  finalsImageUrl?: string;
  leftDivisionImageUrl?: string;
  rightDivisionImageUrl?: string;
  leftDivisionDisplayType?: "text" | "image";
  rightDivisionDisplayType?: "text" | "image";
  finalsDisplayType?: "text" | "image";
  championshipDisplayType?: "text" | "image";
  designStyle?: string;
  bracketLayout?: string;
  leftDivisionLabel?: string;
  rightDivisionLabel?: string;
  finalsLabel?: string;
  emptyStateText?: string;
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  if (designStyle === "style2") {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
        Style 2 Coming Soon
      </div>
    );
  }

  if (designStyle === "style3") {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
        Style 3 Coming Soon
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-4 text-sm opacity-70">
        {emptyStateText || "Add matchups to build your tournament display."}
      </div>
    );
  }

if (bracketLayout === "east_west") {
  return (
<Style1EastWestBracket
  matches={matches}
  teams={teams}
  finalsImageUrl={finalsImageUrl}
  leftDivisionImageUrl={leftDivisionImageUrl}
  rightDivisionImageUrl={rightDivisionImageUrl}
  leftDivisionDisplayType={leftDivisionDisplayType}
  rightDivisionDisplayType={rightDivisionDisplayType}
  finalsDisplayType={finalsDisplayType}
  championshipDisplayType={championshipDisplayType}
  leftDivisionLabel={leftDivisionLabel}
  rightDivisionLabel={rightDivisionLabel}
  finalsLabel={finalsLabel}
  styles={styles}
  options={options}
/>
  );
}

  return (
    <RoundColumnBracket
      matches={matches}
      teams={teams}
      styles={styles}
      options={options}
    />
  );
}

function Style1EastWestBracket({
  matches,
  teams,
  finalsImageUrl,
  leftDivisionImageUrl,
  rightDivisionImageUrl,
  leftDivisionDisplayType,
  rightDivisionDisplayType,
  finalsDisplayType,
  championshipDisplayType,
  leftDivisionLabel,
  rightDivisionLabel,
  finalsLabel,
  styles,
  options,
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
  finalsImageUrl?: string;
  leftDivisionImageUrl?: string;
  rightDivisionImageUrl?: string;
  leftDivisionDisplayType?: "text" | "image";
  rightDivisionDisplayType?: "text" | "image";
  finalsDisplayType?: "text" | "image";
  championshipDisplayType?: "text" | "image";
  leftDivisionLabel?: string;
  rightDivisionLabel?: string;
  finalsLabel?: string;
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  const westRound1 = matches.filter(
    (match) => match.division === "west" && getRoundName(match) === "Round 1",
  );
  const westRound2 = matches.filter(
    (match) => match.division === "west" && getRoundName(match) === "Round 2",
  );
  const westFinal = matches.find(
    (match) =>
      match.division === "west" && getRoundName(match) === "Division Finals",
  );

  const eastRound1 = matches.filter(
    (match) => match.division === "east" && getRoundName(match) === "Round 1",
  );
  const eastRound2 = matches.filter(
    (match) => match.division === "east" && getRoundName(match) === "Round 2",
  );
  const eastFinal = matches.find(
    (match) =>
      match.division === "east" && getRoundName(match) === "Division Finals",
  );

  const championship = matches.find(
    (match) =>
      match.division === "finals" || getRoundName(match) === "Championship",
  );

  return (
    <div className="min-w-max">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 260px 1fr",
          columnGap: options.bracketColumnSpacing,
        }}
      >
        <BracketSide
          label={leftDivisionLabel || "West Division"}
          align="left"
          displayType={leftDivisionDisplayType}
          imageUrl={leftDivisionImageUrl}
          round1={westRound1}
          round2={westRound2}
          divisionFinal={westFinal}
          teams={teams}
          styles={styles}
          options={options}
        />

        <ChampionshipCard
          label={finalsLabel || "Championship"}
          match={championship}
          teams={teams}
          styles={styles}
          options={options}
          finalsImageUrl={finalsImageUrl}
          finalsDisplayType={finalsDisplayType}
          championshipDisplayType={championshipDisplayType}
        />

        <BracketSide
          label={rightDivisionLabel || "East Division"}
          align="right"
          displayType={rightDivisionDisplayType}
          imageUrl={rightDivisionImageUrl}
          round1={eastRound1}
          round2={eastRound2}
          divisionFinal={eastFinal}
          teams={teams}
          styles={styles}
          options={options}
        />
      </div>
    </div>
  );
}

function BracketSide({
  label,
  align,
  displayType,
  imageUrl,
  round1,
  round2,
  divisionFinal,
  teams,
  styles,
  options,
}: {
  label: string;
  align: "left" | "right";
  displayType?: "text" | "image";
  imageUrl?: string;
  round1: TournamentMatchLike[];
  round2: TournamentMatchLike[];
  divisionFinal?: TournamentMatchLike;
  teams: TournamentTeamLike[];
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  const round2Matches = fillMatches(round2, 2);

  const finalMatch = divisionFinal ?? {
    id: `${align}-division-final-placeholder`,
    roundTitle: "Division Finals",
    teamA:
      round2Matches[0]?.winner ||
      round2Matches[0]?.teamA ||
      "Winner",
    teamB:
      round2Matches[1]?.winner ||
      round2Matches[1]?.teamA ||
      "Winner",
    scoreA: 0,
    scoreB: 0,
    status: "upcoming" as const,
  };

  const divisionLabelStyle =
    align === "right"
      ? styles.rightDivisionLabelStyle
      : styles.leftDivisionLabelStyle;

  const shouldShowLabel =
    (align === "left" && options.showLeftDivisionLabel) ||
    (align === "right" && options.showRightDivisionLabel);

const divisionHeader =
  shouldShowLabel && displayType === "image" ? (
    imageUrl ? (
      <img
        src={imageUrl}
        alt={label}
        className={[
          "mb-4 h-10 w-[220px] rounded-xl object-cover",
          align === "right" ? "ml-auto" : "",
        ].join(" ")}
      />
    ) : (
      <div
        className={[
          "mb-4 h-10 w-[220px] rounded-xl border border-white/20 bg-white/10",
          align === "right" ? "ml-auto" : "",
        ].join(" ")}
      />
    )
  ) : shouldShowLabel ? (
    <div
      className={[
        "mb-4 text-xs font-bold uppercase tracking-[0.18em]",
        align === "right" ? "text-right" : "",
      ].join(" ")}
      style={divisionLabelStyle}
    >
      {label}
    </div>
  ) : null;

  return (
    <div>
      {divisionHeader}

      {align === "right" ? (
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: `${options.matchCardColumnWidth}px ${options.bracketColumnSpacing}px ${options.matchCardColumnWidth}px ${options.bracketColumnSpacing}px ${options.matchCardColumnWidth}px`,
          }}
        >
          <div>
            <BracketMatchCard
              match={finalMatch}
              teams={teams}
              large
              mirrored
              styles={styles}
              options={options}
            />
          </div>

          <ConnectorColumn rows={2} align={align} options={options} />

          <div className="space-y-16">
            {round2Matches.map((match, index) => (
              <BracketMatchCard
                key={match.id || `${align}-round2-${index}`}
                match={match}
                teams={teams}
                mirrored
                styles={styles}
                options={options}
              />
            ))}
          </div>

          <ConnectorColumn rows={4} align={align} options={options} />

          <div className="space-y-4">
            {fillMatches(round1, 4).map((match, index) => (
              <BracketMatchCard
                key={match.id || `${align}-round1-${index}`}
                match={match}
                teams={teams}
                compact
                mirrored
                styles={styles}
                options={options}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: `${options.matchCardColumnWidth}px ${options.bracketColumnSpacing}px ${options.matchCardColumnWidth}px ${options.bracketColumnSpacing}px ${options.matchCardColumnWidth}px`,
          }}
        >
          <div className="space-y-4">
            {fillMatches(round1, 4).map((match, index) => (
              <BracketMatchCard
                key={match.id || `${align}-round1-${index}`}
                match={match}
                teams={teams}
                compact
                styles={styles}
                options={options}
              />
            ))}
          </div>

          <ConnectorColumn rows={4} align={align} options={options} />

          <div className="space-y-16">
            {round2Matches.map((match, index) => (
              <BracketMatchCard
                key={match.id || `${align}-round2-${index}`}
                match={match}
                teams={teams}
                styles={styles}
                options={options}
              />
            ))}
          </div>

          <ConnectorColumn rows={2} align={align} options={options} />

          <div>
            <BracketMatchCard
              match={finalMatch}
              teams={teams}
              large
              styles={styles}
              options={options}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectorColumn({
  rows,
  align,
  options,
}: {
  rows: 2 | 4;
  align: "left" | "right";
  options: TournamentDisplayOptions;
}) {
  const heightClass = rows === 4 ? "h-[420px]" : "h-[240px]";

    if (!options.connectorLinesEnabled) {
    return <div className={heightClass} />;
  }

  const connectorStyle: CSSProperties = {
    backgroundColor: options.connectorLineColor,
  };

  const horizontalStyle: CSSProperties = {
    ...connectorStyle,
    height: options.connectorLineThickness,
  };

  const verticalStyle: CSSProperties = {
    ...connectorStyle,
    width: options.connectorLineThickness,
  };

return (
  <div className={`relative ${heightClass}`}>
    <div
      className={[
        "absolute top-[13%] w-full",
        align === "right" ? "right-0" : "left-0",
      ].join(" ")}
      style={horizontalStyle}
    />
    <div
      className={[
        "absolute top-[38%] w-full",
        align === "right" ? "right-0" : "left-0",
      ].join(" ")}
      style={horizontalStyle}
    />
    <div
      className={[
        "absolute top-[63%] w-full",
        rows === 4 ? "" : "hidden",
        align === "right" ? "right-0" : "left-0",
      ].join(" ")}
      style={horizontalStyle}
    />
    <div
      className={[
        "absolute top-[88%] w-full",
        rows === 4 ? "" : "hidden",
        align === "right" ? "right-0" : "left-0",
      ].join(" ")}
      style={horizontalStyle}
    />

    <div
      className={[
        "absolute top-[13%] h-[25%]",
        align === "right" ? "left-0" : "right-0",
      ].join(" ")}
      style={verticalStyle}
    />
    <div
      className={[
        "absolute top-[63%] h-[25%]",
        rows === 4 ? "" : "hidden",
        align === "right" ? "left-0" : "right-0",
      ].join(" ")}
      style={verticalStyle}
    />
    <div
      className={[
        "absolute top-[38%] w-full",
        align === "right" ? "left-0" : "right-0",
      ].join(" ")}
      style={horizontalStyle}
    />
  </div>
);
}

function ChampionshipCard({
  label,
  match,
  teams,
  styles,
  options,
  finalsImageUrl,
  finalsDisplayType,
  championshipDisplayType,
}: {
  label: string;
  match?: TournamentMatchLike;
  teams: TournamentTeamLike[];
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
  finalsImageUrl?: string;
  finalsDisplayType?: "text" | "image";
  championshipDisplayType?: "text" | "image";
}) {
  const safeMatch = match ?? {
    teamA: "West Champion",
    teamB: "East Champion",
    scoreA: 0,
    scoreB: 0,
    status: "upcoming" as const,
  };

  const teamA = findTeamByName(teams, safeMatch.teamA);
  const teamB = findTeamByName(teams, safeMatch.teamB);

  return (
    <div className="flex h-full min-h-[560px] flex-col items-center justify-center">
{finalsDisplayType === "image" ? (
  <div className="mb-4 h-10 w-40 rounded-xl border border-white/20 bg-white/10" />
) : (
  <div
    className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] opacity-70"
    style={styles.finalsLabelStyle}
  >
    {label}
  </div>
)}

      <div className="w-full max-w-[250px] overflow-hidden rounded-[28px] border border-white/15 bg-slate-950 shadow-xl">
        {finalsImageUrl ? (
          <img
            src={finalsImageUrl}
            alt="Finals"
            className="h-24 w-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center bg-white/10 text-xs uppercase tracking-[0.16em] opacity-60">
            Finals Image
          </div>
        )}

        <div className="px-5 py-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-300/10 text-3xl">
            🏆
          </div>

          <div className="text-2xl font-black uppercase tracking-[0.08em]">
            Final
          </div>

          <div className="mt-2 text-xs opacity-70">
            {[safeMatch.gameDate, safeMatch.gameTime].filter(Boolean).join(" • ")}
          </div>

          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex flex-col items-center gap-2">
              <TeamLogo team={teamA} size={56} />
              <div className="text-xs font-bold uppercase">
                {safeMatch.teamA || "West Champion"}
              </div>
              <div className="text-lg font-black" style={styles.scoreStyle}>
                {safeMatch.scoreA ?? 0}
              </div>
            </div>

            <div className="text-sm font-black opacity-70">VS</div>

            <div className="flex flex-col items-center gap-2">
              <TeamLogo team={teamB} size={56} />
              <div className="text-xs font-bold uppercase">
                {safeMatch.teamB || "East Champion"}
              </div>
              <div className="text-lg font-black" style={styles.scoreStyle}>
                {safeMatch.scoreB ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-5 py-3 text-center">
{championshipDisplayType === "image" ? (
  <div className="mx-auto mb-2 h-10 w-36 rounded-xl border border-yellow-300/30 bg-yellow-300/10" />
) : (
  <div
    className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-200"
    style={styles.championStyle}
  >
    Champion
  </div>
)}
        <div className="mt-1 text-sm font-semibold" style={styles.championStyle}>
          {safeMatch.winner || "Awaiting Winner"}
        </div>
      </div>
    </div>
  );
}

function BracketMatchCard({
  match,
  teams,
  compact = false,
  large = false,
  championship = false,
  mirrored = false,
  styles,
  options,
}: {
  match?: TournamentMatchLike;
  teams: TournamentTeamLike[];
  compact?: boolean;
  large?: boolean;
  championship?: boolean;
  mirrored?: boolean;
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  if (!match) return null;

  const teamA = findTeamByName(teams, match.teamA);
  const teamB = findTeamByName(teams, match.teamB);
  const teamAWon = Boolean(match.winner && match.winner === match.teamA);
  const teamBWon = Boolean(match.winner && match.winner === match.teamB);

const cardShadowX =
  options.matchCardShadowDirection === "left"
    ? -Math.abs(options.matchCardShadowX || 12)
    : options.matchCardShadowDirection === "right"
      ? Math.abs(options.matchCardShadowX || 12)
      : options.matchCardShadowDirection === "custom"
        ? options.matchCardShadowX
        : 0;

const cardShadowY =
  options.matchCardShadowDirection === "up"
    ? -Math.abs(options.matchCardShadowY || 8)
    : options.matchCardShadowDirection === "down"
      ? Math.abs(options.matchCardShadowY || 8)
      : options.matchCardShadowDirection === "custom"
        ? options.matchCardShadowY
        : 0;

const cardStyle: CSSProperties = {
  borderColor: options.matchCardBorderEnabled
    ? options.matchCardBorderColor
    : "transparent",

  borderRadius: options.matchCardRadius,

  paddingLeft: options.matchCardPaddingX,
  paddingRight: options.matchCardPaddingX,

  paddingTop: options.matchCardPaddingY,
  paddingBottom: options.matchCardPaddingY,

  boxShadow: options.matchCardShadowEnabled
    ? `${cardShadowX}px ${cardShadowY}px ${options.matchCardShadowBlur}px rgba(0,0,0,0.35)`
    : undefined,
};

return (
  <div
    className={[
      "rounded-2xl border bg-white/10",
championship
  ? "border-yellow-300/30"
  : large
    ? "border-white/15"
    : "border-white/10",
      compact ? "text-xs" : "text-sm",
    ].join(" ")}
    style={cardStyle}
  >
      <BracketTeamRow
        team={teamA}
        fallbackName={match.teamA || "Team A"}
        score={match.scoreA}
        isWinner={teamAWon}
        matchHasWinner={Boolean(match.winner)}
        mirrored={mirrored}
        styles={styles}
        options={options}
      />

      <div className="my-2 h-px bg-white/10" />

      <BracketTeamRow
        team={teamB}
        fallbackName={match.teamB || "Team B"}
        score={match.scoreB}
        isWinner={teamBWon}
        matchHasWinner={Boolean(match.winner)}
        mirrored={mirrored}
        styles={styles}
        options={options}
      />

      {options.showStatusBadges && match.status ? (
        <div
          className="mt-2 text-[10px] uppercase tracking-[0.14em] opacity-60"
          style={styles.statusStyle}
        >
          {match.status}
        </div>
      ) : null}
    </div>
  );
}

function BracketTeamRow({
  team,
  fallbackName,
  score,
  isWinner,
  matchHasWinner = false,
  mirrored = false,
  styles,
  options,
}: {
  team?: TournamentTeamLike;
  fallbackName: string;
  score?: number;
  isWinner?: boolean;
  matchHasWinner?: boolean;
  mirrored?: boolean;
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  const scoreBadge = options.showScores ? (
    <div
      className={[
        "min-w-8 rounded-lg px-2 py-1 text-center text-xs font-bold",
        isWinner ? "bg-emerald-400 text-black" : "bg-white/10 text-white/70",
      ].join(" ")}
      style={styles.scoreStyle}
    >
      {score ?? 0}
    </div>
  ) : null;

  const seedBadge =
    options.showSeeds && team?.seed ? (
      <div className="w-5 text-[10px] font-bold opacity-70">{team.seed}</div>
    ) : (
      <div className="w-5" />
    );

  const fadedClass = matchHasWinner && !isWinner ? "opacity-40" : "";

  const teamNameNode = (
    <div
      className={[
        "truncate font-semibold",
        mirrored ? "text-right" : "",
        fadedClass,
      ].join(" ")}
      style={styles.teamNameStyle}
    >
      {team?.name || fallbackName}
    </div>
  );

  const recordNode =
    options.showRecords && team?.record ? (
      <div
        className={[
          "text-[10px] opacity-55",
          mirrored ? "text-right" : "",
        ].join(" ")}
        style={styles.recordStyle}
      >
        {team.record}
      </div>
    ) : null;

  const logoNode = (
    <div className={fadedClass}>
      <TeamLogo team={team} size={options.logoSize} />
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {mirrored ? (
        <>
          {scoreBadge}

          <div className="min-w-0 flex-1">
            {teamNameNode}
            {recordNode}
          </div>

          {logoNode}
          {seedBadge}
        </>
      ) : (
        <>
          {seedBadge}
          {logoNode}

          <div className="min-w-0 flex-1">
            {teamNameNode}
            {recordNode}
          </div>

          {scoreBadge}
        </>
      )}
    </div>
  );
}

function RoundColumnBracket({
  matches,
  teams,
  styles,
  options,
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  const rounds = matches.reduce(
    (acc, match) => {
      const roundName = getRoundName(match);
      if (!acc[roundName]) acc[roundName] = [];
      acc[roundName].push(match);
      return acc;
    },
    {} as Record<string, TournamentMatchLike[]>,
  );

  return (
    <div className="flex gap-5 overflow-x-auto pb-2">
      {Object.keys(rounds).map((roundName) => (
        <div key={roundName} className="min-w-[260px] space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
            {roundName}
          </div>

          {rounds[roundName].map((match, index) => (
            <MatchCard
              key={match.id || `${roundName}-${index}`}
              match={match}
              teams={teams}
              styles={styles}
              options={options}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Standings({
  teams,
  styles,
  options,
}: {
  teams: TournamentTeamLike[];
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  const sortedTeams = [...teams].sort((a, b) => {
    const winsA = Number(a.wins ?? 0);
    const winsB = Number(b.wins ?? 0);
    return winsB - winsA;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="text-xs uppercase opacity-60">
          <tr>
            <th className="py-2 pr-3">Team</th>
            <th className="py-2 pr-3">W</th>
            <th className="py-2 pr-3">L</th>
            {options.showRecords ? <th className="py-2 pr-3">Record</th> : null}
          </tr>
        </thead>

        <tbody>
          {sortedTeams.map((team, index) => (
            <tr
              key={team.id || `team-${index}`}
              className="border-t border-white/10"
            >
              <td className="py-2 pr-3">
                <div className="flex items-center gap-2">
                  {options.showSeeds && team.seed ? (
                    <div className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold">
                      #{team.seed}
                    </div>
                  ) : null}

                  <TeamLogo team={team} size={options.logoSize} />

                  <span className="font-medium" style={styles.teamNameStyle}>
                    {team.name || "Team"}
                  </span>
                </div>
              </td>

              <td className="py-2 pr-3">{team.wins ?? 0}</td>
              <td className="py-2 pr-3">{team.losses ?? 0}</td>
              {options.showRecords ? (
                <td className="py-2 pr-3" style={styles.recordStyle}>
                  {team.record || "0-0"}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Matchups({
  matches,
  teams,
  styles,
  options,
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  return (
    <div className="grid gap-3">
      {matches.map((match, index) => (
        <MatchCard
          key={match.id || `matchup-${index}`}
          match={match}
          teams={teams}
          styles={styles}
          options={options}
        />
      ))}
    </div>
  );
}

function MatchCard({
  match,
  teams,
  styles,
  options,
}: {
  match?: TournamentMatchLike;
  teams: TournamentTeamLike[];
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  if (!match) return null;

  const teamA = findTeamByName(teams, match.teamA);
  const teamB = findTeamByName(teams, match.teamB);

  return (
    <div
      className="rounded-xl p-3 text-sm border border-white/10 bg-white/10"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={
              match.winner &&
              match.winner !== match.teamA
                ? "opacity-40"
                : ""
            }
          >
            <TeamLogo team={teamA} size={options.logoSize} />
          </div>

          <div
            className={[
              "truncate font-medium",
              match.winner &&
              match.winner !== match.teamA
                ? "opacity-40"
                : "",
            ].join(" ")}
            style={styles.teamNameStyle}
          >
            {match.teamA || "Team A"}
          </div>
        </div>

        <div className="shrink-0 text-xs opacity-60">vs</div>

        <div className="flex min-w-0 items-center gap-2 text-right">
          <div
            className={[
              "truncate font-medium",
              match.winner &&
              match.winner !== match.teamB
                ? "opacity-40"
                : "",
            ].join(" ")}
            style={styles.teamNameStyle}
          >
            {match.teamB || "Team B"}
          </div>

          <div
            className={
              match.winner &&
              match.winner !== match.teamB
                ? "opacity-40"
                : ""
            }
          >
            <TeamLogo team={teamB} size={options.logoSize} />
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs opacity-70">
        {options.showScores ? (
          <span style={styles.scoreStyle}>
            {match.scoreA ?? 0} - {match.scoreB ?? 0}
          </span>
        ) : null}

        {options.showStatusBadges ? (
          <span
            className="rounded-full bg-white/10 px-2 py-1 capitalize"
            style={styles.statusStyle}
          >
            {match.status || "upcoming"}
          </span>
        ) : null}
      </div>

      {[match.gameDate, match.gameTime, match.location].filter(Boolean).length ? (
        <div className="mt-2 text-xs opacity-70">
          {[match.gameDate, match.gameTime, match.location]
            .filter(Boolean)
            .join(" • ")}
        </div>
      ) : null}
    </div>
  );
}

function TeamLogo({
  team,
  size = 32,
}: {
  team?: TournamentTeamLike;
  size?: number;
}) {
  if (!team?.imageUrl) return null;

  return (
    <img
      src={team.imageUrl}
      alt={team.name || "Team logo"}
      className="shrink-0 rounded-full border border-white/10 bg-white/10 object-cover"
      style={{
        width: size,
        height: size,
      }}
    />
  );
}

function fillMatches(matches: TournamentMatchLike[], count: number) {
  return Array.from({ length: count }, (_item, index) => {
    return (
      matches[index] ?? {
        id: `placeholder-${index}`,
        teamA: "Team",
        teamB: "Team",
        scoreA: 0,
        scoreB: 0,
        status: "upcoming" as const,
      }
    );
  });
}

function getRoundName(match: TournamentMatchLike) {
  return match.roundTitle || "Round 1";
}

function getTextStyle(style?: any): CSSProperties {
  if (!style || typeof style !== "object") return {};

  return {
    fontFamily: style.fontFamily || undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    color: style.color || undefined,
    fontWeight: style.bold ? 700 : style.fontWeight || undefined,
    fontStyle: style.italic ? "italic" : undefined,
    textDecoration: [
      style.underline ? "underline" : "",
      style.strikethrough ? "line-through" : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined,
    backgroundColor: style.backgroundColor || undefined,
  };
}

function findTeamByName(
  teams: TournamentTeamLike[],
  name?: string,
): TournamentTeamLike | undefined {
  if (!name) return undefined;

  return teams.find(
    (team) =>
      (team.name || "").trim().toLowerCase() === name.trim().toLowerCase(),
  );
}