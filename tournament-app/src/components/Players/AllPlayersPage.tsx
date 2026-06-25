import React, {useState, useMemo, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {usePlayers} from '../../context/PlayerContext';
import {Player} from '../../types';
import {useDivision} from '../../context/DivisionContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../Common/AuthContext';
import {
  FaShieldAlt,
  FaTree,
  FaFire,
  FaCrosshairs,
  FaHeart,
  FaRandom,
  FaFilter
} from 'react-icons/fa';
import {compareRanks, convertRankToElo, getPlayerAchievements} from '../../utils';
import {
  PlayersPageContainer,
  PlayersHeaderSection,
  PlayersPageTitle,
  PlayersPageSubtitle,
  PlayersControlsRow,
  PlayersSearchBarContainer,
  PlayersDropdownContainer,
  PlayersDropdownLabel,
  PlayersDropdownSelect,
  PlayersSearchInput,
  PlayersRoleSection,
  PlayersRoleHeader,
  PlayersRoleIconWrapper,
  PlayersGrid,
  PlayersTierSection,
  PlayersTierHeader,
  PlayersTierBadge,
  PlayersPlayerCard,
  PlayersCaptainBadge,
  PlayersAchievementBadgeList,
  PlayersAchievementBadge,
  PlayersPlayerName,
  PlayersRanksContainer,
  PlayersRankInfo,
  PlayersRankLabel,
  PlayersRankValue,
  PlayersRolesContainer,
  PlayersRoleBadge,
  PlayersLoadingContainer,
  PlayersNoPlayersMessage,
  PlayersFilterToggleBtn,
  PlayersFilterPanel,
  PlayersFilterGrid,
  PlayersFilterGroup,
  PlayersFilterLabel,
  PlayersFilterPillContainer,
  PlayersFilterPill,
  PlayersClearFiltersBtn
} from '../../styles';

// Helper map for roles ordering and styling
interface RoleDefinition {
  displayName: string;
  icon: React.ReactNode;
  color: string;
}

const ROLE_DEFINITIONS: {[key: string]: RoleDefinition} = {
  top: {
    displayName: 'Top Lane',
    icon: <FaShieldAlt size={20} />,
    color: '#ef4444'
  },
  jungle: {
    displayName: 'Jungle',
    icon: <FaTree size={20} />,
    color: '#10b981'
  },
  mid: {
    displayName: 'Mid Lane',
    icon: <FaFire size={20} />,
    color: '#f59e0b'
  },
  adc: {
    displayName: 'Bot Lane (ADC)',
    icon: <FaCrosshairs size={20} />,
    color: '#3b82f6'
  },
  support: {
    displayName: 'Support',
    icon: <FaHeart size={20} />,
    color: '#a855f7'
  },
  fill: {
    displayName: 'Fill / Other',
    icon: <FaRandom size={20} />,
    color: '#6b7280'
  }
};

const TIER_ORDER = [
  'Challenger',
  'Grandmaster',
  'Master',
  'Diamond',
  'Emerald',
  'Platinum',
  'Gold',
  'Silver',
  'Bronze',
  'Iron',
  'Unranked'
];

type RankTypeOption = 'highest' | 'peak' | 'solo' | 'flex';

const getPlayerRankTier = (player: Player, type: RankTypeOption): string => {
  let tier = 'Unranked';
  if (type === 'highest') {
    const peakElo = convertRankToElo(player.peakRankTier, player.peakRankDivision);
    const soloElo = convertRankToElo(player.soloRankTier, player.soloRankDivision);
    const flexElo = convertRankToElo(player.flexRankTier, player.flexRankDivision);

    const maxElo = Math.max(peakElo, soloElo, flexElo);

    if (maxElo === peakElo && player.peakRankTier && player.peakRankTier !== 'N/A') tier = player.peakRankTier;
    else if (maxElo === soloElo && player.soloRankTier && player.soloRankTier !== 'N/A') tier = player.soloRankTier;
    else if (maxElo === flexElo && player.flexRankTier && player.flexRankTier !== 'N/A') tier = player.flexRankTier;
  } else if (type === 'peak') {
    tier = player.peakRankTier;
  } else if (type === 'solo') {
    tier = player.soloRankTier;
  } else if (type === 'flex') {
    tier = player.flexRankTier;
  }

  if (!tier || tier === 'N/A') return 'Unranked';

  if (tier === 'Masters') return 'Master';
  if (tier === 'Grandmasters') return 'Grandmaster';
  return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
};

const compareRanksByType = (a: Player, b: Player, type: RankTypeOption): number => {
  if (type === 'highest') {
    return compareRanks(b, a);
  }

  let eloA = 0;
  let eloB = 0;
  if (type === 'peak') {
    eloA = convertRankToElo(a.peakRankTier, a.peakRankDivision);
    eloB = convertRankToElo(b.peakRankTier, b.peakRankDivision);
  } else if (type === 'solo') {
    eloA = convertRankToElo(a.soloRankTier, a.soloRankDivision);
    eloB = convertRankToElo(b.soloRankTier, b.soloRankDivision);
  } else if (type === 'flex') {
    eloA = convertRankToElo(a.flexRankTier, a.flexRankDivision);
    eloB = convertRankToElo(b.flexRankTier, b.flexRankDivision);
  }

  if (eloA === eloB) {
    return a.name.localeCompare(b.name);
  }
  return eloB - eloA;
};

const getPlayerEloByType = (player: Player, type: RankTypeOption): number => {
  if (type === 'highest') {
    return Math.max(
      convertRankToElo(player.peakRankTier, player.peakRankDivision),
      convertRankToElo(player.soloRankTier, player.soloRankDivision),
      convertRankToElo(player.flexRankTier, player.flexRankDivision)
    );
  } else if (type === 'peak') {
    return convertRankToElo(player.peakRankTier, player.peakRankDivision);
  } else if (type === 'solo') {
    return convertRankToElo(player.soloRankTier, player.soloRankDivision);
  } else if (type === 'flex') {
    return convertRankToElo(player.flexRankTier, player.flexRankDivision);
  }
  return 0;
};

const ROLE_ORDER = ['top', 'jungle', 'mid', 'adc', 'support', 'fill'];

const AllPlayersPage: React.FC = () => {
  const {players: allPlayers, loading: playersLoading} = usePlayers();
  const {division} = useDivision();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rankType, setRankType] = useState<RankTypeOption>('highest');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [minRank, setMinRank] = useState<string>('All');
  const [selectedPrimaryRoles, setSelectedPrimaryRoles] = useState<string[]>([]);
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<string[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<('winner' | 'runner_up')[]>([]);

  const {captainTeamId} = useAuth();
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

  const toggleAutoDraft = async (playerId: number) => {
    if (!captainTeamId) return;

    let newPlayerIds: number[];
    if (priorityPlayerIds.includes(playerId)) {
      newPlayerIds = priorityPlayerIds.filter(id => id !== playerId);
    } else {
      newPlayerIds = [...priorityPlayerIds, playerId];
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

  const handleClearFilters = () => {
    setMinRank('All');
    setSelectedPrimaryRoles([]);
    setSelectedSecondaryRoles([]);
    setSelectedAchievements([]);
  };

  // Filter players based on search query, min rank, primary roles, and secondary roles
  const filteredPlayers = useMemo(() => {
    let result = allPlayers;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(player => player.name.toLowerCase().includes(query));
    }

    // Rank filter
    if (minRank !== 'All') {
      const thresholdElo = convertRankToElo(minRank, 4);
      result = result.filter(player => {
        const playerElo = getPlayerEloByType(player, rankType);
        return playerElo >= thresholdElo;
      });
    }

    // Role filters (OR logic between Primary and Secondary if both are selected)
    if (selectedPrimaryRoles.length > 0 || selectedSecondaryRoles.length > 0) {
      result = result.filter(player => {
        const matchesPrimary = selectedPrimaryRoles.length > 0 && player.role && selectedPrimaryRoles.includes(player.role.toLowerCase());
        const matchesSecondary = selectedSecondaryRoles.length > 0 && player.secondaryRoles && player.secondaryRoles.some(secRole =>
          selectedSecondaryRoles.includes(secRole.toLowerCase())
        );
        return matchesPrimary || matchesSecondary;
      });
    }

    // Achievements filter
    if (selectedAchievements.length > 0) {
      result = result.filter(player => {
        const achievements = getPlayerAchievements(player.name);
        return achievements.some(ach => selectedAchievements.includes(ach.type));
      });
    }

    return result;
  }, [allPlayers, searchQuery, minRank, rankType, selectedPrimaryRoles, selectedSecondaryRoles, selectedAchievements]);

  // Group players by primary role and then rank tier
  const playersByRoleAndTier = useMemo(() => {
    const groups: {[role: string]: {[tier: string]: Player[]}} = {};

    ROLE_ORDER.forEach(role => {
      groups[role] = {};
    });

    filteredPlayers.forEach(player => {
      const role = player.role ? player.role.toLowerCase() : 'fill';
      const targetRole = role in groups ? role : 'fill';
      const tier = getPlayerRankTier(player, rankType);

      if (!groups[targetRole][tier]) {
        groups[targetRole][tier] = [];
      }
      groups[targetRole][tier].push(player);
    });

    // Sort players in each sub-group by rank descending (highest Elo first)
    Object.keys(groups).forEach(roleKey => {
      Object.keys(groups[roleKey]).forEach(tierKey => {
        groups[roleKey][tierKey].sort((a, b) => compareRanksByType(a, b, rankType));
      });
    });

    return groups;
  }, [filteredPlayers, rankType]);

  if (playersLoading) {
    return (
      <PlayersLoadingContainer>
        <p>Loading player roster...</p>
      </PlayersLoadingContainer>
    );
  }

  return (
    <PlayersPageContainer>
      <PlayersHeaderSection>
        <PlayersPageTitle>Player Roster</PlayersPageTitle>
        <PlayersPageSubtitle>Explore details and stats of all draft pool participants ({(division === 'gold' ? 'elemental' : 'elder').toUpperCase()} Division)</PlayersPageSubtitle>
      </PlayersHeaderSection>

      <PlayersControlsRow>
        <PlayersSearchBarContainer>
          <PlayersSearchInput
            type="text"
            placeholder="Search players by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </PlayersSearchBarContainer>

        <PlayersDropdownContainer>
          <PlayersDropdownLabel htmlFor="rank-grouping-select">Group By:</PlayersDropdownLabel>
          <PlayersDropdownSelect
            id="rank-grouping-select"
            value={rankType}
            onChange={(e) => setRankType(e.target.value as RankTypeOption)}
          >
            <option value="highest">Highest Rank</option>
            <option value="solo">Solo Q Rank</option>
            <option value="peak">Peak Rank</option>
            <option value="flex">Flex Q Rank</option>
          </PlayersDropdownSelect>
        </PlayersDropdownContainer>

        <PlayersFilterToggleBtn isOpen={isFilterPanelOpen} onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}>
          <FaFilter size={14} /> Filters {(selectedPrimaryRoles.length + selectedSecondaryRoles.length + selectedAchievements.length + (minRank !== 'All' ? 1 : 0)) > 0 && `(${selectedPrimaryRoles.length + selectedSecondaryRoles.length + selectedAchievements.length + (minRank !== 'All' ? 1 : 0)})`}
        </PlayersFilterToggleBtn>
      </PlayersControlsRow>

      <PlayersFilterPanel isOpen={isFilterPanelOpen}>
        <PlayersFilterGrid>
          <PlayersFilterGroup>
            <PlayersFilterLabel>Minimum Rank</PlayersFilterLabel>
            <PlayersDropdownSelect
              value={minRank}
              onChange={(e) => setMinRank(e.target.value)}
              style={{width: '100%', borderRadius: '8px', padding: '0.6rem 1rem'}}
            >
              <option value="All">All Ranks</option>
              {TIER_ORDER.filter(t => t !== 'Unranked').map(tier => (
                <option key={tier} value={tier}>{tier} +</option>
              ))}
            </PlayersDropdownSelect>
          </PlayersFilterGroup>

          <PlayersFilterGroup>
            <PlayersFilterLabel>Primary Role</PlayersFilterLabel>
            <PlayersFilterPillContainer>
              {['top', 'jungle', 'mid', 'adc', 'support', 'fill'].map(role => {
                const isSelected = selectedPrimaryRoles.includes(role);
                return (
                  <PlayersFilterPill
                    key={role}
                    selected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPrimaryRoles(selectedPrimaryRoles.filter(r => r !== role));
                      } else {
                        setSelectedPrimaryRoles([...selectedPrimaryRoles, role]);
                      }
                    }}
                  >
                    {role}
                  </PlayersFilterPill>
                );
              })}
            </PlayersFilterPillContainer>
          </PlayersFilterGroup>

          <PlayersFilterGroup>
            <PlayersFilterLabel>Secondary Role</PlayersFilterLabel>
            <PlayersFilterPillContainer>
              {['top', 'jungle', 'mid', 'adc', 'support', 'fill'].map(role => {
                const isSelected = selectedSecondaryRoles.includes(role);
                return (
                  <PlayersFilterPill
                    key={role}
                    selected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSecondaryRoles(selectedSecondaryRoles.filter(r => r !== role));
                      } else {
                        setSelectedSecondaryRoles([...selectedSecondaryRoles, role]);
                      }
                    }}
                  >
                    {role}
                  </PlayersFilterPill>
                );
              })}
            </PlayersFilterPillContainer>
          </PlayersFilterGroup>
          <PlayersFilterGroup>
            <PlayersFilterLabel>Previous Achievement</PlayersFilterLabel>
            <PlayersFilterPillContainer>
              {[
                {value: 'winner', label: 'Winner'},
                {value: 'runner_up', label: '2nd Place'}
              ].map(opt => {
                const isSelected = selectedAchievements.includes(opt.value as 'winner' | 'runner_up');
                return (
                  <PlayersFilterPill
                    key={opt.value}
                    selected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAchievements(selectedAchievements.filter(a => a !== opt.value));
                      } else {
                        setSelectedAchievements([...selectedAchievements, opt.value as 'winner' | 'runner_up']);
                      }
                    }}
                  >
                    {opt.label}
                  </PlayersFilterPill>
                );
              })}
            </PlayersFilterPillContainer>
          </PlayersFilterGroup>
        </PlayersFilterGrid>

        {(selectedPrimaryRoles.length > 0 || selectedSecondaryRoles.length > 0 || selectedAchievements.length > 0 || minRank !== 'All') && (
          <PlayersClearFiltersBtn onClick={handleClearFilters}>
            Clear All Filters
          </PlayersClearFiltersBtn>
        )}
      </PlayersFilterPanel>

      {filteredPlayers.length === 0 ? (
        <PlayersLoadingContainer>
          <p>No players matched your search.</p>
        </PlayersLoadingContainer>
      ) : (
        ROLE_ORDER.map(roleKey => {
          const tiersWithPlayers = playersByRoleAndTier[roleKey] || {};
          const totalPlayersInRole = Object.values(tiersWithPlayers).reduce((sum, list) => sum + list.length, 0);
          if (totalPlayersInRole === 0) return null;

          const roleDef = ROLE_DEFINITIONS[roleKey] || ROLE_DEFINITIONS['fill'];

          return (
            <PlayersRoleSection key={roleKey}>
              <PlayersRoleHeader>
                <PlayersRoleIconWrapper roleColor={roleDef.color}>
                  {roleDef.icon}
                </PlayersRoleIconWrapper>
                {roleDef.displayName} ({totalPlayersInRole})
              </PlayersRoleHeader>

              {TIER_ORDER.map(tier => {
                const playersInTier = tiersWithPlayers[tier] || [];
                if (playersInTier.length === 0) return null;

                return (
                  <PlayersTierSection key={tier}>
                    <PlayersTierHeader>
                      <PlayersTierBadge tier={tier}>{tier}</PlayersTierBadge>
                      <span style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: 500}}>
                        ({playersInTier.length})
                      </span>
                    </PlayersTierHeader>

                    <PlayersGrid>
                      {playersInTier.map(player => {
                        const isDraftable = !player.isCaptain;
                        const isInAutoDraft = priorityPlayerIds.includes(player.id);
                        const isCaptainLoggedIn = !!captainTeamId;

                        return (
                          <PlayersPlayerCard
                            key={player.id}
                            onClick={() => navigate(`/players/${player.id}?division=${division}`)}
                            style={isCaptainLoggedIn && isDraftable ? {
                              border: isInAutoDraft ? '2px solid #f59e0b' : undefined,
                              backgroundColor: isInAutoDraft ? 'rgba(245, 158, 11, 0.05)' : undefined
                            } : undefined}
                          >
                            {player.isCaptain && <PlayersCaptainBadge>Captain</PlayersCaptainBadge>}
                            {isCaptainLoggedIn && isDraftable && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAutoDraft(player.id);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '1rem',
                                  right: '1rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: isInAutoDraft ? '#f59e0b' : 'rgba(107, 114, 128, 0.1)',
                                  color: isInAutoDraft ? '#fff' : '#6b7280',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '50px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  transition: 'all 0.2s ease',
                                  zIndex: 10
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = isInAutoDraft ? '#d97706' : 'rgba(107, 114, 128, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = isInAutoDraft ? '#f59e0b' : 'rgba(107, 114, 128, 0.1)';
                                }}
                              >
                                {isInAutoDraft ? '★ Auto-Draft' : '+ Auto-Draft'}
                              </button>
                            )}
                            <PlayersPlayerName title={player.name}>{player.name}</PlayersPlayerName>

                            {(() => {
                              const achievements = getPlayerAchievements(player.name);
                              if (achievements.length === 0) return null;
                              return (
                                <PlayersAchievementBadgeList>
                                  {achievements.map((ach, idx) => (
                                    <PlayersAchievementBadge
                                      key={idx}
                                      type={ach.type}
                                      division={ach.division}
                                      title={ach.title}
                                    >
                                      🏆 {ach.title}
                                    </PlayersAchievementBadge>
                                  ))}
                                </PlayersAchievementBadgeList>
                              );
                            })()}

                            <PlayersRanksContainer>
                              <PlayersRankInfo>
                                <PlayersRankLabel>Solo Q</PlayersRankLabel>
                                <PlayersRankValue>{getFormatRank(player.soloRankTier, player.soloRankDivision)}</PlayersRankValue>
                              </PlayersRankInfo>
                              <PlayersRankInfo>
                                <PlayersRankLabel>Flex Q</PlayersRankLabel>
                                <PlayersRankValue>{getFormatRank(player.flexRankTier, player.flexRankDivision)}</PlayersRankValue>
                              </PlayersRankInfo>
                            </PlayersRanksContainer>

                            <PlayersRolesContainer>
                              <PlayersRoleBadge isPrimary={true}>{player.role}</PlayersRoleBadge>
                              {player.secondaryRoles && player.secondaryRoles.map(secRole => (
                                secRole.toLowerCase() !== player.role.toLowerCase() && (
                                  <PlayersRoleBadge key={secRole} isPrimary={false}>{secRole}</PlayersRoleBadge>
                                )
                              ))}
                            </PlayersRolesContainer>
                          </PlayersPlayerCard>
                        );
                      })}
                    </PlayersGrid>
                  </PlayersTierSection>
                );
              })}
            </PlayersRoleSection>
          );
        })
      )}
    </PlayersPageContainer>
  );
};

export default AllPlayersPage;