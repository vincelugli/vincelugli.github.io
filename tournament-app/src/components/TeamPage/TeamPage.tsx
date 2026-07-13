import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BracketRound, BracketSeed, Match, Player } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import styled from 'styled-components';
import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import { createOpGgUrl, createOpGgMultiSearchUrl, isPlayerCaptain } from '../../utils';
import { usePlayers } from '../../context/PlayerContext';
import { useGameMatches } from '../../context/MatchesContext';
import UpcomingMatch from './UpcomingMatch';
import MatchResultPage from '../MatchResult/MatchResultPage';
import { useDivision } from '../../context/DivisionContext';

const TeamPageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const TeamHeaderCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: 2.5rem;
  border: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 600px) {
    padding: 1.5rem;
  }
`;

const TeamTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 1.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const TeamName = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;

  @media (max-width: 600px) {
    font-size: 2.25rem;
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.backgroundTwo};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${({ theme }) => theme.backgroundThree || theme.body};
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
  }

  &:active {
    transform: translateY(1px);
  }
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
  box-shadow: 0 4px 6px rgba(83, 131, 232, 0.15);
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

const PlayerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
`;

const PlayerCard = styled.li`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 1rem 1.25rem;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px ${({ theme }) => theme.boxShadow};
    border-color: ${({ theme }) => theme.primary};
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const PlayerNameLink = styled.a`
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  font-size: 1.1rem;

  &:hover {
    color: ${({ theme }) => theme.primary};
    text-decoration: underline;
  }
`;

const PlayerRole = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textAlt};
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const CaptainIndicator = styled(FaStar)`
  color: #ffc107;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const PageSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;
  position: relative;
  padding-left: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.2rem;
    bottom: 0.2rem;
    width: 4px;
    background-color: ${({ theme }) => theme.primary};
    border-radius: 2px;
  }
`;

const EmptyStateCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textAlt};
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const MatchHistoryCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 600px) {
    padding: 1.25rem;
  }

  & > h1 {
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0 0 1.5rem 0;
    color: ${({ theme }) => theme.text};
    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding-bottom: 1rem;
  }

  & > h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 1.5rem 0 0.75rem 0;
    color: ${({ theme }) => theme.textAlt};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const MatchesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
    <TeamPageContainer>
      <TeamHeaderCard>
        <TeamTitleContainer>
          <TeamName>{team.name}</TeamName>
          <ActionButtonGroup>
            {bracket && bracket.length > 0 && (
              <ActionButton to={`/teams/${teamId}/knockout`}>
                View Knockout Matches
              </ActionButton>
            )}
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
          </ActionButtonGroup>
        </TeamTitleContainer>
        <PlayerList>
          {sortedPlayers.map(player => (
            <PlayerCard key={player.id}>
              {isPlayerCaptain(player, division) && <CaptainIndicator title="Team Captain" />}
              <PlayerInfo>
                <PlayerNameLink href={createOpGgUrl(player.name)} target="_blank" rel="noopener noreferrer">
                  {player.name}
                </PlayerNameLink>
                <PlayerRole>{player.role}</PlayerRole>
              </PlayerInfo>
            </PlayerCard>
          ))}
        </PlayerList>
      </TeamHeaderCard>

      <PageSection>
        <SectionHeader>Upcoming Matches</SectionHeader>
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
          <EmptyStateCard>No upcoming matches scheduled.</EmptyStateCard>
        )}
      </PageSection>

      <PageSection>
        <SectionHeader>Match History</SectionHeader>
        {completedMatches.length > 0 ? (
          <MatchesList>
            {completedMatches.map(match => {
              const opponentId = match.team1Id === team.id ? match.team2Id : match.team1Id;
              const opponent = teams.find(t => t.id === opponentId);

              if (!opponent) {
                return <></>
              }

              return (
                <MatchHistoryCard key={match.id}>
                  <MatchResultPage match={match} teams={teams}></MatchResultPage>
                </MatchHistoryCard>
              );
            })}
          </MatchesList>
        ) : (
          <EmptyStateCard>No matches played yet.</EmptyStateCard>
        )}
      </PageSection>
    </TeamPageContainer>
  );
};

export default TeamPage;
