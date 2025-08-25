import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { usePlayers } from '../../context/PlayerContext';
import { Player } from '../../types';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { ControlsContainer, FilterGroup, SubsLabel, SubsPageContainer, SubsPlayerTable, SubsSelect, SubsTableBody, SubsTableHead, SubsTitle } from '../../styles';
import { convertRankToElo, createOpGgUrl } from '../../utils';

const PlayerNameLink = styled.a`
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

type SortDirection = 'ascending' | 'descending';
type SortKey = keyof Player;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ALL_ROLES = ['All', 'top', 'mid', 'jungle', 'adc', 'support'];

const AllPlayersPage: React.FC = () => {
  // 1. Get all player data and loading state from the global context
  const { players: allPlayers, loading: playersLoading } = usePlayers();

  // 2. Local state for filtering and sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'soloRankTier', direction: 'descending' });
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const filteredPlayers = useMemo(() => {
    if (roleFilter === 'All') {
      return allPlayers;
    }
    return allPlayers.filter(player => 
      player.role.toLowerCase() === roleFilter.toLowerCase() ||
      player.secondaryRoles.some(secRole => secRole.toLowerCase() === roleFilter.toLowerCase())
    );
  }, [allPlayers, roleFilter]);

  const sortedAndFilteredPlayers = useMemo(() => {
    const sortableItems = [...filteredPlayers];
    sortableItems.sort((a, b) => {
      // Custom sorting for 'soloRankTier' to treat it as a number
      if (sortConfig.key === 'soloRankTier') {
        return sortConfig.direction === 'ascending' ?
            convertRankToElo(a.soloRankTier, a.soloRankDivision) - convertRankToElo(b.soloRankTier, b.soloRankDivision) :
            convertRankToElo(b.soloRankTier, b.soloRankDivision) - convertRankToElo(a.soloRankTier, a.soloRankDivision);
      }
      if (sortConfig.key === 'peakRankTier') {
        return sortConfig.direction === 'ascending' ?
            convertRankToElo(a.peakRankTier, a.peakRankDivision) - convertRankToElo(b.peakRankTier, b.peakRankDivision) :
            convertRankToElo(b.peakRankTier, b.peakRankDivision) - convertRankToElo(a.peakRankTier, a.peakRankDivision);
      }
      if (sortConfig.key === 'flexRankTier') {
        return sortConfig.direction === 'ascending' ?
            convertRankToElo(a.flexRankTier, a.flexRankDivision) - convertRankToElo(b.flexRankTier, b.flexRankDivision) :
            convertRankToElo(b.flexRankTier, b.flexRankDivision) - convertRankToElo(a.flexRankTier, a.flexRankDivision);
      }
      
      const aValue = a[sortConfig.key]!;
      const bValue = b[sortConfig.key]!;

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [filteredPlayers, sortConfig]);

  const requestSort = useCallback((key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    // Default to descending for rank when first clicked
    if ((key === 'peakRankTier' && sortConfig.key !== 'peakRankTier') || (key === 'soloRankTier' && sortConfig.key !== 'soloRankTier') || (key === 'flexRankTier' && sortConfig.key !== 'flexRankTier')) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);


  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <FaSort color="#ccc" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp color="#007bff" /> : <FaSortDown color="#007bff" />;
  };

  if (playersLoading) {
    return <SubsPageContainer><p>Loading player list...</p></SubsPageContainer>;
  }

  return (
    <SubsPageContainer>
      <SubsTitle>All Players</SubsTitle>
      
      <ControlsContainer>
        <FilterGroup>
          <SubsLabel htmlFor="role-filter">Filter by Role</SubsLabel>
          <SubsSelect id="role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            {ALL_ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
          </SubsSelect>
        </FilterGroup>
      </ControlsContainer>

      <SubsPlayerTable>
        <SubsTableHead>
          <tr>
            <th onClick={() => requestSort('name')}>Name {getSortIcon('name')}</th>
            <th onClick={() => requestSort('peakRankTier')}>Peak Rank {getSortIcon('peakRankTier')}</th>
            <th onClick={() => requestSort('soloRankTier')}>Solo Rank {getSortIcon('soloRankTier')}</th>
            <th onClick={() => requestSort('flexRankTier')}>Flex Rank {getSortIcon('flexRankTier')}</th>
            <th onClick={() => requestSort('role')}>Primary Role {getSortIcon('role')}</th>
            <th>Secondary Roles</th>
            <th onClick={() => requestSort('timezone')}>Timezone {getSortIcon('role')}</th>
            {/* Disabled is captain for now. */}
            {/* <th onClick={() => requestSort('isCaptain')}>Status {getSortIcon('isCaptain')}</th> */}
          </tr>
        </SubsTableHead>
        <SubsTableBody>
          {sortedAndFilteredPlayers.map((player) => (
            <tr key={player.id}>
              <td>
                <PlayerNameLink href={createOpGgUrl(player.name)} target="_blank" rel="noopener noreferrer">
                  {player.name}
                </PlayerNameLink>
              </td>
              <td>{player.peakRankTier} {player.peakRankDivision === -1 ? "" : player.peakRankDivision}</td>
              <td>{player.soloRankTier === "N/A" ? "" : player.soloRankTier} {player.soloRankDivision === -1 ? "" : player.soloRankDivision}</td>
              <td>{player.flexRankTier === "N/A" ? "" : player.flexRankTier} {player.flexRankDivision === -1 ? "" : player.flexRankDivision}</td>
              <td>{player.role}</td>
              <td>{player.secondaryRoles.join(', ')}</td>
              <td>{player.timezone}</td>
              {/* Disabled is captain for now. */}
              {/* <td>{player.isCaptain ? 'Captain' : 'Player'}</td> */}
            </tr>
          ))}
        </SubsTableBody>
      </SubsPlayerTable>
    </SubsPageContainer>
  );
};

export default AllPlayersPage;