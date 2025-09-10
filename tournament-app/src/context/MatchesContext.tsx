import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Match, TournamentCode } from '../types';
import { useDivision } from './DivisionContext';

// Define the shape of the data the context will provide
interface MatchesContextType {
    matches: Match[],
    loading: boolean,
    tournamentCodes: TournamentCode[]
}

// Create the context with a default value
const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

// Create the Provider component
export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [tournamentCodes, setTournamentCodes] = useState<TournamentCode[]>([]);
    const [loading, setLoading] = useState(true);

    const { division } = useDivision();

    // This effect runs once when the provider mounts to fetch all player data
    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const matchesRef = doc(db, 'matches', `grumble2025_${division}`)
                const snapshot = await getDoc(matchesRef);

                if (snapshot.exists()) {
                    setMatches(snapshot.data().matches);
                }
            } catch (error) {
                console.error("Failed to fetch player data:", error);
            } finally {
               setLoading(false);
            }
        };

        const fetchTournamentCodes = async () => {
            setLoading(true);
            try {
                const collectionName = "matches";
                const matchesRef = collection(db, collectionName);

                const q = query(matchesRef, where("division", "==", division));
                
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.warn(`No matches found for division ${division} in collection ${collectionName}`);
                    setTournamentCodes([]);
                }
                
                setTournamentCodes(querySnapshot.docs.map((d) => ({code: d.id, matchId: d.data().matchId, status: d.data().status, winnerId: d.data().winnerId})));
            } catch (error) {
                console.error(`Error querying for match for division ${division} data:`, error);
                setTournamentCodes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
        fetchTournamentCodes();
    }, [division]);


  const value = {
    matches,
    loading,
    tournamentCodes,
  };

  return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>;
};

// Create a custom hook for easy access to the context
export const useGameMatches = (): MatchesContextType => {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useGameMatches must be used within a MatchesProvider');
  }
  return context;
};
