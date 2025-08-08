import React from 'react';
import GroupComponent from './Group';
import { StageContainer } from '../../styles';
import { useTournament } from '../../context/TournamentContext';

const SwissStage: React.FC = () => {
  const { groups, teams } = useTournament();

  if (!groups || groups.length === 0) {
    return (
    <StageContainer>
      <p>Groups not yet finalized.</p>
    </StageContainer>
    );
  }

  return (
    <StageContainer>
      {groups.map(group => (
        <GroupComponent key={group.id} group={group} teams={teams} />
      ))}
    </StageContainer>
  );
};

export default SwissStage;
