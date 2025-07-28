import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Player } from '../../types';
import { mockPlayers } from '../../data/mockData'; // Assuming this is our full player pool
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { debounce } from 'lodash';

// --- Styled Components ---
const PageContainer = styled.div` /* ... */ `;
const Title = styled.h1` /* ... */ `;
const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
`;

const Column = styled.div<{ isDraggingOver: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${props => props.isDraggingOver ? '#e9ecef' : '#f8f9fa'};
  padding: 1rem;
  border-radius: 8px;
  min-height: 500px;
  transition: background-color 0.2s ease;
`;

const ColumnTitle = styled.h3` /* ... */ `;

const PlayerCard = styled.div<{ isDragging: boolean }>`
  user-select: none;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: ${props => props.isDragging ? '#d4edda' : '#fff'};
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerName = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
`;

const PlayerRole = styled.span`
  font-size: 0.85rem;
  color: #6c757d; /* A muted gray color */
  font-style: italic;
  margin-top: 2px;
`;

const SecondaryRoles = styled.span` /* Add this style */
  font-style: italic;
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 2px;
`;

// --- Component ---
const PriorityListPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [authTeamId, setAuthTeamId] = useState<string | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [priorityPlayers, setPriorityPlayers] = useState<Player[]>([]);

  // Auth checking effect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (!currentUser) {
        navigate('/draft-access');
        return;
      }
      currentUser.getIdTokenResult().then(idTokenResult => {
        const teamId = idTokenResult.claims.teamId as string;
        if (teamId) {
          setAuthTeamId(teamId);
        } else {
          navigate('/draft-access'); // Not a captain
        }
      });
    });
    return () => unsubscribe();
  }, [auth, navigate]);
  
  // Debounced save function to prevent spamming Firestore
  const savePriorityList = useCallback(
    debounce(async (teamId: string, playerIds: number[]) => {
      if (!teamId) return;
      const docRef = doc(db, 'draftBoards', teamId);
      await setDoc(docRef, { playerIds });
    }, 1000), // Wait 1 second after the last change before saving
    []
  );

  // Data fetching and state management effect
  useEffect(() => {
    if (!authTeamId) return;

    const docRef = doc(db, 'draftBoards', authTeamId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const allDraftablePlayers = mockPlayers.filter(p => !p.isCaptain);
      const priorityIds = snapshot.exists() ? snapshot.data().playerIds as number[] : [];

      const priority = priorityIds.map(id => allDraftablePlayers.find(p => p.id === id)!).filter(Boolean);
      const available = allDraftablePlayers.filter(p => !priorityIds.includes(p.id));

      setPriorityPlayers(priority);
      setAvailablePlayers(available);
    });

    return () => unsubscribe();
  }, [authTeamId]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // Dropped outside a list

    // Create copies of the current state arrays
    const sourceList = source.droppableId === 'available' ? [...availablePlayers] : [...priorityPlayers];
    const destList = destination.droppableId === 'available' ? [...availablePlayers] : [...priorityPlayers];
    
    // Remove the item from its source list
    const [movedItem] = sourceList.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
        // Reordering within the same list
        sourceList.splice(destination.index, 0, movedItem);
        if(source.droppableId === 'priority'){
            setPriorityPlayers(sourceList);
            savePriorityList(authTeamId!, sourceList.map(p => p.id));
        } else {
            setAvailablePlayers(sourceList);
        }
    } else {
        // Moving from one list to another
        destList.splice(destination.index, 0, movedItem);
        setAvailablePlayers(source.droppableId === 'available' ? sourceList : destList);
        setPriorityPlayers(source.droppableId === 'priority' ? sourceList : destList);
        savePriorityList(authTeamId!, (source.droppableId === 'priority' ? sourceList : destList).map(p => p.id));
    }
  };

  if (!authTeamId) return <div>Authenticating...</div>;

  return (
    <PageContainer>
      <Title>My Draft Board</Title>
      <DragDropContext onDragEnd={onDragEnd}>
        <BoardContainer>
          <Droppable droppableId="available">
            {(provided, snapshot) => (
              <Column ref={provided.innerRef} {...provided.droppableProps} isDraggingOver={snapshot.isDraggingOver}>
                <ColumnTitle>Available Players</ColumnTitle>
                {availablePlayers.map((player, index) => (
                  <Draggable key={player.id} draggableId={String(player.id)} index={index}>
                    {(provided, snapshot) => (
                      <PlayerCard ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} isDragging={snapshot.isDragging}>
                        <PlayerInfo>
                          <PlayerName>{player.name}</PlayerName>
                          <span>{player.elo}</span>
                          <PlayerRole>{player.role}</PlayerRole>
                          {player.secondaryRoles.length > 0 && (
                            <SecondaryRoles>{player.secondaryRoles.join(', ')}</SecondaryRoles>
                          )}
                        </PlayerInfo>
                      </PlayerCard>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Column>
            )}
          </Droppable>

          <Droppable droppableId="priority">
            {(provided, snapshot) => (
              <Column ref={provided.innerRef} {...provided.droppableProps} isDraggingOver={snapshot.isDraggingOver}>
                <ColumnTitle>My Priority List</ColumnTitle>
                {priorityPlayers.map((player, index) => (
                  <Draggable key={player.id} draggableId={String(player.id)} index={index}>
                    {(provided, snapshot) => (
                      <PlayerCard ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} isDragging={snapshot.isDragging}>
                        <PlayerInfo>
                          <PlayerName>{index + 1}.{player.name}</PlayerName>
                          <span>{player.elo}</span>
                          <PlayerRole>{player.role}</PlayerRole>
                        </PlayerInfo>
                      </PlayerCard>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Column>
            )}
          </Droppable>
        </BoardContainer>
      </DragDropContext>
    </PageContainer>
  );
};

export default PriorityListPage;
