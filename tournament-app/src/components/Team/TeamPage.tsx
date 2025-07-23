import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Team, Match } from '../../types';

// --- Styled Components ---
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const TeamHeader = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TeamName = styled.h1`
  font-size: 3rem;
  color: #333;
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

// Card for the Upcoming Match
const UpcomingMatchCard = styled.div`
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 123, 255, 0.3);
`;

const OpponentInfo = styled.div`
  font-size: 1.2rem;
  span {
    font-weight: 700;
    font-size: 2rem;
  }
`;

const TournamentCodeContainer = styled.div`
  margin-top: 1.5rem;
  label {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
`;

const CodeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Code = styled.code`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
`;

const CopyButton = styled.button`
  background: #fff;
  color: #007bff;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover { background: #f0f0f0; }
`;

// List for Match History
// const MatchHistoryList = styled.ul`
//   list-style: none;
//   padding: 0;
// `;

// const MatchItem = styled.li`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 1rem;
//   border-bottom: 1px solid #eee;
// `;



const MatchHistoryList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MatchItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-left: 5px solid;
`;

const MatchInfo = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: #555;
  span {
    font-weight: 700;
    color: #333;
  }
`;

const MatchResult = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ResultIndicator = styled.span<{ win: boolean }>`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${(props) => (props.win ? '#28a745' : '#dc3545')};
`;

const Score = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  background: #f0f2f5;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
`;

// --- Component Definition ---

interface TeamPageProps {
  teams: Team[];
  matches: Match[];
}

const TeamPage: React.FC<TeamPageProps> = ({ teams, matches }) => {
  const { teamId } = useParams<{ teamId: string }>();
  const [copiedCode, setCopiedCode] = useState('');

  const team = teams.find(t => t.id === Number(teamId));

  if (!team) return <div>Team not found</div>;

  const upcomingMatches = matches.filter(m =>
    m.status === 'upcoming' && (m.team1Id === team.id || m.team2Id === team.id)
  );
  
  const completedMatches = matches.filter(m =>
    m.status === 'completed' && (m.team1Id === team.id || m.team2Id === team.id)
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000); // Reset after 2 seconds
  };
  
  return (
    <PageContainer>
      <TeamHeader>
        <TeamName>{team.name}</TeamName>
        {/* You could add team record or players here */}
      </TeamHeader>

      <div>
        <SectionTitle>Upcoming Match</SectionTitle>
        {upcomingMatches.length > 0 ? (
          upcomingMatches.map(match => {
            const opponentId = match.team1Id === team.id ? match.team2Id : match.team1Id;
            const opponent = teams.find(t => t.id === opponentId);
            return (
              <UpcomingMatchCard key={match.id}>
                <OpponentInfo>
                  vs <span>{opponent ? opponent.name : 'TBD'}</span>
                </OpponentInfo>
                <TournamentCodeContainer>
                  <label>TOURNAMENT CODE</label>
                  <CodeBox>
                    <Code>{match.tournamentCode}</Code>
                    <CopyButton onClick={() => handleCopyCode(match.tournamentCode)}>
                      {copiedCode === match.tournamentCode ? 'Copied!' : 'Copy'}
                    </CopyButton>
                  </CodeBox>
                </TournamentCodeContainer>
              </UpcomingMatchCard>
            );
          })
        ) : (
          <p>No upcoming matches scheduled.</p>
        )}
      </div>

      <div>
        <SectionTitle>Match History</SectionTitle>
        <MatchHistoryList>
          {completedMatches.length > 0 ? (
            // --- UPDATED: Restored the rendering logic here ---
            completedMatches.map(match => {
              const opponentId = match.team1Id === team.id ? match.team2Id : match.team1Id;
              const opponent = teams.find(t => t.id === opponentId);
              const didWin = match.winnerId === team.id;

              return (
                <MatchItem key={match.id}>
                  <MatchInfo>
                    vs <span>{opponent ? opponent.name : 'Unknown'}</span>
                  </MatchInfo>
                  <MatchResult>
                    <ResultIndicator win={didWin}>
                      {didWin ? 'WIN' : 'LOSS'}
                    </ResultIndicator>
                    <Score>{match.score}</Score>
                  </MatchResult>
                </MatchItem>
              );
            })
          ) : (
            <p>No matches played yet.</p>
          )}
        </MatchHistoryList>
      </div>
    </PageContainer>
  );
};

export default TeamPage;