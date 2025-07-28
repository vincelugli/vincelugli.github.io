import React from 'react';
import { Team } from '../../types';
import { TeamsContainer, Title, TeamsTable, TableHead, TableBody, TeamNameLink, TeamRecord } from '../styles';

// Define the component's props
interface TeamsPageProps {
  teams: Team[];
}

const AllTeamsPage: React.FC<TeamsPageProps> = ({ teams }) => {
  // Order the teams by best record
  teams = teams.sort((t1, t2) => {
    const result = t2.wins - t1.wins;
    if (result === 0) {
      return t1.losses - t2.losses;
    }
    return result;
  });

  return (
    <TeamsContainer>
      <Title>All Teams</Title>
      <TeamsTable>
        <TableHead>
          <tr>
            <th>Team Name</th>
            <th>Record (W-L)</th>
          </tr>
        </TableHead>
        <TableBody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>
                {/* Each team name links to their detailed match history */}
                <TeamNameLink to={`/teams/${team.id}`}>
                  {team.name}
                </TeamNameLink>
              </td>
              <td>
                <TeamRecord>{team.record}</TeamRecord>
              </td>
            </tr>
          ))}
        </TableBody>
      </TeamsTable>
    </TeamsContainer>
  );
};

export default AllTeamsPage;