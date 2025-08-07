import React from 'react';
import SwissStage from './Swiss/SwissStage';
import DoubleEliminationBracket from './Brackets/DoubleEliminationBracket';
import { Team, Group, BracketRound } from '../types';
import { TournamentContainer, SectionTitle, StageLink } from '../styles';

interface TournamentProps {
  teams: Team[];
  groups: Group[];
  bracket: BracketRound[];
}

const Tournament: React.FC<TournamentProps> = ({ teams, groups, bracket }) => {
  if (groups.length !== 0) {
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
  } else {
    return (
      <TournamentContainer>
        <div>
          <SectionTitle>Draft still in progress...</SectionTitle>
          <StageLink to={"/draft-access"}>
            Go to draft
          </StageLink>
        </div>
      </TournamentContainer>
    )
  }
};

export default Tournament;
