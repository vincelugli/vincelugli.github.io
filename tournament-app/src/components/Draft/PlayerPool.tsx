import React, { useState, useMemo } from 'react';
import { Player } from '../../types';
import { PoolContainer, PoolHeader, SearchInput, PlayerTable, DraftButton, PlayerInfo, PlayerName, RolesContainer, PrimaryRole, SecondaryRoles } from '../../styles';
import { compareRanks, convertRankToElo, createOpGgUrl, rankTierToShortName } from '../../utils';

interface PlayerPoolProps {
  players: Player[];
  onDraft: (player: Player) => void;
  disabled: boolean;
}

const PlayerPool: React.FC<PlayerPoolProps> = ({ players, onDraft, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');

  players = players ?? [];

  const filteredPlayers = useMemo(() => {
    // An empty search term should show all players
    if (!searchTerm.trim()) {
      return players.sort((a, b) => compareRanks(b, a));
    }

    // Prepare a case-insensitive search term once for efficiency
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    if (lowercasedSearchTerm.startsWith("p:")) {
      const roleSearchTerm = lowercasedSearchTerm.substring(2);
      console.log(roleSearchTerm);
      return players.filter(player => player.role.toLowerCase().includes(roleSearchTerm));
    }

    const filtered = players.filter(player => {
      // Check against player name
      const nameMatch = player.name.toLowerCase().includes(lowercasedSearchTerm);
      
      // Check against primary role
      const primaryRoleMatch = player.role.toLowerCase().includes(lowercasedSearchTerm);
      
      // Check against all secondary roles
      const secondaryRoleMatch = player.secondaryRoles.some(role =>
        role.toLowerCase().includes(lowercasedSearchTerm)
      );

      // Return true if any field matches
      return nameMatch || primaryRoleMatch || secondaryRoleMatch;
    });

    // Sort the final filtered list by Rank
    return filtered.sort((a, b) => compareRanks(b, a));
  }, [players, searchTerm]);

  return (
    <PoolContainer>
      <PoolHeader>Available Players</PoolHeader>
      <SearchInput 
        type="text" 
        placeholder="Search players... (P:<role>)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <PlayerTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Peak</th>
              <th>Solo</th>
              <th>Flex</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(player => (
              <tr key={player.id}>
              <td>
                  <PlayerInfo>
                      <PlayerName
                          href={createOpGgUrl(player.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                      >
                          {player.name}
                      </PlayerName>
                      <RolesContainer>
                          <PrimaryRole>P: {player.role}</PrimaryRole>
                          {/* Only display secondary roles if they exist */}
                          {player.secondaryRoles && player.secondaryRoles.length > 0 && (
                              <SecondaryRoles>
                                  S: {player.secondaryRoles.join(', ')}
                              </SecondaryRoles>
                          )}
                      </RolesContainer>
                  </PlayerInfo>
              </td>
              <td>{rankTierToShortName(player.peakRankTier)}{player.peakRankDivision}</td>
              <td>{rankTierToShortName(player.soloRankTier)}{player.soloRankDivision === -1 ? "" : player.soloRankDivision}</td>
              <td>{rankTierToShortName(player.flexRankTier)}{player.flexRankDivision === -1 ? "" : player.flexRankDivision}</td>
              <td>
                  <DraftButton onClick={() => onDraft(player)} disabled={disabled}>
                      Draft
                  </DraftButton>
              </td>
          </tr>
            ))}
          </tbody>
        </PlayerTable>
      </div>
    </PoolContainer>
  );
};

export default PlayerPool;
