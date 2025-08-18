import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { usePlayers } from '../../context/PlayerContext';
import { Player } from '../../types';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { ControlsContainer, FilterGroup, SubsLabel, SubsPageContainer, SubsPlayerTable, SubsSelect, SubsTableBody, SubsTableHead, SubsTitle } from '../../styles';

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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'elo', direction: 'descending' });
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
      // Custom sorting for 'elo' to treat it as a number
      if (sortConfig.key === 'elo') {
        return sortConfig.direction === 'ascending' ? a.elo - b.elo : b.elo - a.elo;
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
    // Default to descending for Elo when first clicked
    if (key === 'elo' && sortConfig.key !== 'elo') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);


  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <FaSort color="#ccc" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp color="#007bff" /> : <FaSortDown color="#007bff" />;
  };
  const createOpGgUrl = (playerName: string) => `https://op.gg/summoner/${encodeURIComponent(playerName)}`;

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
            <th onClick={() => requestSort('elo')}>Elo {getSortIcon('elo')}</th>
            <th onClick={() => requestSort('role')}>Primary Role {getSortIcon('role')}</th>
            <th>Secondary Roles</th>
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
              <td>{player.elo}</td>
              <td>{player.role}</td>
              <td>{player.secondaryRoles.join(', ')}</td>
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