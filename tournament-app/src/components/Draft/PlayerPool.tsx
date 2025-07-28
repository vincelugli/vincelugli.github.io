import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Player } from '../../types';

const PoolContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  position: sticky;
  top: 2rem;
`;

const PoolHeader = styled.h3`
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  box-sizing: border-box;
`;

const PlayerTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 0.5rem;
    text-align: left;
  }
`;

const DraftButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #218838;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const PlayerName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
`;

const RolesContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  font-size: 0.85rem;
`;

const PrimaryRole = styled.span`
  font-weight: 500;
  color: #0056b3; /* A distinct color for primary role */
`;

const SecondaryRoles = styled.span`
  font-style: italic;
  color: #6c757d; /* Muted color for secondary roles */
  margin-top: 2px;
`;

interface PlayerPoolProps {
  players: Player[];
  onDraft: (player: Player) => void;
  disabled: boolean;
}

const PlayerPool: React.FC<PlayerPoolProps> = ({ players, onDraft, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = useMemo(() => {
    // An empty search term should show all players
    if (!searchTerm.trim()) {
      return players.sort((a, b) => b.elo - a.elo);
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

    // Sort the final filtered list by Elo
    return filtered.sort((a, b) => b.elo - a.elo);
  }, [players, searchTerm]);


  return (
    <PoolContainer>
      <PoolHeader>Available Players</PoolHeader>
      <SearchInput 
        type="text" 
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <PlayerTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Elo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(player => (
              <tr key={player.id}>
              <td>
                  <PlayerInfo>
                      <PlayerName>{player.name}</PlayerName>
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
              <td>{player.elo}</td>
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
