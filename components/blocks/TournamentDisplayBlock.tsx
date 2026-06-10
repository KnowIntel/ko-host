"use client";

import type { MicrositeBlock } from "@/lib/templates/builder";

type Props = {
  block: Extract<MicrositeBlock, { type: "tournament_display" }>;
  designKey?: string;
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
        <Matchups matches={matches} />
      ) : (
        <Bracket
          matches={matches}
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
  bracketLayout,
  leftDivisionLabel,
  rightDivisionLabel,
  finalsLabel,
  emptyStateText,
}: {
  matches: Array<any>;
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
      (m) => m.division === "west" || !m.division,
    );

    const eastMatches = matches.filter(
      (m) => m.division === "east",
    );

    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
            {leftDivisionLabel || "West"}
          </div>

          <div className="space-y-3">
            {westMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
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
            {eastMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
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
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
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

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      <div className="min-w-[220px] space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
          Round 1
        </div>

        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      <div className="min-w-[220px] space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">
          Finals
        </div>

        <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm">
          Winner advances here
        </div>
      </div>
    </div>
  );
}

function Standings({ teams }: { teams: Array<any> }) {
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
          {sortedTeams.map((team) => (
            <tr key={team.id} className="border-t border-white/10">
              <td className="py-2 pr-3 font-medium">{team.name || "Team"}</td>
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

function Matchups({ matches }: { matches: Array<any> }) {
  return (
    <div className="grid gap-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function MatchCard({ match }: { match: any }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">{match.teamA || "Team A"}</div>
        <div className="text-xs opacity-60">vs</div>
        <div className="font-medium">{match.teamB || "Team B"}</div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs opacity-70">
        <span>
          {match.scoreA ?? 0} - {match.scoreB ?? 0}
        </span>
        <span className="rounded-full bg-white/10 px-2 py-1 capitalize">
          {match.status || "upcoming"}
        </span>
      </div>

      {[match.gameDate, match.gameTime, match.location]
        .filter(Boolean)
        .length ? (
        <div className="mt-2 text-xs opacity-70">
          {[match.gameDate, match.gameTime, match.location]
            .filter(Boolean)
            .join(" • ")}
        </div>
      ) : null}
    </div>
  );
}