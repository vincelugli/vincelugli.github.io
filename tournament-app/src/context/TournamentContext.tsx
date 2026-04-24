import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useDivision } from './DivisionContext';
import { getFirebasePrefix } from '../utils';
import { Team, Group, BracketRound, Player } from '../types';

// Define the shape of the data the context will provide
interface TournamentContextType {
  teams: Team[];
  groups: Group[];
  bracket: BracketRound[];
  loading: boolean;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const GRUMBLE_YEAR_PREFIX = getFirebasePrefix();
  const { division } = useDivision(); 
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [bracket, setBracket] = useState<BracketRound[]>([]);
  const [loading, setLoading] = useState(true);

  // This effect will run whenever the component mounts OR whenever the `division` or year prefix changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const playersRef = doc(db, "players", `${GRUMBLE_YEAR_PREFIX}_${division}`);
        const teamsRef = doc(db, "teams", `${GRUMBLE_YEAR_PREFIX}_${division}`);
        const groupsRef = doc(db, "groups", `${GRUMBLE_YEAR_PREFIX}_${division}`);
        const bracketRef = doc(db, "bracket", `${GRUMBLE_YEAR_PREFIX}_${division}`);

        // Fetch all data in parallel for efficiency
        const [playersSnap, teamsSnap, groupsSnap, bracketSnap] = await Promise.all([
            getDoc(playersRef),
            getDoc(teamsRef),
            getDoc(groupsRef),
            getDoc(bracketRef)
        ]);

        if (playersSnap.exists()) {
            const playersData = playersSnap.data();
            setPlayers(playersData.players);
        } else {
            setPlayers([]);
        }
        if (teamsSnap.exists()) {
            const teamsData = teamsSnap.data()
            setTeams(teamsData.teams);
        } else {
            setTeams([]);
        }
        if (groupsSnap.exists()) {
            const groupsData = groupsSnap.data();
            setGroups(groupsData.groups);
        } else {
            setGroups([]);
        }
        if (bracketSnap.exists()) {
            const bracketData = bracketSnap.data();
            setBracket(bracketData.bracket);
        } else {
            setBracket([]);
        }


      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
        setPlayers([])
        setTeams([]);
        setGroups([]);
        setBracket([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [division, GRUMBLE_YEAR_PREFIX]); 

  const value = { players, teams, groups, bracket, loading };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

// Custom hook for easy access
export const useTournament = (): TournamentContextType => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};