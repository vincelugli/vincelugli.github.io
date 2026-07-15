import React from 'react';
import { MatchResultData, PlayerResult, TeamResult } from '../../types';
import {
  MatchResultContainer,
  MatchResultTeamPanelContainer,
  MatchResultBansContainer,
  MatchResultBanIcon,
  MatchResultPlayersContainer,
  MatchResultPlayerRowContainer,
  MatchResultChampionIcon,
  MatchResultSummonerSpells,
  MatchResultSpellIcon,
  MatchResultPlayerName,
  MatchResultItemsGrid,
  MatchResultItemIcon,
  MatchResultEmptyItemSlot,
  MatchResultPlayerInfo,
  MatchResultKDA,
} from '../../styles';

// --- Data Dragon Configuration ---
const LATEST_PATCH = '15.18.1';
const getChampionImage = (championName: string) => `https://ddragon.leagueoflegends.com/cdn/${LATEST_PATCH}/img/champion/${championName}.png`;
const getItemImage = (itemId: number) => `https://ddragon.leagueoflegends.com/cdn/${LATEST_PATCH}/img/item/${itemId}.png`;
const getSpellImage = (spellName: string) => `https://ddragon.leagueoflegends.com/cdn/${LATEST_PATCH}/img/spell/${spellName}.png`;

// --- Sub-Components for Clarity ---

const PlayerRow: React.FC<{ player: PlayerResult }> = ({ player }) => (
  <MatchResultPlayerRowContainer>
    <MatchResultChampionIcon src={getChampionImage(player.championName)} alt={player.championName} />
    <MatchResultSummonerSpells>
      <MatchResultSpellIcon src={getSpellImage(player.summonerSpells[0])} alt={player.summonerSpells[0]} />
      <MatchResultSpellIcon src={getSpellImage(player.summonerSpells[1])} alt={player.summonerSpells[1]} />
    </MatchResultSummonerSpells>
    <MatchResultPlayerInfo>
      <MatchResultPlayerName>{player.playerName}</MatchResultPlayerName>
      <MatchResultKDA>
        <span>{player.kills}</span> / <span>{player.deaths}</span> / <span>{player.assists}</span>
      </MatchResultKDA>
    </MatchResultPlayerInfo>
    <MatchResultItemsGrid>
      {player.items.map((itemId, index) => 
        itemId ? (
          <MatchResultItemIcon key={index} src={getItemImage(itemId)} alt={`Item ${itemId}`} />
        ) : (
          <MatchResultEmptyItemSlot key={index} />
        )
      )}
    </MatchResultItemsGrid>
  </MatchResultPlayerRowContainer>
);

const TeamPanel: React.FC<{ teamData: TeamResult, teamColor: 'blue' | 'red', isWinner: boolean }> = ({ teamData, teamColor, isWinner }) => (
  <MatchResultTeamPanelContainer teamColor={teamColor} isWinner={isWinner}>
    <MatchResultBansContainer>
      {teamData.bans.map(championName => (
        <MatchResultBanIcon key={championName} src={getChampionImage(championName)} alt={`Banned ${championName}`} />
      ))}
    </MatchResultBansContainer>
    <MatchResultPlayersContainer>
      {teamData.players.map(player => (
        <PlayerRow key={player.playerName} player={player} />
      ))}
    </MatchResultPlayersContainer>
  </MatchResultTeamPanelContainer>
);

// --- Main Component ---

interface MatchResultProps {
  result?: MatchResultData;
}

const MatchResult: React.FC<MatchResultProps> = ({ result }) => {
  if (result === undefined) {
    return <></>
  }
  return (
    <MatchResultContainer>
      <TeamPanel 
        teamData={result.blueTeam} 
        teamColor="blue" 
        isWinner={result.winner === 100} 
      />
      <TeamPanel 
        teamData={result.redTeam} 
        teamColor="red" 
        isWinner={result.winner === 200} 
      />
    </MatchResultContainer>
  );
};

export default MatchResult;
