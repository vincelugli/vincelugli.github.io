import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { WeeklyPowerRanking } from '../../types';
import { useDivision } from '../../context/DivisionContext';
import { useTournament } from '../../context/TournamentContext';
import { getFirebasePrefix } from '../../utils';
import { FaArrowUp, FaArrowDown, FaMinus, FaAward } from 'react-icons/fa';
import PowerRankingsTrendChart from './PowerRankingsTrendChart';
import {
  PowerRankingsContainer,
  PowerRankingsHeader,
  PowerRankingsTitle,
  PowerRankingsSubtitle,
  PowerRankingsUpdateInfo,
  PowerRankingsList,
  PowerRankingCard,
  PowerRankingRankSection,
  PowerRankingRankNumber,
  PowerRankingChange,
  PowerRankingInfo,
  PowerRankingTeamName,
  PowerRankingTeamLink,
  PowerRankingRoster,
  PowerRankingComments,
  PowerRankingsLoading,
  PowerRankingsError,
  PowerRankingsEmpty,
  PowerRankingsControlsRow,
  PowerRankingsDropdownContainer,
  PowerRankingsDropdownLabel,
  PowerRankingsDropdownSelect
} from '../../styles';

const PowerRankingsPage: React.FC = () => {
  const { division } = useDivision();
  const { teams } = useTournament();
  const [weeks, setWeeks] = useState<WeeklyPowerRanking[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPowerRankings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const prefix = getFirebasePrefix();
        const docRef = doc(db, 'powerRankings', `${prefix}_${division}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.weeks) {
            const loadedWeeks: WeeklyPowerRanking[] = data.weeks || [];
            const sortedWeeks = [...loadedWeeks].sort((a, b) => b.week - a.week);
            setWeeks(loadedWeeks);
            if (sortedWeeks.length > 0) {
              setSelectedWeek(sortedWeeks[0].week);
            }
          } else if (data.rankings) {
            const legacyWeek: WeeklyPowerRanking = {
              week: 1,
              updatedAt: data.updatedAt || Date.now(),
              rankings: data.rankings
            };
            setWeeks([legacyWeek]);
            setSelectedWeek(1);
          } else {
            setWeeks([]);
            setSelectedWeek(null);
          }
        } else {
          setWeeks([]);
          setSelectedWeek(null);
        }
      } catch (err) {
        console.error("Error fetching power rankings:", err);
        setError("Failed to load power rankings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPowerRankings();
  }, [division]);

  const currentWeekData = useMemo(() => {
    if (selectedWeek === null) return null;
    return weeks.find(w => w.week === selectedWeek) || null;
  }, [weeks, selectedWeek]);

  const availableWeeks = useMemo(() => {
    return weeks.map(w => w.week).sort((a, b) => b - a);
  }, [weeks]);

  const getChangeType = (change: string): 'up' | 'down' | 'neutral' | 'new' => {
    const trimmed = change.trim().toLowerCase();
    if (trimmed.startsWith('+') || trimmed === 'up') return 'up';
    if (trimmed === 'new') return 'new';
    if (/^-\s*\d+$/.test(trimmed) || trimmed === 'down') return 'down';
    return 'neutral';
  };

  const getChangeIcon = (change: string, changeType: 'up' | 'down' | 'neutral' | 'new') => {
    switch (changeType) {
      case 'up':
        return <FaArrowUp size={10} />;
      case 'down':
        return <FaArrowDown size={10} />;
      case 'new':
        return <FaAward size={10} />;
      default:
        return <FaMinus size={10} />;
    }
  };

  const getFormatChange = (change: string, changeType: 'up' | 'down' | 'neutral' | 'new') => {
    if (changeType === 'neutral' && (change === '0' || change === '')) {
      return '-';
    }
    return change;
  };

  const findTeamIdByName = (teamName: string): number | null => {
    if (!teams) return null;
    const match = teams.find(t => t.name.toLowerCase().trim() === teamName.toLowerCase().trim());
    return match ? match.id : null;
  };

  if (isLoading) {
    return (
      <PowerRankingsLoading>
        <p>Loading Power Rankings...</p>
      </PowerRankingsLoading>
    );
  }

  if (error) {
    return (
      <PowerRankingsError>
        <p>{error}</p>
      </PowerRankingsError>
    );
  }

  return (
    <PowerRankingsContainer>
      <PowerRankingsHeader>
        <PowerRankingsTitle>Team Power Rankings</PowerRankingsTitle>
        <PowerRankingsSubtitle>
          Slippy's (probably biased) unofficial power rankings for the {(division === 'gold' ? 'elemental' : 'elder').toUpperCase()} Division
        </PowerRankingsSubtitle>
      </PowerRankingsHeader>

      {weeks.length > 0 && (
        <PowerRankingsControlsRow>
          <PowerRankingsDropdownContainer>
            <PowerRankingsDropdownLabel htmlFor="week-select">Select Week:</PowerRankingsDropdownLabel>
            <PowerRankingsDropdownSelect
              id="week-select"
              value={selectedWeek || ''}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
            >
              {availableWeeks.map(wk => (
                <option key={wk} value={wk}>Week {wk}</option>
              ))}
            </PowerRankingsDropdownSelect>
          </PowerRankingsDropdownContainer>
        </PowerRankingsControlsRow>
      )}

      {currentWeekData && currentWeekData.updatedAt && (
        <PowerRankingsUpdateInfo>
          Last updated: {new Date(currentWeekData.updatedAt).toLocaleDateString()}
        </PowerRankingsUpdateInfo>
      )}

      {!currentWeekData || currentWeekData.rankings.length === 0 ? (
        <PowerRankingsEmpty>
          <p>No power rankings have been published for this division yet.</p>
        </PowerRankingsEmpty>
      ) : (
        <PowerRankingsList>
          {currentWeekData.rankings.map((item) => {
            const changeType = getChangeType(item.change);
            const resolvedTeamId = item.teamId ?? findTeamIdByName(item.team);

            return (
              <PowerRankingCard key={item.rank}>
                <PowerRankingRankSection>
                  <PowerRankingRankNumber>#{item.rank}</PowerRankingRankNumber>
                  <PowerRankingChange changeType={changeType}>
                    {getChangeIcon(item.change, changeType)}
                    <span>{getFormatChange(item.change, changeType)}</span>
                  </PowerRankingChange>
                </PowerRankingRankSection>

                <PowerRankingInfo>
                  <PowerRankingTeamName>
                    {resolvedTeamId !== null ? (
                      <PowerRankingTeamLink to={`/teams/${resolvedTeamId}`}>
                        {item.team}
                      </PowerRankingTeamLink>
                    ) : (
                      item.team
                    )}
                  </PowerRankingTeamName>

                  <PowerRankingRoster>
                    <strong>Roster:</strong> {item.roster}
                  </PowerRankingRoster>

                  {item.comments && (
                    <PowerRankingComments>
                      {item.comments}
                    </PowerRankingComments>
                  )}
                </PowerRankingInfo>
              </PowerRankingCard>
            );
          })}
        </PowerRankingsList>
      )}

      {weeks.length > 1 && (
        <PowerRankingsTrendChart weeks={weeks} />
      )}
    </PowerRankingsContainer>
  );
};

export default PowerRankingsPage;
