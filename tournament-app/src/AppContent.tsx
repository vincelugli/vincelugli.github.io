import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';


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
import RouteChangeTracker from './components/Common/RouteChangeTracker';
import AllPlayersPage from './components/Players/AllPlayersPage';
import { useAuth } from './components/Common/AuthContext';

const AppContent: React.FC = () => {
  const { currentUser: user } = useAuth();

  return (
    <Router>
      <RouteChangeTracker />
      <AppContainer>
          <Header />
          <MainContent>
            <Routes>
                <Route 
                path="/" 
                element={<Tournament />} 
                />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route 
                path="/swiss" 
                element={<SwissStage />}
                />
                <Route 
                path="/knockout" 
                element={<DoubleEliminationBracket />}
                />
                <Route 
                path="/teams" 
                element={<AllTeamsPage />} 
                />
                <Route 
                path="/teams/:teamId" 
                element={<TeamPage matches={[]} />} 
                />
                <Route path="/draft-access" element={<DraftAuthGate />} />
                <Route path="/draft/:draftId" element={<DraftPage />} />
                <Route path="/draft" element={<DraftPage />} />
                {user && (<Route path="/pick-priority" element={<PriorityListPage />} />)}
                <Route path="/subs" element={<SubstitutesPage />} />
                <Route path="/admin-access" element={<AdminAuthGate />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/players" element={<AllPlayersPage />} />
            </Routes>
          </MainContent>
          <Footer />
      </AppContainer>
    </Router>
  );
}

export default AppContent;