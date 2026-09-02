import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { calculateSwissStats, TeamStats } from '../../utils';
import { useDivision } from '../../context/DivisionContext';
import { useGameMatches } from '../../context/MatchesContext';
import {
  TeamName,
  SwissStandingsContainer,
  SwissStandingCard,
  SwissStandingCardTitle,
  SwissStandingTeamList,
  SwissStandingTeamItem,
} from '../../styles';

const SwissStandings: React.FC = () => {
  const { teams, loading: tournamentLoading } = useTournament();
  const { matches, loading: matchesLoading } = useGameMatches();
  const { urlDivision } = useDivision();

  if (tournamentLoading || matchesLoading) {
    return <p>Loading Swiss standings...</p>;
  }

  if (!teams || teams.length === 0) {
    return <p>Teams not yet finalized.</p>;
  }

  const stats = calculateSwissStats(teams, matches);

  const sortStats = (a: TeamStats, b: TeamStats) => {
    if (a.matchWinPercentage !== b.matchWinPercentage) {
      return b.matchWinPercentage - a.matchWinPercentage;
    }
    if (a.adjustedBuchholz !== b.adjustedBuchholz) {
      return b.adjustedBuchholz - a.adjustedBuchholz;
    }
    if (a.gameWinPercentage !== b.gameWinPercentage) {
      return b.gameWinPercentage - a.gameWinPercentage;
    }
    return a.team.id - b.team.id;
  };

  const advancedStats = stats.filter(s => s.wins >= 3).sort(sortStats);
  const eliminatedStats = stats.filter(s => s.losses >= 3).sort(sortStats);
  const activeStats = stats.filter(s => s.wins < 3 && s.losses < 3).sort(sortStats);

  return (
    <SwissStandingsContainer>
      {advancedStats.length > 0 && (
        <SwissStandingCard type="advanced">
          <SwissStandingCardTitle>Advanced to Bracket (3 Wins)</SwissStandingCardTitle>
          <SwissStandingTeamList>
            {advancedStats.map(s => (
              <SwissStandingTeamItem key={s.team.id}>
                <TeamName to={`/teams/${s.team.id}?division=${urlDivision}`}>{s.team.name}</TeamName>
                <span>{`${s.wins}-${s.losses}`}</span>
              </SwissStandingTeamItem>
            ))}
          </SwissStandingTeamList>
        </SwissStandingCard>
      )}

      <SwissStandingCard type="active">
        <SwissStandingCardTitle>Active Teams</SwissStandingCardTitle>
        <SwissStandingTeamList>
          {activeStats.map(s => (
            <SwissStandingTeamItem key={s.team.id}>
              <TeamName to={`/teams/${s.team.id}?division=${urlDivision}`}>{s.team.name}</TeamName>
              <span>{`${s.wins}-${s.losses}`}</span>
            </SwissStandingTeamItem>
          ))}
        </SwissStandingTeamList>
      </SwissStandingCard>

      {eliminatedStats.length > 0 && (
        <SwissStandingCard type="eliminated">
          <SwissStandingCardTitle>Eliminated (3 Losses)</SwissStandingCardTitle>
          <SwissStandingTeamList>
            {eliminatedStats.map(s => (
              <SwissStandingTeamItem key={s.team.id}>
                <TeamName to={`/teams/${s.team.id}?division=${urlDivision}`}>{s.team.name}</TeamName>
                <span>{`${s.wins}-${s.losses}`}</span>
              </SwissStandingTeamItem>
            ))}
          </SwissStandingTeamList>
        </SwissStandingCard>
      )}
    </SwissStandingsContainer>
  );
};

export default SwissStandings;
