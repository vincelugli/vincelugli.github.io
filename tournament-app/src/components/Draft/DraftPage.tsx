import React, { useEffect, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { Player, Team } from '../../types';
import { mockPlayers } from '../../data/mockData';
import PickOrderDisplay from './PickOrderDisplay';
import PlayerPool from './PlayerPool'; // We will create this next
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// --- Main Layout Components ---
const DraftPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DraftHeader = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
`;

const DraftStatus = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  color: #007bff;
  margin: 0.5rem 0 0 0;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  align-items: start;
`;

const TeamsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
`;

// --- Team Card Component ---
const TeamCardContainer = styled.div<{ isPicking: boolean }>`
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  border: 2px solid ${props => props.isPicking ? '#007bff' : '#transparent'};
  transition: border-color 0.3s ease;
`;

const TeamHeader = styled.h3`
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
`;

const PlayerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PlayerListItem = styled.li<{ isCaptain?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-weight: ${props => props.isCaptain ? '700' : '400'};
  color: ${props => props.isCaptain ? '#d9534f' : '#333'};
`;

interface DraftState {
  teams: Team[];
  pickOrder: (number | null)[];
  availablePlayers: Player[];
  completedPicks: { [pickIndex: number]: number }; // Maps pick index to drafted player ID
  currentPickIndex: number; // Index of the current pick in the pickOrder
}

// --- Logic and Component Definition ---

const calculatePickIndex = (pickNumber: number, numCaptains: number, captainIndex: number): number => {
  if (pickNumber % 2 === 1) {
    return (pickNumber - 1) * numCaptains + captainIndex;
  } else {
    return (pickNumber - 1) * numCaptains + (numCaptains - 1 - captainIndex);
  }
}

const initializeDraft = (): DraftState => {
  const captains = mockPlayers.filter(p => p.isCaptain).sort((a, b) => b.elo - a.elo);
  const availablePlayers = mockPlayers.filter(p => !p.isCaptain);
  const allPlayersSorted = [...mockPlayers].sort((a, b) => b.elo - a.elo);

  const teams: Team[] = captains.map((captain, index) => ({
    id: index + 1,
    name: `Team ${captain.name}`,
    captainId: captain.id,
    players: [captain],
    wins: 0,
    losses: 0
  }));

  const numRounds = 5; // To get to 5 players total
  const numTeams = teams.length;
  const pickOrder: (number|null)[] = [];
  for (let i = 0; i < numRounds; i++) {
    const roundOrder = Array.from({ length: numTeams }, (_, j) => teams[j].id);
    if ((i + 1) % 2 === 0) { // Snake draft reverse order for even rounds
      roundOrder.reverse();
    }
    pickOrder.push(...roundOrder);
  }

  let playerSkipSlot: { [playerId: number]: number } = {};
  let nextTeamId = 1;
  
  allPlayersSorted.forEach((player, index) => {
    const overallRank = index; // The pick number to be forfeited
    if (player.isCaptain && pickOrder[overallRank] !== undefined) {
        playerSkipSlot[player.id] = index / mockPlayers.length;
        player.teamId = nextTeamId++;
    }
  });
  
  captains.forEach((captain) => {
    if (playerSkipSlot[captain.id] !== undefined) {
        const captainPercent = playerSkipSlot[captain.id];
        if (captainPercent <= 0.2) {
            // skip the first round pick
            pickOrder[calculatePickIndex(1, numTeams, captain.teamId!) - 1] = null;
        }
        else if (captainPercent <= 0.4) {
            // skip the second round pick
            pickOrder[calculatePickIndex(2, numTeams, captain.teamId!) - 1] = null;
        }
        else if (captainPercent <= 0.6) {
            // skip the third round pick
            pickOrder[calculatePickIndex(3, numTeams, captain.teamId!) - 1] = null;
        }
        else if (captainPercent <= 0.8) {
            // skip the fourth round pick
            pickOrder[calculatePickIndex(4, numTeams, captain.teamId!) - 1] = null;
        }
        else if (captainPercent <= 1) {
            // skip the fifth round pick
            pickOrder[calculatePickIndex(5, numTeams, captain.teamId!) - 1] = null;
        }
    }
  });

  let currentPickIndex = 0;
  // Update skipped picks
  while (pickOrder[currentPickIndex] === null && currentPickIndex < pickOrder.length) {
    currentPickIndex++;
  }

  return { teams, pickOrder, availablePlayers, completedPicks: {}, currentPickIndex };
};

const DraftPage: React.FC = () => {
//   const [draftState, setDraftState] = useState<DraftState>(initializeDraft);

  //////// Firebase Setup //////////
  const [isLoading, setIsLoading] = useState(true);
  const [draftState, setDraftState] = useState<DraftState>(initializeDraft);

  const { teams, pickOrder, availablePlayers, currentPickIndex } = draftState;

  const [nextPickIndex, setNextPickIndex] = useState(currentPickIndex);

  const isDraftComplete = nextPickIndex >= pickOrder.length;
  const currentTeamIdPicking = !isDraftComplete ? pickOrder[currentPickIndex] : null;

  const draftDocRef = doc(db, 'drafts', 'liveDraft');
  useEffect(() => {
    // onSnapshot listens for any changes to the document
    const unsubscribe = onSnapshot(draftDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DraftState;
        setDraftState(data);
      } else {
        // If the draft doesn't exist in the DB, initialize it
        console.log("No draft found, initializing...");
        const initialState = initializeDraft(); // Your existing function
        setDoc(draftDocRef, initialState); // Create it in Firestore
        setDraftState(initialState);
      }
      setIsLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [draftDocRef]);

  const handleDraftPlayer = useCallback(async (player: Player) => {
    if (!draftState) return;
    
    const { currentPickIndex, teams, completedPicks, availablePlayers, pickOrder } = draftState;
    const currentTeamIdPicking = pickOrder[currentPickIndex];

    if (currentTeamIdPicking === null) return;

    // --- Create the next state object ---
    const newTeams = teams.map(team => 
        team.id === currentTeamIdPicking ? { ...team, players: [...team.players!, player] } : team
    );
    const newAvailablePlayers = availablePlayers.filter(p => p.id !== player.id);
    const newCompletedPicks = { ...completedPicks, [currentPickIndex]: player.id };
    let nextPickIndex = currentPickIndex + 1;
    // Update skipped picks
    while (pickOrder[nextPickIndex] === null && nextPickIndex < pickOrder.length) {
      nextPickIndex++;
    }
    debugger;
    setNextPickIndex(nextPickIndex);

    // --- Create the final update object ---
    const updatedDraft = {
        ...draftState,
        teams: newTeams,
        availablePlayers: newAvailablePlayers,
        completedPicks: newCompletedPicks,
        currentPickIndex: nextPickIndex,
    };

    // --- Atomically write the entire update back to Firestore ---
    await updateDoc(draftDocRef, updatedDraft);
    // NOTE: We no longer call setDraftState() here. The `onSnapshot` listener
    // will automatically receive this update and update the state for everyone.

  }, [draftState, draftDocRef]); // Dependency is now just draftState

  const handleResetDraft = async () => {
      await setDoc(draftDocRef, initializeDraft());
  }

  useEffect(() => {
    if (!draftState || draftState.pickOrder[draftState.currentPickIndex] !== null) {
      return;
    }
    const timer = setTimeout(async () => {
      await updateDoc(draftDocRef, { currentPickIndex: draftState.currentPickIndex + 1 });
    }, 1500);
    return () => clearTimeout(timer);
  }, [draftState, draftDocRef]);

  //////// Firebase Setup //////////

//   const handleDraftPlayer = useCallback((player: Player) => {
//     if (isDraftComplete || !currentTeamIdPicking) return;

//     setDraftState(prevState => {
//       // Add player to the picking team
//       const newTeams = prevState.teams.map(team => {
//         if (team.id === currentTeamIdPicking) {
//           return { ...team, players: [...team.players!, player] };
//         }
//         return team;
//       });

//       // Remove player from available pool
//       const newAvailablePlayers = prevState.availablePlayers.filter(p => p.id !== player.id);

//       const newCompletedPicks = {
//         ...prevState.completedPicks,
//         [currentPickIndex]: player.id,
//       };

//       return { ...prevState, teams: newTeams, availablePlayers: newAvailablePlayers, completedPicks: newCompletedPicks };
//     });

//     // Move to the next pick
//     setCurrentPickIndex(prev => {
//         while (pickOrder[prev + 1] === null && prev + 1 < totalPicks) {
//           prev++;
//         }
//         return prev + 1;
//     });
//   }, [isDraftComplete, currentTeamIdPicking, currentPickIndex]);

  const currentTeamPicking = useMemo(() => {
    return teams.find(t => t.id === currentTeamIdPicking);
  }, [teams, currentTeamIdPicking]);

  if (isLoading || !draftState) {
    return <div>Connecting to Live Draft...</div>;
  }

  return (
    <DraftPageContainer>
      <DraftHeader>
        <Title>Live Player Draft</Title>
        <DraftStatus>
          {isDraftComplete
            ? "Draft Complete!"
            : `Round ${Math.floor(currentPickIndex / teams.length) + 1}, Pick ${currentPickIndex % teams.length + 1}: ${currentTeamPicking?.name} is on the clock!`}
        </DraftStatus>
        <button onClick={handleResetDraft}>Reset Draft</button>
      </DraftHeader>

      <MainContent>
        <TeamsSection>
          {teams.map(team => (
            <TeamCardContainer key={team.id} isPicking={team.id === currentTeamIdPicking}>
              <TeamHeader>{team.name}</TeamHeader>
              <PlayerList>
                {team.players!.map(p => (
                  <PlayerListItem key={p.id} isCaptain={p.isCaptain}>
                    <span>{p.name}</span>
                    <span>{p.elo}</span>
                  </PlayerListItem>
                ))}
              </PlayerList>
            </TeamCardContainer>
          ))}
        </TeamsSection>
        
        <PlayerPool
          players={availablePlayers}
          onDraft={handleDraftPlayer}
          disabled={isDraftComplete}
        />
      </MainContent>

      <PickOrderDisplay
        pickOrder={draftState.pickOrder}
        teams={draftState.teams}
        // Assuming players are static, but they could also be loaded from Firestore
        players={mockPlayers} 
        currentPickIndex={draftState.currentPickIndex}
        completedPicks={draftState.completedPicks}
      />
    </DraftPageContainer>
  );
};

export default DraftPage;
