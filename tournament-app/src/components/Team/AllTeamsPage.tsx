import React from 'react';
import { TeamsContainer, Title, TeamsTable, TableHead, TableBody, TeamNameLink, Record, TableScrollWrapper } from '../../styles';
import { compareTeams } from '../../utils';
import { useTournament } from '../../context/TournamentContext';
import { useDivision } from '../../context/DivisionContext';
import TeamLogo from '../Common/TeamLogo';

const AllTeamsPage: React.FC = () => {
  let { teams } = useTournament();
  const { urlDivision } = useDivision();
  
  // Order the teams by best record
  teams = teams ? teams.sort(compareTeams) : [];

  return (
    <TeamsContainer>
      <Title>All Teams</Title>
      <TableScrollWrapper>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {team.logo && <TeamLogo logo={team.logo} size={28} />}
                    {/* Each team name links to their detailed match history */}
                    <TeamNameLink to={`/teams/${team.id}?division=${urlDivision}`}>
                      {team.name}
                    </TeamNameLink>
                  </div>
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
      </TableScrollWrapper>
    </TeamsContainer>
  );
};

export default AllTeamsPage;