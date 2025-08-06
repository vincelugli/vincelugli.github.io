import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Player } from '../../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { debounce } from 'lodash';
import { PageContainer, Title, BoardContainer, Column, ColumnTitle, PlayerCard, PlayerInfo, PlayerName, PlayerRole, SecondaryRoles } from '../../styles';
import { usePlayers } from '../../context/PlayerContext';

const PriorityListPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [authTeamId, setAuthTeamId] = useState<string | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [priorityPlayers, setPriorityPlayers] = useState<Player[]>([]);

  const { players: allPlayers } = usePlayers();

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
  const savePriorityList = useMemo(() =>
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
      const allDraftablePlayers = allPlayers.filter(p => !p.isCaptain);
      const priorityIds = snapshot.exists() ? snapshot.data().playerIds as number[] : [];

      const priority = priorityIds.map(id => allDraftablePlayers.find(p => p.id === id)!).filter(Boolean);
      const available = allDraftablePlayers.filter(p => !priorityIds.includes(p.id));

      setPriorityPlayers(priority);
      setAvailablePlayers(available);
    });

    return () => unsubscribe();
  }, [allPlayers, authTeamId]);

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

  const createOpGgUrl = (playerName: string) => `https://op.gg/summoners/na/${encodeURIComponent(playerName)}`;

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
                          <PlayerName 
                            href={createOpGgUrl(player.name)} 
                            target="_blank"
                            rel="noopener noreferrer" >
                              {player.name}
                          </PlayerName>
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
                <ColumnTitle>My Auto Draft Board</ColumnTitle>
                {priorityPlayers.map((player, index) => (
                  <Draggable key={player.id} draggableId={String(player.id)} index={index}>
                    {(provided, snapshot) => (
                      <PlayerCard ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} isDragging={snapshot.isDragging}>
                        <PlayerInfo>
                          <PlayerName 
                            href={createOpGgUrl(player.name)} 
                            target="_blank"
                            rel="noopener noreferrer" >
                              {index + 1}.{player.name}
                          </PlayerName>
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
        </BoardContainer>
      </DragDropContext>
    </PageContainer>
  );
};

export default PriorityListPage;
