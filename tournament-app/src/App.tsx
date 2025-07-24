import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';

import Tournament from './components/Tournament';
import SwissStage from './components/Swiss/SwissStage';
import DoubleEliminationBracket from './components/Brackets/DoubleEliminationBracket';
import AllTeamsPage from './components/Team/AllTeamsPage';
import MatchHistory from './components/MatchHistory/MatchHistory';
import TeamPage from './components/Team/TeamPage'; 
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import DraftAuthGate from './components/Draft/DraftAuthGate';
import { mockTeams, mockMatches, mockGroups, mockBracket } from './data/mockData';
import DraftPage from './components/Draft/DraftPage';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f0f2f5;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const App: React.FC = () => {
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
            <Route path="draft" element={<DraftPage />} />
            <Route 
              path="/match-history/:teamId" 
              element={<MatchHistory teams={mockTeams} />} 
            />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </Router>
  );
}

export default App;