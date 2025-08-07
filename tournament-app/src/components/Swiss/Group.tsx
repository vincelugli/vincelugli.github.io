import React from 'react';
import { Group, Team } from '../../types';
import { GroupContainer, GroupTitle, TeamList, TeamItem, TeamName, GroupHeaderRow, ColumnTitle, Record } from '../../styles';
import { compareTeams } from '../../utils';

interface GroupProps {
  group: Group;
  teams: Team[];
}

// TODO: Pull records from database
// TODO: Hook into division context
const GroupComponent: React.FC<GroupProps> = ({ group, teams }) => {
  teams = teams
    .filter((team) => group.teams.includes(team.id))
    .sort(compareTeams);

  return (
    <GroupContainer>
      <GroupTitle>{group.name}</GroupTitle>

      <GroupHeaderRow>
        <ColumnTitle style={{ textAlign: 'left' }}>Team</ColumnTitle>
        <ColumnTitle>Match</ColumnTitle>
        <ColumnTitle>Game</ColumnTitle>
      </GroupHeaderRow>

      <TeamList>
        {teams.map(team => {
          if (!team) return null; // Or some fallback UI
          return (
            <TeamItem key={team.id}>
              <TeamName to={`/teams/${team.id}`}>{team.name}</TeamName>
              <Record>{team.record || '0-0'}</Record>
              <Record>{team.gameRecord || '0-0'}</Record>
            </TeamItem>
          );
        })}
      </TeamList>
    </GroupContainer>
  );
};

export default GroupComponent;
