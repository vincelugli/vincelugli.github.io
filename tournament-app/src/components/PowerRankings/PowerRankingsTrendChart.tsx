import React, { useState, useMemo, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { WeeklyPowerRanking } from '../../types';
import { FaArrowUp, FaArrowDown, FaMinus, FaAward } from 'react-icons/fa';
import { cleanTeamName } from '../../utils';

const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px ${({ theme }) => theme.boxShadow};
  margin-top: 1.5rem;
  position: relative;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const ChartSubtitle = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textAlt};
`;

const SvgContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  position: relative;
`;

const TooltipContainer = styled.div<{ active: boolean; x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -100%);
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 4px 15px ${({ theme }) => theme.boxShadow};
  pointer-events: none;
  opacity: ${props => (props.active ? 1 : 0)};
  transition: opacity 0.15s ease, left 0.1s ease, top 0.1s ease;
  z-index: 10;
  min-width: 180px;
  max-width: 280px;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TooltipTeam = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const TooltipRankRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.95rem;
`;

const TooltipComment = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondaryText};
  border-left: 2px solid ${({ theme }) => theme.borderColor || theme.border};
  padding-left: 6px;
  margin-top: 4px;
  font-style: italic;
  white-space: normal;
`;

const ChangeIndicator = styled.span<{ changeType: 'up' | 'down' | 'neutral' | 'new' }>`
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: ${({ theme, changeType }) => 
    changeType === 'up' ? theme.success :
    changeType === 'down' ? theme.danger :
    changeType === 'new' ? theme.primary :
    theme.textAlt
  };
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const LegendItem = styled.div<{ active: boolean; isDimmed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => (props.active ? props.theme.text : props.theme.textAlt)};
  opacity: ${props => (props.isDimmed ? 0.4 : 1)};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => (props.active && !props.isDimmed ? props.theme.backgroundThree : 'transparent')};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.text};
    background-color: ${props => props.theme.backgroundTwo};
  }
`;

const ColorIndicator = styled.span<{ color: string; disabled: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => (props.disabled ? 'transparent' : props.color)};
  border: 2px solid ${props => props.color};
  display: inline-block;
  transition: background-color 0.2s ease;
`;

const YAxisLabel = styled.text`
  font-size: 0.8rem;
  fill: ${({ theme }) => theme.textAlt};
  text-anchor: end;
  dominant-baseline: middle;
  font-weight: 500;
`;

const XAxisLabel = styled.text`
  font-size: 0.8rem;
  fill: ${({ theme }) => theme.textAlt};
  text-anchor: middle;
  font-weight: 500;
`;

const GridLine = styled.line`
  stroke: ${({ theme }) => theme.border};
  stroke-width: 1;
  stroke-dasharray: 4,4;
  opacity: 0.4;
`;

const PathLine = styled.path<{ color: string; isHovered: boolean; isDimmed: boolean }>`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: ${props => (props.isHovered ? 4 : 2)};
  stroke-opacity: ${props => (props.isDimmed ? 0.15 : 1)};
  transition: stroke-width 0.2s ease, stroke-opacity 0.2s ease;
  cursor: pointer;
`;

const PointDot = styled.circle<{ color: string; isHovered: boolean; isDimmed: boolean }>`
  fill: ${props => props.color};
  stroke: ${({ theme }) => theme.background};
  stroke-width: 1.5;
  opacity: ${props => (props.isDimmed ? 0.15 : 1)};
  r: ${props => (props.isHovered ? 6 : 4)};
  transition: r 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
`;

const TEAM_COLORS = [
  '#FF6B6B', // Red
  '#4DABF7', // Blue
  '#51CF66', // Green
  '#FCC419', // Yellow
  '#FF922B', // Orange
  '#845EF7', // Violet
  '#AE3EC9', // Grape
  '#3BC9DB', // Cyan
  '#94D82D', // Lime
  '#F06595'  // Pink
];

interface PowerRankingsTrendChartProps {
  weeks: WeeklyPowerRanking[];
}

const PowerRankingsTrendChart: React.FC<PowerRankingsTrendChartProps> = ({ weeks }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTeamName, setHoveredTeamName] = useState<string | null>(null);
  const [disabledTeams, setDisabledTeams] = useState<string[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    teamName: string;
    weekNum: number;
    rank: number;
    change: string;
    comments: string;
    x: number;
    y: number;
  } | null>(null);

  const sortedWeeks = useMemo(() => {
    return [...weeks].sort((a, b) => a.week - b.week);
  }, [weeks]);

  const uniqueTeams = useMemo(() => {
    const teamsMap = new Map<string, number | null>();
    sortedWeeks.forEach(w => {
      w.rankings.forEach(r => {
        const normalizedName = cleanTeamName(r.team);
        if (!teamsMap.has(normalizedName)) {
          teamsMap.set(normalizedName, r.teamId ?? null);
        } else if (r.teamId && teamsMap.get(normalizedName) === null) {
          teamsMap.set(normalizedName, r.teamId);
        }
      });
    });
    return Array.from(teamsMap.entries()).map(([name, id]) => ({ name, id }));
  }, [sortedWeeks]);

  const teamColors = useMemo(() => {
    const colors: { [teamName: string]: string } = {};
    uniqueTeams.forEach((team, index) => {
      colors[team.name] = TEAM_COLORS[index % TEAM_COLORS.length];
    });
    return colors;
  }, [uniqueTeams]);

  const maxRank = useMemo(() => {
    let max = 1;
    sortedWeeks.forEach(w => {
      w.rankings.forEach(r => {
        if (r.rank > max) max = r.rank;
      });
    });
    return max;
  }, [sortedWeeks]);

  // SVG Dimension setups
  const width = 800;
  const height = 350;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = useCallback((index: number) => {
    if (sortedWeeks.length <= 1) {
      return paddingLeft + chartWidth / 2;
    }
    return paddingLeft + (index / (sortedWeeks.length - 1)) * chartWidth;
  }, [sortedWeeks.length, chartWidth]);

  const getY = useCallback((rank: number) => {
    if (maxRank <= 1) {
      return paddingTop + chartHeight / 2;
    }
    return paddingTop + ((rank - 1) / (maxRank - 1)) * chartHeight;
  }, [maxRank, chartHeight]);

  const horizontalGridLines = useMemo(() => {
    const lines = [];
    const step = maxRank > 12 ? Math.ceil(maxRank / 8) : 1;
    for (let r = 1; r <= maxRank; r += step) {
      lines.push(r);
    }
    if (lines[lines.length - 1] !== maxRank) {
      lines.push(maxRank);
    }
    return lines;
  }, [maxRank]);

  const teamLines = useMemo(() => {
    return uniqueTeams.map(team => {
      const points: { weekIndex: number; weekNum: number; rank: number; x: number; y: number; change: string; comments: string }[] = [];
      sortedWeeks.forEach((w, weekIndex) => {
        const item = w.rankings.find(r => cleanTeamName(r.team).toLowerCase() === team.name.toLowerCase());
        if (item) {
          points.push({
            weekIndex,
            weekNum: w.week,
            rank: item.rank,
            x: getX(weekIndex),
            y: getY(item.rank),
            change: item.change,
            comments: item.comments,
          });
        }
      });
      return {
        teamName: team.name,
        points,
      };
    });
  }, [uniqueTeams, sortedWeeks, getX, getY]);

  const getPathD = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const handleMouseEnterPoint = (e: React.MouseEvent<SVGCircleElement>, point: any, teamName: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = containerRef.current?.getBoundingClientRect();
    
    if (container) {
      const tooltipX = rect.left - container.left + rect.width / 2;
      const tooltipY = rect.top - container.top - 8;
      
      setHoveredPoint({
        teamName,
        weekNum: point.weekNum,
        rank: point.rank,
        change: point.change,
        comments: point.comments,
        x: tooltipX,
        y: tooltipY,
      });
    }
    setHoveredTeamName(teamName);
  };

  const handleMouseLeavePoint = () => {
    setHoveredPoint(null);
    setHoveredTeamName(null);
  };

  const getChangeType = (change: string): 'up' | 'down' | 'neutral' | 'new' => {
    const trimmed = change.trim().toLowerCase();
    if (trimmed.startsWith('+') || trimmed === 'up') return 'up';
    if (trimmed === 'new') return 'new';
    if (/^-\s*\d+$/.test(trimmed) || trimmed === 'down') return 'down';
    return 'neutral';
  };

  const getChangeIcon = (changeType: 'up' | 'down' | 'neutral' | 'new') => {
    switch (changeType) {
      case 'up': return <FaArrowUp size={10} />;
      case 'down': return <FaArrowDown size={10} />;
      case 'new': return <FaAward size={10} />;
      default: return <FaMinus size={10} />;
    }
  };

  const toggleTeam = (teamName: string) => {
    setDisabledTeams(prev => {
      if (prev.includes(teamName)) {
        return prev.filter(t => t !== teamName);
      } else {
        // Prevent disabling all teams
        const activeCount = uniqueTeams.length - prev.length;
        if (activeCount <= 1) return prev;
        return [...prev, teamName];
      }
    });
  };

  return (
    <ChartCard ref={containerRef}>
      <ChartHeader>
        <ChartTitle>Rankings Trend</ChartTitle>
        <ChartSubtitle>Hover points for details • Click legend to filter</ChartSubtitle>
      </ChartHeader>

      <SvgContainer>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ display: 'block', overflow: 'visible' }}>
          {/* Horizontal Gridlines & Y labels */}
          {horizontalGridLines.map(rank => (
            <React.Fragment key={rank}>
              <GridLine
                x1={paddingLeft}
                y1={getY(rank)}
                x2={width - paddingRight}
                y2={getY(rank)}
              />
              <YAxisLabel x={paddingLeft - 10} y={getY(rank)}>
                #{rank}
              </YAxisLabel>
            </React.Fragment>
          ))}

          {/* Vertical Gridlines & X labels */}
          {sortedWeeks.map((w, index) => (
            <React.Fragment key={w.week}>
              <GridLine
                x1={getX(index)}
                y1={paddingTop}
                x2={getX(index)}
                y2={height - paddingBottom}
              />
              <XAxisLabel x={getX(index)} y={height - paddingBottom + 20}>
                Week {w.week}
              </XAxisLabel>
            </React.Fragment>
          ))}

          {/* Render Path Lines */}
          {teamLines
            .filter(t => !disabledTeams.includes(t.teamName))
            .map(t => {
              const color = teamColors[t.teamName] || '#999';
              const isHovered = hoveredTeamName === t.teamName;
              const isDimmed = hoveredTeamName !== null && hoveredTeamName !== t.teamName;

              return (
                <PathLine
                  key={t.teamName}
                  d={getPathD(t.points)}
                  color={color}
                  isHovered={isHovered}
                  isDimmed={isDimmed}
                  onMouseEnter={() => setHoveredTeamName(t.teamName)}
                  onMouseLeave={() => setHoveredTeamName(null)}
                />
              );
            })}

          {/* Render Point Dots (done in a separate loop to render on top of the lines) */}
          {teamLines
            .filter(t => !disabledTeams.includes(t.teamName))
            .map(t => {
              const color = teamColors[t.teamName] || '#999';
              const isHovered = hoveredTeamName === t.teamName;
              const isDimmed = hoveredTeamName !== null && hoveredTeamName !== t.teamName;

              return t.points.map((p, idx) => (
                <PointDot
                  key={`${t.teamName}-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  color={color}
                  isHovered={isHovered || (hoveredPoint?.teamName === t.teamName && hoveredPoint?.weekNum === p.weekNum)}
                  isDimmed={isDimmed}
                  onMouseEnter={(e) => handleMouseEnterPoint(e, p, t.teamName)}
                  onMouseLeave={handleMouseLeavePoint}
                />
              ));
            })}
        </svg>
      </SvgContainer>

      {/* Tooltip component */}
      <TooltipContainer
        active={hoveredPoint !== null}
        x={hoveredPoint?.x || 0}
        y={hoveredPoint?.y || 0}
      >
        {hoveredPoint && (
          <>
            <TooltipTeam>{hoveredPoint.teamName}</TooltipTeam>
            <TooltipRankRow>
              <span>Rank: #{hoveredPoint.rank}</span>
              <ChangeIndicator changeType={getChangeType(hoveredPoint.change)}>
                {getChangeIcon(getChangeType(hoveredPoint.change))}
                {hoveredPoint.change !== '0' && hoveredPoint.change}
              </ChangeIndicator>
            </TooltipRankRow>
            {hoveredPoint.comments && (
              <TooltipComment>{hoveredPoint.comments}</TooltipComment>
            )}
          </>
        )}
      </TooltipContainer>

      {/* Legend below the chart */}
      <Legend>
        {uniqueTeams.map(team => {
          const color = teamColors[team.name] || '#999';
          const isDisabled = disabledTeams.includes(team.name);
          const isDimmed = hoveredTeamName !== null && hoveredTeamName !== team.name;

          return (
            <LegendItem
              key={team.name}
              active={!isDisabled}
              isDimmed={isDimmed}
              onClick={() => toggleTeam(team.name)}
              onMouseEnter={() => !isDisabled && setHoveredTeamName(team.name)}
              onMouseLeave={() => setHoveredTeamName(null)}
            >
              <ColorIndicator color={color} disabled={isDisabled} />
              <span>{team.name}</span>
            </LegendItem>
          );
        })}
      </Legend>
    </ChartCard>
  );
};

export default PowerRankingsTrendChart;
