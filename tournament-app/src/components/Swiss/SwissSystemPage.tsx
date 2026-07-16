import React from 'react';
import SwissStandings from './SwissStandings';
import SwissBracket from './SwissBracket';
import {
  SwissPageContainer,
  SwissSectionTitle,
} from '../../styles';

const SwissSystemPage: React.FC = () => {
  return (
    <SwissPageContainer>
      <SwissSectionTitle>Swiss Stage Standings</SwissSectionTitle>
      <SwissStandings />

      <SwissSectionTitle>Swiss Stage Bracket</SwissSectionTitle>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem', fontStyle: 'italic' }}>
        ← Swipe or scroll horizontally to view all Swiss rounds →
      </p>
      <SwissBracket />
    </SwissPageContainer>
  );
};

export default SwissSystemPage;
