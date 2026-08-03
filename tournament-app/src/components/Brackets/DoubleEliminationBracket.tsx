import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDivision } from '../../context/DivisionContext';
import { BracketSeed, BracketRound } from '../../types';
import { FaCoins, FaTv } from 'react-icons/fa';

const BracketWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
`;

const ColumnsWrapper = styled.div`
  display: flex;
  gap: 4rem;
  overflow-x: auto;
  padding: 3rem 2rem;
  position: relative;
  background: ${({ theme }) => theme.backgroundTwo || 'rgba(15, 23, 42, 0.45)'};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.borderColor || 'rgba(255, 255, 255, 0.06)'};
  backdrop-filter: blur(8px);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.2);
  
  // Custom scrollbar
  &::-webkit-scrollbar {
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    border: 2px solid rgba(0, 0, 0, 0.2);
    &:hover {
      background: rgba(255, 255, 255, 0.22);
    }
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5rem;
`;

const BracketRow = styled.div`
  display: flex;
  gap: 4rem;
`;

const RightSection = styled.div`
  display: flex;
  gap: 4rem;
  align-items: center;
`;

const SvgOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
`;

const ConnectorPath = styled.path<{ $isActive?: boolean }>`
  fill: none;
  stroke: ${({ $isActive, theme }) => $isActive ? (theme.primary || '#3b82f6') : (theme.borderColor || 'rgba(255, 255, 255, 0.12)')};
  stroke-width: ${({ $isActive }) => $isActive ? '3' : '2'};
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 0.25s ease, stroke-width 0.25s ease, filter 0.25s ease;
  filter: ${({ $isActive }) => $isActive ? 'drop-shadow(0px 0px 6px rgba(59, 130, 246, 0.5))' : 'none'};
`;

const RoundColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 300px;
  position: relative;
  z-index: 2;
`;

const RoundTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textAlt || '#94a3b8'};
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: ${({ theme }) => theme.backgroundThree || 'rgba(255, 255, 255, 0.04)'};
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.borderColor || 'rgba(255, 255, 255, 0.05)'};
`;

const MatchupsList = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

interface MatchCardProps {
  isCompleted?: boolean;
  $isHovered?: boolean;
}

const MatchCard = styled.div<MatchCardProps>`
  background: ${({ theme }) => theme.background || 'rgba(15, 23, 42, 0.65)'};
  border: 1px solid ${({ $isHovered, theme }) => $isHovered ? (theme.primary || '#3b82f6') : (theme.borderColor || 'rgba(255, 255, 255, 0.07)')};
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ $isHovered }) => $isHovered ? '0 8px 24px -5px rgba(59, 130, 246, 0.25)' : '0 4px 15px rgba(0, 0, 0, 0.25)'};

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.primary || '#3b82f6'};
    box-shadow: 0 12px 28px -5px rgba(59, 130, 246, 0.3), 0 8px 16px -8px rgba(59, 130, 246, 0.2);
  }
`;

const MatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textAlt || '#64748b'};
  border-bottom: 1px solid ${({ theme }) => theme.borderColor || 'rgba(255, 255, 255, 0.06)'};
  padding-bottom: 0.5rem;
  margin-bottom: 0.3rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

interface TeamRowProps {
  isWinner?: boolean;
  isTbd?: boolean;
  $isHovered?: boolean;
}

const TeamRow = styled.div<TeamRowProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: ${({ isWinner, $isHovered, theme }) => {
    if ($isHovered) return 'rgba(59, 130, 246, 0.12)';
    if (isWinner) return 'rgba(34, 197, 94, 0.08)';
    return theme.backgroundTwo || 'rgba(255, 255, 255, 0.02)';
  }};
  border: 1px solid ${({ isWinner, $isHovered, theme }) => {
    if ($isHovered) return theme.primary || '#3b82f6';
    if (isWinner) return 'rgba(34, 197, 94, 0.15)';
    return 'transparent';
  }};
  cursor: ${({ isTbd }) => isTbd ? 'default' : 'pointer'};
  transition: all 0.15s ease;
  
  &:hover {
    background: ${({ isTbd, $isHovered, theme }) => {
      if (isTbd) return theme.backgroundTwo || 'rgba(255, 255, 255, 0.02)';
      if ($isHovered) return 'rgba(59, 130, 246, 0.18)';
      return theme.backgroundThree || 'rgba(255, 255, 255, 0.06)';
    }};
  }
`;

interface TeamNameProps {
  isWinner?: boolean;
  isTbd?: boolean;
  $isHovered?: boolean;
}

const TeamName = styled.span<TeamNameProps>`
  font-size: 0.85rem;
  font-weight: ${({ isWinner, $isHovered }) => (isWinner || $isHovered) ? '700' : '600'};
  color: ${({ isWinner, isTbd, $isHovered, theme }) => {
    if ($isHovered) return theme.primary || '#3b82f6';
    if (isWinner) return theme.success || '#22c55e';
    if (isTbd) return theme.textAlt || '#64748b';
    return theme.text || '#f8fafc';
  }};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

interface TeamScoreProps {
  isWinner?: boolean;
  isTbd?: boolean;
  $isHovered?: boolean;
}

const TeamScore = styled.span<TeamScoreProps>`
  font-size: 0.9rem;
  font-weight: 800;
  color: ${({ isWinner, isTbd, $isHovered, theme }) => {
    if ($isHovered) return theme.primary || '#3b82f6';
    if (isWinner) return theme.success || '#22c55e';
    if (isTbd) return theme.textAlt || '#475569';
    return theme.textAlt || '#94a3b8';
  }};
`;

const MatchMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.3rem;
  font-size: 0.75rem;
`;

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = styled.span<StatusBadgeProps>`
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: ${({ status }) => status === 'completed' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)'};
  color: ${({ status }) => status === 'completed' ? '#22c55e' : '#eab308'};
  border: 1px solid ${({ status }) => status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'};
`;

const CoinsBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #eab308;
  font-weight: 700;
  font-size: 0.7rem;
  background: rgba(234, 179, 8, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(234, 179, 8, 0.15);
`;

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #a855f7;
  font-weight: 700;
  font-size: 0.7rem;
  background: rgba(168, 85, 247, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(168, 85, 247, 0.15);
`;

const DoubleEliminationBracket: React.FC = () => {
  const { bracket } = useTournament();
  const navigate = useNavigate();
  const { urlDivision } = useDivision();

  const [hoveredTeamId, setHoveredTeamId] = React.useState<number | null>(null);
  const [hoveredMatchId, setHoveredMatchId] = React.useState<number | null>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const [paths, setPaths] = React.useState<{ d: string; isActive: boolean }[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const findSeedById = React.useCallback((id: number): BracketSeed | null => {
    for (const round of bracket) {
      const seed = round.seeds.find(s => s.id === id);
      if (seed) return seed;
    }
    return null;
  }, [bracket]);

  React.useLayoutEffect(() => {
    if (!containerRef.current || bracket.length === 0) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    setDimensions({
      width: container.scrollWidth,
      height: container.scrollHeight
    });

    const getRowCenter = (matchId: number, slot: 1 | 2) => {
      const el = container.querySelector(`[data-match-row-id="${matchId}-${slot}"]`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + container.scrollLeft,
        y: rect.top - containerRect.top + container.scrollTop + rect.height / 2
      };
    };

    const isConnActive = (conn: { from: number; to: number; type: string }) => {
      if (hoveredTeamId === null) return false;
      
      const fromSeed = findSeedById(conn.from);
      const toSeed = findSeedById(conn.to);
      
      if (fromSeed) {
        const isTeamInFrom = fromSeed.team1Id === hoveredTeamId || fromSeed.team2Id === hoveredTeamId;
        if (isTeamInFrom) {
          if (fromSeed.status === 'completed') {
            const isWinner = fromSeed.winnerId === hoveredTeamId;
            if (conn.type === 'winner' && isWinner) return true;
            if (conn.type === 'loser' && !isWinner) return true;
          } else {
            return true;
          }
        }
      }
      
      if (toSeed) {
        const isTeamInTo = toSeed.team1Id === hoveredTeamId || toSeed.team2Id === hoveredTeamId;
        if (isTeamInTo) return true;
      }
      
      return false;
    };

    const newPaths: typeof paths = [];

    const connections = [
      // Upper to Upper
      { from: 1, fromSlot: 1, to: 3, toSlot: 1, type: 'winner' }, 
      { from: 2, fromSlot: 1, to: 3, toSlot: 2, type: 'winner' }, 
      
      // Lower to Lower
      { from: 4, fromSlot: 1, to: 6, toSlot: 1, type: 'winner' }, 
      { from: 5, fromSlot: 1, to: 6, toSlot: 2, type: 'winner' }, 
      { from: 6, fromSlot: 1, to: 7, toSlot: 2, type: 'winner' }, 

      // Connect to Grand Finals
      { from: 3, fromSlot: 1, to: 8, toSlot: 1, type: 'winner' },
      { from: 7, fromSlot: 1, to: 8, toSlot: 2, type: 'winner' },

      // Grand Finals Reset
      { from: 8, fromSlot: 1, to: 9, toSlot: 1, type: 'reset' }   
    ];

    connections.forEach(conn => {
      const fromEl = container.querySelector(`[data-match-card-id="${conn.from}"]`);
      const toRow = getRowCenter(conn.to, conn.toSlot as 1 | 2);

      if (fromEl && toRow) {
        const fromRect = fromEl.getBoundingClientRect();
        const startX = fromRect.right - containerRect.left + container.scrollLeft;
        const startY = fromRect.top - containerRect.top + container.scrollTop + fromRect.height / 2;

        const endX = toRow.x;
        const endY = toRow.y;

        const midX = startX + (endX - startX) * 0.45;
        const d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
        
        const isPathActive = isConnActive(conn) || (hoveredMatchId === conn.from && (conn.type === 'winner' || conn.type === 'reset'));

        newPaths.push({ d, isActive: isPathActive });
      }
    });

    setPaths(newPaths);
  }, [bracket, hoveredTeamId, hoveredMatchId, findSeedById]);

  if (!bracket || bracket.length === 0) {
    return <p>Bracket not yet finalized.</p>;
  }

  const parseScore = (scoreStr: string | undefined) => {
    if (!scoreStr) return { s1: '-', s2: '-' };
    const parts = scoreStr.split('-');
    if (parts.length === 2) {
      return { s1: parts[0], s2: parts[1] };
    }
    return { s1: '-', s2: '-' };
  };

  const handleTeamClick = (teamId: number) => {
    if (teamId > 0) {
      navigate(`/teams/${teamId}?division=${urlDivision}`);
    }
  };

  const getSeedPlaceholderName = (seedId: number, slot: 1 | 2): string => {
    switch (seedId) {
      case 1: return slot === 1 ? 'Seed 1' : 'Seed 4';
      case 2: return slot === 1 ? 'Seed 2' : 'Seed 3';
      case 3: return slot === 1 ? 'Winner M1' : 'Winner M2';
      case 4: return slot === 1 ? 'Seed 5' : 'Loser M1';
      case 5: return slot === 1 ? 'Seed 6' : 'Loser M2';
      case 6: return slot === 1 ? 'Winner M4' : 'Winner M5';
      case 7: return slot === 1 ? 'Loser M3' : 'Winner M6';
      case 8: return slot === 1 ? 'Winner M3' : 'Winner M7';
      case 9: return 'Grand Finals Reset';
      default: return 'TBD';
    }
  };

  const renderSeedCard = (seed: BracketSeed) => {
    const [team1, team2] = seed.teams;
    const isCompleted = seed.status === 'completed';
    const isT1Winner = isCompleted && seed.winnerId === seed.team1Id;
    const isT2Winner = isCompleted && seed.winnerId === seed.team2Id;

    const t1Id = seed.team1Id || 0;
    const t2Id = seed.team2Id || 0;
    const t1Name = t1Id > 0 ? (team1?.name || `Team ${t1Id}`) : getSeedPlaceholderName(seed.id, 1);
    const t2Name = t2Id > 0 ? (team2?.name || `Team ${t2Id}`) : getSeedPlaceholderName(seed.id, 2);

    const { s1, s2 } = parseScore(seed.score);

    const t1CoinWinner = seed.coinFlipResult === 'heads';
    const t2CoinWinner = seed.coinFlipResult === 'tails';

    const isT1Hovered = t1Id > 0 && t1Id === hoveredTeamId;
    const isT2Hovered = t2Id > 0 && t2Id === hoveredTeamId;
    const isMatchHovered = seed.id === hoveredMatchId;

    return (
      <MatchCard 
        key={seed.id} 
        isCompleted={isCompleted}
        data-match-card-id={seed.id}
        $isHovered={isMatchHovered}
        onMouseEnter={() => setHoveredMatchId(seed.id)}
        onMouseLeave={() => setHoveredMatchId(null)}
      >
        <MatchHeader>
          <span>Match #{seed.id}</span>
          <span>Week {seed.weekPlayed}</span>
        </MatchHeader>

        <TeamRow 
          isWinner={isT1Winner} 
          isTbd={t1Id <= 0}
          $isHovered={isT1Hovered}
          data-match-row-id={`${seed.id}-1`}
          onMouseEnter={() => t1Id > 0 && setHoveredTeamId(t1Id)}
          onMouseLeave={() => setHoveredTeamId(null)}
          onClick={() => handleTeamClick(t1Id)}
        >
          <TeamName isWinner={isT1Winner} isTbd={t1Id <= 0} $isHovered={isT1Hovered}>
            {t1Name}
            {t1CoinWinner && <CoinsBadge title="Side Selection Coin Flip Winner"><FaCoins /></CoinsBadge>}
          </TeamName>
          <TeamScore isWinner={isT1Winner} isTbd={t1Id <= 0} $isHovered={isT1Hovered}>{s1}</TeamScore>
        </TeamRow>

        <TeamRow 
          isWinner={isT2Winner} 
          isTbd={t2Id <= 0}
          $isHovered={isT2Hovered}
          data-match-row-id={`${seed.id}-2`}
          onMouseEnter={() => t2Id > 0 && setHoveredTeamId(t2Id)}
          onMouseLeave={() => setHoveredTeamId(null)}
          onClick={() => handleTeamClick(t2Id)}
        >
          <TeamName isWinner={isT2Winner} isTbd={t2Id <= 0} $isHovered={isT2Hovered}>
            {t2Name}
            {t2CoinWinner && <CoinsBadge title="Side Selection Coin Flip Winner"><FaCoins /></CoinsBadge>}
          </TeamName>
          <TeamScore isWinner={isT2Winner} isTbd={t2Id <= 0} $isHovered={isT2Hovered}>{s2}</TeamScore>
        </TeamRow>

        <MatchMeta>
          <StatusBadge status={seed.status}>{seed.status}</StatusBadge>
          {seed.tournamentCodes && seed.tournamentCodes.length > 0 && (
            <LiveBadge title="Live Tournament Codes Available"><FaTv /> Codes</LiveBadge>
          )}
        </MatchMeta>
      </MatchCard>
    );
  };

  const wSF = [findSeedById(1), findSeedById(2)].filter((x): x is BracketSeed => x !== null);
  const wfMatch = findSeedById(3);

  const lR1 = [findSeedById(4), findSeedById(5)].filter((x): x is BracketSeed => x !== null);
  const lSF = [findSeedById(6)].filter((x): x is BracketSeed => x !== null);
  const lF = [findSeedById(7)].filter((x): x is BracketSeed => x !== null);

  const gfMatch = findSeedById(8);
  const gfResetMatch = findSeedById(9);

  const isResetNeeded = gfMatch && gfMatch.status === 'completed' && gfMatch.winnerId === gfMatch.team2Id;

  return (
    <BracketWrapper>
      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        ← Swipe horizontally to view full bracket progress →
      </div>
      
      <div style={{ position: 'relative' }}>
        <ColumnsWrapper ref={containerRef}>
          {dimensions.width > 0 && (
            <SvgOverlay width={dimensions.width} height={dimensions.height}>
              {paths.map((p, idx) => (
                <ConnectorPath key={idx} d={p.d} $isActive={p.isActive} />
              ))}
            </SvgOverlay>
          )}

          <LeftSection>
            {/* UPPER BRACKET */}
            <BracketRow>
              <RoundColumn>
                <RoundTitle>Winners Semifinals</RoundTitle>
                <MatchupsList style={{ justifyContent: 'space-around', minHeight: '340px' }}>
                  {wSF.map(renderSeedCard)}
                </MatchupsList>
              </RoundColumn>

              <RoundColumn>
                <RoundTitle>Winners Finals</RoundTitle>
                <MatchupsList style={{ justifyContent: 'center', minHeight: '340px' }}>
                  {wfMatch && renderSeedCard(wfMatch)}
                </MatchupsList>
              </RoundColumn>
            </BracketRow>

            {/* LOWER BRACKET */}
            <BracketRow>
              <RoundColumn>
                <RoundTitle>Losers Round 1</RoundTitle>
                <MatchupsList style={{ justifyContent: 'space-around', minHeight: '340px' }}>
                  {lR1.map(renderSeedCard)}
                </MatchupsList>
              </RoundColumn>

              <RoundColumn>
                <RoundTitle>Losers Semifinals</RoundTitle>
                <MatchupsList style={{ justifyContent: 'center', minHeight: '340px' }}>
                  {lSF.map(renderSeedCard)}
                </MatchupsList>
              </RoundColumn>

              <RoundColumn>
                <RoundTitle>Losers Finals</RoundTitle>
                <MatchupsList style={{ justifyContent: 'center', minHeight: '340px' }}>
                  {lF.map(renderSeedCard)}
                </MatchupsList>
              </RoundColumn>
            </BracketRow>
          </LeftSection>

          <RightSection>
            <RoundColumn style={{ maxWidth: '320px' }}>
              <RoundTitle>Grand Finals</RoundTitle>
              <MatchupsList style={{ justifyContent: 'center', minHeight: '340px' }}>
                {gfMatch && renderSeedCard(gfMatch)}
              </MatchupsList>
            </RoundColumn>

            {(isResetNeeded || (gfResetMatch && gfResetMatch.team1Id > 0)) && (
              <RoundColumn style={{ maxWidth: '320px' }}>
                <RoundTitle>GF Reset (If Needed)</RoundTitle>
                <MatchupsList style={{ justifyContent: 'center', minHeight: '340px' }}>
                  {gfResetMatch && renderSeedCard(gfResetMatch)}
                </MatchupsList>
              </RoundColumn>
            )}
          </RightSection>
        </ColumnsWrapper>
      </div>
    </BracketWrapper>
  );
};

export default DoubleEliminationBracket;
