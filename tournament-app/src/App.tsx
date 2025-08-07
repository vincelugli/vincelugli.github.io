import React from 'react';


import { GlobalStyle } from './styles';
import { PlayerProvider } from './context/PlayerContext';
import { DivisionProvider } from './context/DivisionContext';
import AppContent from './AppContent';

const App: React.FC = () => {

  return (
    <DivisionProvider>
      <PlayerProvider>
        <GlobalStyle />
        <AppContent />
      </PlayerProvider>
    </DivisionProvider>
  );
}

export default App;