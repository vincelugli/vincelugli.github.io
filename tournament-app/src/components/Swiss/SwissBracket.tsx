import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Match } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import { useGameMatches } from '../../context/MatchesContext';
import { useDivision } from '../../context/DivisionContext';
import { getTeamOrPlaceholder } from '../../utils';
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
  const { urlDivision } = useDivision();
  const navigate = useNavigate();

  const [hoveredTeamId, setHoveredTeamId] = React.useState<number | null>(null);
  const [linePoints, setLinePoints] = React.useState<{ x: number; y: number }[]>([]);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (hoveredTeamId === null || !containerRef.current) {
      setLinePoints([]);
      return;
    }

    const container = containerRef.current;
    
    // Set dimensions to scroll size of container
    setDimensions({
      width: container.scrollWidth,
      height: container.scrollHeight,
    });

    const containerRect = container.getBoundingClientRect();
    const elements = container.querySelectorAll(`[data-team-id="${hoveredTeamId}"]`);
    
    const points = Array.from(elements).map(el => {
      const rect = el.getBoundingClientRect();
      return {
        // Calculate center relative to the scrollable container content
        x: rect.left - containerRect.left + container.scrollLeft + rect.width / 2,
        y: rect.top - containerRect.top + container.scrollTop + rect.height / 2,
      };
    });

    // Sort left to right by X coordinate (round-by-round)
    points.sort((a, b) => a.x - b.x);
    setLinePoints(points);
  }, [hoveredTeamId]);

  const getPathData = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const controlX1 = p1.x + (p2.x - p1.x) / 2;
      const controlY1 = p1.y;
      const controlX2 = p2.x - (p2.x - p1.x) / 2;
      const controlY2 = p2.y;
      d += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

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
        if (teamMatch.score === 'BYE') {
          wins++;
        } else if (teamId === teamMatch.team1Id) {
          if (teamMatch.team1Wins! > teamMatch.team2Wins! && teamMatch.team1Wins! === 2) {
            wins++;
          } else {
            losses++;
          }
        } else if (teamId === teamMatch.team2Id) {
          if (teamMatch.team2Wins! > teamMatch.team1Wins! && teamMatch.team2Wins! === 2) {
            wins++;
          } else {
            losses++;
          }
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
    <SwissBracketContainer ref={containerRef}>
      {hoveredTeamId !== null && linePoints.length > 1 && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: dimensions.width,
            height: dimensions.height,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <defs>
            <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <path
            d={getPathData(linePoints)}
            fill="none"
            stroke="url(#glow-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0px 0px 5px rgba(139, 92, 246, 0.6))',
              opacity: 0.85,
            }}
          />
        </svg>
      )}

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
                    const team1 = getTeamOrPlaceholder(match.team1Id, teams, matches);
                    const team2 = getTeamOrPlaceholder(match.team2Id, teams, matches);
                    const team1Name = team1?.name || (match.team1Id === -1 ? 'Bye' : 'Unknown Team');
                    const team2Name = team2?.name || (match.team2Id === -1 ? 'Bye' : 'Unknown Team');

                    const isCompleted = match.status === 'completed';
                    const isTeam1Winner = isCompleted && match.winnerId === match.team1Id;
                    const isTeam2Winner = isCompleted && match.winnerId === match.team2Id;

                    const t1Score = match.team1Wins !== undefined ? String(match.team1Wins) : (isCompleted ? '0' : '-');
                    const t2Score = match.team2Wins !== undefined ? String(match.team2Wins) : (isCompleted ? '0' : '-');

                    const hasHoveredTeam = hoveredTeamId !== null && 
                      (match.team1Id === hoveredTeamId || match.team2Id === hoveredTeamId);

                    return (
                      <SwissMatchupCard 
                        key={match.id} 
                        onClick={() => navigate(`/match/${match.id}?division=${urlDivision}`)}
                        style={{
                          position: 'relative',
                          zIndex: 1, // Stay on top of SVG path
                          opacity: hoveredTeamId !== null && !hasHoveredTeam ? 0.35 : 1,
                          borderColor: hasHoveredTeam ? '#3b82f6' : undefined,
                          boxShadow: hasHoveredTeam ? '0 0 10px rgba(59, 130, 246, 0.4)' : undefined,
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <SwissTeamRow 
                          isWinner={isTeam1Winner}
                          data-team-id={match.team1Id !== -1 ? match.team1Id : undefined}
                          onMouseEnter={() => match.team1Id !== -1 && setHoveredTeamId(match.team1Id)}
                          onMouseLeave={() => setHoveredTeamId(null)}
                          onClick={(e) => {
                            if (match.team1Id !== -1) {
                              e.stopPropagation();
                              navigate(`/teams/${match.team1Id}?division=${urlDivision}`);
                            }
                          }}
                          style={{
                            cursor: match.team1Id !== -1 ? 'pointer' : 'default',
                            transition: 'all 0.15s ease-in-out',
                            backgroundColor: hoveredTeamId !== null && hoveredTeamId === match.team1Id ? 'rgba(59, 130, 246, 0.15)' : undefined,
                            borderRadius: '4px',
                          }}
                        >
                          <SwissTeamName isWinner={isTeam1Winner}>{team1Name}</SwissTeamName>
                          {isCompleted && <SwissTeamScore isWinner={isTeam1Winner}>{t1Score}</SwissTeamScore>}
                        </SwissTeamRow>

                        <SwissTeamRow 
                          isWinner={isTeam2Winner}
                          data-team-id={match.team2Id !== -1 ? match.team2Id : undefined}
                          onMouseEnter={() => match.team2Id !== -1 && setHoveredTeamId(match.team2Id)}
                          onMouseLeave={() => setHoveredTeamId(null)}
                          onClick={(e) => {
                            if (match.team2Id !== -1) {
                              e.stopPropagation();
                              navigate(`/teams/${match.team2Id}?division=${urlDivision}`);
                            }
                          }}
                          style={{
                            cursor: match.team2Id !== -1 ? 'pointer' : 'default',
                            transition: 'all 0.15s ease-in-out',
                            backgroundColor: hoveredTeamId !== null && hoveredTeamId === match.team2Id ? 'rgba(59, 130, 246, 0.15)' : undefined,
                            borderRadius: '4px',
                          }}
                        >
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
