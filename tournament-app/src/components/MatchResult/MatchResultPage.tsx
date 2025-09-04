import React from 'react';
import styled from 'styled-components';
import MatchResult from './MatchResult';
import { Match, MatchResultData, Team } from '../../types';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
`;

// Example mock data for demonstration
const mockMatchResult: MatchResultData = {
  blueTeam: {
    bans: ["Aatrox", "Ashe", "Caitlyn", "Darius", "Ezreal"],
    players: [
      { playerName: "Player1", championName: "Garen", summonerSpells: ["SummonerFlash", "SummonerTeleport"], items: [3071, 3078, 3006, 3053, 6672, 3156] },
      { playerName: "Player2", championName: "JarvanIV", summonerSpells: ["SummonerFlash", "SummonerSmite"], items: [6692, 3111, 3065, 3076, 6333, 3143] },
      { playerName: "Player3", championName: "Orianna", summonerSpells: ["SummonerFlash", "SummonerHeal"], items: [6653, 3020, 4628, 3157, 3135, 0] },
      { playerName: "Player4", championName: "Jinx", summonerSpells: ["SummonerFlash", "SummonerHeal"], items: [3085, 3006, 6672, 3031, 3036, 3072] },
      { playerName: "Player5", championName: "Lulu", summonerSpells: ["SummonerFlash", "SummonerExhaust"], items: [6617, 3011, 3853, 3157, 0, 0] },
    ],
  },
  redTeam: {
    bans: ["Fiora", "Gangplank", "Gragas", "Graves", "Hecarim"],
    players: [
      { playerName: "Player6", championName: "Renekton", summonerSpells: ["SummonerFlash", "SummonerTeleport"], items: [3078, 3111, 6691, 3065, 3071, 3143] },
      { playerName: "Player7", championName: "LeeSin", summonerSpells: ["SummonerFlash", "SummonerSmite"], items: [6692, 3156, 3071, 3065, 3143, 0] },
      { playerName: "Player8", championName: "Syndra", summonerSpells: ["SummonerFlash", "SummonerTeleport"], items: [6653, 3020, 3157, 4628, 3135, 0] },
      { playerName: "Player9", championName: "Kaisa", summonerSpells: ["SummonerFlash", "SummonerHeal"], items: [3085, 3006, 6671, 3031, 3036, 3072] },
      { playerName: "Player10", championName: "Nautilus", summonerSpells: ["SummonerFlash", "SummonerDot"], items: [3853, 3011, 3190, 3065, 0, 0] },
    ],
  },
};

interface MatchResultProps {
    match?: Match;
    teams?: Team[];
}

const MatchResultPage: React.FC<MatchResultProps> = ({ match, teams }) => {
    const getMatchResultFromMatch = (match?: Match) => {
        return mockMatchResult;
    };

    const matchResult = getMatchResultFromMatch(match);
    const team1 = !!match && !!teams ? teams.find(t => t.id === match.team1Id) : {name: ""};
    const team2 = !!match && !!teams ? teams.find(t => t.id === match.team2Id) : {name: ""};

    return (
        <>
            <h1>{team1?.name + " vs " + team2?.name}</h1>
            <MatchResult result={matchResult} />
        </>
    );
};

export default MatchResultPage;
