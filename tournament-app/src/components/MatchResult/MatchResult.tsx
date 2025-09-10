import React from 'react';
import styled from 'styled-components';
import { MatchResultData, PlayerResult, TeamResult } from '../../types';

// --- Data Dragon Configuration ---
const LATEST_PATCH = '15.18.1';
const getChampionImage = (championName: string) => `https://ddragon.leagueoflegends.com/cdn/${LATEST_PATCH}/img/champion/${championName}.png`;
const getItemImage = (itemId: number) => `https://ddragon.leagueoflegends.com/cdn/${LATEST_PATCH}/img/item/${itemId}.png`;
const getSpellImage = (spellName: string) => `https://ddragon.leagueoflegends.com/cdn/${LATEST_PATCH}/img/spell/${spellName}.png`;

// --- Styled Components ---

const MatchResultContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  font-family: 'Roboto', sans-serif;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const TeamPanelContainer = styled.div<{ teamColor: 'blue' | 'red' }>`
  flex: 1;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  border-top: 5px solid ${({ teamColor }) => (teamColor === 'blue' ? '#007bff' : '#dc3545')};
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const BansContainer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 0.75rem;
  background: ${({ theme }) => theme.body};
  border-radius: 6px 6px 0 0;
`;

const BanIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  opacity: 0.7;
  filter: grayscale(80%);
`;

const PlayersContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerRowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};

  &:last-child {
    border-bottom: none;
  }
`;

const ChampionIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

const SummonerSpells = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SpellIcon = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 4px;
`;

const PlayerName = styled.span`
  font-weight: 600;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const ItemIcon = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 4px;
`;

const EmptyItemSlot = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.borderColor};
`;


// NEW: A container to hold the name and KDA together
const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* This will now be the element that expands */
  min-width: 0; /* Important for allowing text to truncate if needed */
`;

// NEW: A styled component for the K/D/A text
const KDA = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
  margin-top: 2px;
  font-weight: 500;

  span {
    color: ${({ theme }) => theme.text};
    font-weight: 700;
  }
`;

// --- Sub-Components for Clarity ---

const PlayerRow: React.FC<{ player: PlayerResult }> = ({ player }) => (
  <PlayerRowContainer>
    <ChampionIcon src={getChampionImage(player.championName)} alt={player.championName} />
    <SummonerSpells>
      <SpellIcon src={getSpellImage(player.summonerSpells[0])} alt={player.summonerSpells[0]} />
      <SpellIcon src={getSpellImage(player.summonerSpells[1])} alt={player.summonerSpells[1]} />
    </SummonerSpells>
    <PlayerInfo>
      <PlayerName>{player.playerName}</PlayerName>
      <KDA>
        <span>{player.kills}</span> / <span>{player.deaths}</span> / <span>{player.assists}</span>
      </KDA>
    </PlayerInfo>
    <ItemsGrid>
      {player.items.map((itemId, index) => 
        itemId ? (
          <ItemIcon key={index} src={getItemImage(itemId)} alt={`Item ${itemId}`} />
        ) : (
          <EmptyItemSlot key={index} />
        )
      )}
    </ItemsGrid>
  </PlayerRowContainer>
);

const TeamPanel: React.FC<{ teamData: TeamResult, teamColor: 'blue' | 'red' }> = ({ teamData, teamColor }) => (
  <TeamPanelContainer teamColor={teamColor}>
    <BansContainer>
      {teamData.bans.map(championName => (
        <BanIcon key={championName} src={getChampionImage(championName)} alt={`Banned ${championName}`} />
      ))}
    </BansContainer>
    <PlayersContainer>
      {teamData.players.map(player => (
        <PlayerRow key={player.playerName} player={player} />
      ))}
    </PlayersContainer>
  </TeamPanelContainer>
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
      <TeamPanel teamData={result.blueTeam} teamColor="blue" />
      <TeamPanel teamData={result.redTeam} teamColor="red" />
    </MatchResultContainer>
  );
};

export default MatchResult;
