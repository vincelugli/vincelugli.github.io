import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// --- CONTEXT HOOKS ---
import { useDivision } from '../../context/DivisionContext';
import { usePlayers } from '../../context/PlayerContext';
import { useTournament } from '../../context/TournamentContext';

// --- TYPES & UTILS ---
import { Player, Team, Match, MatchResultData, BracketRound } from '../../types';
import { createOpGgUrl, getFirebasePrefix } from '../../utils';
import {enrichPlayerDetails} from '../../utils/playerHelper';
import { MatchInfo, MatchResult, ResultIndicator, Score } from '../../styles';
import {FaExternalLinkAlt} from 'react-icons/fa';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: ${({theme}) => theme.textAlt};
  margin-top: 5rem;
`;

const ProfileHeader = styled.div`
  padding: 2.5rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  margin-bottom: 2rem;
  border: 1px solid ${({theme}) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PlayerName = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const TeamLink = styled(Link)`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const FreeAgentText = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({theme}) => theme.textAlt};
`;

const RoleBadgesList = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
`;

const PrimaryBadge = styled.span`
  background-color: rgba(0, 123, 255, 0.15);
  color: ${({theme}) => theme.primary};
  border: 1px solid ${({theme}) => theme.primary};
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
`;

const SecondaryBadge = styled.span`
  background-color: rgba(108, 117, 125, 0.15);
  color: ${({theme}) => theme.textAlt};
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
`;

const ExternalLinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #5383e8; /* OP.GG Blue */
  color: white;
  text-decoration: none;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: background-color 0.2s;
  box-shadow: 0 4px 6px rgba(83, 131, 232, 0.2);

  &:hover {
    background-color: #3b6bd4;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: ${({ theme }) => theme.boxShadow};
  border: 1px solid ${({theme}) => theme.border};
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
  margin-top: 0;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid ${({theme}) => theme.border};
  padding-bottom: 0.5rem;
`;

// Extensible Stats List
const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed ${({theme}) => theme.border};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: ${({theme}) => theme.textAlt};
  font-weight: 500;
`;

const StatValue = styled.span`
  color: ${({theme}) => theme.text};
  font-weight: 700;
`;

// Champion Stats List
const ChampRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ChampIcon = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid ${({theme}) => theme.border};
`;

const ChampInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ChampName = styled.span`
  font-weight: 700;
  color: ${({theme}) => theme.text};
`;

const ChampStats = styled.span`
  font-size: 0.85rem;
  color: ${({theme}) => theme.textAlt};
`;

const ChampWinrate = styled.span<{winrate?: number}>`
  font-weight: 700;
  color: ${props => props.winrate && props.winrate >= 55 ? props.theme.success : props.winrate && props.winrate < 47 ? props.theme.danger : props.theme.text};
  font-size: 1rem;
`;

// Preferences styling
const PreferenceRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.85rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PreferenceRoleLabel = styled.span`
  width: 90px;
  font-weight: 600;
  text-transform: capitalize;
  color: ${({theme}) => theme.text};
  font-size: 0.95rem;
`;

const PreferenceBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background-color: ${({theme}) => theme.body};
  border-radius: 4px;
  overflow: hidden;
  margin-right: 1rem;
`;

const PreferenceBarFill = styled.div<{value: number}>`
  height: 100%;
  width: ${props => (props.value / 5) * 100}%;
  background-color: ${props => {
    if (props.value === 5) return props.theme.primary;
    if (props.value === 4) return '#10b981'; // Green Comfort
    if (props.value === 3) return '#f59e0b'; // Amber Can Play
    return '#6c757d'; // Gray Avoid / Off
  }};
  border-radius: 4px;
`;

const PreferenceValue = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({theme}) => theme.textAlt};
  width: 80px;
  text-align: right;
`;

// Match history styles
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
  gap: 1.5rem;
`;

const MatchItem = styled.li`
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid ${({theme}) => theme.border};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  }
`;

const GamesContainer = styled.div`
  padding: 0.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const GameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const GameResultIndicator = styled.span<{ win: boolean }>`
  font-weight: 700;
  font-size: 0.8rem;
  color: ${({ theme, win }) => (win ? theme.success : theme.danger)};
  width: 30px;
`;

const ChampionIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
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

const formatChampNameForDdragon = (name: string): string => {
  const clean = name.trim();
  const stripped = clean.replace(/[\s'.]/g, '');
  if (stripped.toLowerCase() === 'wukong') return 'MonkeyKing';
  if (stripped.toLowerCase() === 'leblanc') return 'Leblanc';
  if (stripped.toLowerCase() === 'khazix') return 'Khazix';
  if (stripped.toLowerCase() === 'chogath') return 'Chogath';
  if (stripped.toLowerCase() === 'kaisa') return 'Kaisa';
  if (stripped.toLowerCase() === 'velkoz') return 'Velkoz';
  return stripped;
};

const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { division } = useDivision();
  const { getPlayerById } = usePlayers();
  const { teams } = useTournament();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null);
  const [playerTeam, setPlayerTeam] = useState<Team | null>(null);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [tournamentChampStats, setTournamentChampStats] = useState<ChampionStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Map preferences to strings
  const getPreferenceText = (score: number): string => {
    switch (score) {
      case 5: return 'Primary';
      case 4: return 'Secondary';
      case 3: return 'Comfort';
      case 2: return 'Can Play';
      case 1: return 'Avoid';
      default: return 'Comfort';
    }
  };

  const getFormatRank = (tier: string, divisionVal: number) => {
    if (!tier || tier === 'N/A') return 'Unranked';
    if (divisionVal === -1 || ['master', 'masters', 'grandmaster', 'grandmasters', 'challenger'].includes(tier.toLowerCase())) {
      return tier;
    }
    return `${tier} ${divisionVal}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!playerId) return;
      setLoading(true);

      // 1. Fetch player data
      const playerData = await getPlayerById(Number(playerId));
      if (!playerData) {
        setLoading(false);
        return;
      }

      // Enrich player with detail stats (winrates, champion list, preferences)
      const enrichedPlayer = enrichPlayerDetails(playerData);
      setPlayer(enrichedPlayer);

      // 2. Find the player's team from the global context
      const team = teams.find(t => t.players.includes(Number(playerId))) || null;
      setPlayerTeam(team);

      // 3. Fetch all matches (Swiss and Knockout)
      try {
        const prefix = getFirebasePrefix();
        const swissMatchesDocRef = doc(db, 'matches', `${prefix}_${division}`);
        const knockoutMatchesColRef = doc(db, 'bracket', `${prefix}_${division}`);

        const [swissSnap, knockoutSnap] = await Promise.all([
          getDoc(swissMatchesDocRef),
          getDoc(knockoutMatchesColRef)
        ]);

        const swissMatches = swissSnap.exists() ? swissSnap.data().matches as Match[] : [];
        const knockoutRounds = knockoutSnap.exists() ? knockoutSnap.data().bracket as BracketRound[] : [];
        const knockoutMatches = knockoutRounds.map((round) => round.seeds).flat() as Match[];
        const allMatches = [...swissMatches, ...knockoutMatches];

        // 4. Filter for this player's team matches (if they are on a team)
        if (team) {
          const playerMatches = allMatches.filter(m => m.team1Id === team.id || m.team2Id === team.id);
          const completedPlayerMatches = playerMatches.filter(m => m.status === 'completed');

          // 5. Fetch detailed results for each completed match
          const champStatsMap = new Map<string, {games: number, wins: number}>();
          const enrichedHistory = await Promise.all(completedPlayerMatches.map(async match => {
            const resultsDocRefs = match.tournamentCodes.map((code) => doc(db, 'match_results', code));
            const resultSnaps = await Promise.all(resultsDocRefs.map(ref => getDoc(ref)));

            const processResult = (resultSnap: any) => {
              if (!resultSnap.exists()) return undefined;

              const resultData = resultSnap.data() as MatchResultData;
              const playerPerfBlue = resultData['blueTeam'].players.find(p => p.playerName.toLowerCase() === playerData.name.toLowerCase());
              const playerPerfRed = resultData['redTeam'].players.find(p => p.playerName.toLowerCase() === playerData.name.toLowerCase());

              // Update champion stats
              if (playerPerfBlue) {
                const champName = playerPerfBlue.championName;
                const stats = champStatsMap.get(champName) || {games: 0, wins: 0};
                stats.games++;
                let gameWinner = false;
                if (resultData.winner === 100) {
                  stats.wins++;
                  gameWinner = true;
                }
                champStatsMap.set(champName, stats);
                return {...playerPerfBlue, gameWinner};
              }
              if (playerPerfRed) {
                const champName = playerPerfRed.championName;
                const stats = champStatsMap.get(champName) || {games: 0, wins: 0};
                stats.games++;
                let gameWinner = false;
                if (resultData.winner === 200) {
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
          setTournamentChampStats(Array.from(champStatsMap.entries()).map(([name, data]) => ({name, ...data})).sort((a, b) => b.games - a.games));
        }
      } catch (err) {
        console.error("Error fetching match history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId, division, getPlayerById, teams]);

  if (loading) return <LoadingText>Loading player profile...</LoadingText>;
  if (!player) return <PageContainer><h1>Player Not Found</h1></PageContainer>;

  return (
    <PageContainer>
      <ProfileHeader>
        <HeaderLeft>
          <PlayerName>{player.name}</PlayerName>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem'}}>
            {playerTeam ? (
              <TeamLink to={`/teams/${playerTeam.id}?division=${division}`}>
                {playerTeam.name}
              </TeamLink>
            ) : (
              <FreeAgentText>Draft Pool Candidate</FreeAgentText>
            )}
            <span style={{color: '#6c757d'}}>|</span>
            <span style={{color: '#6c757d', fontWeight: 500}}>Timezone: {player.timezone}</span>
          </div>
          <RoleBadgesList>
            <PrimaryBadge>{player.role}</PrimaryBadge>
            {player.secondaryRoles && player.secondaryRoles.map(secRole => (
              secRole.toLowerCase() !== player.role.toLowerCase() && (
                <SecondaryBadge key={secRole}>{secRole}</SecondaryBadge>
              )
            ))}
          </RoleBadgesList>
        </HeaderLeft>

        <ExternalLinkButton
          href={createOpGgUrl(player.name)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaExternalLinkAlt size={14} /> OP.GG Profile
        </ExternalLinkButton>
      </ProfileHeader>

      <StatsGrid>
        <StatCard>
          <SectionTitle>Scouting & Rankings</SectionTitle>
          <StatsList>
            <StatRow>
              <StatLabel>Peak Rank</StatLabel>
              <StatValue>{getFormatRank(player.peakRankTier, player.peakRankDivision)}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Solo Q Rank</StatLabel>
              <StatValue>{getFormatRank(player.soloRankTier, player.soloRankDivision)}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Flex Q Rank</StatLabel>
              <StatValue>{getFormatRank(player.flexRankTier, player.flexRankDivision)}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Ranked Winrate</StatLabel>
              <StatValue>{player.rankedWinrate}</StatValue>
            </StatRow>
            {player.additionalStats && Object.entries(player.additionalStats).map(([key, val]) => (
              <StatRow key={key}>
                <StatLabel>{key}</StatLabel>
                <StatValue>{val}</StatValue>
              </StatRow>
            ))}
          </StatsList>
        </StatCard>

        <StatCard>
          <SectionTitle>Role Preference Ratings</SectionTitle>
          {player.rolePreferences && Object.entries(player.rolePreferences).map(([role, preference]) => (
            <PreferenceRow key={role}>
              <PreferenceRoleLabel>{role}</PreferenceRoleLabel>
              <PreferenceBarContainer>
                <PreferenceBarFill value={preference} />
              </PreferenceBarContainer>
              <PreferenceValue>{getPreferenceText(preference)}</PreferenceValue>
            </PreferenceRow>
          ))}
        </StatCard>

        <StatCard>
          <SectionTitle>Top Champion Pool</SectionTitle>
          {player.mostPlayedChampions && player.mostPlayedChampions.map((champName) => (
            <ChampRow key={champName}>
              <ChampIcon
                src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${formatChampNameForDdragon(champName)}.png`}
                alt={champName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png';
                }}
              />
              <ChampInfo>
                <ChampName>{champName}</ChampName>
                <ChampStats>Scouted Comfort Pool</ChampStats>
              </ChampInfo>
              <ChampWinrate>Comfort</ChampWinrate>
            </ChampRow>
          ))}
        </StatCard>

        {player.previousSeasons && player.previousSeasons.length > 0 && (
          <StatCard>
            <SectionTitle>Previous Season Rankings</SectionTitle>
            <StatsList>
              {player.previousSeasons.map((prev, index) => (
                <StatRow key={index}>
                  <StatLabel>{prev.season}</StatLabel>
                  <StatValue>{getFormatRank(prev.tier, prev.division)}</StatValue>
                </StatRow>
              ))}
            </StatsList>
          </StatCard>
        )}
      </StatsGrid>

      {/* Tournament Stats & Match History */}
      {playerTeam && matchHistory.length > 0 && (
        <div style={{marginTop: '3rem'}}>
          <SectionTitle>Live Tournament Champions Played</SectionTitle>
          <StatsGrid style={{marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
            {tournamentChampStats.length > 0 ? (
              tournamentChampStats.map(stat => (
                <StatCard key={stat.name} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem'}}>
                  <ChampIcon
                    src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${formatChampNameForDdragon(stat.name)}.png`}
                    alt={stat.name}
                  />
                  <ChampInfo>
                    <ChampName>{stat.name}</ChampName>
                    <ChampStats>{stat.wins}W - {stat.games - stat.wins}L</ChampStats>
                  </ChampInfo>
                  <ChampWinrate winrate={Math.round((stat.wins / stat.games) * 100)}>
                    {Math.round((stat.wins / stat.games) * 100)}%
                  </ChampWinrate>
                </StatCard>
              ))
            ) : (
              <p style={{color: '#6c757d', gridColumn: '1/-1'}}>No tournament champion statistics recorded yet.</p>
            )}
          </StatsGrid>

          <SectionTitle>Tournament Match History</SectionTitle>
          <MatchHistoryList>
            {matchHistory.map(match => {
              const opponentId = match.team1Id === playerTeam.id ? match.team2Id : match.team1Id;
              const opponent = teams.find(t => t.id === opponentId);
              const didWinSeries = match.playerMatchPerf.map((perf: any) => perf.gameWinner).filter((_: any) => _).length === 2;

              return opponent?.name ? (
                <MatchItem key={match.id} onClick={() => navigate(`/match/${match.id}`)}>
                  <MatchHeader win={didWinSeries}>
                    <MatchInfo>vs <span>{opponent.name}</span></MatchInfo>
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
                          src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${formatChampNameForDdragon(perf.championName)}.png`}
                          alt={perf.championName}
                        />
                        <KDA>
                          <span>{perf.kills}</span> / <span>{perf.deaths}</span> / <span>{perf.assists}</span>
                        </KDA>
                      </GameRow>
                    ))}
                  </GamesContainer>
                </MatchItem>
              ) : null;
            })}
          </MatchHistoryList>
        </div>
      )}
    </PageContainer> 
  );
};

export default PlayerProfilePage;
