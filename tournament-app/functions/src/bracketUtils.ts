export interface BracketTeam {
  id?: number;
  name?: string;
  seed?: number;
}

export interface BracketSeed {
  id: number;
  status: "upcoming" | "in_progress" | "in progress" | "completed" | string;
  teams: BracketTeam[];
  team1Id: number;
  team2Id: number;
  tournamentCodes: string[];
  weekPlayed: number;
  winnerId?: number | null;
  score?: string;
  isKnockout: boolean;
  stage?: string;
  coinFlipResult?: "heads" | "tails" | null;
  firstGameSideSelection?: "blue" | "red" | null;
  results?: Record<
    string,
    {winnerId: number; team1Win: number; team2Win: number}
  >;
}

export interface BracketRound {
  title: string;
  seeds: BracketSeed[];
}

export interface Team {
  id: number;
  name: string;
  captainId?: number;
  players?: number[];
  wins?: number;
  losses?: number;
  gameWins?: number;
  gameLosses?: number;
  record?: string;
  gameRecord?: string;
}

export interface Match {
  id: number | string;
  team1Id: number;
  team2Id: number;
  status: string;
  tournamentCodes?: string[];
  weekPlayed?: number;
  winnerId?: number | null;
  score?: string;
  isKnockout?: boolean;
  stage?: string;
  results?: Record<
    string,
    {winnerId: number; team1Win: number; team2Win: number}
  >;
  team1Wins?: number;
  team2Wins?: number;
}

export interface TeamStats {
  team: Team;
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  matchWinPercentage: number;
  gameWinPercentage: number;
  adjustedBuchholz: number;
  opponents: number[];
}

/**
 * Gets the winner ID of a completed match.
 * @param {Match} match - Match object.
 * @return {number | null} Winner team ID or null.
 */
export function getMatchWinnerId(match: Match): number | null {
  if (match.status !== "completed") {
    return null;
  }
  if (match.score === "BYE") {
    return match.team1Id;
  }
  if (
    match.winnerId !== undefined &&
    match.winnerId !== null &&
    match.winnerId > 0
  ) {
    return match.winnerId;
  }
  if (match.team1Wins !== undefined && match.team2Wins !== undefined) {
    if (match.team1Wins > match.team2Wins) {
      return match.team1Id;
    }
    if (match.team2Wins > match.team1Wins) {
      return match.team2Id;
    }
  }
  return null;
}

/**
 * Checks whether a match is a knockout stage match.
 * @param {Match} m - The match object.
 * @return {boolean} True if the match is from the knockout stage.
 */
export function isKnockoutMatch(m: Match): boolean {
  if (m.isKnockout) return true;
  if (typeof m.id === "string" && m.id.startsWith("ko_")) return true;
  if (m.stage && /^(winners|losers|grand\s*finals?)/i.test(m.stage.trim())) {
    return true;
  }
  return false;
}

/**
 * Calculates Swiss tournament statistics for all teams.
 * @param {Team[]} teams - List of teams.
 * @param {Match[]} matches - List of matches.
 * @return {TeamStats[]} Array of calculated team statistics.
 */
export function calculateSwissStats(
  teams: Team[],
  matches: Match[]
): TeamStats[] {
  const swissMatches = matches.filter(
    (m) => !isKnockoutMatch(m) && m.status === "completed"
  );

  const statsMap = new Map<number, TeamStats>();

  for (const team of teams) {
    statsMap.set(team.id, {
      team,
      wins: 0,
      losses: 0,
      gameWins: 0,
      gameLosses: 0,
      matchWinPercentage: 0,
      gameWinPercentage: 0,
      adjustedBuchholz: 0,
      opponents: [],
    });
  }

  for (const match of swissMatches) {
    const t1Id = match.team1Id;
    const t2Id = match.team2Id;

    const isBye = match.score === "BYE" || t1Id === t2Id;
    const winnerId = getMatchWinnerId(match);

    const stats1 = statsMap.get(t1Id);
    if (stats1) {
      if (isBye || winnerId === t1Id) {
        stats1.wins++;
        stats1.gameWins += 2;
      } else {
        stats1.losses++;
        if (t1Id !== -1 && t2Id !== -1) {
          stats1.gameWins += match.team1Wins || 0;
          stats1.gameLosses += match.team2Wins || 0;
        }
      }
      if (!isBye && t2Id > 0) {
        stats1.opponents.push(t2Id);
      }
    }

    if (!isBye && t2Id > 0) {
      const stats2 = statsMap.get(t2Id);
      if (stats2) {
        if (winnerId === t2Id) {
          stats2.wins++;
          stats2.gameWins += 2;
        } else {
          stats2.losses++;
          if (t1Id !== -1 && t2Id !== -1) {
            stats2.gameWins += match.team2Wins || 0;
            stats2.gameLosses += match.team1Wins || 0;
          }
        }
        if (t1Id > 0) {
          stats2.opponents.push(t1Id);
        }
      }
    }
  }

  for (const stats of statsMap.values()) {
    const totalMatches = stats.wins + stats.losses;
    stats.matchWinPercentage =
      totalMatches > 0 ? stats.wins / totalMatches : 0;

    const totalGames = stats.gameWins + stats.gameLosses;
    stats.gameWinPercentage =
      totalGames > 0 ? stats.gameWins / totalGames : 0;
  }

  for (const stats of statsMap.values()) {
    let buchholz = 0;
    for (const oppId of stats.opponents) {
      const oppStats = statsMap.get(oppId);
      if (oppStats) {
        buchholz += oppStats.wins;
        if (oppStats.wins === 3 && oppStats.losses === 0) {
          buchholz += 2;
        } else if (oppStats.wins === 3 && oppStats.losses === 1) {
          buchholz += 1;
        }
      }
    }
    stats.adjustedBuchholz = buchholz;
  }

  return Array.from(statsMap.values());
}

/**
 * Calculates the top 6 qualifying seeds from Swiss matches.
 * @param {Team[]} teams - List of teams.
 * @param {Match[]} matches - List of matches.
 * @return {(Team | null)[]} Array of 6 seeded teams.
 */
export function getQualifyingSeeding(
  teams: Team[],
  matches: Match[]
): (Team | null)[] {
  const stats = calculateSwissStats(teams, matches);

  const qualified = stats.filter((s) => s.wins === 3);

  qualified.sort((a, b) => {
    if (a.matchWinPercentage !== b.matchWinPercentage) {
      return b.matchWinPercentage - a.matchWinPercentage;
    }
    if (a.adjustedBuchholz !== b.adjustedBuchholz) {
      return b.adjustedBuchholz - a.adjustedBuchholz;
    }
    if (a.gameWinPercentage !== b.gameWinPercentage) {
      return b.gameWinPercentage - a.gameWinPercentage;
    }
    return a.team.id - b.team.id;
  });

  const seeding: (Team | null)[] = Array(6).fill(null);
  for (let i = 0; i < qualified.length && i < 6; i++) {
    seeding[i] = qualified[i].team;
  }

  return seeding;
}

/**
 * Updates a 6-team double elimination bracket with progressions.
 * @param {BracketRound[]} currentBracket - The bracket rounds to update.
 * @param {Team[]} teams - List of teams.
 * @param {Match[]} matches - List of all matches.
 * @return {BracketRound[]} Updated bracket.
 */
export function updateDoubleEliminationBracket(
  currentBracket: BracketRound[],
  teams: Team[],
  matches: Match[]
): BracketRound[] {
  if (!currentBracket || currentBracket.length < 6) return currentBracket;

  const seeding = getQualifyingSeeding(teams, matches);
  const updatedBracket = JSON.parse(
    JSON.stringify(currentBracket)
  ) as BracketRound[];

  const getTeamSeedNumber = (teamId: number): number | undefined => {
    if (teamId <= 0) return undefined;
    const idx = seeding.findIndex((t) => t?.id === teamId);
    return idx >= 0 ? idx + 1 : undefined;
  };

  const findSeedById = (id: number): BracketSeed | null => {
    for (const round of updatedBracket) {
      const seed = round.seeds.find((s) => s.id === id);
      if (seed) return seed;
    }
    return null;
  };

  const getWinnerAndLoserOfSeed = (
    seedId: number
  ): {winnerId: number; loserId: number} => {
    const seed = findSeedById(seedId);
    if (!seed) {
      return {winnerId: 0, loserId: 0};
    }

    let winnerId = seed.winnerId || null;
    let isCompleted = seed.status === "completed";

    if (!winnerId || !isCompleted) {
      const match = matches.find((m) =>
        m.id === `ko_${seedId}` ||
        (m.isKnockout &&
          (String(m.id) === String(seedId) ||
            String(m.id).replace(/^ko_/, "") === String(seedId)))
      );
      if (
        match &&
        (match.status === "completed" ||
          (match.winnerId !== undefined &&
            match.winnerId !== null &&
            match.winnerId > 0))
      ) {
        winnerId = match.winnerId || getMatchWinnerId(match);
        isCompleted = true;
      }
    }

    if (!isCompleted || !winnerId) {
      return {winnerId: 0, loserId: 0};
    }
    const loserId =
      winnerId === seed.team1Id ? seed.team2Id : seed.team1Id;
    return {winnerId, loserId};
  };

  const resolveBracketTeam = (teamId: number): BracketTeam => {
    if (teamId <= 0) return {id: 0, name: "TBD"};
    const team = teams.find((t) => t.id === teamId);
    const teamSeed = getTeamSeedNumber(teamId);
    return team ?
      {id: team.id, name: team.name, seed: teamSeed} :
      {id: teamId, name: "Unknown", seed: teamSeed};
  };

  // 1. Winners Semifinals (Match 1 & 2, seeds 1 and 2)
  const wsf1 = findSeedById(1);
  if (wsf1) {
    if (
      wsf1.status !== "completed" &&
      wsf1.status !== "in_progress" &&
      wsf1.status !== "in progress"
    ) {
      wsf1.team1Id = seeding[0]?.id || wsf1.team1Id || 0;
      wsf1.team2Id = seeding[3]?.id || wsf1.team2Id || 0;
    }
    wsf1.teams = [
      resolveBracketTeam(wsf1.team1Id),
      resolveBracketTeam(wsf1.team2Id),
    ];
  }

  const wsf2 = findSeedById(2);
  if (wsf2) {
    if (
      wsf2.status !== "completed" &&
      wsf2.status !== "in_progress" &&
      wsf2.status !== "in progress"
    ) {
      wsf2.team1Id = seeding[1]?.id || wsf2.team1Id || 0;
      wsf2.team2Id = seeding[2]?.id || wsf2.team2Id || 0;
    }
    wsf2.teams = [
      resolveBracketTeam(wsf2.team1Id),
      resolveBracketTeam(wsf2.team2Id),
    ];
  }

  // 2. Winners Finals (Match 3, seed 3)
  const wf = findSeedById(3);
  if (wf) {
    const w1 = getWinnerAndLoserOfSeed(1).winnerId;
    const w2 = getWinnerAndLoserOfSeed(2).winnerId;
    if (w1 > 0) wf.team1Id = w1;
    if (w2 > 0) wf.team2Id = w2;
    wf.teams = [
      resolveBracketTeam(wf.team1Id),
      resolveBracketTeam(wf.team2Id),
    ];
  }

  // 3. Losers Round 1 (Match 4 & 5, seeds 4 and 5)
  const l1m1 = findSeedById(4);
  if (l1m1) {
    if (
      l1m1.status !== "completed" &&
      l1m1.status !== "in_progress" &&
      l1m1.status !== "in progress"
    ) {
      l1m1.team1Id = seeding[4]?.id || l1m1.team1Id || 0;
    }
    const l1 = getWinnerAndLoserOfSeed(1).loserId;
    if (l1 > 0) l1m1.team2Id = l1;
    l1m1.teams = [
      resolveBracketTeam(l1m1.team1Id),
      resolveBracketTeam(l1m1.team2Id),
    ];
  }

  const l1m2 = findSeedById(5);
  if (l1m2) {
    if (
      l1m2.status !== "completed" &&
      l1m2.status !== "in_progress" &&
      l1m2.status !== "in progress"
    ) {
      l1m2.team1Id = seeding[5]?.id || l1m2.team1Id || 0;
    }
    const l2 = getWinnerAndLoserOfSeed(2).loserId;
    if (l2 > 0) l1m2.team2Id = l2;
    l1m2.teams = [
      resolveBracketTeam(l1m2.team1Id),
      resolveBracketTeam(l1m2.team2Id),
    ];
  }

  // 4. Losers Semifinals (Match 6, seed 6)
  const lsf = findSeedById(6);
  if (lsf) {
    const w4 = getWinnerAndLoserOfSeed(4).winnerId;
    const w5 = getWinnerAndLoserOfSeed(5).winnerId;
    if (w4 > 0) lsf.team1Id = w4;
    if (w5 > 0) lsf.team2Id = w5;
    lsf.teams = [
      resolveBracketTeam(lsf.team1Id),
      resolveBracketTeam(lsf.team2Id),
    ];
  }

  // 5. Losers Finals (Match 7, seed 7)
  const lf = findSeedById(7);
  if (lf) {
    const l3 = getWinnerAndLoserOfSeed(3).loserId;
    const w6 = getWinnerAndLoserOfSeed(6).winnerId;
    if (l3 > 0) lf.team1Id = l3;
    if (w6 > 0) lf.team2Id = w6;
    lf.teams = [
      resolveBracketTeam(lf.team1Id),
      resolveBracketTeam(lf.team2Id),
    ];
  }

  // 6. Grand Finals (Match 8 & 9, seeds 8 and 9)
  const gf = findSeedById(8);
  if (gf) {
    const w3 = getWinnerAndLoserOfSeed(3).winnerId;
    const w7 = getWinnerAndLoserOfSeed(7).winnerId;
    if (w3 > 0) gf.team1Id = w3;
    if (w7 > 0) gf.team2Id = w7;
    gf.teams = [
      resolveBracketTeam(gf.team1Id),
      resolveBracketTeam(gf.team2Id),
    ];
  }

  const gfReset = findSeedById(9);
  if (gfReset) {
    const gfSeed = findSeedById(8);
    if (
      gfSeed &&
      gfSeed.status === "completed" &&
      gfSeed.winnerId === gfSeed.team2Id
    ) {
      gfReset.team1Id = gfSeed.team1Id;
      gfReset.team2Id = gfSeed.team2Id;
    } else if (
      gfReset.status !== "completed" &&
      gfReset.status !== "in_progress" &&
      gfReset.status !== "in progress"
    ) {
      gfReset.team1Id = 0;
      gfReset.team2Id = 0;
    }
    gfReset.teams = [
      resolveBracketTeam(gfReset.team1Id),
      resolveBracketTeam(gfReset.team2Id),
    ];
  }

  return updatedBracket;
}

/**
 * Updates a bracket document based on a processed game result.
 * @param {BracketRound[]} currentBracket - The bracket rounds to update.
 * @param {string} shortCode - The match tournament code.
 * @param {number} winnerId - The winner team ID.
 * @param {number | string} matchId - The match ID.
 * @param {Team[]} teams - List of teams.
 * @param {Match[]} matches - List of matches.
 * @param {Match | null} currentMatch - The current match object if available.
 * @return {BracketRound[]} Updated bracket.
 */
export function updateBracketForGameResult(
  currentBracket: BracketRound[],
  shortCode: string,
  winnerId: number,
  matchId: number | string,
  teams: Team[],
  matches: Match[],
  currentMatch?: Match | null
): BracketRound[] {
  if (!currentBracket || currentBracket.length === 0) return currentBracket;

  const updatedBracket = JSON.parse(
    JSON.stringify(currentBracket)
  ) as BracketRound[];
  const WINS_NEEDED_FOR_MATCH = 2;

  // Locate the seed matching this game/match
  let targetSeed: BracketSeed | null = null;

  for (const round of updatedBracket) {
    for (const seed of round.seeds) {
      // 1. Match by tournamentCode
      if (
        Array.isArray(seed.tournamentCodes) &&
        seed.tournamentCodes.includes(shortCode)
      ) {
        targetSeed = seed;
        break;
      }
      // 2. Match by matchId
      const cleanMatchId = String(matchId).replace(/^ko_/, "");
      if (
        String(seed.id) === cleanMatchId ||
        `ko_${seed.id}` === String(matchId)
      ) {
        targetSeed = seed;
        break;
      }
      // 3. Match by currentMatch teams if available and isKnockout
      if (
        currentMatch &&
        (currentMatch.isKnockout || String(currentMatch.id).startsWith("ko_"))
      ) {
        const isSamePair =
          (seed.team1Id === currentMatch.team1Id &&
            seed.team2Id === currentMatch.team2Id) ||
          (seed.team1Id === currentMatch.team2Id &&
            seed.team2Id === currentMatch.team1Id);
        if (isSamePair) {
          targetSeed = seed;
          break;
        }
      }
    }
    if (targetSeed) break;
  }

  if (targetSeed) {
    // If targetSeed doesn't have tournamentCode yet, record it
    if (
      shortCode &&
      (!targetSeed.tournamentCodes ||
        !targetSeed.tournamentCodes.includes(shortCode))
    ) {
      const existingCodes = targetSeed.tournamentCodes || [];
      targetSeed.tournamentCodes = Array.from(
        new Set([...existingCodes, shortCode])
      );
    }

    let team1Wins = 0;
    let team2Wins = 0;

    if (currentMatch && currentMatch.results) {
      const resultsList = Object.values(currentMatch.results);
      const mTeam1Wins = resultsList.reduce(
        (sum: number, r: {team1Win?: number}) => sum + (r.team1Win || 0),
        0
      );
      const mTeam2Wins = resultsList.reduce(
        (sum: number, r: {team2Win?: number}) => sum + (r.team2Win || 0),
        0
      );

      if (currentMatch.team1Id === targetSeed.team1Id) {
        team1Wins = mTeam1Wins;
        team2Wins = mTeam2Wins;
      } else if (currentMatch.team1Id === targetSeed.team2Id) {
        team1Wins = mTeam2Wins;
        team2Wins = mTeam1Wins;
      } else {
        team1Wins = mTeam1Wins;
        team2Wins = mTeam2Wins;
      }
    } else {
      targetSeed.results = targetSeed.results || {};
      const isSeedTeam1 = winnerId === targetSeed.team1Id;
      targetSeed.results[shortCode] = {
        winnerId,
        team1Win: isSeedTeam1 ? 1 : 0,
        team2Win: isSeedTeam1 ? 0 : 1,
      };
      const resList = Object.values(targetSeed.results);
      team1Wins = resList.reduce(
        (sum: number, r: {team1Win?: number}) => sum + (r.team1Win || 0),
        0
      );
      team2Wins = resList.reduce(
        (sum: number, r: {team2Win?: number}) => sum + (r.team2Win || 0),
        0
      );
    }

    targetSeed.score = `${team1Wins}-${team2Wins}`;

    if (
      team1Wins >= WINS_NEEDED_FOR_MATCH ||
      team2Wins >= WINS_NEEDED_FOR_MATCH
    ) {
      targetSeed.status = "completed";
      targetSeed.winnerId =
        team1Wins >= WINS_NEEDED_FOR_MATCH ?
          targetSeed.team1Id :
          targetSeed.team2Id;
    } else {
      targetSeed.status = "in_progress";
      targetSeed.winnerId = null;
    }
  }

  // Advance winners and losers through the bracket
  return updateDoubleEliminationBracket(updatedBracket, teams, matches);
}
