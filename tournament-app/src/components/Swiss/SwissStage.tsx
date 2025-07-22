import React from 'react';
import styled from 'styled-components';
import GroupComponent from './Group';
import { Group, Team } from '../../types';

const StageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

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
