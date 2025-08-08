import React from 'react';


import { GlobalStyle } from './styles';
import { PlayerProvider } from './context/PlayerContext';
import { DivisionProvider } from './context/DivisionContext';
import AppContent from './AppContent';
import { CustomThemeProvider } from './context/ThemeContext';
import { TournamentProvider } from './context/TournamentContext';

const App: React.FC = () => {

  return (
    <CustomThemeProvider>
      <DivisionProvider>
        <PlayerProvider>
          <TournamentProvider>
            <GlobalStyle />
            <AppContent />
          </TournamentProvider>
        </PlayerProvider>
      </DivisionProvider>
    </CustomThemeProvider>
  );
}

export default App;