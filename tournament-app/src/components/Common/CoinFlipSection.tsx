import React from 'react';
import { Match, Team } from '../../types';
import {
  CoinFlipContainer,
  CoinFlipButton,
  SideSelectContainer,
  SideSelectButton,
} from '../../styles';

interface CoinFlipSectionProps {
  match: Match;
  teams: Team[];
  onUpdateMatch: (updatedMatch: Match) => Promise<void> | void;
}

export const CoinFlipSection: React.FC<CoinFlipSectionProps> = ({
  match,
  teams,
  onUpdateMatch,
}) => {
  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);

  if (!team1 || !team2) return null;

  // Heads: lower team ID, Tails: higher team ID
  const lowerIdTeam = match.team1Id < match.team2Id ? team1 : team2;
  const higherIdTeam = match.team1Id < match.team2Id ? team2 : team1;

  const handleFlipCoin = async () => {
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const updatedMatch: Match = {
      ...match,
      coinFlipResult: result,
      firstGameSideSelection: null,
    };
    await onUpdateMatch(updatedMatch);
  };

  const handleSelectSide = async (side: 'blue' | 'red') => {
    const updatedMatch: Match = {
      ...match,
      firstGameSideSelection: side,
    };
    await onUpdateMatch(updatedMatch);
  };

  const coinFlipWinner = match.coinFlipResult === 'heads' ? lowerIdTeam : higherIdTeam;
  const coinFlipLoser = match.coinFlipResult === 'heads' ? higherIdTeam : lowerIdTeam;

  return (
    <CoinFlipContainer>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Game 1 Side Selection</h3>
      {!match.coinFlipResult ? (
        <>
          <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#888', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
            A coin flip determines which team gets side selection for Game 1.<br />
            <strong>Heads:</strong> {lowerIdTeam.name} (lower ID)<br />
            <strong>Tails:</strong> {higherIdTeam.name} (higher ID)
          </p>
          <CoinFlipButton onClick={handleFlipCoin}>
            Flip Coin
          </CoinFlipButton>
        </>
      ) : (
        <>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Result: <span style={{ color: '#0070f3' }}>{match.coinFlipResult.toUpperCase()}</span>
          </p>
          <p style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>
            <strong>{coinFlipWinner.name}</strong> wins the coin flip and gets side selection!
          </p>
          
          {!match.firstGameSideSelection ? (
            <>
              <p style={{ fontSize: '0.95rem', color: '#888', margin: '0 0 0.5rem 0' }}>
                Select side for {coinFlipWinner.name}:
              </p>
              <SideSelectContainer>
                <SideSelectButton
                  side="blue"
                  onClick={() => handleSelectSide('blue')}
                >
                  Blue Side
                </SideSelectButton>
                <SideSelectButton
                  side="red"
                  onClick={() => handleSelectSide('red')}
                >
                  Red Side
                </SideSelectButton>
              </SideSelectContainer>
            </>
          ) : (
            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                Selection Completed:
              </p>
              <p style={{ margin: '0 0 0.25rem 0' }}>
                <span style={{ color: match.firstGameSideSelection === 'blue' ? '#0070f3' : '#e00000', fontWeight: 'bold' }}>
                  {coinFlipWinner.name}
                </span> selected{' '}
                <span style={{ color: match.firstGameSideSelection === 'blue' ? '#0070f3' : '#e00000', fontWeight: 'bold' }}>
                  {match.firstGameSideSelection.toUpperCase()}
                </span>.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
                {coinFlipLoser.name} is on{' '}
                <span style={{ color: match.firstGameSideSelection === 'blue' ? '#e00000' : '#0070f3', fontWeight: 'bold' }}>
                  {match.firstGameSideSelection === 'blue' ? 'RED' : 'BLUE'}
                </span>.
              </p>
            </div>
          )}
        </>
      )}
    </CoinFlipContainer>
  );
};
