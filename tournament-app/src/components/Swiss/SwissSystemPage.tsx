import React, { useState } from 'react';
import { Match } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import { useGameMatches } from '../../context/MatchesContext';
import SwissStandings from './SwissStandings';
import {
  SwissPageContainer,
  SwissSectionTitle,
  SwissRoundsContainer,
  SwissTabHeader,
  SwissTabButton,
  SwissMatchGrid,
  SwissMatchCard,
  SwissMatchTeamSpan,
  SwissMatchTeamLink,
  SwissVersus,
  SwissScoreText,
} from '../../styles';

const SwissSystemPage: React.FC = () => {
  const { teams, loading: teamsLoading } = useTournament();
  const { matches, loading: matchesLoading } = useGameMatches();
  const [activeRound, setActiveRound] = useState('Round 1');

  if (teamsLoading || matchesLoading) {
    return (
      <SwissPageContainer>
        <p>Loading Swiss stage data...</p>
      </SwissPageContainer>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <SwissPageContainer>
        <p>Teams not yet finalized.</p>
      </SwissPageContainer>
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
    <SwissPageContainer>
      <SwissSectionTitle>Swiss Stage Standings</SwissSectionTitle>
      <SwissStandings />

      <SwissSectionTitle>Match History</SwissSectionTitle>
      <SwissRoundsContainer>
        <SwissTabHeader>
          {rounds.map(round => (
            <SwissTabButton
              key={round}
              active={activeRound === round}
              onClick={() => setActiveRound(round)}
            >
              {round}
            </SwissTabButton>
          ))}
        </SwissTabHeader>

        <SwissMatchGrid>
          {getRoundMatches(activeRound).map((match: Match) => {
            const team1 = teams.find(t => t.id === match.team1Id);
            const team2 = teams.find(t => t.id === match.team2Id);
            const team1Name = team1?.name || (match.team1Id === -1 ? 'Bye' : 'Unknown Team');
            const team2Name = team2?.name || (match.team2Id === -1 ? 'Bye' : 'Unknown Team');

            return (
              <SwissMatchCard key={match.id}>
                <div>
                  {team1 ? (
                    <SwissMatchTeamLink to={`/teams/${team1.id}`} winner={match.winnerId === team1.id}>
                      {team1Name}
                    </SwissMatchTeamLink>
                  ) : (
                    <SwissMatchTeamSpan winner={false}>{team1Name}</SwissMatchTeamSpan>
                  )}
                  <SwissVersus> vs </SwissVersus>
                  {team2 ? (
                    <SwissMatchTeamLink to={`/teams/${team2.id}`} winner={match.winnerId === team2.id}>
                      {team2Name}
                    </SwissMatchTeamLink>
                  ) : (
                    <SwissMatchTeamSpan winner={false}>{team2Name}</SwissMatchTeamSpan>
                  )}
                </div>
                {match.status === 'completed' ? (
                  <SwissScoreText>{match.score}</SwissScoreText>
                ) : (
                  <span>Upcoming</span>
                )}
              </SwissMatchCard>
            );
          })}
        </SwissMatchGrid>
      </SwissRoundsContainer>
    </SwissPageContainer>
  );
};

export default SwissSystemPage;
