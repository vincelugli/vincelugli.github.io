import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { calculateSwissStats } from '../../utils';
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

  const sortStats = (a: typeof teams[0], b: typeof teams[0]) => {
    const sA = stats.find(s => s.team.id === a.id);
    const sB = stats.find(s => s.team.id === b.id);
    if (!sA || !sB) return 0;
    
    if (sA.matchWinPercentage !== sB.matchWinPercentage) {
      return sB.matchWinPercentage - sA.matchWinPercentage;
    }
    if (sA.adjustedBuchholz !== sB.adjustedBuchholz) {
      return sB.adjustedBuchholz - sA.adjustedBuchholz;
    }
    if (sA.gameWinPercentage !== sB.gameWinPercentage) {
      return sB.gameWinPercentage - sA.gameWinPercentage;
    }
    return sA.team.id - sB.team.id;
  };

  const advancedTeams = [...teams].filter(t => t.wins === 3).sort(sortStats);
  const eliminatedTeams = [...teams].filter(t => t.losses === 3).sort(sortStats);
  const activeTeams = [...teams].filter(t => t.wins < 3 && t.losses < 3).sort(sortStats);


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
