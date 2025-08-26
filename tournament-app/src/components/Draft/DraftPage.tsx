import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, Team, DraftState } from '../../types';
import PickOrderDisplay from './PickOrderDisplay';
import PlayerPool from './PlayerPool'; 
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DraftTimer from './DraftTimer';
import { DraftPageContainer, DraftHeader, Title, DraftStatus, DraftContent, TeamsSection, TeamCardContainer, TeamHeader, PlayerList, PlayerListItem, PlayerInfoOnCard, PlayerNameOnCard, PlayerRolesOnCard, PlayerEloOnCard } from '../../styles';
import { usePlayers } from '../../context/PlayerContext';
import { useAuth } from '../Common/AuthContext';
import { useDivision } from '../../context/DivisionContext';
import { compareRanks, createOpGgUrl, rankTierToShortName } from '../../utils';
import { ceil } from 'lodash';

const DRAFT_PICK_TIME_LIMIT_IN_MS = 2 * 60 * 60 * 1000;

const calculatePickIndex = (pickNumber: number, numCaptains: number, captainIndex: number): number => {
  if (pickNumber % 2 === 1) {
    return (pickNumber - 1) * numCaptains + captainIndex;
  } else {
    return (pickNumber - 1) * numCaptains + (numCaptains - 1 - captainIndex);
  }
}

const initializeDraft = (allPlayers: Player[], division: string): DraftState => {
  if (!allPlayers) return emptyDraftState();
  let captains = allPlayers.filter(p => p.isCaptain).sort((a, b) => compareRanks(b, a));
  const numCaptains = captains.length;
  if (numCaptains * 5 > allPlayers.length) {
    // there are more captains than players, cut the bottom X captains
    const diff = numCaptains * 5 - allPlayers.length;
    const numCaptainsToRemove = ceil(diff / 5);

    for (let i = 0; i < numCaptainsToRemove; i++){
      captains.pop();
    }
  }
  // Reverse the order so lowest ranked player picks first.
  captains = captains.reverse();

  const availablePlayers = allPlayers.filter(p => !p.isCaptain);
  const allPlayersSorted = [...allPlayers].sort((a, b) => compareRanks(b, a)).reverse();

  const teams: Team[] = captains.map((captain, index) => ({
    id: index + 1,
    name: `Team ${captain.name}`,
    captainId: captain.id,
    players: [captain],
    wins: 0,
    losses: 0,
    gameWins: 0,
    gameLosses: 0
  }));

  const numRounds = 5; // To get to 5 players total
  const numTeams = teams.length;
  const pickOrder: (number|string)[] = [];
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
        playerSkipSlot[player.id] = index / allPlayers.length;
        player.teamId = nextTeamId++;
    }
  });
  
  captains.forEach((captain) => {
    if (playerSkipSlot[captain.id] !== undefined) {
        const captainPercent = playerSkipSlot[captain.id];
        if (captainPercent <= 0.2) {
          // skip the fifth round pick
          pickOrder[calculatePickIndex(5, numTeams, captain.teamId!) - 1] = captain.name;
        }
        else if (captainPercent <= 0.4) {
          // skip the fourth round pick
          pickOrder[calculatePickIndex(4, numTeams, captain.teamId!) + 1] = captain.name;
        }
        else if (captainPercent <= 0.6) {
          // skip the third round pick
          pickOrder[calculatePickIndex(3, numTeams, captain.teamId!) - 1] = captain.name;
        }
        else if (captainPercent <= 0.8) {
          // skip the second round pick
          pickOrder[calculatePickIndex(2, numTeams, captain.teamId!) + 1] = captain.name;
        }
        else if (captainPercent <= 1) {
          // skip the first round pick
          pickOrder[calculatePickIndex(1, numTeams, captain.teamId!) - 1] = captain.name;
        }
    }
  });

  let currentPickIndex = 0;
  // Update skipped picks
  while (typeof(pickOrder[currentPickIndex]) === 'string' && currentPickIndex < pickOrder.length) {
    currentPickIndex++;
  }

  return { teams, pickOrder, availablePlayers, completedPicks: {}, currentPickIndex, draftId: `grumble2025_${division ?? "master"}` };
};

const emptyDraftState = (): DraftState => {
  return {
    teams: [],
    pickOrder: [],
    availablePlayers: [],
    completedPicks: {},
    currentPickIndex: 0,
    draftId: '',
  };
}

const DraftPage: React.FC = () => {
  const navigate = useNavigate();
  const { division } = useDivision();
  const { players: allPlayers } = usePlayers();
  const { captainTeamId, currentUser, isAdmin } = useAuth();

  const initialDraftState = initializeDraft(allPlayers, division);
  const { teams, pickOrder, currentPickIndex } = initialDraftState;

  const [draftState, setDraftState] = useState<DraftState>(emptyDraftState);
  const [draftDocRef, setDraftDocRef] = useState(doc(db, 'drafts', `grumble2025_${division}`));
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [nextPickIndex, setNextPickIndex] = useState(currentPickIndex);
  const [prevDivision, setPrevDivision] = useState('');
  const [isSpectator, setIsSpectator] = useState(sessionStorage.getItem('isSpectator') === 'true');
  const [isLoading, setIsLoading] = useState(true);

  const isDraftComplete = nextPickIndex >= pickOrder.length;
  const currentTeamIdPicking = !isDraftComplete ? pickOrder[draftState.currentPickIndex] : null;

  //// BEGIN AUTH ////
  useEffect(() => {
    const spectatorStatus = sessionStorage.getItem('isSpectator') === 'true';
    setIsSpectator(spectatorStatus);
    // If after checking, user is NOT logged in AND is NOT a spectator, redirect them
    if (!captainTeamId && !spectatorStatus && !isAdmin && !isLoading) {
      navigate('/draft-access');
    }
    setLoadingAuth(false);
  }, [captainTeamId, currentUser, isAdmin, isLoading, navigate, setIsSpectator, setLoadingAuth]);
  //// END AUTH ////

  useEffect(() => {
    if (division !== prevDivision) {
      setDraftDocRef(doc(db, 'drafts', `grumble2025_${division}`));
      setPrevDivision(division);
    }

    async function maybeInitData() {
      // Draft hasn't been initialized yet, update with initialize draft state
      const currentData = await getDoc(draftDocRef);
      if (currentData.exists() && Object.keys(currentData.data()).length <= 1 && allPlayers.length > 0) {
        const initialDraftState = initializeDraft(allPlayers, division);
        // --- Atomically write the entire update back to Firestore ---
        if (!isSpectator && isAdmin) {
          await updateDoc(draftDocRef, {...draftState, ...initialDraftState});
        }
      }
    }

    maybeInitData();

    // onSnapshot listens for any changes to the document
    const unsubscribe = onSnapshot(draftDocRef, async (docSnap) => {
      setIsLoading(false);
      if (docSnap.exists()) {
        const data = docSnap.data() as DraftState;
        if (data.currentPickIndex === draftState.currentPickIndex 
            && data.draftId === draftState.draftId 
            && Object.keys(data).length === Object.keys(draftState).length) {
          return;
        }
        setDraftState(data);
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [allPlayers, isSpectator, division, draftDocRef, draftState, draftState.currentPickIndex, draftState.draftId, prevDivision, setDraftDocRef, setPrevDivision]);

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
    while (typeof(pickOrder[nextPickIndex]) === "string" && nextPickIndex < pickOrder.length) {
      nextPickIndex++;
    }

    setNextPickIndex(nextPickIndex);

    // --- Create the final update object ---
    const updatedDraft = {
        ...draftState,
        teams: newTeams,
        availablePlayers: newAvailablePlayers,
        completedPicks: newCompletedPicks,
        currentPickIndex: nextPickIndex,
        pickEndsAt: Date.now() + DRAFT_PICK_TIME_LIMIT_IN_MS,
    };

    // --- Atomically write the entire update back to Firestore ---
    await updateDoc(draftDocRef, updatedDraft);

  }, [draftState, draftDocRef]); // Dependency is now just draftState

  const currentTeamPicking = useMemo(() => {
    return draftState.teams?.find(t => t.id === currentTeamIdPicking);
  }, [draftState.teams, currentTeamIdPicking]);

  if (isLoading || !draftState) {
    return <div>Connecting to Live Draft...</div>;
  }

  const canDraftNow = (
    !isSpectator &&
    captainTeamId !== null &&
    Object.keys(draftState).length > 0 && 
    (draftState?.pickOrder ? 
      draftState?.pickOrder[draftState.currentPickIndex] === Number(captainTeamId) : false)) || isAdmin;

  if (loadingAuth) {
    return <div>Verifying Access...</div>;
  }

  const latestTeams = !!draftState.teams ? draftState.teams : teams;

  return (
    <DraftPageContainer>
      <DraftHeader>
        <Title>Live Player Draft</Title>
        <DraftStatus>
          {isDraftComplete
            ? "Draft Complete!"
            : `Round ${Math.floor(draftState.currentPickIndex / teams.length) + 1}, Pick ${draftState.currentPickIndex % teams.length + 1}: ${currentTeamPicking?.name} is on the clock!`}
        </DraftStatus>
        <DraftTimer deadlineMs={draftState.pickEndsAt} />
      </DraftHeader>

      <DraftContent>
        <TeamsSection>
          {latestTeams.map(team => (
            <TeamCardContainer key={team.id} isPicking={team.id === currentTeamIdPicking}>
              <TeamHeader>{team.name}</TeamHeader>
              <PlayerList>
                {team.players!.map(p => (
                  <PlayerListItem key={p.id} isCaptain={p.isCaptain}>
                    <PlayerInfoOnCard>
                      <PlayerNameOnCard
                          href={createOpGgUrl(p.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                      >
                          {p.name}
                      </PlayerNameOnCard>
                      <PlayerRolesOnCard>
                        {p.role}
                        {p.secondaryRoles && p.secondaryRoles.length > 0 ? ` (${p.secondaryRoles.join(', ')})` : ''}
                      </PlayerRolesOnCard>
                    </PlayerInfoOnCard>

                    <PlayerEloOnCard>Peak: {rankTierToShortName(p.peakRankTier)}{p.peakRankDivision === -1 ? "" : p.peakRankDivision}</PlayerEloOnCard>
                    {p.soloRankTier !== "N/A" && <PlayerEloOnCard>Solo: {rankTierToShortName(p.soloRankTier)}{p.soloRankDivision === -1 ? "" : p.soloRankDivision}</PlayerEloOnCard>}
                    {p.flexRankTier !== "N/A" && <PlayerEloOnCard>Flex: {rankTierToShortName(p.flexRankTier)}{p.flexRankDivision === -1 ? "" : p.flexRankDivision}</PlayerEloOnCard>}
                  </PlayerListItem>
                ))}
              </PlayerList>
            </TeamCardContainer>
          ))}
        </TeamsSection>
        
        <PlayerPool
          players={draftState.availablePlayers}
          onDraft={handleDraftPlayer}
          disabled={isSpectator || !canDraftNow || isDraftComplete} 
        />
      </DraftContent>

      <PickOrderDisplay
        pickOrder={draftState.pickOrder ?? []}
        teams={draftState.teams}
        players={allPlayers}
        currentPickIndex={draftState.currentPickIndex}
        completedPicks={draftState.completedPicks}
      />
    </DraftPageContainer>
  );
};

export default DraftPage;
