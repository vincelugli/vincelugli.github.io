import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, getDocs, doc, getDoc, query } from 'firebase/firestore';
import { db } from '../../firebase';

// --- CONTEXT HOOKS ---
import { useDivision } from '../../context/DivisionContext';
import { usePlayers } from '../../context/PlayerContext';
import { useTournament } from '../../context/TournamentContext';

// --- TYPES & UTILS ---
import { Player, Team, Match, MatchResultData, BracketSeed, BracketRound } from '../../types';
import { createOpGgUrl } from '../../utils';
import { MatchInfo, MatchResult, ResultIndicator, Score } from '../../styles';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div` /* ... */ `;
const LoadingText = styled.p` /* ... */ `;

const ProfileHeader = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  margin-bottom: 2rem;
`;

const PlayerName = styled.a`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const TeamLink = styled(Link)`
  font-size: 1.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  display: block;
  margin-top: 0.5rem;
  &:hover { text-decoration: underline; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const SectionTitle = styled.h2` /* ... */ `;
const ChampionIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

// NEW: A header for the overall match result
const MatchHeader = styled.div<{ win: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  border-left: 5px solid ${({ theme, win }) => (win ? theme.success : theme.danger)};
  border-radius: 8px 8px 0 0;
`;

const MatchHistoryList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Increased gap for larger cards */
`;

// UPDATE: MatchItem is now a container, not a link
const MatchItem = styled.li`
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  }
`;


// NEW: A container for the list of individual games
const GamesContainer = styled.div`
  padding: 0.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

// NEW: A row for displaying a single game's details
const GameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const GameResultIndicator = styled.span<{ win: boolean }>`
  font-weight: 700;
  font-size: 0.8rem;
  color: ${({ theme, win }) => (win ? theme.success : theme.danger)};
  width: 30px; /* Fixed width for alignment */
`;

const KDA = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
  margin-top: 2px;
  font-weight: 500;

  span {
    color: ${({ theme }) => theme.text};
    font-weight: 700;
  }
`;

interface ChampionStat {
  name: string;
  games: number;
  wins: number;
}

const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { division } = useDivision();
  const { getPlayerById } = usePlayers();
  const { teams } = useTournament();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null);
  const [playerTeam, setPlayerTeam] = useState<Team | null>(null);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [championStats, setChampionStats] = useState<ChampionStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!playerId) return;
      setLoading(true);

      // 1. Fetch the core player data
      const playerData = await getPlayerById(Number(playerId));
      if (!playerData) {
        setLoading(false);
        return;
      }
      setPlayer(playerData);

      // 2. Find the player's team from the global context
      const team = teams.find(t => t.players.includes(Number(playerId))) || null;
      setPlayerTeam(team);

      // 3. Fetch all matches (Swiss and Knockout)
      const swissMatchesDocRef = doc(db, 'matches', `grumble2025_${division}`);
      const knockoutMatchesColRef = doc(db, 'bracket', `grumble2025_${division}`);
      
      const [swissSnap, knockoutSnap] = await Promise.all([
        getDoc(swissMatchesDocRef),
        getDoc(knockoutMatchesColRef)
      ]);

      const swissMatches = swissSnap.exists() ? swissSnap.data().matches as Match[] : [];
      const knockoutRounds = knockoutSnap.exists() ? knockoutSnap.data().bracket as BracketRound[] : [];
      const knockoutMatches = knockoutRounds.map((round) => round.seeds).flat() as Match[];
      const allMatches = [...swissMatches, ...knockoutMatches];

      // 4. Filter for this player's matches
      const playerMatches = allMatches.filter(m => m.team1Id === team?.id || m.team2Id === team?.id);
      const completedPlayerMatches = playerMatches.filter(m => m.status === 'completed');

      // 5. Fetch detailed results for each completed match
      const champStatsMap = new Map<string, { games: number, wins: number }>();
      const enrichedHistory = await Promise.all(completedPlayerMatches.map(async match => {
        const resultsDocRefs = match.tournamentCodes.map((code) => doc(db, 'match_results', code));
        const resultSnaps = await Promise.all(resultsDocRefs.map(ref => getDoc(ref)));

        const processResult = (resultSnap: any) => {
            if (!resultSnap.exists()) return undefined;

            const resultData = resultSnap.data() as MatchResultData;
            const playerPerfBlue = resultData['blueTeam'].players.find(p => p.playerName === playerData.name);
            const playerPerfRed = resultData['redTeam'].players.find(p => p.playerName === playerData.name);
            
            // Update champion stats
            if (playerPerfBlue) {
              const champName = playerPerfBlue.championName;
              const stats = champStatsMap.get(champName) || { games: 0, wins: 0 };
              stats.games++;
              let gameWinner = false;
              if (resultData.winner == 100) {
                stats.wins++;
                gameWinner = true;
              }
              champStatsMap.set(champName, stats);
              return {...playerPerfBlue, gameWinner};
            }
            if (playerPerfRed) {
              const champName = playerPerfRed.championName;
              const stats = champStatsMap.get(champName) || { games: 0, wins: 0 };
              stats.games++;
              let gameWinner = false;
              if (resultData.winner == 200) {
                stats.wins++;
                gameWinner = true;
              }
              champStatsMap.set(champName, stats);
              return {...playerPerfRed, gameWinner};
            }
        }

        const playerMatchPerf = resultSnaps.map(processResult).filter(p => p);
        return {...match, playerMatchPerf};
      }));

      setMatchHistory(enrichedHistory);
      setChampionStats(Array.from(champStatsMap.entries()).map(([name, data]) => ({ name, ...data })).sort((a,b) => b.games - a.games));
      setLoading(false);
    };

    fetchData();
  }, [playerId, division, getPlayerById, teams]);

  if (loading) return <LoadingText>Loading player profile...</LoadingText>;
  if (!player) return <PageContainer><h1>Player Not Found</h1></PageContainer>;

  return (
    <PageContainer>
      <ProfileHeader>
        <PlayerName href={createOpGgUrl(player.name)} target="_blank" rel="noopener noreferrer">
          {player.name}
        </PlayerName>
        {playerTeam && (
          <TeamLink to={`/teams/${playerTeam.id}?division=${division}`}>
            {playerTeam.name}
          </TeamLink>
        )}
      </ProfileHeader>

      <StatsGrid>
        <StatCard>
          <SectionTitle>Most Played Champions</SectionTitle>
          {championStats.map(stat => (
            <div key={stat.name}>
              {stat.name}: {stat.wins}W - {stat.games - stat.wins}L ({Math.round((stat.wins/stat.games)*100)}% WR)
            </div>
          ))}
        </StatCard>
        {/* You could add more stat cards here (Overall KDA, etc.) */}
      </StatsGrid>

      <SectionTitle>Match History</SectionTitle>


      <MatchHistoryList>
        {matchHistory.map(match => {
          const opponentId = match.team1Id === playerTeam?.id ? match.team2Id : match.team1Id;
          const opponent = teams.find(t => t.id === opponentId);
          const didWinSeries = match.playerMatchPerf.map((perf: any) => perf.gameWinner).filter((_: any)=>_).length == 2

          return (
            opponent?.name ? <MatchItem key={match.id} onClick={() => navigate(`/match/${match.id}`)}>
              <MatchHeader win={didWinSeries}>
                <MatchInfo>vs <span>{opponent?.name || 'Unknown'}</span></MatchInfo>
                <MatchResult>
                  <ResultIndicator win={didWinSeries}>{didWinSeries ? 'WIN' : 'LOSS'}</ResultIndicator>
                  <Score win={didWinSeries}>{match.score}</Score>
                </MatchResult>
              </MatchHeader>

              <GamesContainer>
                {match.playerMatchPerf.map((perf: any, index: number) => (
                  <GameRow key={index}>
                    <GameResultIndicator win={perf.gameWinner}>{perf.gameWinner ? 'W' : 'L'}</GameResultIndicator>
                    <ChampionIcon 
                      src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${perf.championName}.png`} 
                      alt={perf.championName}
                    />
                    <KDA>
                      <span>{perf.kills}</span> / <span>{perf.deaths}</span> / <span>{perf.assists}</span>
                    </KDA>
                  </GameRow>
                ))}
              </GamesContainer>
            </MatchItem> : <></>
          );
        })}
      </MatchHistoryList>






      {/* <MatchHistoryList>
        {matchHistory.map(match => {
          const opponentId = match.team1Id === playerTeam?.id ? match.team2Id : match.team1Id;
          const opponent = teams.find(t => t.id === opponentId);
          const didWin = match.winnerId === playerTeam?.id;
          return (opponent?.name ?
            <MatchItem key={match.id}>
              <span>vs {opponent?.name}</span>
              {match.playerPerfs && (
                <>
                {match.playerPerfs.map((playerPerf: any) => {
                    return <> 
                     {playerPerf && <>
                        <span>Champ: {playerPerf.championName}</span>
                        <span>KDA: {playerPerf.kills}/{playerPerf.deaths}/{playerPerf.assists}</span></>}
                    </>
                })}
                  
                </>
              )}
            </MatchItem> : <></>
          );
        })}
      </MatchHistoryList>*/}
    </PageContainer> 
  );
};

export default PlayerProfilePage;
