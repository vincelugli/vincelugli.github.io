import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Match } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import { useGameMatches } from '../../context/MatchesContext';
import SwissStandings from './SwissStandings';

const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.body};
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

const RoundsContainer = styled.div`
  margin-top: 2rem;
`;

const TabHeader = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.body};
  margin-bottom: 1.5rem;
  overflow-x: auto;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: ${({ active, theme }) => (active ? theme.primary : theme.textAlt)};
  border-bottom: 3px solid ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const MatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 1.5rem;
`;

const MatchCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const MatchTeamSpan = styled.span<{ winner?: boolean }>`
  font-weight: ${({ winner }) => (winner ? '700' : '400')};
  color: ${({ winner, theme }) => (winner ? theme.success : 'inherit')};
`;

const MatchTeamLink = styled(Link)<{ winner?: boolean }>`
  font-weight: ${({ winner }) => (winner ? '700' : '400')};
  color: ${({ winner, theme }) => (winner ? theme.success : 'inherit')};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Versus = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
`;

const ScoreText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  background-color: ${({ theme }) => theme.body};
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
`;

const SwissSystemPage: React.FC = () => {
  const { teams, loading: teamsLoading } = useTournament();
  const { matches, loading: matchesLoading } = useGameMatches();
  const [activeRound, setActiveRound] = useState('Round 1');

  if (teamsLoading || matchesLoading) {
    return (
      <PageContainer>
        <p>Loading Swiss stage data...</p>
      </PageContainer>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <PageContainer>
        <p>Teams not yet finalized.</p>
      </PageContainer>
    );
  }

  // Filter out any knockout matches
  const swissMatches = matches.filter(m => !m.isKnockout);

  // Dynamically calculate the maximum round or default to 5
  const maxRound = Math.max(5, ...swissMatches.map(m => m.weekPlayed || 0));
  const rounds = Array.from({ length: maxRound }, (_, i) => `Round ${i + 1}`);

  const getRoundMatches = (round: string) => {
    const roundNum = parseInt(round.replace('Round ', ''), 10);
    return swissMatches.filter(m => m.stage === round || (!m.stage && m.weekPlayed === roundNum));
  };

  return (
    <PageContainer>
      <SectionTitle>Swiss Stage Standings</SectionTitle>
      <SwissStandings />

      <SectionTitle>Match History</SectionTitle>
      <RoundsContainer>
        <TabHeader>
          {rounds.map(round => (
            <TabButton
              key={round}
              active={activeRound === round}
              onClick={() => setActiveRound(round)}
            >
              {round}
            </TabButton>
          ))}
        </TabHeader>

        <MatchGrid>
          {getRoundMatches(activeRound).map((match: Match) => {
            const team1 = teams.find(t => t.id === match.team1Id);
            const team2 = teams.find(t => t.id === match.team2Id);
            const team1Name = team1?.name || (match.team1Id === -1 ? 'Bye' : 'Unknown Team');
            const team2Name = team2?.name || (match.team2Id === -1 ? 'Bye' : 'Unknown Team');

            return (
              <MatchCard key={match.id}>
                <div>
                  {team1 ? (
                    <MatchTeamLink to={`/teams/${team1.id}`} winner={match.winnerId === team1.id}>
                      {team1Name}
                    </MatchTeamLink>
                  ) : (
                    <MatchTeamSpan winner={false}>{team1Name}</MatchTeamSpan>
                  )}
                  <Versus> vs </Versus>
                  {team2 ? (
                    <MatchTeamLink to={`/teams/${team2.id}`} winner={match.winnerId === team2.id}>
                      {team2Name}
                    </MatchTeamLink>
                  ) : (
                    <MatchTeamSpan winner={false}>{team2Name}</MatchTeamSpan>
                  )}
                </div>
                {match.status === 'completed' ? (
                  <ScoreText>{match.score}</ScoreText>
                ) : (
                  <span>Upcoming</span>
                )}
              </MatchCard>
            );
          })}
        </MatchGrid>
      </RoundsContainer>
    </PageContainer>
  );
};

export default SwissSystemPage;
