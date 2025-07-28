import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Team, Match } from '../../types';
import { PageContainer, TeamHeader, TeamPageTeamName, SectionTitle, UpcomingMatchCard, OpponentInfo, TournamentCodeContainer, CodeBox, Code, CopyButton, MatchHistoryList, MatchItem, MatchInfo, MatchResult, ResultIndicator, TeamPageScore } from '../../styles';

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
        <TeamPageTeamName>{team.name}</TeamPageTeamName>
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
                    <TeamPageScore>{match.score}</TeamPageScore>
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