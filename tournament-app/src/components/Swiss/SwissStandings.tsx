import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { compareTeams } from '../../utils';
import { useDivision } from '../../context/DivisionContext';
import {
  TeamName,
  SwissStandingsContainer,
  SwissStandingCard,
  SwissStandingCardTitle,
  SwissStandingTeamList,
  SwissStandingTeamItem,
} from '../../styles';

const SwissStandings: React.FC = () => {
  const { teams, loading } = useTournament();
  const { urlDivision } = useDivision();

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
    <SwissStandingsContainer>
      {advancedTeams.length > 0 && (
        <SwissStandingCard type="advanced">
          <SwissStandingCardTitle>Advanced to Bracket (3 Wins)</SwissStandingCardTitle>
          <SwissStandingTeamList>
            {advancedTeams.map(t => (
              <SwissStandingTeamItem key={t.id}>
                <TeamName to={`/teams/${t.id}?division=${urlDivision}`}>{t.name}</TeamName>
                <span>{t.record || `${t.wins}-${t.losses}`}</span>
              </SwissStandingTeamItem>
            ))}
          </SwissStandingTeamList>
        </SwissStandingCard>
      )}

      <SwissStandingCard type="active">
        <SwissStandingCardTitle>Active Teams</SwissStandingCardTitle>
        <SwissStandingTeamList>
          {activeTeams.map(t => (
            <SwissStandingTeamItem key={t.id}>
              <TeamName to={`/teams/${t.id}?division=${urlDivision}`}>{t.name}</TeamName>
              <span>{t.record || `${t.wins}-${t.losses}`}</span>
            </SwissStandingTeamItem>
          ))}
        </SwissStandingTeamList>
      </SwissStandingCard>

      {eliminatedTeams.length > 0 && (
        <SwissStandingCard type="eliminated">
          <SwissStandingCardTitle>Eliminated (3 Losses)</SwissStandingCardTitle>
          <SwissStandingTeamList>
            {eliminatedTeams.map(t => (
              <SwissStandingTeamItem key={t.id}>
                <TeamName to={`/teams/${t.id}?division=${urlDivision}`}>{t.name}</TeamName>
                <span>{t.record || `${t.wins}-${t.losses}`}</span>
              </SwissStandingTeamItem>
            ))}
          </SwissStandingTeamList>
        </SwissStandingCard>
      )}
    </SwissStandingsContainer>
  );
};

export default SwissStandings;
