import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BracketRound, BracketSeed, Match, Player } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { createOpGgUrl, createOpGgMultiSearchUrl, isPlayerCaptain } from '../../utils';
import { usePlayers } from '../../context/PlayerContext';
import { useGameMatches } from '../../context/MatchesContext';
import UpcomingMatch from './UpcomingMatch';
import MatchResultPage from '../MatchResult/MatchResultPage';
import { useDivision } from '../../context/DivisionContext';
import {
  TeamPageContainer,
  TeamPageHeaderCard,
  TeamPageTitleContainer,
  TeamPageHeaderTitle,
  TeamPageActionButtonGroup,
  TeamPageActionButton,
  TeamPageOpGgMultiSearchLink,
  TeamPagePlayerList,
  TeamPagePlayerCard,
  TeamPagePlayerInfo,
  TeamPagePlayerNameLink,
  TeamPagePlayerRole,
  TeamPageCaptainIndicator,
  TeamPageSection,
  TeamPageSectionHeader,
  TeamPageEmptyStateCard,
  TeamPageMatchHistoryCard,
  TeamPageMatchesList,
} from '../../styles';

interface TeamPageProps {
  matches: Match[];
}

const TeamPage: React.FC<TeamPageProps> = ({ matches }) => {
  const { getPlayerById } = usePlayers();
  const { tournamentCodes } = useGameMatches();
  const { teams, bracket } = useTournament();
  const { teamId } = useParams<{ teamId: string }>();
  const { division, urlDivision } = useDivision();

  const team = teams.find(t => t.id === Number(teamId));

  for (const m of matches) {
    const maybeCodes = tournamentCodes.filter(tc => tc.matchId === m.id);
    if (m.tournamentCodes.length === 0) {
      m.tournamentCodes = maybeCodes.map(tc => tc.code);
    }
  }

  const sortedPlayers: Player[] = useMemo(() => {
    if (!team?.players) return [];

    const roster: Player[] = team.players
      .map((playerId: number) => getPlayerById(playerId))
      .filter((player): player is Player => player !== undefined);

    return roster.sort((a, b) => {
      if (isPlayerCaptain(a, division)) return -1;
      if (isPlayerCaptain(b, division)) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [getPlayerById, team, division]);

  const teamKnockoutMatches: BracketSeed[] = useMemo(() => {
    const seeds: BracketSeed[][] = bracket.map((round: BracketRound) => {
      const title = round.title;
      return round.seeds
        .filter((seed: BracketSeed) => {
          const [team1, team2] = seed.teams;
          if (team1 === undefined || team2 === undefined) return false;
          return team1.id === Number(teamId) || team2.id === Number(teamId);
        })
        .map((seed: BracketSeed) => {
          seed.stage = title;
          seed.isKnockout = true;
          return seed;
        });
    });
    return ([] as BracketSeed[]).concat(...seeds);
  }, [bracket, teamId]);

  if (!team) return <div>Team not found</div>;

  const upcomingKnockoutMatches = teamKnockoutMatches.filter(m => m.status === 'upcoming');
  const completedKnockoutMatches = teamKnockoutMatches.filter(m => m.status === 'completed');

  const upcomingMatches = matches.filter(m =>
    m.status === 'upcoming' && (m.team1Id === team.id || m.team2Id === team.id)
  ).sort((m1, m2) => m1.weekPlayed - m2.weekPlayed).concat(upcomingKnockoutMatches);
  
  const completedMatches = matches.filter(m =>
    m.status === 'completed' && (m.team1Id === team.id || m.team2Id === team.id)
  ).concat(completedKnockoutMatches);
  
  return (
    <TeamPageContainer>
      <TeamPageHeaderCard>
        <TeamPageTitleContainer>
          <TeamPageHeaderTitle>{team.name}</TeamPageHeaderTitle>
          <TeamPageActionButtonGroup>
            {bracket && bracket.length > 0 && (
              <TeamPageActionButton to={`/teams/${teamId}/knockout?division=${urlDivision}`}>
                View Knockout Matches
              </TeamPageActionButton>
            )}
            {sortedPlayers.length > 0 && (
              <TeamPageOpGgMultiSearchLink
                href={createOpGgMultiSearchUrl(sortedPlayers.map(p => p.name))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaExternalLinkAlt size={12} />
                OP.GG Multi-Search
              </TeamPageOpGgMultiSearchLink>
            )}
          </TeamPageActionButtonGroup>
        </TeamPageTitleContainer>
        <TeamPagePlayerList>
          {sortedPlayers.map(player => (
            <TeamPagePlayerCard key={player.id}>
              {isPlayerCaptain(player, division) && <TeamPageCaptainIndicator title="Team Captain" />}
              <TeamPagePlayerInfo>
                <TeamPagePlayerNameLink href={createOpGgUrl(player.name)} target="_blank" rel="noopener noreferrer">
                  {player.name}
                </TeamPagePlayerNameLink>
                <TeamPagePlayerRole>{player.role}</TeamPagePlayerRole>
              </TeamPagePlayerInfo>
            </TeamPagePlayerCard>
          ))}
        </TeamPagePlayerList>
      </TeamPageHeaderCard>

      <TeamPageSection>
        <TeamPageSectionHeader>Upcoming Matches</TeamPageSectionHeader>
        {upcomingMatches.length > 0 ? (
          upcomingMatches.map(match => (
            <UpcomingMatch 
              key={match.id} 
              match={match} 
              teams={teams} 
              currentTeamId={team.id} 
            />
          ))
        ) : (
          <TeamPageEmptyStateCard>No upcoming matches scheduled.</TeamPageEmptyStateCard>
        )}
      </TeamPageSection>

      <TeamPageSection>
        <TeamPageSectionHeader>Match History</TeamPageSectionHeader>
        {completedMatches.length > 0 ? (
          <TeamPageMatchesList>
            {completedMatches.map(match => {
              const opponentId = match.team1Id === team.id ? match.team2Id : match.team1Id;
              const opponent = teams.find(t => t.id === opponentId);

              if (!opponent) {
                return <></>
              }

              return (
                <TeamPageMatchHistoryCard key={match.id}>
                  <MatchResultPage match={match} teams={teams}></MatchResultPage>
                </TeamPageMatchHistoryCard>
              );
            })}
          </TeamPageMatchesList>
        ) : (
          <TeamPageEmptyStateCard>No matches played yet.</TeamPageEmptyStateCard>
        )}
      </TeamPageSection>
    </TeamPageContainer>
  );
};

export default TeamPage;
