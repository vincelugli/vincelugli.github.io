import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { doc, getDoc, updateDoc, writeBatch, setDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { BracketRound, Player, Team, Match, DraftState, DraftTeam } from '../../types';
import Button from '../Common/Button';
import { useNavigate } from 'react-router-dom';
import { AdminPageContainer, AdminTitle, SelectionContainer, AdminLabel, AdminSelect, Form, TextArea } from '../../styles/index';
import { useDivision } from '../../context/DivisionContext';
import { z } from 'zod';
import { useAuth } from '../Common/AuthContext';
import { getFirebasePrefix, compareRanks, rankTierToShortName, convertRankToElo, isPlayerCaptain } from '../../utils';
import { FaUndo, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaSpinner, FaTools, FaUsers, FaTrophy, FaCalendarAlt } from 'react-icons/fa';

// --- Styled Components for Admin Dashboard ---

const TabBar = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.borderColor};
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: ${({ active, theme }) => active ? theme.primary : 'transparent'};
  color: ${({ active, theme }) => active ? '#ffffff' : theme.text};
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ active, theme }) => active ? theme.primaryHover : theme.backgroundTwo};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px ${({ theme }) => theme.boxShadow};
`;

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div<{ columns?: string }>`
  display: grid;
  grid-template-columns: ${({ columns }) => columns || '1fr 1fr'};
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid ${({ theme }) => theme.borderColor};
  background-color: ${({ theme }) => theme.backgroundThree};
  font-weight: 600;
`;

const StyledTd = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  vertical-align: middle;
`;

const FormLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
`;

const TextInput = styled.input`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

const SelectInput = styled.select`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.5rem;
`;

const SearchInput = styled(TextInput)`
  margin-bottom: 1rem;
  width: 100%;
  max-width: 320px;
`;

const Badge = styled.span<{ variant?: 'primary' | 'success' | 'danger' | 'warning' }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return theme.success + '22';
      case 'danger': return theme.danger + '22';
      case 'warning': return '#ffc10722';
      case 'primary':
      default: return theme.primary + '22';
    }
  }};
  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return theme.success;
      case 'danger': return theme.danger;
      case 'warning': return '#ffc107';
      case 'primary':
      default: return theme.primary;
    }
  }};
  border: 1px solid ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return theme.success;
      case 'danger': return theme.danger;
      case 'warning': return '#ffc107';
      case 'primary':
      default: return theme.primary;
    }
  }};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StatusText = styled.p<{ status: 'success' | 'error' | 'loading' }>`
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  margin: 1rem 0;
  background-color: ${({ status, theme }) => status === 'success' ? theme.success + '22' : status === 'error' ? theme.danger + '22' : theme.backgroundThree};
  color: ${({ status, theme }) => status === 'success' ? theme.success : status === 'error' ? theme.danger : theme.text};
  border: 1px solid ${({ status, theme }) => status === 'success' ? theme.success : status === 'error' ? theme.danger : theme.borderColor};
`;

const ActionButton = styled(Button)`
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const ClearButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.danger};
  &:hover {
    background-color: #c82333;
  }
`;

const EditBox = styled.div`
  border: 2px solid ${({ theme }) => theme.primary};
  padding: 1.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.background};
  margin-bottom: 1.5rem;
`;

const FloatingConfirm = styled.div`
  border: 1px solid #ffc107;
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

// Constants
const RANK_TIERS = ["Challenger", "Grandmaster", "Master", "Diamond", "Emerald", "Platinum", "Gold", "Silver", "Bronze", "Iron", "Unranked"];
const ROLES = ["top", "jungle", "mid", "adc", "support", "fill"];
const DIVISIONS = [1, 2, 3, 4, -1];

type TabType = 'draft' | 'players' | 'teams' | 'bracket' | 'matches' | 'bulk';
type DataType = 'players' | 'teams' | 'groups' | 'bracket' | 'subs' | 'exportTeams' | 'matches' | 'matchCodes' | 'matchResults';

// Placeholder definitions for bulk JSON
const PLAYER_JSON_PLACEHOLDER = `[{"id": 101, "name": "PlayerName#NA1", "soloRankTier": "Diamond", "soloRankDivision": 2, "peakRankTier": "Diamond", "peakRankDivision": 1, "flexRankTier": "Gold", "flexRankDivision": 1, "role": "top", "secondaryRoles": ["mid"], "isCaptain": false, "timezone": "EST"}]`;
const TEAM_JSON_PLACEHOLDER = `[{"id": 1, "name": "TEAM 1", "captainId": 1, "players": [], "wins": 0, "losses": 0, "gameWins": 0, "gameLosses": 0}]`;
const BRACKET_JSON_PLACEHOLDER = `[{"title": "Round 1", "seeds": [{"id": 1, "status": "upcoming", "teams": [{"id": 1, "name": "Team A"}, {"id": 2, "name": "Team B"}], "team1Id": 1, "team2Id": 2, "tournamentCodes": [], "weekPlayed": 1, "isKnockout": true}]}]`;
const MATCHES_JSON_PLACEHOLDER = `[{"id": 1, "team1Id": 1, "team2Id": 2, "status": "upcoming", "tournamentCodes": [], "weekPlayed": 1}]`;

// Helper function to build snake draft pick order (identical to DraftPage.tsx logic)
const buildDraftPickOrder = (allPlayers: Player[], division: string): DraftState => {
  let captains = allPlayers.filter(p => isPlayerCaptain(p, division)).sort((a, b) => compareRanks(b, a));
  let numCaptains = captains.length;
  if (numCaptains * 5 > allPlayers.length) {
    const diff = numCaptains * 5 - allPlayers.length;
    const numCaptainsToRemove = Math.ceil(diff / 5);
    for (let i = 0; i < numCaptainsToRemove; i++) {
      captains.pop();
    }
  }
  captains = captains.reverse(); // lowest elo first

  const availablePlayers = allPlayers.filter(p => !isPlayerCaptain(p, division));
  const allPlayersSorted = [...allPlayers].sort((a, b) => compareRanks(b, a)).reverse();

  const teams: DraftTeam[] = captains.map((captain, index) => ({
    id: index + 1,
    name: `Team ${captain.name.split('#')[0]}`,
    captainId: captain.id,
    players: [captain],
    wins: 0,
    losses: 0,
    gameWins: 0,
    gameLosses: 0
  }));

  const numRounds = 5;
  const numTeams = teams.length;
  const pickOrder: (number | string)[] = [];
  for (let i = 0; i < numRounds; i++) {
    const roundOrder = Array.from({ length: numTeams }, (_, j) => teams[j].id);
    if ((i + 1) % 2 === 0) {
      roundOrder.reverse();
    }
    pickOrder.push(...roundOrder);
  }

  let playerSkipSlot: { [playerId: number]: number } = {};
  allPlayersSorted.forEach((player, index) => {
    if (isPlayerCaptain(player, division) && pickOrder[index] !== undefined) {
      playerSkipSlot[player.id] = index / allPlayers.length;
      const matchedTeam = teams.find(t => t.captainId === player.id);
      player.teamId = matchedTeam ? matchedTeam.id : null;
    }
  });

  captains.forEach((captain) => {
    if (playerSkipSlot[captain.id] !== undefined) {
      const captainPercent = playerSkipSlot[captain.id];
      const teamId = captain.teamId!;
      const pickIndex = (roundNum: number) => {
        if (roundNum % 2 === 1) {
          return (roundNum - 1) * numTeams + (teamId - 1);
        } else {
          return (roundNum - 1) * numTeams + (numTeams - teamId);
        }
      };

      if (captainPercent <= 0.2) pickOrder[pickIndex(5)] = captain.name;
      else if (captainPercent <= 0.4) pickOrder[pickIndex(4)] = captain.name;
      else if (captainPercent <= 0.6) pickOrder[pickIndex(3)] = captain.name;
      else if (captainPercent <= 0.8) pickOrder[pickIndex(2)] = captain.name;
      else if (captainPercent <= 1.0) pickOrder[pickIndex(1)] = captain.name;
    }
  });

  let currentPickIndex = 0;
  while (currentPickIndex < pickOrder.length && typeof pickOrder[currentPickIndex] === 'string') {
    currentPickIndex++;
  }

  const prefix = getFirebasePrefix();
  return {
    teams,
    pickOrder,
    availablePlayers,
    completedPicks: {},
    currentPickIndex,
    draftId: `${prefix}_${division}`
  };
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { division } = useDivision();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('draft');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  // Loaded database arrays
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bracket, setBracket] = useState<BracketRound[]>([]);

  // Local component states
  const [playerSearch, setPlayerSearch] = useState('');
  const [confirmResetDraft, setConfirmResetDraft] = useState(false);

  // Form states for creating/editing
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayerForm, setNewPlayerForm] = useState({
    name: '',
    role: 'top',
    secondaryRoles: [] as string[],
    peakRankTier: 'Gold',
    peakRankDivision: 1,
    soloRankTier: 'Gold',
    soloRankDivision: 1,
    flexRankTier: 'Gold',
    flexRankDivision: 1,
    isCaptain: false,
    timezone: 'EST',
    addToPool: true,
    addToDraft: true
  });

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [newMatchForm, setNewMatchForm] = useState({
    id: '',
    team1Id: 0,
    team2Id: 0,
    status: 'upcoming' as 'upcoming' | 'completed',
    weekPlayed: 1,
    score: '',
    winnerId: null as number | null,
    tournamentCodes: '',
    isKnockout: false,
    stage: ''
  });

  // Legacy Bulk imports
  const [selectedBulkType, setSelectedBulkType] = useState<DataType>('players');
  const [bulkJsonString, setBulkJsonString] = useState('');

  const prefix = getFirebasePrefix();

  // Authentication check
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin-access');
    }
  }, [isAdmin, navigate]);

  // Firestore Real-time Subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    setStatus('loading');
    setStatusMsg('Subscribing to division database...');

    const draftRef = doc(db, 'drafts', `${prefix}_${division}`);
    const unsubscribeDraft = onSnapshot(draftRef, (snapshot) => {
      if (snapshot.exists()) {
        setDraftState(snapshot.data() as DraftState);
      } else {
        setDraftState(null);
      }
    });

    const playersRef = doc(db, 'players', `${prefix}_${division}`);
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayers(snapshot.data().players || []);
      } else {
        setPlayers([]);
      }
    });

    const teamsRef = doc(db, 'teams', `${prefix}_${division}`);
    const unsubscribeTeams = onSnapshot(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        setTeams(snapshot.data().teams || []);
      } else {
        setTeams([]);
      }
    });

    const matchesRef = doc(db, 'matches', `${prefix}_${division}`);
    const unsubscribeMatches = onSnapshot(matchesRef, (snapshot) => {
      if (snapshot.exists()) {
        setMatches(snapshot.data().matches || []);
      } else {
        setMatches([]);
      }
    });

    const bracketRef = doc(db, 'bracket', `${prefix}_${division}`);
    const unsubscribeBracket = onSnapshot(bracketRef, (snapshot) => {
      if (snapshot.exists()) {
        setBracket(snapshot.data().bracket || []);
      } else {
        setBracket([]);
      }
    });

    setStatus('idle');
    setStatusMsg('');

    return () => {
      unsubscribeDraft();
      unsubscribePlayers();
      unsubscribeTeams();
      unsubscribeMatches();
      unsubscribeBracket();
    };
  }, [division, prefix, isAdmin]);

  // --- Actions & Handlers ---

  const showStatus = (type: 'success' | 'error', msg: string) => {
    setStatus(type);
    setStatusMsg(msg);
    setTimeout(() => {
      setStatus('idle');
      setStatusMsg('');
    }, 5000);
  };

  // 1. Undo draft picks while keeping draft order
  const handleUndoLastPick = async () => {
    if (!draftState || !draftState.completedPicks || Object.keys(draftState.completedPicks).length === 0) {
      showStatus('error', 'No picks completed yet to undo.');
      return;
    }

    try {
      setStatus('loading');
      const pickKeys = Object.keys(draftState.completedPicks).map(Number);
      const lastPickIdx = Math.max(...pickKeys);
      const playerId = draftState.completedPicks[lastPickIdx];

      // Find the player object to restore
      let playerToRestore: Player | undefined = players.find(p => p.id === playerId);
      if (!playerToRestore) {
        // Search in draft teams if not in player pool
        for (const team of draftState.teams) {
          const found = team.players?.find(p => p.id === playerId);
          if (found) {
            playerToRestore = found;
            break;
          }
        }
      }

      if (!playerToRestore) {
        throw new Error('Unable to find the drafted player object in the player pool or team lists.');
      }

      // 1. Remove player from team roster
      const updatedTeams = draftState.teams.map(t => ({
        ...t,
        players: t.players ? t.players.filter(p => p.id !== playerId) : []
      }));

      // 2. Put player back in available players
      const updatedAvailable = [...draftState.availablePlayers, playerToRestore].sort((a, b) => compareRanks(b, a));

      // 3. Delete from completedPicks mapping
      const updatedCompleted = { ...draftState.completedPicks };
      delete updatedCompleted[lastPickIdx];

      // 4. Update Firestore doc
      const draftRef = doc(db, 'drafts', `${prefix}_${division}`);
      await updateDoc(draftRef, {
        teams: updatedTeams,
        availablePlayers: updatedAvailable,
        completedPicks: updatedCompleted,
        currentPickIndex: lastPickIdx,
        pickEndsAt: null
      });

      showStatus('success', `Undid pick #${lastPickIdx + 1} (Returned ${playerToRestore.name} to pool).`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Error occurred while undoing last pick.');
    }
  };

  const handleResetDraft = async () => {
    if (!confirmResetDraft) {
      showStatus('error', 'Please check the confirmation box before resetting.');
      return;
    }

    try {
      setStatus('loading');
      const initial = buildDraftPickOrder(players, division);
      const draftRef = doc(db, 'drafts', `${prefix}_${division}`);
      await setDoc(draftRef, initial);
      setConfirmResetDraft(false);
      showStatus('success', 'Draft has been successfully re-initialized with all captains and players.');
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Error initializing draft.');
    }
  };

  const handleUpdateIndividualPick = async (pickIndex: number, newPlayerId: number | null) => {
    if (!draftState) return;

    try {
      setStatus('loading');
      const { completedPicks, teams, availablePlayers, pickOrder } = draftState;
      const teamId = pickOrder[pickIndex];

      if (typeof teamId !== 'number') {
        throw new Error('Cannot edit a skipped pick slot.');
      }

      const oldPlayerId = completedPicks[pickIndex];
      let updatedCompletedPicks = { ...completedPicks };
      let updatedAvailablePlayers = [...availablePlayers];
      let playerToRestore: Player | undefined;

      // 1. If there was an old player, find it, remove from team roster, prepare to restore to pool
      if (oldPlayerId) {
        for (const team of teams) {
          const found = team.players?.find(p => p.id === oldPlayerId);
          if (found) {
            playerToRestore = found;
            break;
          }
        }
        if (!playerToRestore) {
          playerToRestore = players.find(p => p.id === oldPlayerId);
        }
      }

      // 2. Prepare the new player if we are assigning one
      let newPlayerObj: Player | undefined;
      if (newPlayerId !== null) {
        newPlayerObj = availablePlayers.find(p => p.id === newPlayerId);
        if (!newPlayerObj) {
          newPlayerObj = players.find(p => p.id === newPlayerId);
        }
        if (!newPlayerObj) {
          throw new Error('New player not found in database.');
        }
      }

      // 3. Update teams rosters
      const updatedTeams = teams.map(team => {
        let teamPlayers = team.players ? [...team.players] : [];
        if (oldPlayerId && teamPlayers.some(p => p.id === oldPlayerId)) {
          teamPlayers = teamPlayers.filter(p => p.id !== oldPlayerId);
        }
        if (team.id === teamId && newPlayerObj) {
          teamPlayers.push(newPlayerObj);
        }
        return { ...team, players: teamPlayers };
      });

      // 4. Update available players pool
      if (playerToRestore) {
        updatedAvailablePlayers.push(playerToRestore);
      }
      if (newPlayerObj) {
        updatedAvailablePlayers = updatedAvailablePlayers.filter(p => p.id !== newPlayerId);
      }
      updatedAvailablePlayers.sort((a, b) => compareRanks(b, a));

      // 5. Update completed picks map
      if (newPlayerId === null) {
        delete updatedCompletedPicks[pickIndex];
      } else {
        updatedCompletedPicks[pickIndex] = newPlayerId;
      }

      // 6. Write back to Firestore
      const draftRef = doc(db, 'drafts', `${prefix}_${division}`);
      await updateDoc(draftRef, {
        completedPicks: updatedCompletedPicks,
        teams: updatedTeams,
        availablePlayers: updatedAvailablePlayers
      });

      showStatus('success', newPlayerId === null 
        ? `Cleared pick #${pickIndex + 1}` 
        : `Updated pick #${pickIndex + 1} to ${newPlayerObj?.name}`
      );
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to update individual pick.');
    }
  };

  const handleToggleSkipPick = async (pickIndex: number) => {
    if (!draftState) return;

    try {
      setStatus('loading');
      const { completedPicks, teams, availablePlayers, pickOrder, skippedOriginalTeams, currentPickIndex } = draftState;
      
      const isSkipped = typeof pickOrder[pickIndex] === 'string';
      const updatedPickOrder = [...pickOrder];
      const updatedSkippedOriginalTeams = { ...(skippedOriginalTeams || {}) };
      let updatedCompletedPicks = { ...completedPicks };
      let updatedAvailablePlayers = [...availablePlayers];
      let updatedTeams = [...teams];
      let newPickIndex = currentPickIndex;

      if (!isSkipped) {
        // --- SKIP THE PICK ---
        const teamId = pickOrder[pickIndex] as number;
        
        // 1. If player is drafted at this pick, clear it
        const oldPlayerId = completedPicks[pickIndex];
        if (oldPlayerId) {
          let playerToRestore: Player | undefined;
          for (const team of teams) {
            const found = team.players?.find(p => p.id === oldPlayerId);
            if (found) {
              playerToRestore = found;
              break;
            }
          }
          if (!playerToRestore) {
            playerToRestore = players.find(p => p.id === oldPlayerId);
          }

          if (playerToRestore) {
            updatedAvailablePlayers.push(playerToRestore);
            updatedAvailablePlayers.sort((a, b) => compareRanks(b, a));
          }

          // Remove from team roster
          updatedTeams = teams.map(t => {
            if (t.id === teamId) {
              return {
                ...t,
                players: t.players ? t.players.filter(p => p.id !== oldPlayerId) : []
              };
            }
            return t;
          });

          delete updatedCompletedPicks[pickIndex];
        }

        // 2. Set pick order element to string
        const teamName = teams.find(t => t.id === teamId)?.name || `Team ${teamId}`;
        updatedPickOrder[pickIndex] = `Skipped (${teamName})`;
        updatedSkippedOriginalTeams[pickIndex] = teamId;

        // 3. Advance currentPickIndex if we skipped the current pick
        if (pickIndex === currentPickIndex) {
          while (newPickIndex < updatedPickOrder.length && typeof updatedPickOrder[newPickIndex] === 'string') {
            newPickIndex++;
          }
        }
      } else {
        // --- UN-SKIP THE PICK ---
        const originalTeamId = updatedSkippedOriginalTeams[pickIndex];
        if (!originalTeamId) {
          throw new Error('Could not find the original team ID to restore this pick.');
        }

        updatedPickOrder[pickIndex] = originalTeamId;
        delete updatedSkippedOriginalTeams[pickIndex];
      }

      const draftRef = doc(db, 'drafts', `${prefix}_${division}`);
      await updateDoc(draftRef, {
        pickOrder: updatedPickOrder,
        skippedOriginalTeams: updatedSkippedOriginalTeams,
        completedPicks: updatedCompletedPicks,
        availablePlayers: updatedAvailablePlayers,
        teams: updatedTeams,
        currentPickIndex: newPickIndex
      });

      showStatus('success', isSkipped ? `Un-skipped pick #${pickIndex + 1}` : `Skipped pick #${pickIndex + 1}`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to toggle pick skip status.');
    }
  };

  // 2. Add player to player pool / draft pool
  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerForm.name) {
      showStatus('error', 'Summoner Name is required.');
      return;
    }

    try {
      setStatus('loading');
      const nextId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 101;
      const elo = Math.max(
        convertRankToElo(newPlayerForm.peakRankTier, newPlayerForm.peakRankDivision),
        convertRankToElo(newPlayerForm.soloRankTier, newPlayerForm.soloRankDivision),
        convertRankToElo(newPlayerForm.flexRankTier, newPlayerForm.flexRankDivision)
      );

      const player: Player = {
        id: nextId,
        name: newPlayerForm.name,
        role: newPlayerForm.role,
        secondaryRoles: newPlayerForm.secondaryRoles,
        peakRankTier: newPlayerForm.peakRankTier,
        peakRankDivision: newPlayerForm.peakRankDivision,
        soloRankTier: newPlayerForm.soloRankTier,
        soloRankDivision: newPlayerForm.soloRankDivision,
        flexRankTier: newPlayerForm.flexRankTier,
        flexRankDivision: newPlayerForm.flexRankDivision,
        isCaptain: newPlayerForm.isCaptain,
        timezone: newPlayerForm.timezone,
        elo: elo
      };

      const batch = writeBatch(db);

      if (newPlayerForm.addToPool) {
        const playersRef = doc(db, 'players', `${prefix}_${division}`);
        batch.update(playersRef, {
          players: arrayUnion(player)
        });
      }

      if (newPlayerForm.addToDraft && draftState) {
        const draftRef = doc(db, 'drafts', `${prefix}_${division}`);
        batch.update(draftRef, {
          availablePlayers: arrayUnion(player)
        });
      }

      await batch.commit();
      showStatus('success', `Created player ${player.name} (ID: ${player.id})`);
      setNewPlayerForm({
        ...newPlayerForm,
        name: '',
        secondaryRoles: [],
        isCaptain: false
      });
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to create player.');
    }
  };

  // 3. Update any player in the player list
  const handleSaveUpdatedPlayer = async () => {
    if (!editingPlayer) return;

    try {
      setStatus('loading');
      const elo = Math.max(
        convertRankToElo(editingPlayer.peakRankTier, editingPlayer.peakRankDivision),
        convertRankToElo(editingPlayer.soloRankTier, editingPlayer.soloRankDivision),
        convertRankToElo(editingPlayer.flexRankTier, editingPlayer.flexRankDivision)
      );

      const updatedPlayer = { ...editingPlayer, elo };
      const batch = writeBatch(db);

      // Save in player list doc
      const newPool = players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
      batch.update(doc(db, 'players', `${prefix}_${division}`), { players: newPool });

      // Save in draft pool if present
      if (draftState) {
        if (draftState.availablePlayers.some(p => p.id === updatedPlayer.id)) {
          const newDraftAvail = draftState.availablePlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
          batch.update(doc(db, 'drafts', `${prefix}_${division}`), { availablePlayers: newDraftAvail });
        }

        // Also update roster inside teams if player was already picked
        const newDraftTeams = draftState.teams.map(t => ({
          ...t,
          players: t.players ? t.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p) : []
        }));
        batch.update(doc(db, 'drafts', `${prefix}_${division}`), { teams: newDraftTeams });
      }

      await batch.commit();
      setEditingPlayer(null);
      showStatus('success', `Updated player details for ${updatedPlayer.name}.`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to save player details.');
    }
  };

  // Remove player from pool or draft pool
  const handleDeletePlayer = async (playerId: number, deleteFromPool: boolean, deleteFromDraft: boolean) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    if (!window.confirm(`Are you sure you want to remove ${player.name} from the selected tables?`)) return;

    try {
      setStatus('loading');
      const batch = writeBatch(db);

      if (deleteFromPool) {
        const filtered = players.filter(p => p.id !== playerId);
        batch.update(doc(db, 'players', `${prefix}_${division}`), { players: filtered });
      }

      if (deleteFromDraft && draftState) {
        const filteredDraft = draftState.availablePlayers.filter(p => p.id !== playerId);
        batch.update(doc(db, 'drafts', `${prefix}_${division}`), { availablePlayers: filteredDraft });
      }

      await batch.commit();
      showStatus('success', `Removed player ${player.name} from selected pools.`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to delete player.');
    }
  };

  // Add a player back to draft pool
  const handleAddPlayerToDraftPool = async (player: Player) => {
    if (!draftState) {
      showStatus('error', 'Draft state not found.');
      return;
    }
    if (draftState.availablePlayers.some(p => p.id === player.id)) {
      showStatus('error', 'Player is already in the draft pool.');
      return;
    }

    try {
      setStatus('loading');
      const updatedAvailable = [...draftState.availablePlayers, player].sort((a, b) => compareRanks(b, a));
      await updateDoc(doc(db, 'drafts', `${prefix}_${division}`), {
        availablePlayers: updatedAvailable
      });
      showStatus('success', `Added ${player.name} to Draft pool.`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to add player to draft pool.');
    }
  };

  // 4. Create teams for the brackets (From Draft teams)
  const handleCreateTeamsFromDraft = async () => {
    if (!draftState || !draftState.teams || draftState.teams.length === 0) {
      showStatus('error', 'No drafted teams found in the draft state database.');
      return;
    }

    if (!window.confirm('Write drafted teams to brackets teams? This overwrites existing tournament teams.')) return;

    try {
      setStatus('loading');
      const mappedTeams: Team[] = draftState.teams.map(dt => ({
        id: dt.id,
        name: dt.name,
        captainId: dt.captainId,
        players: dt.players ? dt.players.map(p => p.id) : [],
        wins: 0,
        losses: 0,
        gameWins: 0,
        gameLosses: 0,
        record: '0-0',
        gameRecord: '0-0'
      }));

      await setDoc(doc(db, 'teams', `${prefix}_${division}`), { teams: mappedTeams });
      showStatus('success', `Created ${mappedTeams.length} teams for the bracket stages.`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to create teams.');
    }
  };

  const handleSaveTeamDetails = async () => {
    if (!editingTeam) return;

    try {
      setStatus('loading');
      const updatedList = teams.map(t => t.id === editingTeam.id ? editingTeam : t);
      await updateDoc(doc(db, 'teams', `${prefix}_${division}`), { teams: updatedList });
      setEditingTeam(null);
      showStatus('success', `Saved team details for ${editingTeam.name}`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to update team details.');
    }
  };

  // 5. Create or Update matches
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchForm.id || !newMatchForm.team1Id || !newMatchForm.team2Id) {
      showStatus('error', 'Match ID, Team 1, and Team 2 are required.');
      return;
    }

    try {
      setStatus('loading');
      const codes = newMatchForm.tournamentCodes ? newMatchForm.tournamentCodes.split(',').map(s => s.trim()).filter(Boolean) : [];
      const newMatchObj: Match = {
        id: isNaN(Number(newMatchForm.id)) ? newMatchForm.id : Number(newMatchForm.id),
        team1Id: newMatchForm.team1Id,
        team2Id: newMatchForm.team2Id,
        status: newMatchForm.status,
        weekPlayed: newMatchForm.weekPlayed,
        tournamentCodes: codes,
        isKnockout: newMatchForm.isKnockout,
        stage: newMatchForm.stage || undefined
      };

      if (newMatchForm.status === 'completed') {
        newMatchObj.winnerId = newMatchForm.winnerId;
        newMatchObj.score = newMatchForm.score || undefined;
      }

      const updatedMatches = [...matches, newMatchObj];
      await updateDoc(doc(db, 'matches', `${prefix}_${division}`), { matches: updatedMatches });

      // Clean up match form
      setNewMatchForm({
        id: '',
        team1Id: 0,
        team2Id: 0,
        status: 'upcoming',
        weekPlayed: 1,
        score: '',
        winnerId: null,
        tournamentCodes: '',
        isKnockout: false,
        stage: ''
      });
      showStatus('success', 'Match created successfully!');
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to create match.');
    }
  };

  const handleGenerateSwissStage = async () => {
    if (teams.length === 0) {
      showStatus('error', 'No teams found in the database. Please create teams first.');
      return;
    }
    const confirmMsg = "Are you sure you want to generate Swiss Stage Round 1 matches? This will overwrite all current matches.";
    if (!window.confirm(confirmMsg)) return;

    try {
      setStatus('loading');
      const generatedMatches: Match[] = [];
      const sortedTeams = [...teams].sort((a, b) => a.id - b.id);

      for (let i = 0; i < sortedTeams.length; i += 2) {
        if (i + 1 < sortedTeams.length) {
          const t1 = sortedTeams[i];
          const t2 = sortedTeams[i + 1];
          const matchId = `swiss_${Math.floor(i / 2) + 1}`;

          generatedMatches.push({
            id: matchId,
            team1Id: t1.id,
            team2Id: t2.id,
            status: 'upcoming',
            tournamentCodes: [],
            weekPlayed: 1,
            isKnockout: false,
            stage: 'Round 1'
          });
        } else {
          // Bye
          const t1 = sortedTeams[i];
          const matchId = `swiss_${Math.floor(i / 2) + 1}`;
          generatedMatches.push({
            id: matchId,
            team1Id: t1.id,
            team2Id: t1.id, // bye indicator
            status: 'completed',
            winnerId: t1.id,
            score: 'BYE',
            tournamentCodes: [],
            weekPlayed: 1,
            isKnockout: false,
            stage: 'Round 1'
          });
        }
      }

      const matchesRef = doc(db, 'matches', `${prefix}_${division}`);
      await setDoc(matchesRef, { matches: generatedMatches });
      showStatus('success', `Successfully generated ${generatedMatches.length} Swiss Round 1 matches.`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to generate Swiss Stage.');
    }
  };

  const handleSaveMatchDetails = async () => {
    if (!editingMatch) return;

    try {
      setStatus('loading');
      const updatedList = matches.map(m => m.id === editingMatch.id ? editingMatch : m);
      await updateDoc(doc(db, 'matches', `${prefix}_${division}`), { matches: updatedList });
      setEditingMatch(null);
      showStatus('success', 'Match updated successfully.');
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to save match details.');
    }
  };

  const handleDeleteMatch = async (matchId: string | number) => {
    if (!window.confirm(`Are you sure you want to delete match ID ${matchId}?`)) return;

    try {
      setStatus('loading');
      const filtered = matches.filter(m => m.id !== matchId);
      await updateDoc(doc(db, 'matches', `${prefix}_${division}`), { matches: filtered });
      showStatus('success', 'Match deleted.');
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to delete match.');
    }
  };

  // Bracket updates
  const handleUpdateBracketSeed = async (roundIndex: number, seedIndex: number, fields: any) => {
    try {
      setStatus('loading');
      const updatedBracket = [...bracket];
      const round = updatedBracket[roundIndex];
      const seed = round.seeds[seedIndex];

      const updatedSeed = { ...seed, ...fields };

      // Map team names based on updated team1Id / team2Id
      const t1 = teams.find(t => t.id === updatedSeed.team1Id);
      const t2 = teams.find(t => t.id === updatedSeed.team2Id);
      updatedSeed.teams = [
        { id: updatedSeed.team1Id || undefined, name: t1?.name || '-' },
        { id: updatedSeed.team2Id || undefined, name: t2?.name || '-' }
      ];

      round.seeds[seedIndex] = updatedSeed;
      await updateDoc(doc(db, 'bracket', `${prefix}_${division}`), { bracket: updatedBracket });
      showStatus('success', `Bracket Round "${round.title}" seed #${seed.id} updated!`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to update bracket seed.');
    }
  };

  // Legacy Bulk Submit Zod Validation
  const handleBulkSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setStatusMsg('');

    let data: any;
    try {
      data = JSON.parse(bulkJsonString);

      const PlayerSchema = z.array(z.object({
        id: z.number(),
        name: z.string(),
        elo: z.number().optional(),
        soloRankTier: z.string(),
        soloRankDivision: z.number(),
        peakRankTier: z.string(),
        peakRankDivision: z.number(),
        flexRankTier: z.string(),
        flexRankDivision: z.number(),
        role: z.string(),
        secondaryRoles: z.array(z.string()),
        isCaptain: z.boolean(),
        timezone: z.string()
      }));

      const TeamSchema = z.array(z.object({
        id: z.number(),
        name: z.string(),
        captainId: z.number(),
        players: z.array(z.number()),
        wins: z.number(),
        losses: z.number(),
        gameWins: z.number(),
        gameLosses: z.number()
      }));

      const BracketSchema = z.array(z.object({
        title: z.string(),
        seeds: z.array(z.object({
          id: z.number(),
          status: z.string(),
          teams: z.array(z.object({ id: z.number().optional(), name: z.string().optional() })),
          team1Id: z.number(),
          team2Id: z.number(),
          tournamentCodes: z.array(z.string()),
          weekPlayed: z.number(),
          winnerId: z.optional(z.nullable(z.number())),
          score: z.optional(z.string()),
          isKnockout: z.boolean()
        }))
      }));

      const MatchesSchema = z.array(z.object({
        id: z.number().or(z.string()),
        team1Id: z.number(),
        team2Id: z.number(),
        status: z.string(),
        tournamentCodes: z.array(z.string()),
        weekPlayed: z.number(),
        winnerId: z.optional(z.nullable(z.number())),
        score: z.optional(z.string())
      }));

      switch (selectedBulkType) {
        case 'players': PlayerSchema.parse(data); break;
        case 'teams': TeamSchema.parse(data); break;
        case 'bracket': BracketSchema.parse(data); break;
        case 'matches': MatchesSchema.parse(data); break;
        default: throw new Error('Unsupported selection type for validation.');
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        showStatus('error', `Validation Failed: ${JSON.stringify(err.format())}`);
      } else {
        showStatus('error', err.message || 'Invalid JSON format.');
      }
      return;
    }

    try {
      const docRef = doc(db, selectedBulkType, `${prefix}_${division}`);
      await setDoc(docRef, { [selectedBulkType]: data }, { merge: true });
      showStatus('success', `Bulk updated ${selectedBulkType} successfully!`);
      setBulkJsonString('');
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Database write error. Check console.');
    }
  }, [bulkJsonString, selectedBulkType, prefix, division]);

  // Filtering players list
  const filteredPlayers = useMemo(() => {
    if (!playerSearch) return players;
    const query = playerSearch.toLowerCase();
    return players.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.role.toLowerCase().includes(query) ||
      (p.secondaryRoles && p.secondaryRoles.some(r => r.toLowerCase().includes(query)))
    );
  }, [players, playerSearch]);

  return (
    <AdminPageContainer>
      <AdminTitle>Admin Dashboard</AdminTitle>

      {statusMsg && (
        <StatusText status={status === 'success' ? 'success' : status === 'error' ? 'error' : 'loading'}>
          {status === 'loading' && <FaSpinner className="spin" style={{ marginRight: '0.5rem' }} />}
          {statusMsg}
        </StatusText>
      )}

      {/* Primary Tab Navigation */}
      <TabBar>
        <TabButton active={activeTab === 'draft'} onClick={() => setActiveTab('draft')}>
          <FaTools /> Draft Control
        </TabButton>
        <TabButton active={activeTab === 'players'} onClick={() => setActiveTab('players')}>
          <FaUsers /> Player Pool
        </TabButton>
        <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')}>
          <FaUsers /> Teams
        </TabButton>
        <TabButton active={activeTab === 'bracket'} onClick={() => setActiveTab('bracket')}>
          <FaTrophy /> Brackets
        </TabButton>
        <TabButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')}>
          <FaCalendarAlt /> Matches Schedule
        </TabButton>
        <TabButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')}>
          <FaTools /> Bulk JSON
        </TabButton>
      </TabBar>

      {/* --- TAB: DRAFT CONTROL --- */}
      {activeTab === 'draft' && (
        <div>
          <Card>
            <CardTitle>Draft Pick History & Reset</CardTitle>
            <p>Configure draft variables or revert picking mistakes.</p>

            {draftState ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <p><strong>Draft Status:</strong> {draftState.currentPickIndex >= draftState.pickOrder.length ? <Badge variant="success">Completed</Badge> : <Badge variant="primary">In Progress</Badge>}</p>
                <p><strong>Current Pick Number:</strong> {draftState.currentPickIndex + 1} / {draftState.pickOrder.length}</p>
                <p><strong>Draft Pool Size:</strong> {draftState.availablePlayers?.length} players remaining</p>
                <p><strong>Completed Pick Count:</strong> {Object.keys(draftState.completedPicks || {}).length}</p>
              </div>
            ) : (
              <p style={{ color: 'orange' }}>No draft state currently initialized for {division} division.</p>
            )}

            <ButtonGroup>
              <ActionButton variant="primary" onClick={handleUndoLastPick} disabled={!draftState || Object.keys(draftState.completedPicks || {}).length === 0}>
                <FaUndo /> Undo Last Pick
              </ActionButton>
            </ButtonGroup>

            <FloatingConfirm style={{ marginTop: '2rem' }}>
              <div>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={confirmResetDraft}
                    onChange={(e) => setConfirmResetDraft(e.target.checked)}
                  />
                  I understand this will clear current rosters, drafts history and reset all picks for <strong>{division}</strong>.
                </CheckboxLabel>
              </div>
              <ClearButton onClick={handleResetDraft} disabled={!confirmResetDraft}>
                Initialize/Reset Draft
              </ClearButton>
            </FloatingConfirm>
          </Card>

          {draftState && draftState.pickOrder && draftState.pickOrder.length > 0 && (
            <Card style={{ marginTop: '1.5rem' }}>
              <CardTitle>Edit Individual Pick Slots</CardTitle>
              <p>Directly modify, swap, or clear any individual pick assignment in the draft matrix.</p>
              <TableContainer>
                <StyledTable>
                  <thead>
                    <tr>
                      <StyledTh style={{ width: '10%' }}>Pick #</StyledTh>
                      <StyledTh style={{ width: '10%' }}>Round</StyledTh>
                      <StyledTh style={{ width: '20%' }}>Team Picking</StyledTh>
                      <StyledTh style={{ width: '20%' }}>Assigned Player</StyledTh>
                      <StyledTh style={{ width: '25%' }}>Change / Assign Player</StyledTh>
                      <StyledTh style={{ width: '15%' }}>Skip Pick</StyledTh>
                    </tr>
                  </thead>
                  <tbody>
                    {draftState.pickOrder.map((teamId, index) => {
                      const isSkipped = typeof teamId === 'string';
                      const team = isSkipped ? null : teams.find(t => t.id === teamId);
                      const draftedPlayerId = draftState.completedPicks[index];
                      const draftedPlayer = draftedPlayerId ? players.find(p => p.id === draftedPlayerId) : null;

                      const numTeams = draftState.teams?.length || 0;
                      const roundNumber = numTeams > 0 ? Math.floor(index / numTeams) + 1 : 1;

                      const isManuallySkipped = draftState.skippedOriginalTeams && draftState.skippedOriginalTeams[index] !== undefined;

                      if (isSkipped && !isManuallySkipped) {
                        return (
                          <tr key={index} style={{ opacity: 0.6, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <StyledTd>#{index + 1}</StyledTd>
                            <StyledTd>Round {roundNumber}</StyledTd>
                            <StyledTd colSpan={3} style={{ fontStyle: 'italic' }}>
                              Skipped (Forced pick: Captain {teamId})
                            </StyledTd>
                            <StyledTd>
                              <Badge variant="danger">Forced Skip</Badge>
                            </StyledTd>
                          </tr>
                        );
                      }

                      if (isManuallySkipped) {
                        const originalTeamId = draftState.skippedOriginalTeams![index];
                        const originalTeam = teams.find(t => t.id === originalTeamId);
                        return (
                          <tr key={index} style={{ backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
                            <StyledTd><strong>#{index + 1}</strong></StyledTd>
                            <StyledTd>Round {roundNumber}</StyledTd>
                            <StyledTd style={{ fontStyle: 'italic' }}>
                              Skipped ({originalTeam?.name || `Team ${originalTeamId}`})
                            </StyledTd>
                            <StyledTd colSpan={2} style={{ fontStyle: 'italic', color: '#888' }}>
                              Pick slot marked as skipped
                            </StyledTd>
                            <StyledTd>
                              <ActionButton 
                                variant="primary" 
                                onClick={() => handleToggleSkipPick(index)}
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                Restore Pick
                              </ActionButton>
                            </StyledTd>
                          </tr>
                        );
                      }

                      return (
                        <tr key={index}>
                          <StyledTd><strong>#{index + 1}</strong></StyledTd>
                          <StyledTd>Round {roundNumber}</StyledTd>
                          <StyledTd><strong>{team?.name || `Team ${teamId}`}</strong></StyledTd>
                          <StyledTd>
                            {draftedPlayer ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Badge variant="success">{draftedPlayer.name.split('#')[0]}</Badge>
                                <ClearButton 
                                  onClick={() => handleUpdateIndividualPick(index, null)} 
                                  title="Clear Pick Slot"
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                                >
                                  <FaTimes /> Clear
                                </ClearButton>
                              </div>
                            ) : (
                              <span style={{ color: '#aaa', fontStyle: 'italic' }}>TBD (Empty)</span>
                            )}
                          </StyledTd>
                          <StyledTd>
                            <SelectInput
                              value={draftedPlayerId || 0}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val === 0) {
                                  handleUpdateIndividualPick(index, null);
                                } else {
                                  handleUpdateIndividualPick(index, val);
                                }
                              }}
                              style={{ width: '100%', padding: '0.4rem' }}
                            >
                              <option value={0}>-- Assign Player --</option>
                              {draftedPlayer && (
                                <option value={draftedPlayer.id}>{draftedPlayer.name} (Current)</option>
                              )}
                              {draftState.availablePlayers?.map(ap => (
                                <option key={ap.id} value={ap.id}>
                                  {ap.name} ({ap.role})
                                </option>
                              ))}
                            </SelectInput>
                          </StyledTd>
                          <StyledTd>
                            <ClearButton 
                              onClick={() => handleToggleSkipPick(index)}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Skip Pick
                            </ClearButton>
                          </StyledTd>
                        </tr>
                      );
                    })}
                  </tbody>
                </StyledTable>
              </TableContainer>
            </Card>
          )}
        </div>
      )}

      {/* --- TAB: PLAYER POOL --- */}
      {activeTab === 'players' && (
        <div>
          {editingPlayer ? (
            <EditBox>
              <CardTitle>Edit Player details: {editingPlayer.name}</CardTitle>
              <FormLayout>
                <Grid>
                  <FormGroup>
                    <Label>Summoner Name</Label>
                    <TextInput
                      type="text"
                      value={editingPlayer.name}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Primary Role</Label>
                    <SelectInput
                      value={editingPlayer.role}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </SelectInput>
                  </FormGroup>
                </Grid>

                <Grid columns="1fr 1fr 1fr">
                  <FormGroup>
                    <Label>Peak Rank</Label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <SelectInput
                        value={editingPlayer.peakRankTier}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, peakRankTier: e.target.value })}
                      >
                        {RANK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </SelectInput>
                      <SelectInput
                        value={editingPlayer.peakRankDivision}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, peakRankDivision: Number(e.target.value) })}
                      >
                        {DIVISIONS.map(d => <option key={d} value={d}>{d === -1 ? 'N/A' : d}</option>)}
                      </SelectInput>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Solo Rank</Label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <SelectInput
                        value={editingPlayer.soloRankTier}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, soloRankTier: e.target.value })}
                      >
                        {RANK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </SelectInput>
                      <SelectInput
                        value={editingPlayer.soloRankDivision}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, soloRankDivision: Number(e.target.value) })}
                      >
                        {DIVISIONS.map(d => <option key={d} value={d}>{d === -1 ? 'N/A' : d}</option>)}
                      </SelectInput>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Flex Rank</Label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <SelectInput
                        value={editingPlayer.flexRankTier}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, flexRankTier: e.target.value })}
                      >
                        {RANK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </SelectInput>
                      <SelectInput
                        value={editingPlayer.flexRankDivision}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, flexRankDivision: Number(e.target.value) })}
                      >
                        {DIVISIONS.map(d => <option key={d} value={d}>{d === -1 ? 'N/A' : d}</option>)}
                      </SelectInput>
                    </div>
                  </FormGroup>
                </Grid>

                <FormGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={editingPlayer.isCaptain}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, isCaptain: e.target.checked })}
                    />
                    Is Captain?
                  </CheckboxLabel>
                </FormGroup>

                <ButtonGroup style={{ marginTop: '1rem' }}>
                  <ActionButton variant="primary" onClick={handleSaveUpdatedPlayer}>
                    <FaSave /> Save Changes
                  </ActionButton>
                  <ActionButton onClick={() => setEditingPlayer(null)}>
                    <FaTimes /> Cancel
                  </ActionButton>
                </ButtonGroup>
              </FormLayout>
            </EditBox>
          ) : (
            <Grid columns="1fr 2fr">
              {/* Form to Add New Player */}
              <Card>
                <CardTitle>Add New Player</CardTitle>
                <form onSubmit={handleCreatePlayer}>
                  <FormLayout>
                    <FormGroup>
                      <Label>Summoner Name</Label>
                      <TextInput
                        type="text"
                        placeholder="Player#NA1"
                        value={newPlayerForm.name}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, name: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Primary Role</Label>
                      <SelectInput
                        value={newPlayerForm.role}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, role: e.target.value })}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </SelectInput>
                    </FormGroup>

                    <FormGroup>
                      <Label>Peak Rank</Label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <SelectInput
                          value={newPlayerForm.peakRankTier}
                          onChange={(e) => setNewPlayerForm({ ...newPlayerForm, peakRankTier: e.target.value })}
                        >
                          {RANK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                        </SelectInput>
                        <SelectInput
                          value={newPlayerForm.peakRankDivision}
                          onChange={(e) => setNewPlayerForm({ ...newPlayerForm, peakRankDivision: Number(e.target.value) })}
                        >
                          {DIVISIONS.map(d => <option key={d} value={d}>{d === -1 ? 'N/A' : d}</option>)}
                        </SelectInput>
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <CheckboxLabel>
                        <input
                          type="checkbox"
                          checked={newPlayerForm.isCaptain}
                          onChange={(e) => setNewPlayerForm({ ...newPlayerForm, isCaptain: e.target.checked })}
                        />
                        Is Captain?
                      </CheckboxLabel>
                    </FormGroup>

                    <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '0.5rem 0' }} />

                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={newPlayerForm.addToPool}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, addToPool: e.target.checked })}
                      />
                      Add to Player Pool
                    </CheckboxLabel>

                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={newPlayerForm.addToDraft}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, addToDraft: e.target.checked })}
                      />
                      Add to Draft Available List
                    </CheckboxLabel>

                    <ActionButton type="submit" variant="primary" style={{ marginTop: '0.5rem' }}>
                      <FaPlus /> Add Player
                    </ActionButton>
                  </FormLayout>
                </form>
              </Card>

              {/* Player Pool List */}
              <Card>
                <CardTitle>Player list ({filteredPlayers.length})</CardTitle>
                <SearchInput
                  type="text"
                  placeholder="Filter players by name/role..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                />
                <TableContainer>
                  <StyledTable>
                    <thead>
                      <tr>
                        <StyledTh>Name</StyledTh>
                        <StyledTh>Role</StyledTh>
                        <StyledTh>Peak</StyledTh>
                        <StyledTh>Cap</StyledTh>
                        <StyledTh>Draft Pool</StyledTh>
                        <StyledTh>Actions</StyledTh>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map(p => {
                        const inDraftAvail = draftState?.availablePlayers?.some(dp => dp.id === p.id);
                        const isDrafted = draftState?.teams?.some(t => t.players?.some(tp => tp.id === p.id));
                        return (
                          <tr key={p.id}>
                            <StyledTd><strong>{p.name.split('#')[0]}</strong> <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>#{p.name.split('#')[1] || 'NA1'}</span></StyledTd>
                            <StyledTd>{p.role}</StyledTd>
                            <StyledTd>{rankTierToShortName(p.peakRankTier)}{p.peakRankDivision !== -1 ? p.peakRankDivision : ''}</StyledTd>
                            <StyledTd>{p.isCaptain ? <Badge variant="danger">Yes</Badge> : 'No'}</StyledTd>
                            <StyledTd>
                              {isDrafted ? (
                                <Badge variant="success">Drafted</Badge>
                              ) : inDraftAvail ? (
                                <Badge variant="primary">Available</Badge>
                              ) : (
                                <Badge variant="warning">Missing</Badge>
                              )}
                            </StyledTd>
                            <StyledTd>
                              <ButtonGroup>
                                <ActionButton onClick={() => setEditingPlayer(p)}><FaEdit /></ActionButton>
                                {!inDraftAvail && !isDrafted && (
                                  <ActionButton variant="primary" onClick={() => handleAddPlayerToDraftPool(p)} title="Add to draft pool">
                                    <FaPlus /> Pool
                                  </ActionButton>
                                )}
                                <ClearButton onClick={() => handleDeletePlayer(p.id, true, true)} title="Delete completely"><FaTrash /></ClearButton>
                              </ButtonGroup>
                            </StyledTd>
                          </tr>
                        );
                      })}
                    </tbody>
                  </StyledTable>
                </TableContainer>
              </Card>
            </Grid>
          )}
        </div>
      )}

      {/* --- TAB: TEAMS --- */}
      {activeTab === 'teams' && (
        <div>
          {editingTeam ? (
            <EditBox>
              <CardTitle>Edit Team: {editingTeam.name}</CardTitle>
              <FormLayout>
                <Grid>
                  <FormGroup>
                    <Label>Team Name</Label>
                    <TextInput
                      type="text"
                      value={editingTeam.name}
                      onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Record (Wins - Losses)</Label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <TextInput
                        type="number"
                        placeholder="Wins"
                        value={editingTeam.wins}
                        onChange={(e) => setEditingTeam({ ...editingTeam, wins: Number(e.target.value), record: `${e.target.value}-${editingTeam.losses}` })}
                      />
                      <TextInput
                        type="number"
                        placeholder="Losses"
                        value={editingTeam.losses}
                        onChange={(e) => setEditingTeam({ ...editingTeam, losses: Number(e.target.value), record: `${editingTeam.wins}-${e.target.value}` })}
                      />
                    </div>
                  </FormGroup>
                </Grid>

                <Grid>
                  <FormGroup>
                    <Label>Game Record (Game Wins - Game Losses)</Label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <TextInput
                        type="number"
                        placeholder="Game Wins"
                        value={editingTeam.gameWins}
                        onChange={(e) => setEditingTeam({ ...editingTeam, gameWins: Number(e.target.value), gameRecord: `${e.target.value}-${editingTeam.gameLosses}` })}
                      />
                      <TextInput
                        type="number"
                        placeholder="Game Losses"
                        value={editingTeam.gameLosses}
                        onChange={(e) => setEditingTeam({ ...editingTeam, gameLosses: Number(e.target.value), gameRecord: `${editingTeam.gameWins}-${e.target.value}` })}
                      />
                    </div>
                  </FormGroup>
                </Grid>

                <ButtonGroup style={{ marginTop: '1rem' }}>
                  <ActionButton variant="primary" onClick={handleSaveTeamDetails}>
                    <FaSave /> Save Team
                  </ActionButton>
                  <ActionButton onClick={() => setEditingTeam(null)}>
                    <FaTimes /> Cancel
                  </ActionButton>
                </ButtonGroup>
              </FormLayout>
            </EditBox>
          ) : (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <CardTitle style={{ border: 'none', margin: 0 }}>Tournament Teams List ({teams.length})</CardTitle>
                <ActionButton variant="primary" onClick={handleCreateTeamsFromDraft}>
                  Create/Sync Teams from Draft Pool
                </ActionButton>
              </div>

              <TableContainer>
                <StyledTable>
                  <thead>
                    <tr>
                      <StyledTh>ID</StyledTh>
                      <StyledTh>Team Name</StyledTh>
                      <StyledTh>Match Record</StyledTh>
                      <StyledTh>Game Record</StyledTh>
                      <StyledTh>Roster Players</StyledTh>
                      <StyledTh>Actions</StyledTh>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map(t => (
                      <tr key={t.id}>
                        <StyledTd>{t.id}</StyledTd>
                        <StyledTd><strong>{t.name}</strong></StyledTd>
                        <StyledTd>{t.record || `${t.wins}-${t.losses}`}</StyledTd>
                        <StyledTd>{t.gameRecord || `${t.gameWins}-${t.gameLosses}`}</StyledTd>
                        <StyledTd>{t.players?.join(', ') || 'Roster empty'}</StyledTd>
                        <StyledTd>
                          <ActionButton onClick={() => setEditingTeam(t)}><FaEdit /> Edit</ActionButton>
                        </StyledTd>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableContainer>
            </Card>
          )}
        </div>
      )}

      {/* --- TAB: BRACKETS --- */}
      {activeTab === 'bracket' && (
        <Card>
          <CardTitle>Brackets Rounds & Seed Management</CardTitle>
          <p>Update teams, statuses, or scores for bracket rounds.</p>

          {bracket.length === 0 ? (
            <p>No brackets round initialized. Use bulk upload or create a bracket structure.</p>
          ) : (
            bracket.map((round, rIdx) => (
              <div key={round.title} style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1.5rem' }}>
                <h4>{round.title}</h4>
                <TableContainer>
                  <StyledTable>
                    <thead>
                      <tr>
                        <StyledTh>Seed ID</StyledTh>
                        <StyledTh>Team 1</StyledTh>
                        <StyledTh>Team 2</StyledTh>
                        <StyledTh>Week</StyledTh>
                        <StyledTh>Status</StyledTh>
                        <StyledTh>Score</StyledTh>
                        <StyledTh>Winner</StyledTh>
                        <StyledTh>Knockout?</StyledTh>
                      </tr>
                    </thead>
                    <tbody>
                      {round.seeds?.map((seed, sIdx) => (
                        <tr key={seed.id}>
                          <StyledTd>{seed.id}</StyledTd>
                          <StyledTd>
                            <SelectInput
                              value={seed.team1Id || 0}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { team1Id: Number(e.target.value) })}
                            >
                              <option value={0}>TBD</option>
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </SelectInput>
                          </StyledTd>
                          <StyledTd>
                            <SelectInput
                              value={seed.team2Id || 0}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { team2Id: Number(e.target.value) })}
                            >
                              <option value={0}>TBD</option>
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </SelectInput>
                          </StyledTd>
                          <StyledTd>
                            <TextInput
                              type="number"
                              style={{ width: '60px' }}
                              value={seed.weekPlayed || 1}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { weekPlayed: Number(e.target.value) })}
                            />
                          </StyledTd>
                          <StyledTd>
                            <SelectInput
                              value={seed.status}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { status: e.target.value })}
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="completed">Completed</option>
                            </SelectInput>
                          </StyledTd>
                          <StyledTd>
                            <TextInput
                              type="text"
                              style={{ width: '80px' }}
                              placeholder="0-0"
                              value={seed.score || ''}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { score: e.target.value })}
                            />
                          </StyledTd>
                          <StyledTd>
                            <SelectInput
                              value={seed.winnerId || 0}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { winnerId: Number(e.target.value) || null })}
                            >
                              <option value={0}>None</option>
                              {seed.team1Id && <option value={seed.team1Id}>Team 1 (ID: {seed.team1Id})</option>}
                              {seed.team2Id && <option value={seed.team2Id}>Team 2 (ID: {seed.team2Id})</option>}
                            </SelectInput>
                          </StyledTd>
                          <StyledTd>
                            <input
                              type="checkbox"
                              checked={seed.isKnockout}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { isKnockout: e.target.checked })}
                            />
                          </StyledTd>
                        </tr>
                      ))}
                    </tbody>
                  </StyledTable>
                </TableContainer>
              </div>
            ))
          )}
        </Card>
      )}

      {/* --- TAB: MATCHES SCHEDULE --- */}
      {activeTab === 'matches' && (
        <div>
          {editingMatch ? (
            <EditBox>
              <CardTitle>Edit Match ID: {editingMatch.id}</CardTitle>
              <FormLayout>
                <Grid>
                  <FormGroup>
                    <Label>Team 1</Label>
                    <SelectInput
                      value={editingMatch.team1Id}
                      onChange={(e) => setEditingMatch({ ...editingMatch, team1Id: Number(e.target.value) })}
                    >
                      <option value={0}>Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </SelectInput>
                  </FormGroup>
                  <FormGroup>
                    <Label>Team 2</Label>
                    <SelectInput
                      value={editingMatch.team2Id}
                      onChange={(e) => setEditingMatch({ ...editingMatch, team2Id: Number(e.target.value) })}
                    >
                      <option value={0}>Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </SelectInput>
                  </FormGroup>
                </Grid>

                <Grid columns="1fr 1fr 1fr">
                  <FormGroup>
                    <Label>Match Status</Label>
                    <SelectInput
                      value={editingMatch.status}
                      onChange={(e) => setEditingMatch({ ...editingMatch, status: e.target.value as 'upcoming' | 'completed' })}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </SelectInput>
                  </FormGroup>
                  <FormGroup>
                    <Label>Winner ID</Label>
                    <SelectInput
                      value={editingMatch.winnerId || 0}
                      onChange={(e) => setEditingMatch({ ...editingMatch, winnerId: Number(e.target.value) || null })}
                    >
                      <option value={0}>None</option>
                      <option value={editingMatch.team1Id}>Team 1 (ID: {editingMatch.team1Id})</option>
                      <option value={editingMatch.team2Id}>Team 2 (ID: {editingMatch.team2Id})</option>
                    </SelectInput>
                  </FormGroup>
                  <FormGroup>
                    <Label>Score (e.g. 2-1)</Label>
                    <TextInput
                      type="text"
                      placeholder="Score"
                      value={editingMatch.score || ''}
                      onChange={(e) => setEditingMatch({ ...editingMatch, score: e.target.value })}
                    />
                  </FormGroup>
                </Grid>

                <Grid columns="2fr 1fr">
                  <FormGroup>
                    <Label>Tournament Code (shortCode)</Label>
                    <TextInput
                      type="text"
                      placeholder="Riot Code"
                      value={editingMatch.tournamentCodes?.join(', ') || ''}
                      onChange={(e) => setEditingMatch({ ...editingMatch, tournamentCodes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Week Played</Label>
                    <TextInput
                      type="number"
                      value={editingMatch.weekPlayed}
                      onChange={(e) => setEditingMatch({ ...editingMatch, weekPlayed: Number(e.target.value) })}
                    />
                  </FormGroup>
                </Grid>

                <ButtonGroup style={{ marginTop: '1rem' }}>
                  <ActionButton variant="primary" onClick={handleSaveMatchDetails}>
                    <FaSave /> Save Match
                  </ActionButton>
                  <ActionButton onClick={() => setEditingMatch(null)}>
                    <FaTimes /> Cancel
                  </ActionButton>
                </ButtonGroup>
              </FormLayout>
            </EditBox>
          ) : (
            <Grid columns="1fr 2fr">
              {/* Form to Create Match */}
              <div>
                <Card>
                  <CardTitle>Create New Match</CardTitle>
                  <form onSubmit={handleCreateMatch}>
                  <FormLayout>
                    <FormGroup>
                      <Label>Match Unique ID (e.g. 101 or match_1)</Label>
                      <TextInput
                        type="text"
                        placeholder="Unique Match ID"
                        value={newMatchForm.id}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, id: e.target.value })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Team 1</Label>
                      <SelectInput
                        value={newMatchForm.team1Id}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, team1Id: Number(e.target.value) })}
                        required
                      >
                        <option value={0}>Select Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </SelectInput>
                    </FormGroup>

                    <FormGroup>
                      <Label>Team 2</Label>
                      <SelectInput
                        value={newMatchForm.team2Id}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, team2Id: Number(e.target.value) })}
                        required
                      >
                        <option value={0}>Select Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </SelectInput>
                    </FormGroup>

                    <FormGroup>
                      <Label>Week Played</Label>
                      <TextInput
                        type="number"
                        value={newMatchForm.weekPlayed}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, weekPlayed: Number(e.target.value) })}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Stage / Label</Label>
                      <TextInput
                        type="text"
                        placeholder="e.g. Group Stage, Semifinals"
                        value={newMatchForm.stage}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, stage: e.target.value })}
                      />
                    </FormGroup>

                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={newMatchForm.isKnockout}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, isKnockout: e.target.checked })}
                      />
                      Is Bracket/Knockout?
                    </CheckboxLabel>

                    <ActionButton type="submit" variant="primary" style={{ marginTop: '0.5rem' }}>
                      <FaPlus /> Create Match
                    </ActionButton>
                  </FormLayout>
                </form>
              </Card>

              <Card style={{ marginTop: '1.5rem' }}>
                <CardTitle>Generate Swiss Stage</CardTitle>
                <p>Automatically generate Round 1 Swiss matchup pairings based on the first-round draft pick order.</p>
                <ActionButton variant="primary" onClick={handleGenerateSwissStage}>
                  Generate Swiss Stage (Round 1)
                </ActionButton>
              </Card>
            </div>

            {/* Match Schedule Table */}
              <Card>
                <CardTitle>Matches list ({matches.length})</CardTitle>
                <TableContainer>
                  <StyledTable>
                    <thead>
                      <tr>
                        <StyledTh>ID</StyledTh>
                        <StyledTh>Week</StyledTh>
                        <StyledTh>Teams Matchup</StyledTh>
                        <StyledTh>Status</StyledTh>
                        <StyledTh>Winner</StyledTh>
                        <StyledTh>Score</StyledTh>
                        <StyledTh>Actions</StyledTh>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map(m => {
                        const t1 = teams.find(t => t.id === m.team1Id);
                        const t2 = teams.find(t => t.id === m.team2Id);
                        const winnerTeam = m.winnerId ? (m.winnerId === m.team1Id ? t1 : t2) : null;
                        return (
                          <tr key={m.id}>
                            <StyledTd>{m.id}</StyledTd>
                            <StyledTd>{m.weekPlayed}</StyledTd>
                            <StyledTd>
                              <strong>{t1?.name || `Team ${m.team1Id}`}</strong>
                              <span style={{ margin: '0 0.25rem', opacity: 0.5 }}>vs</span>
                              <strong>{t2?.name || `Team ${m.team2Id}`}</strong>
                            </StyledTd>
                            <StyledTd>
                              {m.status === 'completed' ? <Badge variant="success">Completed</Badge> : <Badge variant="warning">Upcoming</Badge>}
                            </StyledTd>
                            <StyledTd>{winnerTeam ? winnerTeam.name : '-'}</StyledTd>
                            <StyledTd>{m.score || '-'}</StyledTd>
                            <StyledTd>
                              <ButtonGroup>
                                <ActionButton onClick={() => setEditingMatch(m)}><FaEdit /></ActionButton>
                                <ClearButton onClick={() => handleDeleteMatch(m.id)}><FaTrash /></ClearButton>
                              </ButtonGroup>
                            </StyledTd>
                          </tr>
                        );
                      })}
                    </tbody>
                  </StyledTable>
                </TableContainer>
              </Card>
            </Grid>
          )}
        </div>
      )}

      {/* --- TAB: BULK JSON IMPORT --- */}
      {activeTab === 'bulk' && (
        <Card>
          <CardTitle>Legacy Bulk JSON Import/Export</CardTitle>
          <p>Directly load or retrieve arrays of JSON documents to/from the database.</p>

          <SelectionContainer style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '1.5rem' }}>
            <FormGroup>
              <AdminLabel htmlFor="bulk-data-select">Data type to upload</AdminLabel>
              <AdminSelect
                id="bulk-data-select"
                value={selectedBulkType}
                onChange={(e) => setSelectedBulkType(e.target.value as DataType)}
              >
                <option value="players">Players</option>
                <option value="teams">Teams</option>
                <option value="bracket">Bracket</option>
                <option value="matches">Matches</option>
              </AdminSelect>
            </FormGroup>
          </SelectionContainer>

          <Form onSubmit={handleBulkSubmit}>
            <TextArea
              value={bulkJsonString}
              onChange={(e) => setBulkJsonString(e.target.value)}
              placeholder={
                selectedBulkType === 'players' ? PLAYER_JSON_PLACEHOLDER :
                selectedBulkType === 'teams' ? TEAM_JSON_PLACEHOLDER :
                selectedBulkType === 'bracket' ? BRACKET_JSON_PLACEHOLDER :
                MATCHES_JSON_PLACEHOLDER
              }
              required
            />
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Committing bulk updates...' : 'Submit Bulk Changes'}
            </Button>
          </Form>
        </Card>
      )}
    </AdminPageContainer>
  );
};

export default AdminPage;
