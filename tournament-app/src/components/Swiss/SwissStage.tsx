import React from 'react';
import GroupComponent from './Group';
import { Group, Team } from '../../types';
import { StageContainer } from '../../styles';

interface SwissStageProps {
  groups: Group[];
  teams: Team[];
}

const SwissStage: React.FC<SwissStageProps> = ({ groups, teams }) => {
  return (
    <StageContainer>
      {groups.map(group => (
        <GroupComponent key={group.id} group={group} teams={teams} />
      ))}
    </StageContainer>
  );
};

export default SwissStage;
