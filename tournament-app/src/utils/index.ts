import { Player, Team, PlayerAchievement } from "../types";

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
        "Challenger": 10000,
        "Grandmasters": 1000,
        "Masters": 400,
        "Master": 400,
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
    const p1Max = Math.max(
            convertRankToElo(player1.peakRankTier, player1.peakRankDivision),
            convertRankToElo(player1.soloRankTier, player1.soloRankDivision),
            convertRankToElo(player1.flexRankTier, player1.flexRankDivision));
    const p2Max = Math.max(
            convertRankToElo(player2.peakRankTier, player2.peakRankDivision),
            convertRankToElo(player2.soloRankTier, player2.soloRankDivision),
            convertRankToElo(player2.flexRankTier, player2.flexRankDivision));

    if (p1Max === p2Max) {
        let p1Sum = convertRankToElo(player1.peakRankTier, player1.peakRankDivision);
        let p2Sum = convertRankToElo(player2.peakRankTier, player2.peakRankDivision);
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

