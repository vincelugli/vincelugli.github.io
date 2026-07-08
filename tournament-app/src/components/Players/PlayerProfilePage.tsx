import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// --- CONTEXT HOOKS ---
import { useDivision } from '../../context/DivisionContext';
import { usePlayers } from '../../context/PlayerContext';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../Common/AuthContext';

// --- TYPES & UTILS ---
import { Player, Team, Match, MatchResultData, BracketRound } from '../../types';
import { createOpGgUrl, getFirebasePrefix, getPlayerAchievements } from '../../utils';
import {enrichPlayerDetails} from '../../utils/playerHelper';
import {
  ProfilePageContainer,
  ProfileLoadingText,
  ProfileHeader,
  ProfileHeaderLeft,
  ProfilePlayerName,
  ProfileTeamLink,
  ProfileFreeAgentText,
  ProfileRoleBadgesList,
  ProfilePrimaryBadge,
  ProfileSecondaryBadge,
  ProfileCaptainBadge,
  ProfileAchievementBadge,
  ProfileExternalLinkButton,
  ProfileStatsGrid,
  ProfileStatCard,
  ProfileSectionTitle,
  ProfileStatsList,
  ProfileStatRow,
  ProfileStatLabel,
  ProfileStatValue,
  ProfileChampRow,
  ProfileChampIcon,
  ProfileChampInfo,
  ProfileChampName,
  ProfileChampStats,
  ProfileChampWinrate,
  ProfileChampRight,
  ProfilePreferenceRow,
  ProfilePreferenceRoleLabel,
  ProfilePreferenceBarContainer,
  ProfilePreferenceBarFill,
  ProfilePreferenceValue,
  ProfileMatchHeader,
  ProfileMatchHistoryList,
  ProfileMatchItem,
  ProfileGamesContainer,
  ProfileGameRow,
  ProfileGameResultIndicator,
  ProfileChampionIcon,
  ProfileKDA,
  MatchInfo,
  MatchResult,
  ResultIndicator,
  Score,
  ProfileRankValue
} from '../../styles';
import {FaExternalLinkAlt} from 'react-icons/fa';

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

  const [player, setPlayer] = useState<Required<Player> | null>(null);
  const [playerTeam, setPlayerTeam] = useState<Team | null>(null);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [tournamentChampStats, setTournamentChampStats] = useState<ChampionStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { captainTeamId } = useAuth();
  const [priorityPlayerIds, setPriorityPlayerIds] = useState<number[]>([]);

  useEffect(() => {
    if (!captainTeamId) return;

    const docRef = doc(db, 'draftBoards', String(captainTeamId));
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setPriorityPlayerIds(snapshot.data().playerIds || []);
      } else {
        setPriorityPlayerIds([]);
      }
    });

    return () => unsubscribe();
  }, [captainTeamId]);

  const handleToggleAutoDraft = async () => {
    if (!captainTeamId || !player) return;

    let newPlayerIds: number[];
    if (priorityPlayerIds.includes(player.id)) {
      newPlayerIds = priorityPlayerIds.filter(id => id !== player.id);
    } else {
      newPlayerIds = [...priorityPlayerIds, player.id];
    }

    const docRef = doc(db, 'draftBoards', String(captainTeamId));
    try {
      await setDoc(docRef, { playerIds: newPlayerIds });
    } catch (err) {
      console.error("Failed to update auto-draft list:", err);
    }
  };

  // Format rank display
  const getFormatRank = (tier: string, divisionVal: number) => {
    if (!tier || tier === 'N/A') return 'Unranked';
    if (divisionVal === -1 || ['master', 'masters', 'grandmaster', 'grandmasters', 'challenger'].includes(tier.toLowerCase())) {
      return tier;
    }
    return `${tier} ${divisionVal}`;
  };

  const getPreferenceText = (pref: number): string => {
    switch (pref) {
      case 5: return 'Primary';
      case 4: return 'Secondary';
      case 3: return 'Comfortable';
      case 2: return 'Can Play';
      case 1: return 'Avoid';
      default: return 'Can Play';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!playerId) return;
      setLoading(true);

      try {
        // 1. Get player raw info
        const rawPlayer = getPlayerById(parseInt(playerId, 10));
        if (!rawPlayer) {
          setPlayer(null);
          setLoading(false);
          return;
        }

        // 2. Enrich player details
        const enriched = enrichPlayerDetails(rawPlayer);
        setPlayer(enriched);

        // 3. Find Team
        const team = teams.find((t) => t.id === enriched.teamId);
        setPlayerTeam(team || null);

        // 4. Fetch Matches & calculate tournament stats if team exists
        if (team) {
          const dbPrefix = getFirebasePrefix(division);
          const docRef = doc(db, `${dbPrefix}_matches`, 'matchesData');
          const docSnap = await getDoc(docRef);

          const matches: Match[] = [];
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.rounds) {
              data.rounds.forEach((round: any) => {
                const seedsList = round.seeds || round.matches || [];
                seedsList.forEach((match: any) => {
                  // Match has either team1Id or team2Id equal to player's team id
                  if (match.team1Id === team.id || match.team2Id === team.id) {
                    matches.push(match);
                  }
                });
              });
            }
          }

          // 5. Gather Match Performance Details from firebase results
          const champStatsMap = new Map<string, { games: number; wins: number }>();

          const enrichedHistory = await Promise.all(matches.map(async (match) => {
            const resultRef = doc(db, `${dbPrefix}_match_results`, String(match.id));
            const resultSnap = await getDoc(resultRef);
            
            const resultsData = resultSnap.exists() 
              ? resultSnap.data() as any
              : { matchId: String(match.id), games: [] };

            const resultSnaps = resultsData.games || [];

            function processResult(gameResult: any) {
              const playerPerfBlue = gameResult.blueTeamPlayers?.find((p: any) => p.playerId === enriched.id);
              const playerPerfRed = gameResult.redTeamPlayers?.find((p: any) => p.playerId === enriched.id);

              if (playerPerfBlue) {
                const champName = playerPerfBlue.championName;
                const stats = champStatsMap.get(champName) || { games: 0, wins: 0 };
                stats.games++;
                let gameWinner = false;
                if (gameResult.winner === 'blue') {
                  stats.wins++;
                  gameWinner = true;
                }
                champStatsMap.set(champName, stats);
                return {...playerPerfBlue, gameWinner};
              } else if (playerPerfRed) {
                const champName = playerPerfRed.championName;
                const stats = champStatsMap.get(champName) || { games: 0, wins: 0 };
                stats.games++;
                let gameWinner = false;
                if (gameResult.winner === 'red') {
                  stats.wins++;
                  gameWinner = true;
                }
                champStatsMap.set(champName, stats);
                return {...playerPerfRed, gameWinner};
              }
            }

            const playerMatchPerf = resultSnaps.map(processResult).filter((p: any) => p);
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

  if (loading) return <ProfileLoadingText>Loading player profile...</ProfileLoadingText>;
  if (!player) return <ProfilePageContainer><h1>Player Not Found</h1></ProfilePageContainer>;

  return (
    <ProfilePageContainer>
      <ProfileHeader>
        <ProfileHeaderLeft>
          <ProfilePlayerName>{player.name}</ProfilePlayerName>
          {(() => {
            const achievements = getPlayerAchievements(player.name);
            if (achievements.length === 0) return null;
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                {achievements.map((ach, idx) => (
                  <ProfileAchievementBadge
                    key={idx}
                    type={ach.type}
                    division={ach.division}
                    title={ach.title}
                  >
                    🏆 {ach.title}
                  </ProfileAchievementBadge>
                ))}
              </div>
            );
          })()}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem'}}>
            {playerTeam ? (
              <ProfileTeamLink to={`/teams/${playerTeam.id}?division=${division}`}>
                {playerTeam.name}
              </ProfileTeamLink>
            ) : (
              <ProfileFreeAgentText>Draft Pool Candidate</ProfileFreeAgentText>
            )}
            <span style={{color: '#6c757d'}}>|</span>
            <span style={{color: '#6c757d', fontWeight: 500}}>Timezone: {player.timezone}</span>
          </div>
          <ProfileRoleBadgesList>
            {player.isCaptain && <ProfileCaptainBadge>Captain</ProfileCaptainBadge>}
            <ProfilePrimaryBadge>{player.role}</ProfilePrimaryBadge>
            {player.secondaryRoles && player.secondaryRoles.map(secRole => (
              secRole.toLowerCase() !== player.role.toLowerCase() && (
                <ProfileSecondaryBadge key={secRole}>{secRole}</ProfileSecondaryBadge>
              )
            ))}
          </ProfileRoleBadgesList>
        </ProfileHeaderLeft>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {!!captainTeamId && !player.isCaptain && (
            <button
              onClick={handleToggleAutoDraft}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: priorityPlayerIds.includes(player.id) ? '#f59e0b' : 'transparent',
                color: priorityPlayerIds.includes(player.id) ? '#fff' : '#f59e0b',
                border: '2px solid #f59e0b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                const isSelected = priorityPlayerIds.includes(player.id);
                e.currentTarget.style.backgroundColor = isSelected ? '#d97706' : 'rgba(245, 158, 11, 0.1)';
                e.currentTarget.style.borderColor = '#d97706';
                if (!isSelected) e.currentTarget.style.color = '#d97706';
              }}
              onMouseOut={(e) => {
                const isSelected = priorityPlayerIds.includes(player.id);
                e.currentTarget.style.backgroundColor = isSelected ? '#f59e0b' : 'transparent';
                e.currentTarget.style.borderColor = '#f59e0b';
                if (!isSelected) e.currentTarget.style.color = '#f59e0b';
              }}
            >
              {priorityPlayerIds.includes(player.id) ? '★ In Auto-Draft' : '☆ Add to Auto-Draft'}
            </button>
          )}

          <ProfileExternalLinkButton
            href={createOpGgUrl(player.name)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaExternalLinkAlt size={14} /> OP.GG Profile
          </ProfileExternalLinkButton>
        </div>
      </ProfileHeader>

      <ProfileStatsGrid>
        <ProfileStatCard>
          <ProfileSectionTitle>Scouting & Rankings</ProfileSectionTitle>
          <ProfileStatsList>
            <ProfileStatRow>
              <ProfileStatLabel>Peak Rank</ProfileStatLabel>
              <ProfileRankValue tier={player.peakRankTier}>
                {getFormatRank(player.peakRankTier, player.peakRankDivision)}
              </ProfileRankValue>
            </ProfileStatRow>
            <ProfileStatRow>
              <ProfileStatLabel>Solo Q Rank</ProfileStatLabel>
              <ProfileRankValue tier={player.soloRankTier}>
                {getFormatRank(player.soloRankTier, player.soloRankDivision)}
              </ProfileRankValue>
            </ProfileStatRow>
            <ProfileStatRow>
              <ProfileStatLabel>Flex Q Rank</ProfileStatLabel>
              <ProfileRankValue tier={player.flexRankTier}>
                {getFormatRank(player.flexRankTier, player.flexRankDivision)}
              </ProfileRankValue>
            </ProfileStatRow>
            <ProfileStatRow>
              <ProfileStatLabel>Ranked Winrate</ProfileStatLabel>
              <ProfileStatValue>{player.rankedWinrate}</ProfileStatValue>
            </ProfileStatRow>
            {player.additionalStats && Object.entries(player.additionalStats).map(([key, val]) => (
              <ProfileStatRow key={key}>
                <ProfileStatLabel>{key}</ProfileStatLabel>
                <ProfileStatValue>{val}</ProfileStatValue>
              </ProfileStatRow>
            ))}
          </ProfileStatsList>
        </ProfileStatCard>

        <ProfileStatCard>
          <ProfileSectionTitle>Role Preference Ratings</ProfileSectionTitle>
          {player.rolePreferences && ['top', 'jungle', 'mid', 'adc', 'support'].map((role) => {
            const preference = player.rolePreferences[role as 'top' | 'jungle' | 'mid' | 'adc' | 'support'];
            if (preference === undefined) return null;
            const scaledPreference = preference <= 5 ? preference * 2 : preference;
            return (
              <ProfilePreferenceRow key={role}>
                <ProfilePreferenceRoleLabel style={{ textTransform: 'capitalize' }}>
                  {role === 'adc' ? 'ADC' : role}
                </ProfilePreferenceRoleLabel>
                <ProfilePreferenceBarContainer>
                  <ProfilePreferenceBarFill value={scaledPreference} />
                </ProfilePreferenceBarContainer>
                <ProfilePreferenceValue>{scaledPreference}/10</ProfilePreferenceValue>
              </ProfilePreferenceRow>
            );
          })}
        </ProfileStatCard>

        <ProfileStatCard>
          <ProfileSectionTitle>Top Champion Pool</ProfileSectionTitle>
          {player.mostPlayedChampions && player.mostPlayedChampions.map((champ, index) => {
            const isObject = typeof champ === 'object' && champ !== null;
            const champName = isObject ? champ.name : champ;
            const games = isObject ? champ.games : null;
            const winrate = isObject ? champ.winrate : 'Comfort';
            const kda = isObject ? champ.kda : null;
            const kills = isObject ? champ.kills : null;
            const deaths = isObject ? champ.deaths : null;
            const assists = isObject ? champ.assists : null;
            const csPerMin = isObject ? champ.csPerMin : null;

            return (
              <ProfileChampRow key={champName || index}>
                <ProfileChampIcon
                  src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${formatChampNameForDdragon(champName)}.png`}
                  alt={champName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png';
                  }}
                />
                <ProfileChampInfo>
                  <ProfileChampName>{champName}</ProfileChampName>
                </ProfileChampInfo>
                <ProfileChampRight>
                  <ProfileChampWinrate>{winrate}</ProfileChampWinrate>
                  <ProfileChampStats>
                    {isObject ? (
                      <>
                        {games} games
                        {csPerMin && csPerMin !== '-' && ` • ${csPerMin} CS/m`} • {kda} KDA ({kills}/{deaths}/{assists})
                      </>
                    ) : (
                      'Scouted Comfort Pool'
                    )}
                  </ProfileChampStats>
                </ProfileChampRight>
              </ProfileChampRow>
            );
          })}
        </ProfileStatCard>

        {player.previousSeasons && player.previousSeasons.length > 0 && (
          <ProfileStatCard>
            <ProfileSectionTitle>Previous Season Rankings</ProfileSectionTitle>
            <ProfileStatsList>
              {player.previousSeasons.map((prev, index) => (
                <ProfileStatRow key={index}>
                  <ProfileStatLabel>{prev.season}</ProfileStatLabel>
                  <ProfileRankValue tier={prev.tier}>
                    {getFormatRank(prev.tier, prev.division)}
                  </ProfileRankValue>
                </ProfileStatRow>
              ))}
            </ProfileStatsList>
          </ProfileStatCard>
        )}
      </ProfileStatsGrid>

      {/* Tournament Stats & Match History */}
      {playerTeam && matchHistory.length > 0 && (
        <div style={{marginTop: '3rem'}}>
          <ProfileSectionTitle>Live Tournament Champions Played</ProfileSectionTitle>
          <ProfileStatsGrid style={{marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
            {tournamentChampStats.length > 0 ? (
              tournamentChampStats.map(stat => (
                <ProfileStatCard key={stat.name} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem'}}>
                  <ProfileChampIcon
                    src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${formatChampNameForDdragon(stat.name)}.png`}
                    alt={stat.name}
                  />
                  <ProfileChampInfo>
                    <ProfileChampName>{stat.name}</ProfileChampName>
                    <ProfileChampStats>{stat.wins}W - {stat.games - stat.wins}L</ProfileChampStats>
                  </ProfileChampInfo>
                  <ProfileChampWinrate winrate={Math.round((stat.wins / stat.games) * 100)}>
                    {Math.round((stat.wins / stat.games) * 100)}%
                  </ProfileChampWinrate>
                </ProfileStatCard>
              ))
            ) : (
              <p style={{color: '#6c757d', gridColumn: '1/-1'}}>No tournament champion statistics recorded yet.</p>
            )}
          </ProfileStatsGrid>

          <ProfileSectionTitle>Tournament Match History</ProfileSectionTitle>
          <ProfileMatchHistoryList>
            {matchHistory.map(match => {
              const opponentId = match.team1Id === playerTeam.id ? match.team2Id : match.team1Id;
              const opponent = teams.find(t => t.id === opponentId);
              const didWinSeries = match.playerMatchPerf.map((perf: any) => perf.gameWinner).filter((_: any) => _).length === 2;

              return opponent?.name ? (
                <ProfileMatchItem key={match.id} onClick={() => navigate(`/match/${match.id}`)}>
                  <ProfileMatchHeader win={didWinSeries}>
                    <MatchInfo>vs <span>{opponent.name}</span></MatchInfo>
                    <MatchResult>
                      <ResultIndicator win={didWinSeries}>{didWinSeries ? 'WIN' : 'LOSS'}</ResultIndicator>
                      <Score win={didWinSeries}>{match.score}</Score>
                    </MatchResult>
                  </ProfileMatchHeader>

                  <ProfileGamesContainer>
                    {match.playerMatchPerf.map((perf: any, index: number) => (
                      <ProfileGameRow key={index}>
                        <ProfileGameResultIndicator win={perf.gameWinner}>{perf.gameWinner ? 'W' : 'L'}</ProfileGameResultIndicator>
                        <ProfileChampionIcon 
                          src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${formatChampNameForDdragon(perf.championName)}.png`}
                          alt={perf.championName}
                        />
                        <ProfileKDA>
                          <span>{perf.kills}</span> / <span>{perf.deaths}</span> / <span>{perf.assists}</span>
                        </ProfileKDA>
                      </ProfileGameRow>
                    ))}
                  </ProfileGamesContainer>
                </ProfileMatchItem>
              ) : null;
            })}
          </ProfileMatchHistoryList>
        </div>
      )}
    </ProfilePageContainer>
  );
};

export default PlayerProfilePage;
