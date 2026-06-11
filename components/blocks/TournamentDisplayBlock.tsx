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
};

type TournamentMatchLike = {
  id?: string;
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
  bracketLayout,
  leftDivisionLabel,
  rightDivisionLabel,
  finalsLabel,
  emptyStateText,
}: {
  matches: TournamentMatchLike[];
  teams: TournamentTeamLike[];
  bracketLayout?: string;
  leftDivisionLabel?: string;
  rightDivisionLabel?: string;
  finalsLabel?: string;
  emptyStateText?: string;
}) {
  if (!matches.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-4 text-sm opacity-70">
        {emptyStateText || "Add matchups to build your tournament display."}
      </div>
    );
  }

  if (bracketLayout === "east_west") {
    const westMatches = matches.filter(
      (match) => match.division === "west" || !match.division,
    );

    const eastMatches = matches.filter((match) => match.division === "east");

    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
            {leftDivisionLabel || "West"}
          </div>

          <div className="space-y-3">
            {westMatches.map((match, index) => (
              <MatchCard
                key={match.id || `west-match-${index}`}
                match={match}
                teams={teams}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
            {finalsLabel || "Finals"}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-center">
            Championship Match
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
            {rightDivisionLabel || "East"}
          </div>

          <div className="space-y-3">
            {eastMatches.map((match, index) => (
              <MatchCard
                key={match.id || `east-match-${index}`}
                match={match}
                teams={teams}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (bracketLayout === "double_elimination") {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
            Winner Bracket
          </div>

          <div className="space-y-3">
            {matches.map((match, index) => (
              <MatchCard
                key={match.id || `winner-match-${index}`}
                match={match}
                teams={teams}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
            Loser Bracket
          </div>

          <div className="rounded-xl border border-dashed border-white/20 p-4 text-sm opacity-70">
            Loser bracket structure coming next phase.
          </div>
        </div>
      </div>
    );
  }

  const rounds =
    matches.reduce(
      (acc, match) => {
        const roundName =
          (match as any).roundTitle ||
          (match as any).round ||
          "Round 1";

        if (!acc[roundName]) {
          acc[roundName] = [];
        }

        acc[roundName].push(match);
        return acc;
      },
      {} as Record<string, TournamentMatchLike[]>,
    );

  const roundNames = Object.keys(rounds);

  return (
    <div className="flex gap-5 overflow-x-auto pb-2">
      {roundNames.map((roundName) => (
        <div
          key={roundName}
          className="min-w-[260px] space-y-3"
        >
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
                  <TeamLogo team={team} />

                  <span className="font-medium">{team.name || "Team"}</span>
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
    match.winner === match.teamA
      ? "text-emerald-300"
      : "",
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
    match.winner === match.teamB
      ? "text-emerald-300"
      : "",
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

function findTeamByName(
  teams: TournamentTeamLike[],
  name?: string,
): TournamentTeamLike | undefined {
  if (!name) return undefined;

  return teams.find(
    (team) => (team.name || "").trim().toLowerCase() === name.trim().toLowerCase(),
  );
}