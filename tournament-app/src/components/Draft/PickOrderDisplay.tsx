import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Team, Player } from '../../types';

// --- Styled Components ---
const PickOrderContainer = styled.div`
  background: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow-x: auto; /* Crucial for horizontal scrolling */
  white-space: nowrap; /* Prevents items from wrapping to the next line */
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 4px;
  }
`;

const PickList = styled.div`
  display: inline-flex; /* Use inline-flex for horizontal layout inside the scroll container */
  gap: 1rem;
`;

const PickItem = styled.div<{ isCurrent: boolean; isCompleted: boolean; isSkipped: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 90px;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  text-align: center;
  transition: all 0.3s ease-in-out;
  
  /* Conditional styling */
  opacity: ${props => props.isCompleted ? 0.7 : 1};
  background-color: ${props => props.isSkipped ? '#e9ecef' : '#f8f9fa'};
  border-color: ${props => props.isCurrent ? '#007bff' : '#dee2e6'};
  transform: ${props => props.isCurrent ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${props => props.isCurrent ? '0 0 15px rgba(0, 123, 255, 0.5)' : 'none'};
`;

const PickNumber = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: #6c757d;
`;

const TeamName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #343a40;
  margin: 4px 0;
`;

const PlayerName = styled.div`
  font-size: 0.9rem;
  color: #28a745;
  font-weight: 500;
`;

const SkippedText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #dc3545;
  text-decoration: line-through;
`;

// --- Component Definition ---

interface PickOrderDisplayProps {
  pickOrder: (number | null)[];
  teams: Team[];
  players: Player[];
  currentPickIndex: number;
  completedPicks: { [pickIndex: number]: number };
}

const PickOrderDisplay: React.FC<PickOrderDisplayProps> = ({ pickOrder, teams, players, currentPickIndex, completedPicks }) => {
  const currentPickRef = useRef<HTMLDivElement>(null);

  // Effect to scroll the current pick into view
  useEffect(() => {
    if (currentPickRef.current) {
      currentPickRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentPickIndex]);

  const getTeamById = (id: number) => teams.find(t => t.id === id);
  const getPlayerById = (id: number) => players.find(p => p.id === id);

  return (
    <PickOrderContainer>
      <PickList>
        {pickOrder.map((teamId, index) => {
          const isCurrent = index === currentPickIndex;
          const isCompleted = index < currentPickIndex;
          const isSkipped = teamId === null;
          
          const team = isSkipped ? null : getTeamById(teamId!);
          const draftedPlayerId = completedPicks[index];
          const draftedPlayer = draftedPlayerId ? getPlayerById(draftedPlayerId) : null;

          return (
            <PickItem
              key={index}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              isSkipped={isSkipped}
              ref={isCurrent ? currentPickRef : null}
            >
              <PickNumber>PICK {index + 1}</PickNumber>
              {isSkipped ? (
                <SkippedText>SKIPPED</SkippedText>
              ) : (
                <>
                  <TeamName>{team?.name || 'N/A'}</TeamName>
                  {draftedPlayer && (
                    <PlayerName>{draftedPlayer.name}</PlayerName>
                  )}
                </>
              )}
            </PickItem>
          );
        })}
      </PickList>
    </PickOrderContainer>
  );
};

export default PickOrderDisplay;
