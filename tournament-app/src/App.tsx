import React from 'react';
import ReactGA from 'react-ga4';
import { GlobalStyle } from './styles';
import { PlayerProvider } from './context/PlayerContext';
import { DivisionProvider } from './context/DivisionContext';
import AppContent from './AppContent';
import { CustomThemeProvider } from './context/ThemeContext';
import { TournamentProvider } from './context/TournamentContext';
import { AuthProvider } from './components/Common/AuthContext';
import { MatchProvider } from './context/MatchesContext';

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
  console.log("Google Analytics initialized.");
} else {
  console.warn("Google Analytics Measurement ID not found. Analytics will be disabled.");
}

const App: React.FC = () => {

  return (
    <AuthProvider>
      <CustomThemeProvider>
        <DivisionProvider>
          <PlayerProvider>
            <MatchProvider>
              <TournamentProvider>
                <GlobalStyle />
                <AppContent />
              </TournamentProvider>
            </MatchProvider>
          </PlayerProvider>
        </DivisionProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
}

export default App;