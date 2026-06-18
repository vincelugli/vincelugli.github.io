import React, {useState, useMemo} from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import { usePlayers } from '../../context/PlayerContext';
import { Player } from '../../types';
import {useDivision} from '../../context/DivisionContext';
import {
  FaShieldAlt,
  FaTree,
  FaFire,
  FaCrosshairs,
  FaHeart,
  FaRandom,
  FaFilter
} from 'react-icons/fa';
import { compareRanks, convertRankToElo } from '../../utils';

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: ${({theme}) => theme.text};
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, ${({theme}) => theme.primary}, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${({theme}) => theme.textAlt};
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 3rem auto;
  align-items: center;
  
  @media (max-width: 650px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const SearchBarContainer = styled.div`
  flex: 1;
  position: relative;
  min-width: 0;
`;

const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 650px) {
    justify-content: space-between;
  }
`;

const DropdownLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({theme}) => theme.textAlt};
  white-space: nowrap;
`;

const DropdownSelect = styled.select`
  box-sizing: border-box;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  border: 1px solid ${({theme}) => theme.border};
  background-color: ${({theme}) => theme.background};
  color: ${({theme}) => theme.text};
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: ${({theme}) => theme.boxShadow};
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${({theme}) => theme.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
  }
`;

const SearchInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  border: 1px solid ${({theme}) => theme.border};
  background-color: ${({theme}) => theme.background};
  color: ${({theme}) => theme.text};
  font-size: 1rem;
  box-shadow: ${({theme}) => theme.boxShadow};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({theme}) => theme.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
  }
`;

const RoleSection = styled.div`
  margin-bottom: 3.5rem;
`;

const RoleHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${({theme}) => theme.border};
  padding-bottom: 0.5rem;
`;

const RoleIconWrapper = styled.span<{roleColor: string}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.roleColor};
`;

const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const TierSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TierHeader = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({theme}) => theme.border};
    margin-left: 0.5rem;
  }
`;

const TierBadge = styled.span<{ tier: string }>`
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${({ tier }) => getTierColor(tier).bg};
  color: ${({ tier }) => getTierColor(tier).text};
`;

const PlayerCard = styled.div`
  background-color: ${({theme}) => theme.background};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({theme}) => theme.boxShadow};
  border: 1px solid ${({theme}) => theme.border};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
    border-color: ${({theme}) => theme.primary};
  }
`;

const CaptainBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #f59e0b;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PlayerName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
  margin: 0 0 1rem 0;
  padding-right: 4.5rem; /* Avoid overlap with captain badge */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RanksContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  background-color: ${({theme}) => theme.body};
  padding: 0.75rem;
  border-radius: 8px;
`;

const RankInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const RankLabel = styled.span`
  font-size: 0.7rem;
  color: ${({theme}) => theme.textAlt};
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const RankValue = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
`;

const RolesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
`;

const RoleBadge = styled.span<{isPrimary: boolean}>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  text-transform: capitalize;
  background-color: ${props => props.isPrimary ? 'rgba(0, 123, 255, 0.15)' : 'rgba(108, 117, 125, 0.15)'};
  color: ${props => props.isPrimary ? props.theme.primary : props.theme.textAlt};
  border: 1px solid ${props => props.isPrimary ? props.theme.primary : 'transparent'};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: 1.2rem;
  color: ${({theme}) => theme.textAlt};
`;

const NoPlayersMessage = styled.p`
  color: ${({theme}) => theme.textAlt};
  font-style: italic;
  font-size: 1rem;
`;

const FilterToggleBtn = styled.button<{ isOpen: boolean }>`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  border: 1px solid ${({theme, isOpen}) => isOpen ? theme.primary : theme.border};
  background-color: ${({theme, isOpen}) => isOpen ? 'rgba(0, 123, 255, 0.1)' : theme.background};
  color: ${({theme, isOpen}) => isOpen ? theme.primary : theme.text};
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({theme}) => theme.boxShadow};
  
  &:hover {
    border-color: ${({theme}) => theme.primary};
    background-color: rgba(0, 123, 255, 0.05);
  }
`;

const FilterPanel = styled.div<{ isOpen: boolean }>`
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
  background-color: ${({theme}) => theme.background};
  border: ${({isOpen, theme}) => isOpen ? `1px solid ${theme.border}` : 'none'};
  border-radius: 16px;
  box-shadow: ${({isOpen, theme}) => isOpen ? theme.boxShadow : 'none'};
  overflow: hidden;
  max-height: ${({isOpen}) => isOpen ? '500px' : '0'};
  opacity: ${({isOpen}) => isOpen ? '1' : '0'};
  margin-bottom: ${({isOpen}) => isOpen ? '3rem' : '0'};
  padding: ${({isOpen}) => isOpen ? '1.5rem' : '0 1.5rem'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FilterLabel = styled.h4`
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({theme}) => theme.textAlt};
  margin: 0;
`;

const FilterPillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterPill = styled.button<{ selected: boolean }>`
  box-sizing: border-box;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  border: 1px solid ${({theme, selected}) => selected ? theme.primary : theme.border};
  background-color: ${({theme, selected}) => selected ? 'rgba(0, 123, 255, 0.15)' : 'transparent'};
  color: ${({theme, selected}) => selected ? theme.primary : theme.textAlt};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: capitalize;

  &:hover {
    border-color: ${({theme}) => theme.primary};
    color: ${({theme}) => theme.text};
  }
`;

const ClearFiltersBtn = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  color: ${({theme}) => theme.primary};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: opacity 0.2s;
  
  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
`;

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

const getTierColor = (tier: string): { bg: string; text: string } => {
  const t = tier.toLowerCase();
  switch (t) {
    case 'challenger':
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
    case 'grandmaster':
    case 'grandmasters':
      return { bg: 'rgba(220, 38, 38, 0.15)', text: '#dc2626' };
    case 'master':
    case 'masters':
      return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' };
    case 'diamond':
      return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
    case 'emerald':
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
    case 'platinum':
      return { bg: 'rgba(45, 212, 191, 0.15)', text: '#2dd4bf' };
    case 'gold':
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
    case 'silver':
      return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' };
    case 'bronze':
      return { bg: 'rgba(180, 83, 9, 0.15)', text: '#b45309' };
    case 'iron':
      return { bg: 'rgba(75, 85, 99, 0.15)', text: '#4b5563' };
    default:
      return { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280' };
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

    // Primary role filter
    if (selectedPrimaryRoles.length > 0) {
      result = result.filter(player => 
        player.role && selectedPrimaryRoles.includes(player.role.toLowerCase())
      );
    }

    // Secondary role filter
    if (selectedSecondaryRoles.length > 0) {
      result = result.filter(player => 
        player.secondaryRoles && player.secondaryRoles.some(secRole => 
          selectedSecondaryRoles.includes(secRole.toLowerCase())
        )
      );
    }

    return result;
  }, [allPlayers, searchQuery, minRank, rankType, selectedPrimaryRoles, selectedSecondaryRoles]);

  // Group players by primary role and then rank tier
  const playersByRoleAndTier = useMemo(() => {
    const groups: { [role: string]: { [tier: string]: Player[] } } = {};

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
      <LoadingContainer>
        <p>Loading player roster...</p>
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <PageTitle>Player Roster</PageTitle>
        <PageSubtitle>Explore details and stats of all draft pool participants ({(division === 'gold' ? 'elemental' : 'elder').toUpperCase()} Division)</PageSubtitle>
      </HeaderSection>

      <ControlsRow>
        <SearchBarContainer>
          <SearchInput
            type="text"
            placeholder="Search players by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBarContainer>

        <DropdownContainer>
          <DropdownLabel htmlFor="rank-grouping-select">Group By:</DropdownLabel>
          <DropdownSelect
            id="rank-grouping-select"
            value={rankType}
            onChange={(e) => setRankType(e.target.value as RankTypeOption)}
          >
            <option value="highest">Highest Rank</option>
            <option value="solo">Solo Q Rank</option>
            <option value="peak">Peak Rank</option>
            <option value="flex">Flex Q Rank</option>
          </DropdownSelect>
        </DropdownContainer>

        <FilterToggleBtn isOpen={isFilterPanelOpen} onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}>
          <FaFilter size={14} /> Filters {(selectedPrimaryRoles.length + selectedSecondaryRoles.length + (minRank !== 'All' ? 1 : 0)) > 0 && `(${selectedPrimaryRoles.length + selectedSecondaryRoles.length + (minRank !== 'All' ? 1 : 0)})`}
        </FilterToggleBtn>
      </ControlsRow>

      <FilterPanel isOpen={isFilterPanelOpen}>
        <FilterGrid>
          <FilterGroup>
            <FilterLabel>Minimum Rank</FilterLabel>
            <DropdownSelect
              value={minRank}
              onChange={(e) => setMinRank(e.target.value)}
              style={{ width: '100%', borderRadius: '8px', padding: '0.6rem 1rem' }}
            >
              <option value="All">All Ranks</option>
              {TIER_ORDER.filter(t => t !== 'Unranked').map(tier => (
                <option key={tier} value={tier}>{tier} +</option>
              ))}
            </DropdownSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Primary Role</FilterLabel>
            <FilterPillContainer>
              {['top', 'jungle', 'mid', 'adc', 'support', 'fill'].map(role => {
                const isSelected = selectedPrimaryRoles.includes(role);
                return (
                  <FilterPill
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
                  </FilterPill>
                );
              })}
            </FilterPillContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Secondary Role</FilterLabel>
            <FilterPillContainer>
              {['top', 'jungle', 'mid', 'adc', 'support', 'fill'].map(role => {
                const isSelected = selectedSecondaryRoles.includes(role);
                return (
                  <FilterPill
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
                  </FilterPill>
                );
              })}
            </FilterPillContainer>
          </FilterGroup>
        </FilterGrid>

        {(selectedPrimaryRoles.length > 0 || selectedSecondaryRoles.length > 0 || minRank !== 'All') && (
          <ClearFiltersBtn onClick={handleClearFilters}>
            Clear All Filters
          </ClearFiltersBtn>
        )}
      </FilterPanel>

      {filteredPlayers.length === 0 ? (
        <LoadingContainer>
          <p>No players matched your search.</p>
        </LoadingContainer>
      ) : (
        ROLE_ORDER.map(roleKey => {
          const tiersWithPlayers = playersByRoleAndTier[roleKey] || {};
          const totalPlayersInRole = Object.values(tiersWithPlayers).reduce((sum, list) => sum + list.length, 0);
          if (totalPlayersInRole === 0) return null;

          const roleDef = ROLE_DEFINITIONS[roleKey] || ROLE_DEFINITIONS['fill'];

          return (
            <RoleSection key={roleKey}>
              <RoleHeader>
                <RoleIconWrapper roleColor={roleDef.color}>
                  {roleDef.icon}
                </RoleIconWrapper>
                {roleDef.displayName} ({totalPlayersInRole})
              </RoleHeader>

              {TIER_ORDER.map(tier => {
                const playersInTier = tiersWithPlayers[tier] || [];
                if (playersInTier.length === 0) return null;

                return (
                  <TierSection key={tier}>
                    <TierHeader>
                      <TierBadge tier={tier}>{tier}</TierBadge>
                      <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>
                        ({playersInTier.length})
                      </span>
                    </TierHeader>

                    <PlayersGrid>
                      {playersInTier.map(player => (
                        <PlayerCard
                          key={player.id}
                          onClick={() => navigate(`/players/${player.id}?division=${division}`)}
                        >
                          {player.isCaptain && <CaptainBadge>Captain</CaptainBadge>}
                          <PlayerName title={player.name}>{player.name}</PlayerName>

                          <RanksContainer>
                            <RankInfo>
                              <RankLabel>Solo Q</RankLabel>
                              <RankValue>{getFormatRank(player.soloRankTier, player.soloRankDivision)}</RankValue>
                            </RankInfo>
                            <RankInfo>
                              <RankLabel>Flex Q</RankLabel>
                              <RankValue>{getFormatRank(player.flexRankTier, player.flexRankDivision)}</RankValue>
                            </RankInfo>
                          </RanksContainer>

                          <RolesContainer>
                            <RoleBadge isPrimary={true}>{player.role}</RoleBadge>
                            {player.secondaryRoles && player.secondaryRoles.map(secRole => (
                              secRole.toLowerCase() !== player.role.toLowerCase() && (
                                <RoleBadge key={secRole} isPrimary={false}>{secRole}</RoleBadge>
                              )
                            ))}
                          </RolesContainer>
                        </PlayerCard>
                      ))}
                    </PlayersGrid>
                  </TierSection>
                );
              })}
            </RoleSection>
          );
        })
      )}
    </PageContainer>
  );
};

export default AllPlayersPage;