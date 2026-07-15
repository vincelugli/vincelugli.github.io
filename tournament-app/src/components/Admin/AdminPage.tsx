import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { doc, getDoc, updateDoc, writeBatch, setDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import {getFunctions, httpsCallable} from 'firebase/functions';
import { BracketRound, Player, Team, Match, DraftState, DraftTeam } from '../../types';
import Button from '../Common/Button';
import { useNavigate } from 'react-router-dom';
import { useDivision } from '../../context/DivisionContext';
import { z } from 'zod';
import { useAuth } from '../Common/AuthContext';
import { getFirebasePrefix, compareRanks, rankTierToShortName, convertRankToElo, isPlayerCaptain } from '../../utils';
import {FaUndo, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaSpinner, FaTools, FaUsers, FaTrophy, FaCalendarAlt, FaLink, FaCopy, FaCheck} from 'react-icons/fa';
import {
  AdminPageContainer,
  AdminTitle,
  SelectionContainer,
  AdminLabel,
  AdminSelect,
  Form,
  TextArea,
  AdminTabBar,
  AdminTabButton,
  AdminCard,
  AdminCardTitle,
  AdminGrid,
  AdminTableContainer,
  AdminStyledTable,
  AdminStyledTh,
  AdminStyledTd,
  AdminFormLayout,
  AdminFormGroup,
  AdminFormLabel,
  AdminTextInput,
  AdminSelectInput,
  AdminCheckboxLabel,
  AdminSearchInput,
  AdminBadge,
  AdminButtonGroup,
  AdminStatusText,
  AdminActionButton,
  AdminClearButton,
  AdminIconButton,
  AdminEditBox,
  AdminFloatingConfirm,
} from '../../styles/index';


// Constants
const RANK_TIERS = ["Challenger", "Grandmaster", "Master", "Diamond", "Emerald", "Platinum", "Gold", "Silver", "Bronze", "Iron", "Unranked"];
const ROLES = ["top", "jungle", "mid", "adc", "support", "fill"];
const DIVISIONS = [1, 2, 3, 4, -1];

type TabType = 'draft' | 'players' | 'teams' | 'bracket' | 'matches' | 'codes' | 'casters' | 'bulk';
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

  // Tournament codes generation state
  const [selectedMatchForCodes, setSelectedMatchForCodes] = useState<string | number>('');
  const [codesCount, setCodesCount] = useState(1);
  const [codesIsKnockout, setCodesIsKnockout] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const prefix = getFirebasePrefix();

  // Casters state
  const [casterCodes, setCasterCodes] = useState<{ [id: string]: { name: string, accessCode: string } }>({});
  const [newCasterName, setNewCasterName] = useState('');

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

    const castersCodesRef = doc(db, 'teamAccessCodes', `${prefix}_casters`);
    const unsubscribeCastersCodes = onSnapshot(castersCodesRef, (snapshot) => {
      if (snapshot.exists()) {
        setCasterCodes(snapshot.data() as { [id: string]: { name: string, accessCode: string } });
      } else {
        setCasterCodes({});
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
      unsubscribeCastersCodes();
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

  const handleCreateCasterCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCasterName.trim()) {
      showStatus('error', 'Caster name is required.');
      return;
    }
    try {
      setStatus('loading');
      setStatusMsg('Generating caster access code...');
      
      const nextId = 'caster_' + (Object.keys(casterCodes).length > 0
        ? Math.max(...Object.keys(casterCodes).map(k => Number(k.replace('caster_', '')))) + 1
        : 1);
        
      const codeAlphabet = 'ABCDEFGHJKLMNOPQRSTUVWXYZ23456789';
      let code = '';
      const existingCodes = Object.values(casterCodes).map(c => c.accessCode);
      
      // Ensure unique code
      do {
        code = '';
        for (let i = 0; i < 6; i++) {
          code += codeAlphabet.charAt(Math.floor(Math.random() * codeAlphabet.length));
        }
      } while (existingCodes.includes(code));

      const updatedCasters = {
        ...casterCodes,
        [nextId]: {
          name: newCasterName.trim(),
          accessCode: code
        }
      };

      await setDoc(doc(db, 'teamAccessCodes', `${prefix}_casters`), updatedCasters);
      setNewCasterName('');
      showStatus('success', `Created caster code for ${newCasterName.trim()}: ${code}`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to generate caster access code.');
    }
  };

  const handleDeleteCasterCode = async (casterId: string) => {
    const caster = casterCodes[casterId];
    if (!caster) return;
    if (!window.confirm(`Are you sure you want to delete the caster code for ${caster.name}?`)) return;

    try {
      setStatus('loading');
      setStatusMsg(`Deleting caster code for ${caster.name}...`);
      
      const updatedCasters = { ...casterCodes };
      delete updatedCasters[casterId];
      
      await setDoc(doc(db, 'teamAccessCodes', `${prefix}_casters`), updatedCasters);
      showStatus('success', `Deleted caster code for ${caster.name}.`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'Failed to delete caster access code.');
    }
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForCodes) {
      showStatus('error', 'Please select a match first.');
      return;
    }

    try {
      setStatus('loading');
      setStatusMsg('Contacting Riot Games API and creating codes...');

      const functions = getFunctions();
      const generateCodesFn = httpsCallable(functions, 'generateTournamentCodesForMatch');

      const year = prefix.replace('grumble', '');

      const result = await generateCodesFn({
        division,
        matchId: selectedMatchForCodes,
        count: codesCount,
        isKnockout: codesIsKnockout,
        year
      });

      const newCodes = (result.data as {codes: string[]}).codes;
      showStatus('success', `Successfully generated ${newCodes.length} tournament codes: ${newCodes.join(', ')}`);

      setSelectedMatchForCodes('');
      setCodesCount(1);
      setCodesIsKnockout(false);
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to generate tournament codes.');
    }
  };

  const handleBulkGenerateCodesForMissing = async (e: React.MouseEvent) => {
    e.preventDefault();
    const matchesWithoutCodes = matches.filter(m => !m.tournamentCodes || m.tournamentCodes.length === 0);
    
    if (matchesWithoutCodes.length === 0) {
      showStatus('success', 'All matches already have tournament codes!');
      return;
    }

    const confirmMsg = `Are you sure you want to generate ${codesCount} codes for all ${matchesWithoutCodes.length} matches that currently have no codes?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setStatus('loading');
      const functions = getFunctions();
      const generateCodesFn = httpsCallable(functions, 'generateTournamentCodesForMatch');
      const year = prefix.replace('grumble', '');

      let successCount = 0;
      for (const m of matchesWithoutCodes) {
        setStatusMsg(`Generating codes for match ${m.id} (${successCount + 1}/${matchesWithoutCodes.length})...`);
        await generateCodesFn({
          division,
          matchId: m.id,
          count: codesCount,
          isKnockout: codesIsKnockout,
          year
        });
        successCount++;
      }

      showStatus('success', `Successfully generated tournament codes for ${successCount} matches.`);
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Failed to bulk generate tournament codes.');
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
        <AdminStatusText status={status === 'success' ? 'success' : status === 'error' ? 'error' : 'loading'}>
          {status === 'loading' && <FaSpinner className="spin" style={{ marginRight: '0.5rem' }} />}
          {statusMsg}
        </AdminStatusText>
      )}

      {/* Primary Tab Navigation */}
      <AdminTabBar>
        <AdminTabButton active={activeTab === 'draft'} onClick={() => setActiveTab('draft')}>
          <FaTools /> Draft Control
        </AdminTabButton>
        <AdminTabButton active={activeTab === 'players'} onClick={() => setActiveTab('players')}>
          <FaUsers /> Player Pool
        </AdminTabButton>
        <AdminTabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')}>
          <FaUsers /> Teams
        </AdminTabButton>
        <AdminTabButton active={activeTab === 'bracket'} onClick={() => setActiveTab('bracket')}>
          <FaTrophy /> Brackets
        </AdminTabButton>
        <AdminTabButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')}>
          <FaCalendarAlt /> Matches Schedule
        </AdminTabButton>
        <AdminTabButton active={activeTab === 'codes'} onClick={() => setActiveTab('codes')}>
          <FaLink /> Tournament Codes
        </AdminTabButton>
        <AdminTabButton active={activeTab === 'casters'} onClick={() => setActiveTab('casters')}>
          <FaUsers /> Caster Codes
        </AdminTabButton>
        <AdminTabButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')}>
          <FaTools /> Bulk JSON
        </AdminTabButton>
      </AdminTabBar>

      {/* --- TAB: DRAFT CONTROL --- */}
      {activeTab === 'draft' && (
        <div>
          <AdminCard>
            <AdminCardTitle>Draft Pick History & Reset</AdminCardTitle>
            <p>Configure draft variables or revert picking mistakes.</p>

            {draftState ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <p><strong>Draft Status:</strong> {draftState.currentPickIndex >= draftState.pickOrder.length ? <AdminBadge variant="success">Completed</AdminBadge> : <AdminBadge variant="primary">In Progress</AdminBadge>}</p>
                <p><strong>Current Pick Number:</strong> {draftState.currentPickIndex + 1} / {draftState.pickOrder.length}</p>
                <p><strong>Draft Pool Size:</strong> {draftState.availablePlayers?.length} players remaining</p>
                <p><strong>Completed Pick Count:</strong> {Object.keys(draftState.completedPicks || {}).length}</p>
              </div>
            ) : (
              <p style={{ color: 'orange' }}>No draft state currently initialized for {division} division.</p>
            )}

            <AdminButtonGroup>
              <AdminActionButton variant="primary" onClick={handleUndoLastPick} disabled={!draftState || Object.keys(draftState.completedPicks || {}).length === 0}>
                <FaUndo /> Undo Last Pick
              </AdminActionButton>
            </AdminButtonGroup>

            <AdminFloatingConfirm style={{ marginTop: '2rem' }}>
              <div>
                <AdminCheckboxLabel>
                  <input
                    type="checkbox"
                    checked={confirmResetDraft}
                    onChange={(e) => setConfirmResetDraft(e.target.checked)}
                  />
                  I understand this will clear current rosters, drafts history and reset all picks for <strong>{division}</strong>.
                </AdminCheckboxLabel>
              </div>
              <AdminClearButton onClick={handleResetDraft} disabled={!confirmResetDraft}>
                Initialize/Reset Draft
              </AdminClearButton>
            </AdminFloatingConfirm>
          </AdminCard>

          {draftState && draftState.pickOrder && draftState.pickOrder.length > 0 && (
            <AdminCard style={{ marginTop: '1.5rem' }}>
              <AdminCardTitle>Edit Individual Pick Slots</AdminCardTitle>
              <p>Directly modify, swap, or clear any individual pick assignment in the draft matrix.</p>
              <AdminTableContainer>
                <AdminStyledTable>
                  <thead>
                    <tr>
                      <AdminStyledTh style={{ width: '10%' }}>Pick #</AdminStyledTh>
                      <AdminStyledTh style={{ width: '10%' }}>Round</AdminStyledTh>
                      <AdminStyledTh style={{ width: '20%' }}>Team Picking</AdminStyledTh>
                      <AdminStyledTh style={{ width: '20%' }}>Assigned Player</AdminStyledTh>
                      <AdminStyledTh style={{ width: '25%' }}>Change / Assign Player</AdminStyledTh>
                      <AdminStyledTh style={{ width: '15%' }}>Skip Pick</AdminStyledTh>
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
                            <AdminStyledTd>#{index + 1}</AdminStyledTd>
                            <AdminStyledTd>Round {roundNumber}</AdminStyledTd>
                            <AdminStyledTd colSpan={3} style={{ fontStyle: 'italic' }}>
                              Skipped (Forced pick: Captain {teamId})
                            </AdminStyledTd>
                            <AdminStyledTd>
                              <AdminBadge variant="danger">Forced Skip</AdminBadge>
                            </AdminStyledTd>
                          </tr>
                        );
                      }

                      if (isManuallySkipped) {
                        const originalTeamId = draftState.skippedOriginalTeams![index];
                        const originalTeam = teams.find(t => t.id === originalTeamId);
                        return (
                          <tr key={index} style={{ backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
                            <AdminStyledTd><strong>#{index + 1}</strong></AdminStyledTd>
                            <AdminStyledTd>Round {roundNumber}</AdminStyledTd>
                            <AdminStyledTd style={{ fontStyle: 'italic' }}>
                              Skipped ({originalTeam?.name || `Team ${originalTeamId}`})
                            </AdminStyledTd>
                            <AdminStyledTd colSpan={2} style={{ fontStyle: 'italic', color: '#888' }}>
                              Pick slot marked as skipped
                            </AdminStyledTd>
                            <AdminStyledTd>
                              <AdminActionButton 
                                variant="primary" 
                                onClick={() => handleToggleSkipPick(index)}
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                Restore Pick
                              </AdminActionButton>
                            </AdminStyledTd>
                          </tr>
                        );
                      }

                      return (
                        <tr key={index}>
                          <AdminStyledTd><strong>#{index + 1}</strong></AdminStyledTd>
                          <AdminStyledTd>Round {roundNumber}</AdminStyledTd>
                          <AdminStyledTd><strong>{team?.name || `Team ${teamId}`}</strong></AdminStyledTd>
                          <AdminStyledTd>
                            {draftedPlayer ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AdminBadge variant="success">{draftedPlayer.name.split('#')[0]}</AdminBadge>
                                <AdminClearButton 
                                  onClick={() => handleUpdateIndividualPick(index, null)} 
                                  title="Clear Pick Slot"
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                                >
                                  <FaTimes /> Clear
                                </AdminClearButton>
                              </div>
                            ) : (
                              <span style={{ color: '#aaa', fontStyle: 'italic' }}>TBD (Empty)</span>
                            )}
                          </AdminStyledTd>
                          <AdminStyledTd>
                            <AdminSelectInput
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
                            </AdminSelectInput>
                          </AdminStyledTd>
                          <AdminStyledTd>
                            <AdminClearButton 
                              onClick={() => handleToggleSkipPick(index)}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Skip Pick
                            </AdminClearButton>
                          </AdminStyledTd>
                        </tr>
                      );
                    })}
                  </tbody>
                </AdminStyledTable>
              </AdminTableContainer>
            </AdminCard>
          )}
        </div>
      )}

      {/* --- TAB: PLAYER POOL --- */}
      {activeTab === 'players' && (
        <div>
          {editingPlayer ? (
            <AdminEditBox>
              <AdminCardTitle>Edit Player details: {editingPlayer.name}</AdminCardTitle>
              <AdminFormLayout>
                <AdminGrid>
                  <AdminFormGroup>
                    <AdminFormLabel>Summoner Name</AdminFormLabel>
                    <AdminTextInput
                      type="text"
                      value={editingPlayer.name}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    />
                  </AdminFormGroup>
                  <AdminFormGroup>
                    <AdminFormLabel>Primary Role</AdminFormLabel>
                    <AdminSelectInput
                      value={editingPlayer.role}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </AdminSelectInput>
                  </AdminFormGroup>
                </AdminGrid>

                <AdminGrid columns="1fr 1fr 1fr">
                  <AdminFormGroup>
                    <AdminFormLabel>Peak Rank</AdminFormLabel>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <AdminSelectInput
                        value={editingPlayer.peakRankTier}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, peakRankTier: e.target.value })}
                      >
                        {RANK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </AdminSelectInput>
                      <AdminSelectInput
                        value={editingPlayer.peakRankDivision}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, peakRankDivision: Number(e.target.value) })}
                      >
                        {DIVISIONS.map(d => <option key={d} value={d}>{d === -1 ? 'N/A' : d}</option>)}
                      </AdminSelectInput>
                    </div>
                  </AdminFormGroup>
                  <AdminFormGroup>
                    <AdminFormLabel>Solo Rank</AdminFormLabel>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <AdminSelectInput
                        value={editingPlayer.soloRankTier}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, soloRankTier: e.target.value })}
                      >
                        {RANK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </AdminSelectInput>
                      <AdminSelectInput
                        value={editingPlayer.soloRankDivision}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, soloRankDivision: Number(e.target.value) })}
                      >
                        {DIVISIONS.map(d => <option key={d} value={d}>{d === -1 ? 'N/A' : d}</option>)}
                      </AdminSelectInput>
                    </div>
                  </AdminFormGroup>
                  <AdminFormGroup>
                    <AdminFormLabel>Flex Rank</AdminFormLabel>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <AdminSelectInput
                        value={editingPlayer.flexRankTier}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, flexRankTier: e.target.value })}
                      >
                        {RANK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                      </AdminSelectInput>
                      <AdminSelectInput
                        value={editingPlayer.flexRankDivision}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, flexRankDivision: Number(e.target.value) })}
                      >
                        {DIVISIONS.map(d => <option key={d} value={d}>{d === -1 ? 'N/A' : d}</option>)}
                      </AdminSelectInput>
                    </div>
                  </AdminFormGroup>
                </AdminGrid>

                <AdminFormGroup>
                  <AdminCheckboxLabel>
                    <input
                      type="checkbox"
                      checked={editingPlayer.isCaptain}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, isCaptain: e.target.checked })}
                    />
                    Is Captain?
                  </AdminCheckboxLabel>
                </AdminFormGroup>

                <AdminButtonGroup style={{ marginTop: '1rem' }}>
                  <AdminActionButton variant="primary" onClick={handleSaveUpdatedPlayer}>
                    <FaSave /> Save Changes
                  </AdminActionButton>
                  <AdminActionButton onClick={() => setEditingPlayer(null)}>
                    <FaTimes /> Cancel
                  </AdminActionButton>
                </AdminButtonGroup>
              </AdminFormLayout>
            </AdminEditBox>
          ) : (
            <AdminGrid columns="1fr 2fr">
              {/* Form to Add New Player */}
              <AdminCard>
                <AdminCardTitle>Add New Player</AdminCardTitle>
                <form onSubmit={handleCreatePlayer}>
                  <AdminFormLayout>
                    <AdminFormGroup>
                      <AdminFormLabel>Summoner Name</AdminFormLabel>
                      <AdminTextInput
                        type="text"
                        placeholder="Player#NA1"
                        value={newPlayerForm.name}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, name: e.target.value })}
                        required
                      />
                    </AdminFormGroup>

                    <AdminFormGroup>
                      <AdminFormLabel>Primary Role</AdminFormLabel>
                      <AdminSelectInput
                        value={newPlayerForm.role}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, role: e.target.value })}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </AdminSelectInput>
                    </AdminFormGroup>

                    <AdminFormGroup>
                      <AdminFormLabel>Peak Rank</AdminFormLabel>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <AdminSelectInput
                          value={newPlayerForm.peakRankTier}
                          onChange={(e) => setNewPlayerForm({ ...newPlayerForm, peakRankTier: e.target.value })}
                        >
                          {RANK_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                        </AdminSelectInput>
                        <AdminSelectInput
                          value={newPlayerForm.peakRankDivision}
                          onChange={(e) => setNewPlayerForm({ ...newPlayerForm, peakRankDivision: Number(e.target.value) })}
                        >
                          {DIVISIONS.map(d => <option key={d} value={d}>{d === -1 ? 'N/A' : d}</option>)}
                        </AdminSelectInput>
                      </div>
                    </AdminFormGroup>

                    <AdminFormGroup>
                      <AdminCheckboxLabel>
                        <input
                          type="checkbox"
                          checked={newPlayerForm.isCaptain}
                          onChange={(e) => setNewPlayerForm({ ...newPlayerForm, isCaptain: e.target.checked })}
                        />
                        Is Captain?
                      </AdminCheckboxLabel>
                    </AdminFormGroup>

                    <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '0.5rem 0' }} />

                    <AdminCheckboxLabel>
                      <input
                        type="checkbox"
                        checked={newPlayerForm.addToPool}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, addToPool: e.target.checked })}
                      />
                      Add to Player Pool
                    </AdminCheckboxLabel>

                    <AdminCheckboxLabel>
                      <input
                        type="checkbox"
                        checked={newPlayerForm.addToDraft}
                        onChange={(e) => setNewPlayerForm({ ...newPlayerForm, addToDraft: e.target.checked })}
                      />
                      Add to Draft Available List
                    </AdminCheckboxLabel>

                    <AdminActionButton type="submit" variant="primary" style={{ marginTop: '0.5rem' }}>
                      <FaPlus /> Add Player
                    </AdminActionButton>
                  </AdminFormLayout>
                </form>
              </AdminCard>

              {/* Player Pool List */}
              <AdminCard>
                <AdminCardTitle>Player list ({filteredPlayers.length})</AdminCardTitle>
                <AdminSearchInput
                  type="text"
                  placeholder="Filter players by name/role..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                />
                <AdminTableContainer>
                  <AdminStyledTable>
                    <thead>
                      <tr>
                        <AdminStyledTh>Name</AdminStyledTh>
                        <AdminStyledTh>Role</AdminStyledTh>
                        <AdminStyledTh>Peak</AdminStyledTh>
                        <AdminStyledTh>Cap</AdminStyledTh>
                        <AdminStyledTh>Draft Pool</AdminStyledTh>
                        <AdminStyledTh>Actions</AdminStyledTh>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map(p => {
                        const inDraftAvail = draftState?.availablePlayers?.some(dp => dp.id === p.id);
                        const isDrafted = draftState?.teams?.some(t => t.players?.some(tp => tp.id === p.id));
                        return (
                          <tr key={p.id}>
                            <AdminStyledTd><strong>{p.name.split('#')[0]}</strong> <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>#{p.name.split('#')[1] || 'NA1'}</span></AdminStyledTd>
                            <AdminStyledTd>{p.role}</AdminStyledTd>
                            <AdminStyledTd>{rankTierToShortName(p.peakRankTier)}{p.peakRankDivision !== -1 ? p.peakRankDivision : ''}</AdminStyledTd>
                            <AdminStyledTd>{p.isCaptain ? <AdminBadge variant="danger">Yes</AdminBadge> : 'No'}</AdminStyledTd>
                            <AdminStyledTd>
                              {isDrafted ? (
                                <AdminBadge variant="success">Drafted</AdminBadge>
                              ) : inDraftAvail ? (
                                <AdminBadge variant="primary">Available</AdminBadge>
                              ) : (
                                <AdminBadge variant="warning">Missing</AdminBadge>
                              )}
                            </AdminStyledTd>
                            <AdminStyledTd>
                              <AdminButtonGroup>
                                <AdminActionButton onClick={() => setEditingPlayer(p)}><FaEdit /></AdminActionButton>
                                {!inDraftAvail && !isDrafted && (
                                  <AdminActionButton variant="primary" onClick={() => handleAddPlayerToDraftPool(p)} title="Add to draft pool">
                                    <FaPlus /> Pool
                                  </AdminActionButton>
                                )}
                                <AdminClearButton onClick={() => handleDeletePlayer(p.id, true, true)} title="Delete completely"><FaTrash /></AdminClearButton>
                              </AdminButtonGroup>
                            </AdminStyledTd>
                          </tr>
                        );
                      })}
                    </tbody>
                  </AdminStyledTable>
                </AdminTableContainer>
              </AdminCard>
            </AdminGrid>
          )}
        </div>
      )}

      {/* --- TAB: TEAMS --- */}
      {activeTab === 'teams' && (
        <div>
          {editingTeam ? (
            <AdminEditBox>
              <AdminCardTitle>Edit Team: {editingTeam.name}</AdminCardTitle>
              <AdminFormLayout>
                <AdminGrid>
                  <AdminFormGroup>
                    <AdminFormLabel>Team Name</AdminFormLabel>
                    <AdminTextInput
                      type="text"
                      value={editingTeam.name}
                      onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    />
                  </AdminFormGroup>
                  <AdminFormGroup>
                    <AdminFormLabel>Record (Wins - Losses)</AdminFormLabel>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <AdminTextInput
                        type="number"
                        placeholder="Wins"
                        value={editingTeam.wins}
                        onChange={(e) => setEditingTeam({ ...editingTeam, wins: Number(e.target.value), record: `${e.target.value}-${editingTeam.losses}` })}
                      />
                      <AdminTextInput
                        type="number"
                        placeholder="Losses"
                        value={editingTeam.losses}
                        onChange={(e) => setEditingTeam({ ...editingTeam, losses: Number(e.target.value), record: `${editingTeam.wins}-${e.target.value}` })}
                      />
                    </div>
                  </AdminFormGroup>
                </AdminGrid>

                <AdminGrid>
                  <AdminFormGroup>
                    <AdminFormLabel>Game Record (Game Wins - Game Losses)</AdminFormLabel>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <AdminTextInput
                        type="number"
                        placeholder="Game Wins"
                        value={editingTeam.gameWins}
                        onChange={(e) => setEditingTeam({ ...editingTeam, gameWins: Number(e.target.value), gameRecord: `${e.target.value}-${editingTeam.gameLosses}` })}
                      />
                      <AdminTextInput
                        type="number"
                        placeholder="Game Losses"
                        value={editingTeam.gameLosses}
                        onChange={(e) => setEditingTeam({ ...editingTeam, gameLosses: Number(e.target.value), gameRecord: `${editingTeam.gameWins}-${e.target.value}` })}
                      />
                    </div>
                  </AdminFormGroup>
                </AdminGrid>

                <AdminButtonGroup style={{ marginTop: '1rem' }}>
                  <AdminActionButton variant="primary" onClick={handleSaveTeamDetails}>
                    <FaSave /> Save Team
                  </AdminActionButton>
                  <AdminActionButton onClick={() => setEditingTeam(null)}>
                    <FaTimes /> Cancel
                  </AdminActionButton>
                </AdminButtonGroup>
              </AdminFormLayout>
            </AdminEditBox>
          ) : (
            <AdminCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <AdminCardTitle style={{ border: 'none', margin: 0 }}>Tournament Teams List ({teams.length})</AdminCardTitle>
                <AdminActionButton variant="primary" onClick={handleCreateTeamsFromDraft}>
                  Create/Sync Teams from Draft Pool
                </AdminActionButton>
              </div>

              <AdminTableContainer>
                <AdminStyledTable>
                  <thead>
                    <tr>
                      <AdminStyledTh>ID</AdminStyledTh>
                      <AdminStyledTh>Team Name</AdminStyledTh>
                      <AdminStyledTh>Match Record</AdminStyledTh>
                      <AdminStyledTh>Game Record</AdminStyledTh>
                      <AdminStyledTh>Roster Players</AdminStyledTh>
                      <AdminStyledTh>Actions</AdminStyledTh>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map(t => (
                      <tr key={t.id}>
                        <AdminStyledTd>{t.id}</AdminStyledTd>
                        <AdminStyledTd><strong>{t.name}</strong></AdminStyledTd>
                        <AdminStyledTd>{t.record || `${t.wins}-${t.losses}`}</AdminStyledTd>
                        <AdminStyledTd>{t.gameRecord || `${t.gameWins}-${t.gameLosses}`}</AdminStyledTd>
                        <AdminStyledTd>{t.players?.join(', ') || 'Roster empty'}</AdminStyledTd>
                        <AdminStyledTd>
                          <AdminActionButton onClick={() => setEditingTeam(t)}><FaEdit /> Edit</AdminActionButton>
                        </AdminStyledTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminStyledTable>
              </AdminTableContainer>
            </AdminCard>
          )}
        </div>
      )}

      {/* --- TAB: BRACKETS --- */}
      {activeTab === 'bracket' && (
        <AdminCard>
          <AdminCardTitle>Brackets Rounds & Seed Management</AdminCardTitle>
          <p>Update teams, statuses, or scores for bracket rounds.</p>

          {bracket.length === 0 ? (
            <p>No brackets round initialized. Use bulk upload or create a bracket structure.</p>
          ) : (
            bracket.map((round, rIdx) => (
              <div key={round.title} style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1.5rem' }}>
                <h4>{round.title}</h4>
                <AdminTableContainer>
                  <AdminStyledTable>
                    <thead>
                      <tr>
                        <AdminStyledTh>Seed ID</AdminStyledTh>
                        <AdminStyledTh>Team 1</AdminStyledTh>
                        <AdminStyledTh>Team 2</AdminStyledTh>
                        <AdminStyledTh>Week</AdminStyledTh>
                        <AdminStyledTh>Status</AdminStyledTh>
                        <AdminStyledTh>Score</AdminStyledTh>
                        <AdminStyledTh>Winner</AdminStyledTh>
                        <AdminStyledTh>Knockout?</AdminStyledTh>
                      </tr>
                    </thead>
                    <tbody>
                      {round.seeds?.map((seed, sIdx) => (
                        <tr key={seed.id}>
                          <AdminStyledTd>{seed.id}</AdminStyledTd>
                          <AdminStyledTd>
                            <AdminSelectInput
                              value={seed.team1Id || 0}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { team1Id: Number(e.target.value) })}
                            >
                              <option value={0}>TBD</option>
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </AdminSelectInput>
                          </AdminStyledTd>
                          <AdminStyledTd>
                            <AdminSelectInput
                              value={seed.team2Id || 0}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { team2Id: Number(e.target.value) })}
                            >
                              <option value={0}>TBD</option>
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </AdminSelectInput>
                          </AdminStyledTd>
                          <AdminStyledTd>
                            <AdminTextInput
                              type="number"
                              style={{ width: '60px' }}
                              value={seed.weekPlayed || 1}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { weekPlayed: Number(e.target.value) })}
                            />
                          </AdminStyledTd>
                          <AdminStyledTd>
                            <AdminSelectInput
                              value={seed.status}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { status: e.target.value })}
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="completed">Completed</option>
                            </AdminSelectInput>
                          </AdminStyledTd>
                          <AdminStyledTd>
                            <AdminTextInput
                              type="text"
                              style={{ width: '80px' }}
                              placeholder="0-0"
                              value={seed.score || ''}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { score: e.target.value })}
                            />
                          </AdminStyledTd>
                          <AdminStyledTd>
                            <AdminSelectInput
                              value={seed.winnerId || 0}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { winnerId: Number(e.target.value) || null })}
                            >
                              <option value={0}>None</option>
                              {seed.team1Id && <option value={seed.team1Id}>Team 1 (ID: {seed.team1Id})</option>}
                              {seed.team2Id && <option value={seed.team2Id}>Team 2 (ID: {seed.team2Id})</option>}
                            </AdminSelectInput>
                          </AdminStyledTd>
                          <AdminStyledTd>
                            <input
                              type="checkbox"
                              checked={seed.isKnockout}
                              onChange={(e) => handleUpdateBracketSeed(rIdx, sIdx, { isKnockout: e.target.checked })}
                            />
                          </AdminStyledTd>
                        </tr>
                      ))}
                    </tbody>
                  </AdminStyledTable>
                </AdminTableContainer>
              </div>
            ))
          )}
        </AdminCard>
      )}

      {/* --- TAB: MATCHES SCHEDULE --- */}
      {activeTab === 'matches' && (
        <div>
          {editingMatch ? (
            <AdminEditBox>
              <AdminCardTitle>Edit Match ID: {editingMatch.id}</AdminCardTitle>
              <AdminFormLayout>
                <AdminGrid>
                  <AdminFormGroup>
                    <AdminFormLabel>Team 1</AdminFormLabel>
                    <AdminSelectInput
                      value={editingMatch.team1Id}
                      onChange={(e) => setEditingMatch({ ...editingMatch, team1Id: Number(e.target.value) })}
                    >
                      <option value={0}>Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </AdminSelectInput>
                  </AdminFormGroup>
                  <AdminFormGroup>
                    <AdminFormLabel>Team 2</AdminFormLabel>
                    <AdminSelectInput
                      value={editingMatch.team2Id}
                      onChange={(e) => setEditingMatch({ ...editingMatch, team2Id: Number(e.target.value) })}
                    >
                      <option value={0}>Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </AdminSelectInput>
                  </AdminFormGroup>
                </AdminGrid>

                <AdminGrid columns="1fr 1fr 1fr">
                  <AdminFormGroup>
                    <AdminFormLabel>Match Status</AdminFormLabel>
                    <AdminSelectInput
                      value={editingMatch.status}
                      onChange={(e) => setEditingMatch({ ...editingMatch, status: e.target.value as 'upcoming' | 'completed' })}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </AdminSelectInput>
                  </AdminFormGroup>
                  <AdminFormGroup>
                    <AdminFormLabel>Winner ID</AdminFormLabel>
                    <AdminSelectInput
                      value={editingMatch.winnerId || 0}
                      onChange={(e) => setEditingMatch({ ...editingMatch, winnerId: Number(e.target.value) || null })}
                    >
                      <option value={0}>None</option>
                      <option value={editingMatch.team1Id}>Team 1 (ID: {editingMatch.team1Id})</option>
                      <option value={editingMatch.team2Id}>Team 2 (ID: {editingMatch.team2Id})</option>
                    </AdminSelectInput>
                  </AdminFormGroup>
                  <AdminFormGroup>
                    <AdminFormLabel>Score (e.g. 2-1)</AdminFormLabel>
                    <AdminTextInput
                      type="text"
                      placeholder="Score"
                      value={editingMatch.score || ''}
                      onChange={(e) => setEditingMatch({ ...editingMatch, score: e.target.value })}
                    />
                  </AdminFormGroup>
                </AdminGrid>

                <AdminGrid columns="2fr 1fr">
                  <AdminFormGroup>
                    <AdminFormLabel>Tournament Code (shortCode)</AdminFormLabel>
                    <AdminTextInput
                      type="text"
                      placeholder="Riot Code"
                      value={editingMatch.tournamentCodes?.join(', ') || ''}
                      onChange={(e) => setEditingMatch({ ...editingMatch, tournamentCodes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </AdminFormGroup>
                  <AdminFormGroup>
                    <AdminFormLabel>Week Played</AdminFormLabel>
                    <AdminTextInput
                      type="number"
                      value={editingMatch.weekPlayed}
                      onChange={(e) => setEditingMatch({ ...editingMatch, weekPlayed: Number(e.target.value) })}
                    />
                  </AdminFormGroup>
                </AdminGrid>

                <AdminButtonGroup style={{ marginTop: '1rem' }}>
                  <AdminActionButton variant="primary" onClick={handleSaveMatchDetails}>
                    <FaSave /> Save Match
                  </AdminActionButton>
                  <AdminActionButton onClick={() => setEditingMatch(null)}>
                    <FaTimes /> Cancel
                  </AdminActionButton>
                </AdminButtonGroup>
              </AdminFormLayout>
            </AdminEditBox>
          ) : (
            <AdminGrid columns="1fr 2fr">
              {/* Form to Create Match */}
              <div>
                <AdminCard>
                  <AdminCardTitle>Create New Match</AdminCardTitle>
                  <form onSubmit={handleCreateMatch}>
                  <AdminFormLayout>
                    <AdminFormGroup>
                      <AdminFormLabel>Match Unique ID (e.g. 101 or match_1)</AdminFormLabel>
                      <AdminTextInput
                        type="text"
                        placeholder="Unique Match ID"
                        value={newMatchForm.id}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, id: e.target.value })}
                        required
                      />
                    </AdminFormGroup>

                    <AdminFormGroup>
                      <AdminFormLabel>Team 1</AdminFormLabel>
                      <AdminSelectInput
                        value={newMatchForm.team1Id}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, team1Id: Number(e.target.value) })}
                        required
                      >
                        <option value={0}>Select Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </AdminSelectInput>
                    </AdminFormGroup>

                    <AdminFormGroup>
                      <AdminFormLabel>Team 2</AdminFormLabel>
                      <AdminSelectInput
                        value={newMatchForm.team2Id}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, team2Id: Number(e.target.value) })}
                        required
                      >
                        <option value={0}>Select Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </AdminSelectInput>
                    </AdminFormGroup>

                    <AdminFormGroup>
                      <AdminFormLabel>Week Played</AdminFormLabel>
                      <AdminTextInput
                        type="number"
                        value={newMatchForm.weekPlayed}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, weekPlayed: Number(e.target.value) })}
                        required
                      />
                    </AdminFormGroup>

                    <AdminFormGroup>
                      <AdminFormLabel>Stage / Label</AdminFormLabel>
                      <AdminTextInput
                        type="text"
                        placeholder="e.g. Group Stage, Semifinals"
                        value={newMatchForm.stage}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, stage: e.target.value })}
                      />
                    </AdminFormGroup>

                    <AdminCheckboxLabel>
                      <input
                        type="checkbox"
                        checked={newMatchForm.isKnockout}
                        onChange={(e) => setNewMatchForm({ ...newMatchForm, isKnockout: e.target.checked })}
                      />
                      Is Bracket/Knockout?
                    </AdminCheckboxLabel>

                    <AdminActionButton type="submit" variant="primary" style={{ marginTop: '0.5rem' }}>
                      <FaPlus /> Create Match
                    </AdminActionButton>
                  </AdminFormLayout>
                </form>
              </AdminCard>

              <AdminCard style={{ marginTop: '1.5rem' }}>
                <AdminCardTitle>Generate Swiss Stage</AdminCardTitle>
                <p>Automatically generate Round 1 Swiss matchup pairings based on the first-round draft pick order.</p>
                <AdminActionButton variant="primary" onClick={handleGenerateSwissStage}>
                  Generate Swiss Stage (Round 1)
                </AdminActionButton>
              </AdminCard>
            </div>

            {/* Match Schedule Table */}
              <AdminCard>
                <AdminCardTitle>Matches list ({matches.length})</AdminCardTitle>
                <AdminTableContainer>
                  <AdminStyledTable>
                    <thead>
                      <tr>
                        <AdminStyledTh>ID</AdminStyledTh>
                        <AdminStyledTh>Week</AdminStyledTh>
                        <AdminStyledTh>Teams Matchup</AdminStyledTh>
                        <AdminStyledTh>Status</AdminStyledTh>
                        <AdminStyledTh>Winner</AdminStyledTh>
                        <AdminStyledTh>Score</AdminStyledTh>
                        <AdminStyledTh>Actions</AdminStyledTh>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map(m => {
                        const t1 = teams.find(t => t.id === m.team1Id);
                        const t2 = teams.find(t => t.id === m.team2Id);
                        const winnerTeam = m.winnerId ? (m.winnerId === m.team1Id ? t1 : t2) : null;
                        return (
                          <tr key={m.id}>
                            <AdminStyledTd>{m.id}</AdminStyledTd>
                            <AdminStyledTd>{m.weekPlayed}</AdminStyledTd>
                            <AdminStyledTd>
                              <strong>{t1?.name || `Team ${m.team1Id}`}</strong>
                              <span style={{ margin: '0 0.25rem', opacity: 0.5 }}>vs</span>
                              <strong>{t2?.name || `Team ${m.team2Id}`}</strong>
                            </AdminStyledTd>
                            <AdminStyledTd>
                              {m.status === 'completed' ? <AdminBadge variant="success">Completed</AdminBadge> : <AdminBadge variant="warning">Upcoming</AdminBadge>}
                            </AdminStyledTd>
                            <AdminStyledTd>{winnerTeam ? winnerTeam.name : '-'}</AdminStyledTd>
                            <AdminStyledTd>{m.score || '-'}</AdminStyledTd>
                            <AdminStyledTd>
                              <AdminButtonGroup>
                                <AdminActionButton onClick={() => setEditingMatch(m)}><FaEdit /></AdminActionButton>
                                <AdminClearButton onClick={() => handleDeleteMatch(m.id)}><FaTrash /></AdminClearButton>
                              </AdminButtonGroup>
                            </AdminStyledTd>
                          </tr>
                        );
                      })}
                    </tbody>
                  </AdminStyledTable>
                </AdminTableContainer>
              </AdminCard>
            </AdminGrid>
          )}
        </div>
      )}

      {/* --- TAB: TOURNAMENT CODES --- */}
      {activeTab === 'codes' && (
        <AdminGrid columns="1fr">
          {/* Form to generate tournament codes */}
          <AdminCard>
            <AdminCardTitle>Generate Riot Tournament Codes</AdminCardTitle>
            <form onSubmit={handleGenerateCodes}>
              <AdminFormLayout>
                <AdminFormGroup>
                  <AdminFormLabel>Select Match</AdminFormLabel>
                  <AdminSelectInput
                    value={selectedMatchForCodes}
                    onChange={(e) => setSelectedMatchForCodes(e.target.value)}
                    required
                  >
                    <option value="">-- Select Match --</option>
                    {matches.map(m => {
                      const t1 = teams.find(t => t.id === m.team1Id);
                      const t2 = teams.find(t => t.id === m.team2Id);
                      const stageLabel = m.stage ? ` (${m.stage})` : ` (Week ${m.weekPlayed})`;
                      return (
                        <option key={m.id} value={m.id}>
                          {m.id} : {t1?.name || `Team ${m.team1Id}`} vs {t2?.name || `Team ${m.team2Id}`}{stageLabel}
                        </option>
                      );
                    })}
                  </AdminSelectInput>
                </AdminFormGroup>

                <AdminFormGroup>
                  <AdminFormLabel>Codes Count (Standard is 1 code per game, best of 3 needs 2-3 codes)</AdminFormLabel>
                  <AdminTextInput
                    type="number"
                    min={1}
                    max={10}
                    value={codesCount}
                    onChange={(e) => setCodesCount(Math.max(1, Number(e.target.value)))}
                    required
                  />
                </AdminFormGroup>

                <AdminCheckboxLabel>
                  <input
                    type="checkbox"
                    checked={codesIsKnockout}
                    onChange={(e) => setCodesIsKnockout(e.target.checked)}
                  />
                  Is Bracket/Knockout match?
                </AdminCheckboxLabel>

                <AdminButtonGroup style={{marginTop: '0.5rem'}}>
                  <AdminActionButton type="submit" variant="primary" disabled={status === 'loading'}>
                    {status === 'loading' ? <FaSpinner className="spin" /> : <FaLink />} Generate for Selected Match
                  </AdminActionButton>
                  <AdminActionButton 
                    type="button" 
                    variant="secondary" 
                    disabled={status === 'loading'} 
                    onClick={handleBulkGenerateCodesForMissing}
                  >
                    {status === 'loading' ? <FaSpinner className="spin" /> : <FaLink />} Generate for All Empty Matches
                  </AdminActionButton>
                </AdminButtonGroup>
              </AdminFormLayout>
            </form>
          </AdminCard>

          {/* Current codes listing */}
          <AdminCard>
            <AdminCardTitle>Generated Tournament Codes Matrix</AdminCardTitle>
            <p>List of tournament codes assigned to each match. Players use these codes to enter lobbies.</p>
            <AdminTableContainer>
              <AdminStyledTable style={{tableLayout: 'fixed'}}>
                <thead>
                  <tr>
                    <AdminStyledTh style={{width: '15%'}}>Match ID</AdminStyledTh>
                    <AdminStyledTh style={{width: '45%'}}>Matchup</AdminStyledTh>
                    <AdminStyledTh style={{width: '40%'}}>Tournament Codes</AdminStyledTh>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(m => {
                    const t1 = teams.find(t => t.id === m.team1Id);
                    const t2 = teams.find(t => t.id === m.team2Id);
                    const codes = m.tournamentCodes || [];
                    return (
                      <tr key={m.id}>
                        <AdminStyledTd style={{width: '15%'}}>{m.id}</AdminStyledTd>
                        <AdminStyledTd style={{width: '45%'}}>
                          <strong>{t1?.name || `Team ${m.team1Id}`}</strong>
                          <span style={{margin: '0 0.25rem', opacity: 0.5}}>vs</span>
                          <strong>{t2?.name || `Team ${m.team2Id}`}</strong>
                          {m.stage ? (
                            <span style={{marginLeft: '0.5rem', fontSize: '0.8rem', color: '#888', background: 'rgba(0,0,0,0.05)', padding: '0.15rem 0.3rem', borderRadius: '3px'}}>
                              {m.stage}
                            </span>
                          ) : (
                            <span style={{marginLeft: '0.5rem', fontSize: '0.8rem', color: '#888', background: 'rgba(0,0,0,0.05)', padding: '0.15rem 0.3rem', borderRadius: '3px'}}>
                              Week {m.weekPlayed}
                            </span>
                          )}
                        </AdminStyledTd>
                        <AdminStyledTd style={{width: '40%'}}>
                          {codes.length === 0 ? (
                            <span style={{color: '#aaa', fontStyle: 'italic'}}>No codes generated yet</span>
                          ) : (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.6rem'}}>
                              {codes.map(code => (
                                <div key={code} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem'}}>
                                  <code
                                    title={code}
                                    style={{
                                      fontSize: '0.9rem',
                                      padding: '0.2rem 0.4rem',
                                      background: 'rgba(0,0,0,0.05)',
                                      borderRadius: '3px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: '380px',
                                      display: 'block'
                                    }}
                                  >
                                    {code}
                                  </code>
                                  <AdminActionButton
                                    onClick={() => handleCopyCode(code)}
                                    style={{padding: '0.15rem 0.4rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center'}}
                                  >
                                    {copiedCode === code ? <><FaCheck style={{color: 'green'}} /> Copied!</> : <><FaCopy /> Copy</>}
                                  </AdminActionButton>
                                </div>
                              ))}
                            </div>
                          )}
                        </AdminStyledTd>
                      </tr>
                    );
                  })}
                </tbody>
              </AdminStyledTable>
            </AdminTableContainer>
          </AdminCard>
        </AdminGrid>
      )}

      {/* --- TAB: CASTER ACCESS CODES --- */}
      {activeTab === 'casters' && (
        <AdminGrid columns="1fr 1fr">
          {/* List of current casters and their access codes */}
          <AdminCard>
            <AdminCardTitle><FaUsers /> Registered Casters & Access Codes</AdminCardTitle>
            <p>A list of all casters registered for the year <strong>{prefix.replace('grumble', '')}</strong>.</p>
            {Object.keys(casterCodes).length === 0 ? (
              <p style={{ fontStyle: 'italic', color: '#888' }}>No casters registered yet.</p>
            ) : (
              <AdminTableContainer>
                <AdminStyledTable>
                  <thead>
                    <tr>
                      <AdminStyledTh>Name</AdminStyledTh>
                      <AdminStyledTh>Access Code</AdminStyledTh>
                      <AdminStyledTh style={{ width: '10%' }}>Actions</AdminStyledTh>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(casterCodes).map(([casterId, caster]) => (
                      <tr key={casterId}>
                        <AdminStyledTd><strong>{caster.name}</strong></AdminStyledTd>
                        <AdminStyledTd>
                          <code style={{ fontSize: '1.1rem', background: '#333', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                            {caster.accessCode}
                          </code>
                        </AdminStyledTd>
                        <AdminStyledTd>
                          <AdminIconButton variant="danger" title="Delete Caster" onClick={() => handleDeleteCasterCode(casterId)}>
                            <FaTrash />
                          </AdminIconButton>
                        </AdminStyledTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminStyledTable>
              </AdminTableContainer>
            )}
          </AdminCard>

          {/* Form to create a new caster access code */}
          <AdminCard>
            <AdminCardTitle>Create Caster Access Code</AdminCardTitle>
            <form onSubmit={handleCreateCasterCode}>
              <AdminFormLayout>
                <AdminFormGroup>
                  <AdminFormLabel htmlFor="caster-name-input">Caster Name</AdminFormLabel>
                  <AdminTextInput
                    id="caster-name-input"
                    type="text"
                    placeholder="e.g. Captain Flowers"
                    value={newCasterName}
                    onChange={(e) => setNewCasterName(e.target.value)}
                    required
                  />
                </AdminFormGroup>

                <AdminButtonGroup style={{ marginTop: '1rem' }}>
                  <AdminActionButton type="submit" variant="primary" disabled={status === 'loading'}>
                    {status === 'loading' ? <FaSpinner className="spin" /> : <FaPlus />} Generate Caster Code
                  </AdminActionButton>
                </AdminButtonGroup>
              </AdminFormLayout>
            </form>
          </AdminCard>
        </AdminGrid>
      )}

      {/* --- TAB: BULK JSON IMPORT --- */}
      {activeTab === 'bulk' && (
        <AdminCard>
          <AdminCardTitle>Legacy Bulk JSON Import/Export</AdminCardTitle>
          <p>Directly load or retrieve arrays of JSON documents to/from the database.</p>

          <SelectionContainer style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '1.5rem' }}>
            <AdminFormGroup>
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
            </AdminFormGroup>
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
        </AdminCard>
      )}
    </AdminPageContainer>
  );
};

export default AdminPage;
