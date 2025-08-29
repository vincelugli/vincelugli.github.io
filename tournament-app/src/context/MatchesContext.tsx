import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Match } from '../types';
import { useDivision } from './DivisionContext';

// Define the shape of the data the context will provide
interface MatchesContextType {
  matches: Match[],
  loading: boolean
}

// Create the context with a default value
const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

// Create the Provider component
export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const { division } = useDivision();

  // This effect runs once when the provider mounts to fetch all player data
  useEffect(() => {
    const fetchPlayers = async () => {
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

    fetchPlayers();
  }, [division]);


  const value = {
    matches,
    loading,
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
