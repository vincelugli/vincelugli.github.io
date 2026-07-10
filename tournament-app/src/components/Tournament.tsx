import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SwissStage from './Swiss/SwissStage';
import SwissStandings from './Swiss/SwissStandings';
import DoubleEliminationBracket from './Brackets/DoubleEliminationBracket';
import { TournamentContainer, SectionTitle } from '../styles';
import { getYearFromHash } from '../utils';

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 2px solid ${({ theme }) => theme.secondaryBorderBotton};
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

const InlineSectionTitle = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const ViewStageLink = styled(Link)`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;

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
            <SectionHeader>
              <InlineSectionTitle>Swiss Stage</InlineSectionTitle>
              <ViewStageLink to="/swiss">Full Swiss Stage & Matches →</ViewStageLink>
            </SectionHeader>
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
