import React, { useEffect, useState } from 'react';
import SwissStage from './Swiss/SwissStage';
import SwissStandings from './Swiss/SwissStandings';
import DoubleEliminationBracket from './Brackets/DoubleEliminationBracket';
import {
  TournamentContainer,
  SectionTitle,
  TournamentSectionHeader,
  TournamentInlineSectionTitle,
  TournamentViewStageLink,
} from '../styles';
import { getYearFromHash } from '../utils';

const Tournament: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const year = getYearFromHash(hash) || '2026';

  return (
    <TournamentContainer>
      <div>
        {year === '2026' ? (
          <>
            <TournamentSectionHeader>
              <TournamentInlineSectionTitle>Swiss Stage</TournamentInlineSectionTitle>
              <TournamentViewStageLink to="/swiss">Full Swiss Stage & Matches →</TournamentViewStageLink>
            </TournamentSectionHeader>
            <SwissStandings />
          </>
        ) : (
          <>
            <SectionTitle>Swiss Stage</SectionTitle>
            <SwissStage />
          </>
        )}
      </div>
      <div>
        <SectionTitle>Knockout</SectionTitle>
        <DoubleEliminationBracket />
      </div>
    </TournamentContainer>
  );
};

export default Tournament;
