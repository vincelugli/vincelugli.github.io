import React, { useState, useCallback } from 'react';
import { Match, Team } from '../../types';
import { OpponentInfo, UpcomingMatchCard, TournamentCodeContainer, CodeBox, Code, CopyButton, MatchNavLink, UpcomingMatchGameSelect } from '../../styles';

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

  const isUserTeamCaptain = true; //(Number(captainTeamId) === currentTeamId && authDivision === division) || isAdmin;

  // Get the currently selected code based on the dropdown
  const currentCode = match.tournamentCodes?.[selectedGameIndex] || 'N/A';

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(currentCode);
    setTimeout(() => setCopiedCode(''), 2000);
  }, [currentCode]);


  return (
    <UpcomingMatchCard>
      {match.isKnockout ? match.stage : "WEEK " + match.weekPlayed}
      <OpponentInfo>
        {!!opponent && "vs"} <span>{opponent ? <MatchNavLink to={`/teams/${opponent?.id}`}>{opponent.name}</MatchNavLink> : 'Bye'}</span>
      </OpponentInfo>
      {!!opponent && isUserTeamCaptain && <TournamentCodeContainer>
        <label>TOURNAMENT CODE</label>
        <CodeBox>
          <UpcomingMatchGameSelect
            value={selectedGameIndex}
            onChange={(e) => setSelectedGameIndex(parseInt(e.target.value, 10))}
          >
            {match.tournamentCodes.map((code, index) => (
              <option key={index} value={index}>
                Game {index + 1}
              </option>
            ))}
          </UpcomingMatchGameSelect>
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
