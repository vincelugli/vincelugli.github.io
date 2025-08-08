import React from 'react';


import { GlobalStyle } from './styles';
import { PlayerProvider } from './context/PlayerContext';
import { DivisionProvider } from './context/DivisionContext';
import AppContent from './AppContent';
import { CustomThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {

  return (
    <CustomThemeProvider>
      <DivisionProvider>
        <PlayerProvider>
          <GlobalStyle />
          <AppContent />
        </PlayerProvider>
      </DivisionProvider>
    </CustomThemeProvider>
  );
}

export default App;