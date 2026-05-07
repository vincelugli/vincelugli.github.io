import React, { useState } from 'react';
import styled from 'styled-components';
import { mockSwissTeams, mockSwissMatches } from '../../data/mockSwissData';
import { Match } from '../../types';

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

const StandingsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StandingCard = styled.div<{ type: 'advanced' | 'eliminated' | 'active' }>`
  background-color: ${({ theme }) => theme.backgroundTwo};
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 5px solid ${({ theme, type }) =>
    type === 'advanced' ? theme.success :
      type === 'eliminated' ? theme.danger :
        theme.primary};
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const CardTitle = styled.h3`
  margin-top: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.secondaryText};
`;

const TeamList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TeamItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderBottom};
  display: flex;
  justify-content: space-between;
  &:last-child {
    border-bottom: none;
  }
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

const TeamName = styled.span<{ winner?: boolean }>`
  font-weight: ${({ winner }) => (winner ? '700' : '400')};
  color: ${({ winner, theme }) => (winner ? theme.success : 'inherit')};
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
  const [activeRound, setActiveRound] = useState('Round 1');

  const advancedTeams = mockSwissTeams.filter(t => t.wins === 3);
  const eliminatedTeams = mockSwissTeams.filter(t => t.losses === 3);
  const activeTeams = mockSwissTeams.filter(t => t.wins < 3 && t.losses < 3);

  const rounds = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'];

  const getRoundMatches = (round: string) => {
    return mockSwissMatches.filter(m => m.stage === round);
  };

  return (
    <PageContainer>
      <SectionTitle>Swiss Stage Standings</SectionTitle>
      <StandingsContainer>
        <StandingCard type="advanced">
          <CardTitle>Advanced to Bracket (3 Wins)</CardTitle>
          <TeamList>
            {advancedTeams.map(t => (
              <TeamItem key={t.id}>
                <span>{t.name}</span>
                <span>{t.record}</span>
              </TeamItem>
            ))}
          </TeamList>
        </StandingCard>

        <StandingCard type="active">
          <CardTitle>Active Teams</CardTitle>
          <TeamList>
            {activeTeams.map(t => (
              <TeamItem key={t.id}>
                <span>{t.name}</span>
                <span>{t.record}</span>
              </TeamItem>
            ))}
          </TeamList>
        </StandingCard>

        <StandingCard type="eliminated">
          <CardTitle>Eliminated (3 Losses)</CardTitle>
          <TeamList>
            {eliminatedTeams.map(t => (
              <TeamItem key={t.id}>
                <span>{t.name}</span>
                <span>{t.record}</span>
              </TeamItem>
            ))}
          </TeamList>
        </StandingCard>
      </StandingsContainer>

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
            const team1 = mockSwissTeams.find(t => t.id === match.team1Id);
            const team2 = mockSwissTeams.find(t => t.id === match.team2Id);
            return (
              <MatchCard key={match.id}>
                <div>
                  <TeamName winner={match.winnerId === team1?.id}>{team1?.name}</TeamName>
                  <Versus> vs </Versus>
                  <TeamName winner={match.winnerId === team2?.id}>{team2?.name}</TeamName>
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
