import React, {useState, useEffect, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SubPlayer } from '../../types';
import {
  FaShieldAlt,
  FaTree,
  FaFire,
  FaCrosshairs,
  FaHeart,
  FaRandom,
  FaFilter
} from 'react-icons/fa';
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
  PlayersFilterToggleBtn,
  PlayersFilterPanel,
  PlayersFilterGrid,
  PlayersFilterGroup,
  PlayersFilterLabel,
  PlayersFilterPillContainer,
  PlayersFilterPill,
  PlayersClearFiltersBtn,
  ContactInfo,
  SubsCopyButton
} from '../../styles';
import {convertRankToElo, getFirebasePrefix, getPlayerAchievements} from '../../utils';
import { useDivision } from '../../context/DivisionContext';

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

const getPlayerRankTier = (player: SubPlayer, type: RankTypeOption): string => {
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

const compareRanksByType = (a: SubPlayer, b: SubPlayer, type: RankTypeOption): number => {
  let eloA = 0;
  let eloB = 0;

  if (type === 'highest') {
    eloA = Math.max(
      convertRankToElo(a.peakRankTier, a.peakRankDivision),
      convertRankToElo(a.soloRankTier, a.soloRankDivision),
      convertRankToElo(a.flexRankTier, a.flexRankDivision)
    );
    eloB = Math.max(
      convertRankToElo(b.peakRankTier, b.peakRankDivision),
      convertRankToElo(b.soloRankTier, b.soloRankDivision),
      convertRankToElo(b.flexRankTier, b.flexRankDivision)
    );
  } else if (type === 'peak') {
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
    if (type === 'highest') {
      let sumA = convertRankToElo(a.peakRankTier, a.peakRankDivision);
      let sumB = convertRankToElo(b.peakRankTier, b.peakRankDivision);
      if (a.soloRankDivision !== -1 && b.soloRankDivision !== -1) {
        sumA += convertRankToElo(a.soloRankTier, a.soloRankDivision);
        sumB += convertRankToElo(b.soloRankTier, b.soloRankDivision);
      }
      if (a.flexRankDivision !== -1 && b.flexRankDivision !== -1) {
        sumA += convertRankToElo(a.flexRankTier, a.flexRankDivision);
        sumB += convertRankToElo(b.flexRankTier, b.flexRankDivision);
      }
      if (sumA !== sumB) {
        return sumB - sumA;
      }
    }
    return a.name.localeCompare(b.name);
  }
  return eloB - eloA;
};

const getPlayerEloByType = (player: SubPlayer, type: RankTypeOption): number => {
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

const SubstitutesPage: React.FC = () => {
  const [substitutes, setSubstitutes] = useState<SubPlayer[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedPlayerName, setCopiedPlayerName] = useState<string | null>(null);
  const { division } = useDivision();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rankType, setRankType] = useState<RankTypeOption>('highest');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [minRank, setMinRank] = useState<string>('All');
  const [selectedPrimaryRoles, setSelectedPrimaryRoles] = useState<string[]>([]);
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<string[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<('winner' | 'runner_up')[]>([]);

  useEffect(() => {
    const fetchSubs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const prefix = getFirebasePrefix();
        const docRef = doc(db, 'players', `${prefix}_${division}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const subsData = data.subs || [];
          setSubstitutes(subsData as SubPlayer[]);
        } else {
          setSubstitutes([]);
        }
      } catch (err) {
        console.error("Error fetching substitutes:", err);
        setError("Failed to fetch data. Please check the console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubs();
  }, [division]);

  const handleCopy = (contact: string, name: string) => {
    navigator.clipboard.writeText(contact);
    setCopiedPlayerName(name);
    setTimeout(() => setCopiedPlayerName(null), 2000);
  };

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

  const filteredSubs = useMemo(() => {
    let result = substitutes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(sub => sub.name.toLowerCase().includes(query));
    }

    if (minRank !== 'All') {
      const thresholdElo = convertRankToElo(minRank, 4);
      result = result.filter(sub => {
        const subElo = getPlayerEloByType(sub, rankType);
        return subElo >= thresholdElo;
      });
    }

    if (selectedPrimaryRoles.length > 0 || selectedSecondaryRoles.length > 0) {
      result = result.filter(sub => {
        const matchesPrimary = selectedPrimaryRoles.length > 0 && sub.role && selectedPrimaryRoles.includes(sub.role.toLowerCase());
        const matchesSecondary = selectedSecondaryRoles.length > 0 && sub.secondaryRoles && sub.secondaryRoles.some(secRole =>
          selectedSecondaryRoles.includes(secRole.toLowerCase())
        );
        return matchesPrimary || matchesSecondary;
      });
    }

    if (selectedAchievements.length > 0) {
      result = result.filter(sub => {
        const achievements = getPlayerAchievements(sub.name);
        return achievements.some(ach => selectedAchievements.includes(ach.type));
      });
    }

    return result;
  }, [substitutes, searchQuery, minRank, rankType, selectedPrimaryRoles, selectedSecondaryRoles, selectedAchievements]);

  const subsByRoleAndTier = useMemo(() => {
    const groups: {[role: string]: {[tier: string]: SubPlayer[]}} = {};

    ROLE_ORDER.forEach(role => {
      groups[role] = {};
    });

    filteredSubs.forEach(sub => {
      const role = sub.role ? sub.role.toLowerCase() : 'fill';
      const targetRole = role in groups ? role : 'fill';
      const tier = getPlayerRankTier(sub, rankType);

      if (!groups[targetRole][tier]) {
        groups[targetRole][tier] = [];
      }
      groups[targetRole][tier].push(sub);
    });

    Object.keys(groups).forEach(roleKey => {
      Object.keys(groups[roleKey]).forEach(tierKey => {
        groups[roleKey][tierKey].sort((a, b) => compareRanksByType(a, b, rankType));
      });
    });

    return groups;
  }, [filteredSubs, rankType]);

  if (isLoading) {
    return (
      <PlayersLoadingContainer>
        <p>Loading Substitute Pool...</p>
      </PlayersLoadingContainer>
    );
  }

  if (error) {
    return (
      <PlayersLoadingContainer style={{color: '#ef4444'}}>
        <p>{error}</p>
      </PlayersLoadingContainer>
    );
  }

  return (
    <PlayersPageContainer>
      <PlayersHeaderSection>
        <PlayersPageTitle>Substitute Player Pool</PlayersPageTitle>
        <PlayersPageSubtitle>Explore details and stats of all substitute pool participants ({(division === 'gold' ? 'elemental' : 'elder').toUpperCase()} Division)</PlayersPageSubtitle>
      </PlayersHeaderSection>

      <PlayersControlsRow>
        <PlayersSearchBarContainer>
          <PlayersSearchInput
            type="text"
            placeholder="Search substitutes by name..."
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

      {filteredSubs.length === 0 ? (
        <PlayersLoadingContainer>
          <p>No substitutes matched your search.</p>
        </PlayersLoadingContainer>
      ) : (
        ROLE_ORDER.map(roleKey => {
          const tiersWithSubs = subsByRoleAndTier[roleKey] || {};
          const totalSubsInRole = Object.values(tiersWithSubs).reduce((sum, list) => sum + list.length, 0);
          if (totalSubsInRole === 0) return null;

          const roleDef = ROLE_DEFINITIONS[roleKey] || ROLE_DEFINITIONS['fill'];

          return (
            <PlayersRoleSection key={roleKey}>
              <PlayersRoleHeader>
                <PlayersRoleIconWrapper roleColor={roleDef.color}>
                  {roleDef.icon}
                </PlayersRoleIconWrapper>
                {roleDef.displayName} ({totalSubsInRole})
              </PlayersRoleHeader>

              {TIER_ORDER.map(tier => {
                const subsInTier = tiersWithSubs[tier] || [];
                if (subsInTier.length === 0) return null;

                return (
                  <PlayersTierSection key={tier}>
                    <PlayersTierHeader>
                      <PlayersTierBadge tier={tier}>{tier}</PlayersTierBadge>
                      <span style={{fontSize: '0.9rem', color: '#6b7280', fontWeight: 500}}>
                        ({subsInTier.length})
                      </span>
                    </PlayersTierHeader>

                    <PlayersGrid>
                      {subsInTier.map((sub, index) => (
                        <PlayersPlayerCard
                          key={index}
                          onClick={() => navigate(`/players/${sub.id}?division=${division}&isSub=true`)}
                        >
                          <PlayersPlayerName title={sub.name}>{sub.name}</PlayersPlayerName>

                          {(() => {
                            const achievements = getPlayerAchievements(sub.name);
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
                              <PlayersRankLabel>Peak</PlayersRankLabel>
                              <PlayersRankValue>{getFormatRank(sub.peakRankTier, sub.peakRankDivision)}</PlayersRankValue>
                            </PlayersRankInfo>
                            <PlayersRankInfo>
                              <PlayersRankLabel>Solo Q</PlayersRankLabel>
                              <PlayersRankValue>{getFormatRank(sub.soloRankTier, sub.soloRankDivision)}</PlayersRankValue>
                            </PlayersRankInfo>
                            <PlayersRankInfo>
                              <PlayersRankLabel>Flex Q</PlayersRankLabel>
                              <PlayersRankValue>{getFormatRank(sub.flexRankTier, sub.flexRankDivision)}</PlayersRankValue>
                            </PlayersRankInfo>
                          </PlayersRanksContainer>

                          <div style={{marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <div style={{fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <span style={{color: '#6b7280', fontWeight: 600}}>Timezone:</span>
                              <span style={{fontWeight: 700}}>{sub.timezone}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'}}>
                              <span style={{fontSize: '0.85rem', color: '#6b7280', fontWeight: 600}}>Discord:</span>
                              <ContactInfo>
                                <span style={{fontSize: '0.85rem', fontWeight: 700, wordBreak: 'break-all'}}>{sub.contact}</span>
                                <SubsCopyButton onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(sub.contact, sub.name);
                                }}>
                                  {copiedPlayerName === sub.name ? 'Copied!' : 'Copy'}
                                </SubsCopyButton>
                              </ContactInfo>
                            </div>
                          </div>

                          <PlayersRolesContainer>
                            <PlayersRoleBadge isPrimary={true}>{sub.role}</PlayersRoleBadge>
                            {sub.secondaryRoles && sub.secondaryRoles.map(secRole => (
                              secRole.toLowerCase() !== sub.role.toLowerCase() && (
                                <PlayersRoleBadge key={secRole} isPrimary={false}>{secRole}</PlayersRoleBadge>
                              )
                            ))}
                          </PlayersRolesContainer>
                        </PlayersPlayerCard>
                      ))}
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

export default SubstitutesPage;
