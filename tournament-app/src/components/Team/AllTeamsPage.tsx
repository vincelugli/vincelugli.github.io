import React, { useMemo } from 'react';
import { TeamsContainer, Title, TeamsTable, TableHead, TableBody, TeamNameLink, Record, TableScrollWrapper, TableRow } from '../../styles';
import { compareTeams, calculateSwissStats, TeamStats } from '../../utils';
import { useTournament } from '../../context/TournamentContext';
import { useDivision } from '../../context/DivisionContext';
import { useGameMatches } from '../../context/MatchesContext';
import TeamLogo from '../Common/TeamLogo';

const AllTeamsPage: React.FC = () => {
  const { teams } = useTournament();
  const { matches } = useGameMatches();
  const { urlDivision } = useDivision();
  
  const swissStats = useMemo(() => {
    return (teams && matches) ? calculateSwissStats(teams, matches) : [];
  }, [teams, matches]);

  const statsMap = useMemo(() => {
    const map = new Map<number, TeamStats>();
    swissStats.forEach(s => map.set(s.team.id, s));
    return map;
  }, [swissStats]);

  // Order the teams by best record
  const sortedTeams = useMemo(() => {
    if (!teams) return [];
    return [...teams].sort((a, b) => {
      const sA = statsMap.get(a.id);
      const sB = statsMap.get(b.id);
      if (sA && sB) {
        if (sB.wins !== sA.wins) return sB.wins - sA.wins;
        if (sA.losses !== sB.losses) return sA.losses - sB.losses;
        if (sB.gameWins !== sA.gameWins) return sB.gameWins - sA.gameWins;
        return sA.gameLosses - sB.gameLosses;
      }
      return compareTeams(a, b);
    });
  }, [teams, statsMap]);

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
            {sortedTeams.map(team => {
              const stat = statsMap.get(team.id);
              const wins = stat ? stat.wins : team.wins;
              const losses = stat ? stat.losses : team.losses;
              const matchRecord = stat ? `${stat.wins}-${stat.losses}` : (team.record || `${team.wins}-${team.losses}`);
              const gameRecord = stat ? `${stat.gameWins}-${stat.gameLosses}` : (team.gameRecord || `${team.gameWins}-${team.gameLosses}`);
              const status = wins >= 3 ? 'qualified' : losses >= 3 ? 'eliminated' : 'active';
              return (
                <TableRow key={team.id} status={status}>
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
                    <Record>{matchRecord}</Record>
                  </td>
                  <td>
                    <Record>{gameRecord}</Record>
                  </td>
                </TableRow>
              );
            })}
          </TableBody>
        </TeamsTable>
      </TableScrollWrapper>
    </TeamsContainer>
  );
};

export default AllTeamsPage;