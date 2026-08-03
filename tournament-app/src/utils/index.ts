import { Player, Team, PlayerAchievement, Match, BracketRound, BracketSeed, BracketTeam } from "../types";

export function compareTeams(t1: Team , t2: Team): number {
    let result = t2.wins - t1.wins;
    if (result !== 0) return result;
    
    // Match wins are equal, tiebreak on losses
    result = t1.losses - t2.losses;
    if (result !== 0) return result;

    // Match wins and losses are equal, tiebreak on game wins
    result = t2.gameWins - t1.gameWins;
    if (result !== 0) return result;

    // Match wins and losses are equal, game wins are equal, tiebreak on game losses
    return t1.gameLosses - t2.gameLosses;
}

export function convertRankToElo(rankTier: string, rankDivision: number): number {
    const rankTierToNumber: {[key: string]: number} = {
        "Challenger": 100,
        "Grandmasters": 100,
        "Grandmaster": 100,
        "Masters": 100,
        "Master": 100,
        "Diamond": 70,
        "Emerald": 60,
        "Platinum": 50,
        "Gold": 40,
        "Silver": 30,
        "Bronze": 20,
        "Iron": 10,
        "Unranked": 0
    };

    if (rankTier === "Masters" || rankTier === "Master" || rankTier === "Grandmasters" || rankTier === "Challenger") {
        return rankTierToNumber[rankTier] + rankDivision;
    }

    return rankTierToNumber[rankTier] + (10 - rankDivision) || 0;
}

export function createOpGgUrl(name: string): string {
    return `https://op.gg/summoners/na/${encodeURIComponent(name.replace('#', '-'))}`
}

export function createOpGgMultiSearchUrl(names: string[]): string {
    const encodedNames = names.map(name => encodeURIComponent(name)).join('%2C');
    return `https://op.gg/lol/multisearch/na?summoners=${encodedNames}`;
}


export function rankTierToShortName(rankTier: string): string {
    const TIER_TO_SHORT: {[key: string]: string} = {
        "Challenger": "C",
        "Grandmasters": "G",
        "Master": "M",
        "Masters": "M",
        "Diamond": "D",
        "Emerald": "E",
        "Platinum": "P",
        "Gold": "G",
        "Silver": "S",
        "Bronze": "B",
        "Iron": "I",
        "Unranked": "U"
    }
    return TIER_TO_SHORT[rankTier];
}

export function compareRanks(player1: Player, player2: Player): number {
    const p1Max = player1.elo !== undefined ? player1.elo : Math.max(
            convertRankToElo(player1.peakRankTier, player1.peakRankDivision),
            convertRankToElo(player1.soloRankTier, player1.soloRankDivision),
            convertRankToElo(player1.flexRankTier, player1.flexRankDivision));
    const p2Max = player2.elo !== undefined ? player2.elo : Math.max(
            convertRankToElo(player2.peakRankTier, player2.peakRankDivision),
            convertRankToElo(player2.soloRankTier, player2.soloRankDivision),
            convertRankToElo(player2.flexRankTier, player2.flexRankDivision));

    if (p1Max === p2Max) {
        let p1Sum = player1.elo !== undefined ? player1.elo : convertRankToElo(player1.peakRankTier, player1.peakRankDivision);
        let p2Sum = player2.elo !== undefined ? player2.elo : convertRankToElo(player2.peakRankTier, player2.peakRankDivision);
        if (player1.soloRankDivision !== -1 && player2.soloRankDivision !== -1) {
            p1Sum += convertRankToElo(player1.soloRankTier, player1.soloRankDivision);
            p2Sum += convertRankToElo(player2.soloRankTier, player2.soloRankDivision);
        }
        if (player1.flexRankDivision !== -1 && player2.flexRankDivision !== -1) {
            p1Sum += convertRankToElo(player1.flexRankTier, player1.flexRankDivision);
            p2Sum += convertRankToElo(player2.flexRankTier, player2.flexRankDivision);
        }
        if (p1Sum === p2Sum) {
            return player1.id - player2.id;
        }
        return p1Sum - p2Sum;
    }

    return p1Max - p2Max;
}

export function getYearFromHash(hash: string): string | undefined {
  const match = hash.match(/#\/(\d{4})/);
  return match ? match[1] : undefined;
}

export function getUrlDivision(division: string): string {
  if (division === 'master') return 'elder';
  if (division === 'gold') return 'elemental';
  return division;
}

export function getYearDisplayString(hash: string): string {
  const year = getYearFromHash(hash);
  return year ? `GRumble ${year}` : "GRumble 2026";
}

export function getFirebasePrefix(division?: string): string {
  const hash = window.location.hash;
  const year = getYearFromHash(hash) || '2026';
  return division ? `grumble${year}_${division}` : `grumble${year}`;
}

const PREVIOUS_WINNERS: { [key: string]: PlayerAchievement } = {
    // Gold Winners
    'banbandd#na1': {title: 'GRumble 2025 Gold Winner', type: 'winner', division: 'gold', year: 2025},
    'cdj#6398': {title: 'GRumble 2025 Gold Winner', type: 'winner', division: 'gold', year: 2025},
    'chonkychip#cooki': {title: 'GRumble 2025 Gold Winner', type: 'winner', division: 'gold', year: 2025},
    'conanjoey#uoft': {title: 'GRumble 2025 Gold Winner', type: 'winner', division: 'gold', year: 2025},
    'sadistictwist#na1': {title: 'GRumble 2025 Gold Winner', type: 'winner', division: 'gold', year: 2025},

    // Gold 2nd Place
    'kiro705#na1': {title: 'GRumble 2025 Gold 2nd Place', type: 'runner_up', division: 'gold', year: 2025},
    'harucchan#na1': {title: 'GRumble 2025 Gold 2nd Place', type: 'runner_up', division: 'gold', year: 2025},
    'joetft#tactx': {title: 'GRumble 2025 Gold 2nd Place', type: 'runner_up', division: 'gold', year: 2025},
    'mokazon#na1': {title: 'GRumble 2025 Gold 2nd Place', type: 'runner_up', division: 'gold', year: 2025},
    'vontease#na1': {title: 'GRumble 2025 Gold 2nd Place', type: 'runner_up', division: 'gold', year: 2025},

    // Master Winners
    'john#noob': {title: 'GRumble 2025 Master Winner', type: 'winner', division: 'master', year: 2025},
    'alekos#na1': {title: 'GRumble 2025 Master Winner', type: 'winner', division: 'master', year: 2025},
    'fnasty#na1': {title: 'GRumble 2025 Master Winner', type: 'winner', division: 'master', year: 2025},
    'gyopo#krnyc': {title: 'GRumble 2025 Master Winner', type: 'winner', division: 'master', year: 2025},
    'lulalualala123#na1': {title: 'GRumble 2025 Master Winner', type: 'winner', division: 'master', year: 2025},

    // Master 2nd Place
    'diceruler#tho': {title: 'GRumble 2025 Master 2nd Place', type: 'runner_up', division: 'master', year: 2025},
    'show#hello': {title: 'GRumble 2025 Master 2nd Place', type: 'runner_up', division: 'master', year: 2025},
    'baybuzz#na1': {title: 'GRumble 2025 Master 2nd Place', type: 'runner_up', division: 'master', year: 2025},
    'exnihilo#없었었다': {title: 'GRumble 2025 Master 2nd Place', type: 'runner_up', division: 'master', year: 2025},
    'grontad#na1': {title: 'GRumble 2025 Master 2nd Place', type: 'runner_up', division: 'master', year: 2025},
    'intrinsically#heart': {title: 'GRumble 2025 Master 2nd Place', type: 'runner_up', division: 'master', year: 2025},

    // 2024 Winners
    'sneakylinkeater#tgdb': {title: 'GRumble 2024 Winner', type: 'winner', division: 'master', year: 2024},
    'avatarluffy#na1': {title: 'GRumble 2024 Winner', type: 'winner', division: 'master', year: 2024},
    'tomytomm#na1': {title: 'GRumble 2024 Winner', type: 'winner', division: 'master', year: 2024},
    'christmas13#na1': {title: 'GRumble 2024 Winner', type: 'winner', division: 'master', year: 2024},
    'vaporéonlover#na1': {title: 'GRumble 2024 Winner', type: 'winner', division: 'master', year: 2024},
    'givesfirstblood#000': {title: 'GRumble 2024 Winner', type: 'winner', division: 'master', year: 2024},
    'megazero#na1': {title: 'GRumble 2024 Winner', type: 'winner', division: 'master', year: 2024},

    // 2024 2nd Place
    'dto10000#na1': {title: 'GRumble 2024 2nd Place', type: 'runner_up', division: 'master', year: 2024},
    'meepsonsale#na1': {title: 'GRumble 2024 2nd Place', type: 'runner_up', division: 'master', year: 2024},
    'mrastroman#na1': {title: 'GRumble 2024 2nd Place', type: 'runner_up', division: 'master', year: 2024},
    'zenith#tofu': {title: 'GRumble 2024 2nd Place', type: 'runner_up', division: 'master', year: 2024},
    'playerneo#na1': {title: 'GRumble 2024 2nd Place', type: 'runner_up', division: 'master', year: 2024},
    'bklounge#na1': {title: 'GRumble 2024 2nd Place', type: 'runner_up', division: 'master', year: 2024},
    'xemacs#lor': {title: 'GRumble 2024 2nd Place', type: 'runner_up', division: 'master', year: 2024},
    'icarus129#na1': {title: 'GRumble 2024 2nd Place', type: 'runner_up', division: 'master', year: 2024},
};

export function getPlayerAchievements(playerName: string): PlayerAchievement[] {
  if (!playerName) return [];
  const normalized = playerName.toLowerCase().replace(/\s+/g, '');
  const achievement = PREVIOUS_WINNERS[normalized];
  return achievement ? [achievement] : [];
}

export function isPlayerCaptain(player: Player, division?: string): boolean {
  if (!player || !player.name) return false;
    const captainNames = (division === 'master') ? [
    "beepimajeep#na1",
    "marshallkm#na1",
    "umm gg#mrshl",
    "nuclear pop#na1",
    "sadgesadgesadge#sadge",
    "lulalualala123#na1",
    "fiallo#na1",
    "cherry avenue#55555",
    "metalicapt #na1",
    "asdfjklg#777",
    "guyuy#na1",
    "tomytomm#na1"
    ] : [
        "K9Delta #Bork",
        "rl1000#BOT",
        "cartonnnn#crisp",
        "Z0MBI3S#Nasty",
        "BanBanDD#NA1",
        "DA VINKl#NA1",
        "reuben12358#na1",
        "Red Rain Coward#succ",
        "Legendbird",
        "iwanttogetaname#NA1",
        "Thiên#vn111",
        "Talenelat#US24"
    ];
  return captainNames.includes(player.name.toLowerCase().trim());
}

export function getNextSunday3PMPT(): Date {
  const now = new Date();
  const nextSunday = new Date(now);
  const currentDay = now.getDay();
  const daysToAdd = currentDay === 0 ? 7 : 7 - currentDay;
  nextSunday.setDate(now.getDate() + daysToAdd);

  const tzString = nextSunday.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
  const parts = tzString.split('/');
  const year = parts[2];
  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  let testDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 22, 0, 0));
  let formattedHour = Number(formatter.formatToParts(testDate).find(p => p.type === 'hour')?.value);
  if (formattedHour !== 15) {
    testDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 0, 0));
  }
  return testDate;
}

export function formatToPMPT(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) + ' PT';
}

export function formatToLocal(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getTeamOrPlaceholder(
  teamId: number,
  teams: Team[],
  matches: Match[]
): { id: number; name: string } | undefined {
  if (teamId >= 0) {
    return teams.find(t => t.id === teamId);
  }
  const matchIdx = Math.floor(Math.abs(teamId) / 100);
  const isWinner = Math.abs(teamId) % 100 === 0;
  const sourceMatchId = `swiss_${matchIdx}`;
  const sourceMatch = matches.find(m => String(m.id) === sourceMatchId);
  if (!sourceMatch) {
    return { id: teamId, name: `Placeholder Match ${matchIdx}` };
  }
  
  const winnerId = getMatchWinnerId(sourceMatch);
  if (sourceMatch.status === 'completed' && winnerId !== null) {
    const loserId = winnerId === sourceMatch.team1Id ? sourceMatch.team2Id : sourceMatch.team1Id;
    const resolvedId = isWinner ? winnerId : loserId;
    return getTeamOrPlaceholder(resolvedId, teams, matches);
  }
  
  const t1 = getTeamOrPlaceholder(sourceMatch.team1Id, teams, matches);
  const t2 = getTeamOrPlaceholder(sourceMatch.team2Id, teams, matches);
  const t1Name = t1 ? t1.name : `Team ${sourceMatch.team1Id}`;
  const t2Name = t2 ? t2.name : `Team ${sourceMatch.team2Id}`;
  
  return {
    id: teamId,
    name: `${isWinner ? 'Winner' : 'Loser'} of ${t1Name} vs ${t2Name}`
  };
}

export function getMatchWinnerId(match: Match): number | null {
  if (match.status !== 'completed') {
    return null;
  }
  if (match.score === 'BYE') {
    return match.team1Id;
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

export function cleanTeamName(name: string): string {
  if (!name) return "";
  return name.replace(/\s*[(]\s*\d+\s*-\s*\d+\s*[)]\s*$/, '').trim();
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

export function calculateSwissStats(teams: Team[], matches: Match[]): TeamStats[] {
  const swissMatches = matches.filter(m => !m.isKnockout && m.status === 'completed');
  
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
      opponents: []
    });
  }
  
  for (const match of swissMatches) {
    const t1Id = match.team1Id;
    const t2Id = match.team2Id;
    
    const isBye = match.score === 'BYE' || t1Id === t2Id;
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
    stats.matchWinPercentage = totalMatches > 0 ? stats.wins / totalMatches : 0;
    
    const totalGames = stats.gameWins + stats.gameLosses;
    stats.gameWinPercentage = totalGames > 0 ? stats.gameWins / totalGames : 0;
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

export function getQualifyingSeeding(teams: Team[], matches: Match[]): (Team | null)[] {
  const stats = calculateSwissStats(teams, matches);
  
  const qualified = stats.filter(s => s.wins === 3);
  
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

export function updateDoubleEliminationBracket(
  currentBracket: BracketRound[],
  teams: Team[],
  matches: Match[]
): BracketRound[] {
  if (currentBracket.length < 6) return currentBracket;

  const seeding = getQualifyingSeeding(teams, matches);
  const updatedBracket = JSON.parse(JSON.stringify(currentBracket)) as BracketRound[];

  const findSeedById = (id: number): BracketSeed | null => {
    for (const round of updatedBracket) {
      const seed = round.seeds.find(s => s.id === id);
      if (seed) return seed;
    }
    return null;
  };

  const getWinnerAndLoserOfSeed = (seedId: number): { winnerId: number; loserId: number } => {
    const seed = findSeedById(seedId);
    if (!seed || seed.status !== 'completed' || !seed.winnerId) {
      return { winnerId: 0, loserId: 0 };
    }
    const loserId = (seed.winnerId === seed.team1Id) ? seed.team2Id : seed.team1Id;
    return { winnerId: seed.winnerId, loserId };
  };

  const resolveBracketTeam = (teamId: number): BracketTeam => {
    if (teamId <= 0) return { id: 0, name: "TBD" };
    const team = teams.find(t => t.id === teamId);
    return team ? { id: team.id, name: team.name } : { id: teamId, name: "Unknown" };
  };

  // 1. Winners Semifinals (Match 1 & 2, seeds 1 and 2)
  const wsf1 = findSeedById(1);
  if (wsf1) {
    wsf1.team1Id = seeding[0]?.id || 0;
    wsf1.team2Id = seeding[3]?.id || 0;
    wsf1.teams = [resolveBracketTeam(wsf1.team1Id), resolveBracketTeam(wsf1.team2Id)];
  }

  const wsf2 = findSeedById(2);
  if (wsf2) {
    wsf2.team1Id = seeding[1]?.id || 0;
    wsf2.team2Id = seeding[2]?.id || 0;
    wsf2.teams = [resolveBracketTeam(wsf2.team1Id), resolveBracketTeam(wsf2.team2Id)];
  }

  // 2. Winners Finals (Match 3, seed 3)
  const wf = findSeedById(3);
  if (wf) {
    wf.team1Id = getWinnerAndLoserOfSeed(1).winnerId;
    wf.team2Id = getWinnerAndLoserOfSeed(2).winnerId;
    wf.teams = [resolveBracketTeam(wf.team1Id), resolveBracketTeam(wf.team2Id)];
  }

  // 3. Losers Round 1 (Match 4 & 5, seeds 4 and 5)
  const l1m1 = findSeedById(4);
  if (l1m1) {
    l1m1.team1Id = seeding[4]?.id || 0;
    l1m1.team2Id = getWinnerAndLoserOfSeed(1).loserId;
    l1m1.teams = [resolveBracketTeam(l1m1.team1Id), resolveBracketTeam(l1m1.team2Id)];
  }

  const l1m2 = findSeedById(5);
  if (l1m2) {
    l1m2.team1Id = seeding[5]?.id || 0;
    l1m2.team2Id = getWinnerAndLoserOfSeed(2).loserId;
    l1m2.teams = [resolveBracketTeam(l1m2.team1Id), resolveBracketTeam(l1m2.team2Id)];
  }

  // 4. Losers Semifinals (Match 6, seed 6)
  const lsf = findSeedById(6);
  if (lsf) {
    lsf.team1Id = getWinnerAndLoserOfSeed(4).winnerId;
    lsf.team2Id = getWinnerAndLoserOfSeed(5).winnerId;
    lsf.teams = [resolveBracketTeam(lsf.team1Id), resolveBracketTeam(lsf.team2Id)];
  }

  // 5. Losers Finals (Match 7, seed 7)
  const lf = findSeedById(7);
  if (lf) {
    lf.team1Id = getWinnerAndLoserOfSeed(3).loserId;
    lf.team2Id = getWinnerAndLoserOfSeed(6).winnerId;
    lf.teams = [resolveBracketTeam(lf.team1Id), resolveBracketTeam(lf.team2Id)];
  }

  // 6. Grand Finals (Match 8 & 9, seeds 8 and 9)
  const gf = findSeedById(8);
  if (gf) {
    gf.team1Id = getWinnerAndLoserOfSeed(3).winnerId;
    gf.team2Id = getWinnerAndLoserOfSeed(7).winnerId;
    gf.teams = [resolveBracketTeam(gf.team1Id), resolveBracketTeam(gf.team2Id)];
  }

  const gfReset = findSeedById(9);
  if (gfReset) {
    const gfSeed = findSeedById(8);
    if (gfSeed && gfSeed.status === 'completed' && gfSeed.winnerId === gfSeed.team2Id) {
      gfReset.team1Id = gfSeed.team1Id;
      gfReset.team2Id = gfSeed.team2Id;
    } else {
      gfReset.team1Id = 0;
      gfReset.team2Id = 0;
    }
    gfReset.teams = [resolveBracketTeam(gfReset.team1Id), resolveBracketTeam(gfReset.team2Id)];
  }

  return updatedBracket;
}



