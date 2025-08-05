import React, { useEffect, useState } from 'react';
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
import { mockTeams, mockMatches, mockGroups, mockBracket } from './data/mockData';
import DraftPage from './components/Draft/DraftPage';
import PriorityListPage from './components/PriorityList/PriorityListPage';
import {GlobalStyle, AppContainer, MainContent } from './styles';
import SchedulePage from './components/Schedule/SchedulePage';
import SubstitutesPage from './components/Players/SubstitutePlayersPage';

const App: React.FC = () => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  
  // Listen to auth state to show/hide the captain link
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, [auth]);

  return (
    <Router>
      <GlobalStyle />
      
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route 
              path="/" 
              element={<Tournament teams={mockTeams} groups={mockGroups} bracket={mockBracket} />} 
            />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route 
              path="/swiss" 
              element={<SwissStage groups={mockGroups} teams={mockTeams} />}
            />
            <Route 
              path="/knockout" 
              element={<DoubleEliminationBracket bracket={mockBracket} />}
            />
            <Route 
              path="/teams" 
              element={<AllTeamsPage teams={mockTeams} />} 
            />
            <Route 
              path="/teams/:teamId" 
              element={<TeamPage teams={mockTeams} matches={mockMatches} />} 
            />
            <Route path="/draft-access" element={<DraftAuthGate />} />
            <Route path="/draft/:draftId" element={<DraftPage />} />
            {user && (<Route path="/pick-priority" element={<PriorityListPage />} />)}
            <Route path="/subs" element={<SubstitutesPage />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </Router>
  );
}

export default App;