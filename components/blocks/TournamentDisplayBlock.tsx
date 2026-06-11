"use client";

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

export default function TournamentDisplayBlock({ block }: Props) {
  const data = block.data;
  const teams = Array.isArray(data.teams) ? data.teams : [];
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const displayMode = data.displayMode ?? "bracket";

  return (
    <div className="h-full w-full overflow-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-white">
      <div className="mb-4">
        <div className="text-lg font-semibold">
          {data.tournamentName || "Tournament Display"}
        </div>

        <div className="text-xs opacity-70">
          {[data.season, data.year].filter(Boolean).join(" • ")}
        </div>
      </div>

      {displayMode === "standings" ? (
        <Standings teams={teams} />
      ) : displayMode === "matchups" ? (
        <Matchups matches={matches} teams={teams} />
      ) : (
        <Bracket
          matches={matches}
          teams={teams}
          designStyle={(data as any).designStyle ?? "style1"}
          bracketLayout={data.bracketLayout}
          leftDivisionLabel={data.leftDivisionLabel}
          rightDivisionLabel={data.rightDivisionLabel}
          finalsLabel={data.finalsLabel}
          emptyStateText={data.emptyStateText}
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
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
  designStyle?: string;
  bracketLayout?: string;
  leftDivisionLabel?: string;
  rightDivisionLabel?: string;
  finalsLabel?: string;
  emptyStateText?: string;
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
      />
    );
  }

  return <RoundColumnBracket matches={matches} teams={teams} />;
}

function Style1EastWestBracket({
  matches,
  teams,
  leftDivisionLabel,
  rightDivisionLabel,
  finalsLabel,
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
  leftDivisionLabel?: string;
  rightDivisionLabel?: string;
  finalsLabel?: string;
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
      match.division === "finals" ||
      getRoundName(match) === "Championship",
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
        />

        <ChampionshipCard
          label={finalsLabel || "Championship"}
          match={championship}
          teams={teams}
        />

        <BracketSide
          label={rightDivisionLabel || "East Division"}
          align="right"
          round1={eastRound1}
          round2={eastRound2}
          divisionFinal={eastFinal}
          teams={teams}
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
}: {
  label: string;
  align: "left" | "right";
  round1: TournamentMatchLike[];
  round2: TournamentMatchLike[];
  divisionFinal?: TournamentMatchLike;
  teams: TournamentTeamLike[];
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

  return (
    <div>
      <div
        className={[
          "mb-4 text-xs font-bold uppercase tracking-[0.18em]",
          align === "right" ? "text-right" : "",
        ].join(" ")}
      >
        {label}
      </div>

      {align === "right" ? (
        <div className="grid grid-cols-[220px_54px_220px_54px_220px] items-center">
          <div>
            <BracketMatchCard match={finalMatch} teams={teams} large mirrored />
          </div>

          <ConnectorColumn rows={2} align={align} />

          <div className="space-y-16">
            {round2Matches.map((match, index) => (
              <BracketMatchCard
                key={match.id || `${align}-round2-${index}`}
                match={match}
                teams={teams}
                mirrored
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
              />
            ))}
          </div>

          <ConnectorColumn rows={2} align={align} />

          <div>
            <BracketMatchCard match={finalMatch} teams={teams} large />
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
}: {
  label: string;
  match?: TournamentMatchLike;
  teams: TournamentTeamLike[];
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
      <div className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] opacity-70">
        {label}
      </div>

      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-300/10 text-3xl">
        🏆
      </div>

      <BracketMatchCard match={safeMatch} teams={teams} championship />

      <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-5 py-3 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-200">
          Champion
        </div>
        <div className="mt-1 text-sm font-semibold">
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
}: {
  match: TournamentMatchLike;
  teams: TournamentTeamLike[];
  compact?: boolean;
  large?: boolean;
  championship?: boolean;
  mirrored?: boolean;
}) {
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
      />

      <div className="my-2 h-px bg-white/10" />

      <BracketTeamRow
        team={teamB}
        fallbackName={match.teamB || "Team B"}
        score={match.scoreB}
        isWinner={teamBWon}
        mirrored={mirrored}
      />

      {match.status ? (
        <div className="mt-2 text-[10px] uppercase tracking-[0.14em] opacity-60">
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
}: {
  team?: TournamentTeamLike;
  fallbackName: string;
  score?: number;
  isWinner?: boolean;
  mirrored?: boolean;
}) {
  const scoreBadge = (
    <div
      className={[
        "min-w-8 rounded-lg px-2 py-1 text-center text-xs font-bold",
        isWinner
          ? "bg-emerald-400 text-black"
          : "bg-white/10 text-white/70",
      ].join(" ")}
    >
      {score ?? 0}
    </div>
  );

  const seedBadge = team?.seed ? (
    <div className="w-5 text-[10px] font-bold opacity-70">{team.seed}</div>
  ) : (
    <div className="w-5" />
  );

  const teamInfo = (
    <>
      <TeamLogo team={team} />

      <div className={["min-w-0 flex-1", mirrored ? "text-right" : ""].join(" ")}>
        <div
          className={[
            "truncate font-semibold",
            isWinner ? "text-emerald-300" : "",
          ].join(" ")}
          style={{ color: team?.color || undefined }}
        >
          {team?.name || fallbackName}
        </div>

        {team?.record ? (
          <div className="text-[10px] opacity-55">{team.record}</div>
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
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
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
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Standings({ teams }: { teams: TournamentTeamLike[] }) {
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
            <th className="py-2 pr-3">Record</th>
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
                  {team.seed ? (
                    <div className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold">
                      #{team.seed}
                    </div>
                  ) : null}

                  <TeamLogo team={team} />

                  <span
                    className="font-medium"
                    style={{ color: team.color || undefined }}
                  >
                    {team.name || "Team"}
                  </span>
                </div>
              </td>

              <td className="py-2 pr-3">{team.wins ?? 0}</td>
              <td className="py-2 pr-3">{team.losses ?? 0}</td>
              <td className="py-2 pr-3">{team.record || "0-0"}</td>
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
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
}) {
  return (
    <div className="grid gap-3">
      {matches.map((match, index) => (
        <MatchCard
          key={match.id || `matchup-${index}`}
          match={match}
          teams={teams}
        />
      ))}
    </div>
  );
}

function MatchCard({
  match,
  teams,
}: {
  match: TournamentMatchLike;
  teams: TournamentTeamLike[];
}) {
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
          <TeamLogo team={teamA} />

          <div
            className={[
              "truncate font-medium",
              match.winner === match.teamA ? "text-emerald-300" : "",
            ].join(" ")}
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
          >
            {match.teamB || "Team B"}
          </div>

          <TeamLogo team={teamB} />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs opacity-70">
        <span>
          {match.scoreA ?? 0} - {match.scoreB ?? 0}
        </span>

        <span className="rounded-full bg-white/10 px-2 py-1 capitalize">
          {match.status || "upcoming"}
        </span>
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

function TeamLogo({ team }: { team?: TournamentTeamLike }) {
  if (!team?.imageUrl) return null;

  return (
    <img
      src={team.imageUrl}
      alt={team.name || "Team logo"}
      className="h-8 w-8 shrink-0 rounded-full border border-white/10 bg-white/10 object-cover"
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