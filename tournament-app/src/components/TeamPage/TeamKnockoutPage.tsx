import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer, SectionTitle, MatchHistoryList, Title } from '../../styles';

import { useTournament } from '../../context/TournamentContext';

import { BracketRound, BracketSeed } from '../../types';
import UpcomingMatch from '../../components/TeamPage/UpcomingMatch'; 
import MatchResultPage from '../MatchResult/MatchResultPage';

const TeamKnockoutPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { teams, bracket } = useTournament();

  const team = teams.find(t => t.id === Number(teamId));

  // Find the current team from the global context
  const currentTeam = useMemo(() => teams.find(t => t.id === Number(teamId)), [teams, teamId]);

  // Filter the knockout matches for only this team's games
  const teamKnockoutMatches: BracketSeed[] = useMemo(() => {
    const seeds: BracketSeed[][] = bracket.map((round: BracketRound) => {
        return round.seeds.filter((seed: BracketSeed) => {
            const [team1, team2] = seed.teams;
            if (team1 === undefined || team2 === undefined) return false;
            return team1.id === Number(teamId) || team2.id === Number(teamId);
        });
    });
    return ([] as BracketSeed[]).concat(...seeds);
  }, [bracket, teamId]);

  const upcomingMatches = teamKnockoutMatches.filter(m => m.status === 'upcoming');
  const completedMatches = teamKnockoutMatches.filter(m => m.status === 'completed');

  if (!currentTeam) {
    return <PageContainer><p>Team not found.</p></PageContainer>;
  }

  return (
    <PageContainer>
      <Title>{currentTeam.name}'s Knockout Stage</Title>
      
      <div>
        <SectionTitle>Upcoming Match</SectionTitle>
        {upcomingMatches.length > 0 ? (
          upcomingMatches.map(match => (
            <UpcomingMatch 
              key={match.id}
              match={match}
              teams={teams}
              currentTeamId={currentTeam.id}
            />
          ))
        ) : (
          <p>No upcoming knockout matches scheduled.</p>
        )}
      </div>

      <div>
        <SectionTitle>Match History</SectionTitle>
        <MatchHistoryList>
          {completedMatches.length > 0 ? (
            completedMatches.map(match => {
              const opponentId = match.team1Id === team?.id ? match.team2Id : match.team1Id;
              const opponent = teams.find(t => t.id === opponentId);

              if (!opponent) {
                return <></>
              }
              return (
                <MatchResultPage match={match} teams={teams}></MatchResultPage>
              );
            })
          ) : (
            <p>No knockout matches played yet.</p>
          )}
        </MatchHistoryList>
      </div>
    </PageContainer>
  );
};

export default TeamKnockoutPage;
