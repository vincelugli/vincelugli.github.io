import React from 'react';
import { Match, Team } from '../../types';
import { 
  CoinFlipContainer, 
  CoinFlipTitle, 
  CoinFlipText, 
  CoinFlipSecondaryText, 
  CoinFlipResultText, 
  CoinFlipSubText 
} from '../../styles';

interface CoinFlipSectionProps {
  match: Match;
  teams: Team[];
}

export const CoinFlipSection: React.FC<CoinFlipSectionProps> = ({
  match,
  teams,
}) => {
  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);

  if (!team1 || !team2) return null;

  // Heads: lower team ID, Tails: higher team ID
  const lowerIdTeam = match.team1Id < match.team2Id ? team1 : team2;
  const higherIdTeam = match.team1Id < match.team2Id ? team2 : team1;

  const coinFlipWinner = match.coinFlipResult === 'heads' ? lowerIdTeam : (match.coinFlipResult === 'tails' ? higherIdTeam : null);
  const coinFlipLoser = match.coinFlipResult === 'heads' ? higherIdTeam : (match.coinFlipResult === 'tails' ? lowerIdTeam : null);

  return (
    <CoinFlipContainer>
      <CoinFlipTitle>Game 1 Side Selection</CoinFlipTitle>
      {!match.coinFlipResult ? (
        <CoinFlipSecondaryText>
          Waiting for an administrator to flip the coin.
        </CoinFlipSecondaryText>
      ) : (
        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          <CoinFlipResultText>
            Result: <span style={{ color: '#0070f3' }}>{match.coinFlipResult.toUpperCase()}</span>
          </CoinFlipResultText>
          <CoinFlipText>
            <strong>{coinFlipWinner?.name}</strong> won the coin flip and gets{' '}
            <span style={{ color: '#0070f3', fontWeight: 'bold' }}>BLUE</span> side for Game 1.
          </CoinFlipText>
          <CoinFlipSubText>
            {coinFlipLoser?.name} is on{' '}
            <span style={{ color: '#e00000', fontWeight: 'bold' }}>RED</span> side.
          </CoinFlipSubText>
        </div>
      )}
    </CoinFlipContainer>
  );
};
