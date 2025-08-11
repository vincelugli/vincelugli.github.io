import React from 'react';
import { TeamsContainer, Title, TeamsTable, TableHead, TableBody, TeamNameLink, Record } from '../../styles';
import { compareTeams } from '../../utils';
import { useTournament } from '../../context/TournamentContext';

const AllTeamsPage: React.FC = () => {
  let { teams } = useTournament();
  
  // Order the teams by best record
  teams = teams ? teams.sort(compareTeams) : [];

  return (
    <TeamsContainer>
      <Title>All Teams</Title>
      <TeamsTable>
        <TableHead>
          <tr>
            <th>Team Name</th>
            <th>Team Record (W-L)</th>
            <th>Game Record (W-L)</th>
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
                <Record>{team.record}</Record>
              </td>
              <td>
                <Record>{team.gameRecord}</Record>
              </td>
            </tr>
          ))}
        </TableBody>
      </TeamsTable>
    </TeamsContainer>
  );
};

export default AllTeamsPage;