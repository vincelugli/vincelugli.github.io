import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Match, Team } from '../../types';
import { OpponentInfo, UpcomingMatchCard, TournamentCodeContainer, CodeBox, Code, CopyButton } from '../../styles';

// NEW: A styled component for the game selection dropdown
const GameSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;

  option {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
  }
`;

interface UpcomingMatchProps {
  match: Match;
  teams: Team[];
  currentTeamId: number;
}

const UpcomingMatch: React.FC<UpcomingMatchProps> = ({ match, teams, currentTeamId }) => {
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState('');

  const opponentId = match.team1Id === currentTeamId ? match.team2Id : match.team1Id;
  const opponent = teams.find(t => t.id === opponentId);

  // Get the currently selected code based on the dropdown
  const currentCode = match.tournamentCodes?.[selectedGameIndex] || 'N/A';

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(currentCode);
    setTimeout(() => setCopiedCode(''), 2000);
  }, [currentCode]);


  return (
    <UpcomingMatchCard>
      WEEK {match.weekPlayed}
      <OpponentInfo>
        {!!opponent && "vs"} <span>{opponent ? opponent.name : 'Bye'}</span>
      </OpponentInfo>
      {!!opponent && <TournamentCodeContainer>
        <label>TOURNAMENT CODE</label>
        <CodeBox>
          <GameSelect
            value={selectedGameIndex}
            onChange={(e) => setSelectedGameIndex(parseInt(e.target.value, 10))}
          >
            {match.tournamentCodes.map((code, index) => (
              <option key={index} value={index}>
                Game {index + 1}
              </option>
            ))}
          </GameSelect>
          <Code>{currentCode}</Code>
          <CopyButton onClick={handleCopyCode}>
            {copiedCode === currentCode ? 'Copied!' : 'Copy'}
          </CopyButton>
        </CodeBox>
      </TournamentCodeContainer>}
    </UpcomingMatchCard>
  );
};

export default UpcomingMatch;