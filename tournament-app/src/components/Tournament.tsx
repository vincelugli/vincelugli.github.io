import React from 'react';
import SwissStage from './Swiss/SwissStage';
import DoubleEliminationBracket from './Brackets/DoubleEliminationBracket';
import { TournamentContainer, SectionTitle } from '../styles';

const Tournament: React.FC = () => {
  return (
    <TournamentContainer>
      <div>
        <SectionTitle>Swiss Stage</SectionTitle>
        <SwissStage />
      </div>
      <div>
        <SectionTitle>Knockout</SectionTitle>
        <DoubleEliminationBracket />
      </div>
    </TournamentContainer>
  );
};

export default Tournament;
