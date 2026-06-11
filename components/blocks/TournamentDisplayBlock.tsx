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
  logoSize: number;
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
  logoSize:
    typeof data.logoSize === "number" && Number.isFinite(data.logoSize)
      ? Math.max(16, Math.min(72, data.logoSize))
      : 32,
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
        <div className="text-lg font-semibold" style={styles.tournamentNameStyle}>
          {data.tournamentName || "Tournament Display"}
        </div>

        <div className="text-xs opacity-70" style={styles.seasonStyle}>
          {[data.season, data.year].filter(Boolean).join(" • ")}
        </div>
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
  leftDivisionLabel,
  rightDivisionLabel,
  finalsLabel,
  styles,
  options,
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
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
    <div className="min-w-[1180px]">
      <div className="grid grid-cols-[1fr_260px_1fr] gap-8">
        <BracketSide
          label={leftDivisionLabel || "West Division"}
          align="left"
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
        />

        <BracketSide
          label={rightDivisionLabel || "East Division"}
          align="right"
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
  round1,
  round2,
  divisionFinal,
  teams,
  styles,
  options,
}: {
  label: string;
  align: "left" | "right";
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
    teamA: round2Matches[0]?.winner || round2Matches[0]?.teamA || "Winner",
    teamB: round2Matches[1]?.winner || round2Matches[1]?.teamA || "Winner",
    scoreA: 0,
    scoreB: 0,
    status: "upcoming" as const,
  };

  const divisionLabelStyle =
    align === "right"
      ? styles.rightDivisionLabelStyle
      : styles.leftDivisionLabelStyle;

  return (
    <div>
      <div
        className={[
          "mb-4 text-xs font-bold uppercase tracking-[0.18em]",
          align === "right" ? "text-right" : "",
        ].join(" ")}
        style={divisionLabelStyle}
      >
        {label}
      </div>

      {align === "right" ? (
        <div className="grid grid-cols-[220px_54px_220px_54px_220px] items-center">
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

          <ConnectorColumn rows={2} align={align} />

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

          <ConnectorColumn rows={4} align={align} />

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
        <div className="grid grid-cols-[220px_54px_220px_54px_220px] items-center">
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

          <ConnectorColumn rows={4} align={align} />

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

          <ConnectorColumn rows={2} align={align} />

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
}: {
  rows: 2 | 4;
  align: "left" | "right";
}) {
  const heightClass = rows === 4 ? "h-[420px]" : "h-[240px]";

  return (
    <div className={`relative ${heightClass}`}>
      <div
        className={[
          "absolute top-[13%] h-[2px] w-full bg-white/20",
          align === "right" ? "right-0" : "left-0",
        ].join(" ")}
      />
      <div
        className={[
          "absolute top-[38%] h-[2px] w-full bg-white/20",
          align === "right" ? "right-0" : "left-0",
        ].join(" ")}
      />
      <div
        className={[
          "absolute top-[63%] h-[2px] w-full bg-white/20",
          rows === 4 ? "" : "hidden",
          align === "right" ? "right-0" : "left-0",
        ].join(" ")}
      />
      <div
        className={[
          "absolute top-[88%] h-[2px] w-full bg-white/20",
          rows === 4 ? "" : "hidden",
          align === "right" ? "right-0" : "left-0",
        ].join(" ")}
      />

      <div
        className={[
          "absolute top-[13%] h-[25%] w-[2px] bg-white/20",
          align === "right" ? "left-0" : "right-0",
        ].join(" ")}
      />
      <div
        className={[
          "absolute top-[63%] h-[25%] w-[2px] bg-white/20",
          rows === 4 ? "" : "hidden",
          align === "right" ? "left-0" : "right-0",
        ].join(" ")}
      />
      <div
        className={[
          "absolute top-[38%] h-[2px] w-full bg-white/20",
          align === "right" ? "left-0" : "right-0",
        ].join(" ")}
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
}: {
  label: string;
  match?: TournamentMatchLike;
  teams: TournamentTeamLike[];
  styles: TournamentDisplayStyles;
  options: TournamentDisplayOptions;
}) {
  const safeMatch = match ?? {
    teamA: "West Champion",
    teamB: "East Champion",
    scoreA: 0,
    scoreB: 0,
    status: "upcoming" as const,
  };

  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center">
      <div
        className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] opacity-70"
        style={styles.finalsLabelStyle}
      >
        {label}
      </div>

      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-300/10 text-3xl">
        🏆
      </div>

      <BracketMatchCard
        match={safeMatch}
        teams={teams}
        championship
        styles={styles}
        options={options}
      />

      <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-5 py-3 text-center">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-200"
          style={styles.championStyle}
        >
          Champion
        </div>
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

  return (
    <div
      className={[
        "rounded-2xl border bg-white/10 shadow-sm",
        championship
          ? "border-yellow-300/30 p-3"
          : large
            ? "border-white/15 p-3"
            : "border-white/10 p-2",
        compact ? "text-xs" : "text-sm",
      ].join(" ")}
    >
      <BracketTeamRow
        team={teamA}
        fallbackName={match.teamA || "Team A"}
        score={match.scoreA}
        isWinner={teamAWon}
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
  mirrored = false,
  styles,
  options,
}: {
  team?: TournamentTeamLike;
  fallbackName: string;
  score?: number;
  isWinner?: boolean;
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

  const teamInfo = (
    <>
      <TeamLogo team={team} size={options.logoSize} />

      <div className={["min-w-0 flex-1", mirrored ? "text-right" : ""].join(" ")}>
        <div
          className={[
            "truncate font-semibold",
            isWinner ? "text-emerald-300" : "",
          ].join(" ")}
          style={styles.teamNameStyle}
        >
          {team?.name || fallbackName}
        </div>

        {options.showRecords && team?.record ? (
          <div className="text-[10px] opacity-55" style={styles.recordStyle}>
            {team.record}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-2">
      {mirrored ? (
        <>
          {scoreBadge}
          {teamInfo}
          {seedBadge}
        </>
      ) : (
        <>
          {seedBadge}
          {teamInfo}
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
      className={[
        "rounded-xl p-3 text-sm border",
        match.winner
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-white/10 bg-white/10",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo team={teamA} size={options.logoSize} />

          <div
            className={[
              "truncate font-medium",
              match.winner === match.teamA ? "text-emerald-300" : "",
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
              match.winner === match.teamB ? "text-emerald-300" : "",
            ].join(" ")}
            style={styles.teamNameStyle}
          >
            {match.teamB || "Team B"}
          </div>

          <TeamLogo team={teamB} size={options.logoSize} />
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