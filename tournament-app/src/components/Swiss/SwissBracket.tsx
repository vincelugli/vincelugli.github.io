import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Match } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import { useGameMatches } from '../../context/MatchesContext';
import {
  SwissBracketContainer,
  SwissRoundColumn,
  SwissRoundHeader,
  SwissRecordGroup,
  SwissRecordGroupTitle,
  SwissMatchupCard,
  SwissTeamRow,
  SwissTeamName,
  SwissTeamScore,
  SwissMatchMeta,
  SwissStatusBadge,
} from '../../styles';

const SwissBracket: React.FC = () => {
  const { teams, loading: teamsLoading } = useTournament();
  const { matches, loading: matchesLoading } = useGameMatches();
  const navigate = useNavigate();

  if (teamsLoading || matchesLoading) {
    return <p>Loading Swiss bracket...</p>;
  }

  if (!teams || teams.length === 0) {
    return <p>Teams not yet finalized.</p>;
  }

  // Filter out any knockout matches
  const swissMatches = matches.filter(m => !m.isKnockout);

  // Dynamically calculate the maximum round or default to 5
  const maxRound = Math.max(5, ...swissMatches.map(m => m.weekPlayed || 0));
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);

  // Helper to get a team's record BEFORE a given round number
  const getTeamRecordBeforeRound = (teamId: number, roundNum: number) => {
    let wins = 0;
    let losses = 0;

    for (let r = 1; r < roundNum; r++) {
      const roundMatches = swissMatches.filter(m => {
        const mRound = m.stage ? parseInt(m.stage.replace('Round ', ''), 10) : m.weekPlayed;
        return mRound === r;
      });

      const teamMatch = roundMatches.find(m => m.team1Id === teamId || m.team2Id === teamId);
      if (teamMatch && teamMatch.status === 'completed') {
        if (teamMatch.winnerId === teamId) {
          wins++;
        } else {
          losses++;
        }
      }
    }
    return { wins, losses };
  };

  // Compare records for sorting (e.g. 2-0 before 1-1 before 0-2)
  const compareRecords = (recA: string, recB: string) => {
    const [wA, lA] = recA.split('-').map(Number);
    const [wB, lB] = recB.split('-').map(Number);
    if (wA !== wB) {
      return wB - wA; // Higher wins first
    }
    return lA - lB; // Lower losses first
  };

  const getRecordGroupLabel = (record: string) => {
    switch (record) {
      case '2-0':
        return '2-0 Record (Qualifying)';
      case '0-2':
        return '0-2 Record (Elimination)';
      case '2-1':
        return '2-1 Record (Qualifying)';
      case '1-2':
        return '1-2 Record (Elimination)';
      case '2-2':
        return '2-2 Record (Decider)';
      default:
        return `${record} Record`;
    }
  };

  const getMatchesGroupedByRecord = (roundNum: number) => {
    const roundMatches = swissMatches.filter(m => {
      const mRound = m.stage ? parseInt(m.stage.replace('Round ', ''), 10) : m.weekPlayed;
      return mRound === roundNum;
    });

    const groups: { [record: string]: Match[] } = {};

    roundMatches.forEach(match => {
      const t1Id = match.team1Id;
      const t2Id = match.team2Id;

      const rec1 = getTeamRecordBeforeRound(t1Id, roundNum);
      const rec2 = getTeamRecordBeforeRound(t2Id, roundNum);

      let recStr = '0-0';
      if (t1Id !== -1) {
        recStr = `${rec1.wins}-${rec1.losses}`;
      } else if (t2Id !== -1) {
        recStr = `${rec2.wins}-${rec2.losses}`;
      }

      if (!groups[recStr]) {
        groups[recStr] = [];
      }
      groups[recStr].push(match);
    });

    return groups;
  };

  return (
    <SwissBracketContainer>
      {rounds.map(roundNum => {
        const groupedMatches = getMatchesGroupedByRecord(roundNum);
        const sortedRecords = Object.keys(groupedMatches).sort(compareRecords);

        return (
          <SwissRoundColumn key={roundNum}>
            <SwissRoundHeader>Round {roundNum}</SwissRoundHeader>
            
            {sortedRecords.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', padding: '1rem 0' }}>
                No matches scheduled
              </p>
            ) : (
              sortedRecords.map(record => (
                <SwissRecordGroup key={record}>
                  <SwissRecordGroupTitle>{getRecordGroupLabel(record)}</SwissRecordGroupTitle>
                  {groupedMatches[record].map((match: Match) => {
                    const team1 = teams.find(t => t.id === match.team1Id);
                    const team2 = teams.find(t => t.id === match.team2Id);
                    const team1Name = team1?.name || (match.team1Id === -1 ? 'Bye' : 'Unknown Team');
                    const team2Name = team2?.name || (match.team2Id === -1 ? 'Bye' : 'Unknown Team');

                    const isCompleted = match.status === 'completed';
                    const isTeam1Winner = isCompleted && match.winnerId === match.team1Id;
                    const isTeam2Winner = isCompleted && match.winnerId === match.team2Id;

                    const t1Score = match.team1Wins !== undefined ? String(match.team1Wins) : (isCompleted ? '0' : '-');
                    const t2Score = match.team2Wins !== undefined ? String(match.team2Wins) : (isCompleted ? '0' : '-');

                    return (
                      <SwissMatchupCard key={match.id} onClick={() => navigate(`/match/${match.id}`)}>
                        <SwissTeamRow isWinner={isTeam1Winner}>
                          <SwissTeamName isWinner={isTeam1Winner}>{team1Name}</SwissTeamName>
                          {isCompleted && <SwissTeamScore isWinner={isTeam1Winner}>{t1Score}</SwissTeamScore>}
                        </SwissTeamRow>

                        <SwissTeamRow isWinner={isTeam2Winner}>
                          <SwissTeamName isWinner={isTeam2Winner}>{team2Name}</SwissTeamName>
                          {isCompleted && <SwissTeamScore isWinner={isTeam2Winner}>{t2Score}</SwissTeamScore>}
                        </SwissTeamRow>

                        <SwissMatchMeta>
                          <SwissStatusBadge status={match.status}>
                            {match.status}
                          </SwissStatusBadge>
                          {match.isCasted && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#9146FF', fontWeight: 'bold' }}>
                              🎥 Live
                            </span>
                          )}
                        </SwissMatchMeta>
                      </SwissMatchupCard>
                    );
                  })}
                </SwissRecordGroup>
              ))
            )}
          </SwissRoundColumn>
        );
      })}
    </SwissBracketContainer>
  );
};

export default SwissBracket;
