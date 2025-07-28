import React from 'react';
import { Group, Team } from '../../types';
import { GroupContainer, GroupTitle, TeamList, TeamItem, TeamName, TeamRecord } from '../styles';

interface GroupProps {
  group: Group;
  teams: Team[];
}

const GroupComponent: React.FC<GroupProps> = ({ group, teams }) => {
  const getTeamById = (id: number): Team | undefined => teams.find(team => team.id === id);

  return (
    <GroupContainer>
      <GroupTitle>{group.name}</GroupTitle>
      <TeamList>
        {group.teams.map(teamId => {
          const team = getTeamById(teamId);
          if (!team) return null; // Or some fallback UI
          return (
            <TeamItem key={team.id}>
              <TeamName to={`/teams/${team.id}`}>{team.name}</TeamName>
              <TeamRecord>{team.record}</TeamRecord>
            </TeamItem>
          );
        })}
      </TeamList>
    </GroupContainer>
  );
};

export default GroupComponent;
