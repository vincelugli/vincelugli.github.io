import { Team } from "../types";

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
        "Challenger": 100,
        "Grandmasters": 90,
        "Master": 80,
        "Diamond": 70,
        "Emerald": 60,
        "Platinum": 50,
        "Gold": 40,
        "Silver": 30,
        "Bronze": 20,
        "Iron": 10,
        "Unranked": 0
    };

    return rankTierToNumber[rankTier] + rankDivision;
}