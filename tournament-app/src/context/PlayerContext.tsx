import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Player } from '../types';
import { useDivision } from './DivisionContext';

// Define the shape of the data the context will provide
interface PlayerContextType {
  players: Player[];
  draftablePlayers: Player[];
  loading: boolean;
  getPlayerById: (id: number) => Player | undefined;
}

// Create the context with a default value
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Create the Provider component
export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [draftablePlayers, setDraftablePlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const { division } = useDivision();

  // This effect runs once when the provider mounts to fetch all player data
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const playersRef = doc(db, 'players', `grumble2025_${division}`);
        const snapshot = await getDoc(playersRef);

        if (snapshot.exists()) {
            setPlayers(snapshot.data().players);
        }
      } catch (error) {
        console.error("Failed to fetch player data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRemainingDraftablePlayers = async () => {
      setLoading(true);

      try {
        const draftRef = doc(db, 'drafts', `grumble2025_${division}`);
        const snapshot = await getDoc(draftRef);

        if (snapshot.exists()) {
          setDraftablePlayers(snapshot.data().availablePlayers);
        }
      } catch (error) {
        console.error("Failed to fetch draft data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
    fetchRemainingDraftablePlayers();
  }, [division]);

  // Helper function to find a player by ID, memoized for performance
  const getPlayerById = (id: number) => players.find(p => p.id === id);

  const value = {
    players,
    draftablePlayers,
    loading,
    getPlayerById,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

// Create a custom hook for easy access to the context
export const usePlayers = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayers must be used within a PlayerProvider');
  }
  return context;
};
