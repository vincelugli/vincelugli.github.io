import { Player, Team } from "../types";

export function compareTeams(t1: Team , t2: Team): number {
    let result = t2.wins - t1.wins;
    if (result !== 0) return result;
    
    // Match wins are equal, tiebreak on losses
    result = t1.losses - t2.losses;
    if (result !== 0) return result;

    // Match wins and losses are equal, tiebreak on game wins
    result = t1.gameWins - t2.gameWins;
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
        return p1Sum - p2Sum;
    }

    return p1Max - p2Max;
}
