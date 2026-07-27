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
  MatchResultDuration,
  MatchResultTeamHeader,
  MatchResultColumn,
} from '../../styles';

// --- Data Dragon Configuration ---
const LATEST_PATCH = '16.14.1';
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
  blueTeamName?: string;
  redTeamName?: string;
}

const formatDuration = (seconds: number) => {
  const totalSeconds = seconds > 100000 ? Math.floor(seconds / 1000) : seconds;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const MatchResult: React.FC<MatchResultProps> = ({
  result,
  blueTeamName = 'Blue Team',
  redTeamName = 'Red Team'
}) => {
  if (result === undefined) {
    return <></>;
  }
  return (
    <div style={{ width: '100%' }}>
      <MatchResultDuration>
        Game Duration: {formatDuration(result.gameDuration)}
      </MatchResultDuration>
      <MatchResultContainer>
        <MatchResultColumn>
          <MatchResultTeamHeader teamColor="blue">{blueTeamName}</MatchResultTeamHeader>
          <TeamPanel 
            teamData={result.blueTeam} 
            teamColor="blue" 
            isWinner={result.winner === 100} 
          />
        </MatchResultColumn>
        <MatchResultColumn>
          <MatchResultTeamHeader teamColor="red">{redTeamName}</MatchResultTeamHeader>
          <TeamPanel 
            teamData={result.redTeam} 
            teamColor="red" 
            isWinner={result.winner === 200} 
          />
        </MatchResultColumn>
      </MatchResultContainer>
    </div>
  );
};

export default MatchResult;
