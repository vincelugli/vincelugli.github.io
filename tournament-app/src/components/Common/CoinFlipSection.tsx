import React from 'react';
import { Match, Team } from '../../types';
import { CoinFlipContainer } from '../../styles';

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
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Game 1 Side Selection</h3>
      {!match.coinFlipResult ? (
        <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#888', margin: '0 0 1rem 0', lineHeight: '1.4', fontStyle: 'italic' }}>
          Waiting for an administrator to flip the coin.
        </p>
      ) : (
        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Result: <span style={{ color: '#0070f3' }}>{match.coinFlipResult.toUpperCase()}</span>
          </p>
          <p style={{ margin: '0 0 0.25rem 0' }}>
            <strong>{coinFlipWinner?.name}</strong> won the coin flip and gets{' '}
            <span style={{ color: '#0070f3', fontWeight: 'bold' }}>BLUE</span> side for Game 1.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
            {coinFlipLoser?.name} is on{' '}
            <span style={{ color: '#e00000', fontWeight: 'bold' }}>RED</span> side.
          </p>
        </div>
      )}
    </CoinFlipContainer>
  );
};
