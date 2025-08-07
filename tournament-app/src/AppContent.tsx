import React, { useCallback, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuth, User } from 'firebase/auth';


import Tournament from './components/Tournament';
import SwissStage from './components/Swiss/SwissStage';
import DoubleEliminationBracket from './components/Brackets/DoubleEliminationBracket';
import AllTeamsPage from './components/Team/AllTeamsPage';
import TeamPage from './components/TeamPage/TeamPage'; 
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import DraftAuthGate from './components/Draft/DraftAuthGate';
import { mockMatches } from './data/mockData';
import DraftPage from './components/Draft/DraftPage';
import PriorityListPage from './components/PriorityList/PriorityListPage';
import { AppContainer, MainContent } from './styles';
import SchedulePage from './components/Schedule/SchedulePage';
import SubstitutesPage from './components/Players/SubstitutePlayersPage';
import AdminPage from './components/Admin/AdminPage';
import AdminAuthGate from './components/Admin/AdminAuthGate';
import { useDivision } from './context/DivisionContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { BracketRound, Group, Team } from './types';

const GRUMBLE_YEAR_PREFIX = "grumble2025";

const AppContent: React.FC = () => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [bracket, setBracket] = useState<BracketRound[]>([]);

  const { division } = useDivision();

  const fetchItems = useCallback(async (collectionName: string) => {
    try{ 
      const ref = doc(db, collectionName, `${GRUMBLE_YEAR_PREFIX}_${division}`);
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch (error) {
      console.error("Failed to fetch data: ", error);
    }
  }, [division]);
  
  // Listen to auth state to show/hide the captain link
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
      const fetchTeams = async () => setTeams((fetchItems('teams') as any).teams ?? []);
      fetchTeams();
    }, [fetchItems]);

  useEffect(() => {
      const fetchGroups = async () => setGroups((fetchItems('groups') as any).groups ?? []);
      fetchGroups();
    }, [fetchItems]);

  useEffect(() => {
      const fetchBracket = async () => setBracket((fetchItems('bracket') as any).bracket ?? []);
      fetchBracket();
    }, [fetchItems]);

  return (
    <Router>
    <AppContainer>
        <Header />
        <MainContent>
        <Routes>
            <Route 
            path="/" 
            element={<Tournament teams={teams} groups={groups} bracket={bracket} />} 
            />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route 
            path="/swiss" 
            element={<SwissStage groups={groups} teams={teams} />}
            />
            <Route 
            path="/knockout" 
            element={<DoubleEliminationBracket bracket={bracket} />}
            />
            <Route 
            path="/teams" 
            element={<AllTeamsPage teams={teams} />} 
            />
            <Route 
            path="/teams/:teamId" 
            element={<TeamPage teams={teams} matches={mockMatches} />} 
            />
            <Route path="/draft-access" element={<DraftAuthGate />} />
            <Route path="/draft/:draftId" element={<DraftPage />} />
            {user && (<Route path="/pick-priority" element={<PriorityListPage />} />)}
            <Route path="/subs" element={<SubstitutesPage />} />
            <Route path="/admin-access" element={<AdminAuthGate />} />
            <Route path="/admin" element={<AdminPage />} />
        </Routes>
        </MainContent>
        <Footer />
    </AppContainer>
    </Router>
  );
}

export default AppContent;