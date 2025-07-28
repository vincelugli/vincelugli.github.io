import React from 'react';
import { useParams } from 'react-router-dom';
import { Team } from '../../types';
import { HistoryContainer, MatchHistoryTeamName, MatchList, MatchItem, MatchInfo, Opponent, Score } from '../../styles';

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// DOES NOT WORK //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

interface MatchHistoryProps {
  teams: Team[];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ teams }) => {
  const { teamId } = useParams<{ teamId: string }>();
  const team = teams.find(t => t.id === Number(teamId));

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <HistoryContainer>
      {/* <TeamName to={`/teams/${team.id}`}>{team.name}</TeamName> */}
      <MatchHistoryTeamName>{team.name}'s Match History</MatchHistoryTeamName>
      <MatchList>
        {team.matchHistory!.map((match, index) => (
          <MatchItem key={index}>
            <MatchInfo>
              <span>vs</span>
              <Opponent>{teams.find(t => t.id === match.team1Id)?.name}</Opponent>
            </MatchInfo>
            <Score win={match.winnerId ? match.winnerId === match.team1Id : false}>{match.score}</Score>
          </MatchItem>
        ))}
      </MatchList>
    </HistoryContainer>
  );
};

export default MatchHistory;
