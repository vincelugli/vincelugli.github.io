import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Group, Team } from '../../types';

const GroupContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const GroupTitle = styled.h3`
  font-size: 1.5rem;
  color: #555;
  margin-top: 0;
`;

const TeamList = styled.ul`
  list-style: none;
  padding: 0;
`;

const TeamItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const TeamName = styled(Link)`
  font-weight: 500;
  color: #333;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const TeamRecord = styled.span`
  font-size: 0.9rem;
  color: #777;
`;

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
              <TeamName to={`/match-history/${team.id}`}>{team.name}</TeamName>
              <TeamRecord>{team.record}</TeamRecord>
            </TeamItem>
          );
        })}
      </TeamList>
    </GroupContainer>
  );
};

export default GroupComponent;
