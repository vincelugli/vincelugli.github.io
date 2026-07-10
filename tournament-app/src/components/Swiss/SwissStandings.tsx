import React from 'react';
import styled from 'styled-components';
import { useTournament } from '../../context/TournamentContext';
import { compareTeams } from '../../utils';
import { TeamName } from '../../styles';

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
  align-items: center;
  &:last-child {
    border-bottom: none;
  }
`;

const SwissStandings: React.FC = () => {
  const { teams, loading } = useTournament();

  if (loading) {
    return <p>Loading Swiss standings...</p>;
  }

  if (!teams || teams.length === 0) {
    return <p>Teams not yet finalized.</p>;
  }

  const advancedTeams = [...teams].filter(t => t.wins === 3).sort(compareTeams);
  const eliminatedTeams = [...teams].filter(t => t.losses === 3).sort(compareTeams);
  const activeTeams = [...teams].filter(t => t.wins < 3 && t.losses < 3).sort(compareTeams);

  return (
    <StandingsContainer>
      <StandingCard type="advanced">
        <CardTitle>Advanced to Bracket (3 Wins)</CardTitle>
        <TeamList>
          {advancedTeams.map(t => (
            <TeamItem key={t.id}>
              <TeamName to={`/teams/${t.id}`}>{t.name}</TeamName>
              <span>{t.record || `${t.wins}-${t.losses}`}</span>
            </TeamItem>
          ))}
        </TeamList>
      </StandingCard>

      <StandingCard type="active">
        <CardTitle>Active Teams</CardTitle>
        <TeamList>
          {activeTeams.map(t => (
            <TeamItem key={t.id}>
              <TeamName to={`/teams/${t.id}`}>{t.name}</TeamName>
              <span>{t.record || `${t.wins}-${t.losses}`}</span>
            </TeamItem>
          ))}
        </TeamList>
      </StandingCard>

      <StandingCard type="eliminated">
        <CardTitle>Eliminated (3 Losses)</CardTitle>
        <TeamList>
          {eliminatedTeams.map(t => (
            <TeamItem key={t.id}>
              <TeamName to={`/teams/${t.id}`}>{t.name}</TeamName>
              <span>{t.record || `${t.wins}-${t.losses}`}</span>
            </TeamItem>
          ))}
        </TeamList>
      </StandingCard>
    </StandingsContainer>
  );
};

export default SwissStandings;
