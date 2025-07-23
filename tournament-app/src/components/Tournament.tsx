import React from 'react';
import styled from 'styled-components';
import SwissStage from './Swiss/SwissStage';
import DoubleEliminationBracket from './Brackets/DoubleEliminationBracket';
import { Team, Group, BracketRound } from '../types';

const TournamentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  border-bottom: 2px solid #ddd;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
`;

interface TournamentProps {
  teams: Team[];
  groups: Group[];
  bracket: BracketRound[];
}

const Tournament: React.FC<TournamentProps> = ({ teams, groups, bracket }) => {
  return (
    <TournamentContainer>
      <div>
        <SectionTitle>Swiss Stage</SectionTitle>
        <SwissStage groups={groups} teams={teams} />
      </div>
      <div>
        <SectionTitle>Upper Bracket</SectionTitle>
        <DoubleEliminationBracket bracket={bracket} />
      </div>
      <div>
        <SectionTitle>Lower Bracket</SectionTitle>
        <DoubleEliminationBracket bracket={bracket} />
      </div>
    </TournamentContainer>
  );
};

export default Tournament;
