import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BracketRound, BracketSeed, Match, Player } from '../../types';
import { PageContainer, TeamHeader, TeamPageTeamName, SectionTitle, MatchHistoryList, MatchNavLink } from '../../styles';
import { useTournament } from '../../context/TournamentContext';
import styled from 'styled-components';
import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import { createOpGgUrl, createOpGgMultiSearchUrl, isPlayerCaptain } from '../../utils';
import { usePlayers } from '../../context/PlayerContext';
import { useGameMatches } from '../../context/MatchesContext';
import UpcomingMatch from './UpcomingMatch';
import MatchResultPage from '../MatchResult/MatchResultPage';
import { useDivision } from '../../context/DivisionContext';


const PlayerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
  display: flex;
  flex-wrap: wrap; /* Allow player cards to wrap on smaller screens */
  gap: 1rem;
`;

const PlayerListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.borderColor};
  padding: 0.75rem 1rem;
  border-radius: 6px;
  min-width: 200px;
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerNameLink = styled.a`
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const PlayerRole = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
  margin-top: 2px;
`;

const CaptainIndicator = styled(FaStar)`
  color: #ffc107; /* A gold color for the star */
  font-size: 1.2rem;
`;

const TeamTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const OpGgMultiSearchLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #5383e8, #2a58b8);
  color: white;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(83, 131, 232, 0.3);
    background: linear-gradient(135deg, #6493f8, #3b69c8);
    color: white;
    text-decoration: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

interface TeamPageProps {
  matches: Match[];
}

const TeamPage: React.FC<TeamPageProps> = ({ matches }) => {
  const { getPlayerById } = usePlayers();
  const { tournamentCodes } = useGameMatches();
  const { teams, bracket } = useTournament();
  const { teamId } = useParams<{ teamId: string }>();
  const { division } = useDivision();

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
    <PageContainer>
      <TeamHeader>
        <TeamTitleContainer>
          <TeamPageTeamName>{team.name}</TeamPageTeamName>
          {sortedPlayers.length > 0 && (
            <OpGgMultiSearchLink
              href={createOpGgMultiSearchUrl(sortedPlayers.map(p => p.name))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaExternalLinkAlt size={12} />
              OP.GG Multi-Search
            </OpGgMultiSearchLink>
          )}
        </TeamTitleContainer>
        <PlayerList>
          {sortedPlayers.map(player => (
            <PlayerListItem key={player.id}>
              {isPlayerCaptain(player, division) && <CaptainIndicator title="Team Captain" />}
              <PlayerInfo>
                <PlayerNameLink href={createOpGgUrl(player.name)} target="_blank" rel="noopener noreferrer">
                  {player.name}
                </PlayerNameLink>
                <PlayerRole>{player.role}</PlayerRole>
              </PlayerInfo>
            </PlayerListItem>
          ))}
        </PlayerList>
      </TeamHeader>

      <div>
        <SectionTitle>
          <MatchNavLink to={`/teams/${teamId}/knockout`}>View Knockout Matches</MatchNavLink>
        </SectionTitle>
      </div>

      <div>
        <SectionTitle>Upcoming Match</SectionTitle>
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

              if (!opponent) {
                return <></>
              }

              return (
                <MatchResultPage match={match} teams={teams}></MatchResultPage>
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
