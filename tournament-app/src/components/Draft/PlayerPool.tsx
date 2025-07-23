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

interface PlayerPoolProps {
  players: Player[];
  onDraft: (player: Player) => void;
  disabled: boolean;
}

const PlayerPool: React.FC<PlayerPoolProps> = ({ players, onDraft, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.elo - a.elo);
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
                <td>{player.name}</td>
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
