import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Team } from '../../types';

const HistoryContainer = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TeamName = styled.h2`
  font-size: 2.5rem;
  color: #333;
`;

const MatchList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MatchItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const MatchInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Opponent = styled.span`
  font-weight: 500;
`;

const Score = styled.span<{ win: boolean }>`
  font-weight: bold;
  color: ${props => (props.win ? 'green' : 'red')};
`;

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
      <TeamName>{team.name}'s Match History</TeamName>
      <MatchList>
        {team.matchHistory!.map((match, index) => (
          <MatchItem key={index}>
            <MatchInfo>
              <span>vs</span>
              <Opponent>{teams.find(t => t.id === match.opponentId)?.name}</Opponent>
            </MatchInfo>
            <Score win={match.result === 'W'}>{match.score}</Score>
          </MatchItem>
        ))}
      </MatchList>
    </HistoryContainer>
  );
};

export default MatchHistory;
