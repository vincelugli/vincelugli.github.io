import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../Common/AuthContext';
import { usePlayers } from '../../context/PlayerContext';
import { useDivision } from '../../context/DivisionContext';
import { getFirebasePrefix } from '../../utils';
import { Team, Player } from '../../types';
import Button from '../Common/Button';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  Input,
  ErrorMessage,
  AvailabilityPageContainer,
  AvailabilitySectionTitle,
  AvailabilityControlsContainer,
  AvailabilitySelect,
  AvailabilityGridContainer,
  AvailabilityGrid,
  AvailabilityGridHeader,
  AvailabilityTimeLabel,
  AvailabilitySlot,
  AvailabilitySlotCount,
  AvailabilityBestSlotsContainer,
  AvailabilityBestSlotCard,
  AvailabilityScoreBadge,
  AvailabilityStatusMessage,
} from '../../styles';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const fullTimes = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const fullTimes30 = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const min = (i % 2 === 0) ? '00' : '30';
  return `${hour}:${min}`;
});

const combineConsecutiveTimes = (activeSlots: string[], timeList: string[]) => {
  const grouped: { [day: string]: number[] } = {};
  
  const getNextSlotTime = (list: string[], idx: number) => {
    if (idx + 1 < list.length) {
      return list[idx + 1];
    }
    const lastTime = list[idx];
    const [h, m] = lastTime.split(':').map(Number);
    const is30m = list.length === 48;
    if (is30m) {
      const newM = m + 30;
      const newH = h + Math.floor(newM / 60);
      return `${newH.toString().padStart(2, '0')}:${(newM % 60).toString().padStart(2, '0')}`;
    } else {
      return `${(h + 1).toString().padStart(2, '0')}:00`;
    }
  };

  activeSlots.forEach(slot => {
    const [day, time] = slot.split('-');
    const index = timeList.indexOf(time);
    if (index !== -1) {
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(index);
    }
  });

  const result: string[] = [];

  days.forEach(day => {
    if (!grouped[day]) return;
    
    const indices = grouped[day].sort((a, b) => a - b);
    let startIdx = indices[0];
    let prevIdx = indices[0];

    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === prevIdx + 1) {
        prevIdx = indices[i];
      } else {
        result.push(`${day} ${timeList[startIdx]} - ${getNextSlotTime(timeList, prevIdx)}`);
        startIdx = indices[i];
        prevIdx = indices[i];
      }
    }
    result.push(`${day} ${timeList[startIdx]} - ${getNextSlotTime(timeList, prevIdx)}`);
  });

  return result;
};

const timezoneOffsets: { [key: string]: number } = {
  'PT': 0,
  'MT': 1,
  'CT': 2,
  'ET': 3,
  'GMT': 8,
  'CET': 9,
  'EET': 10,
};

const convertTime = (timeStr: string, offset: number) => {
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const newHourRaw = hour + offset;
  let newHour = (newHourRaw + 24) % 24;
  
  let suffix = '';
  if (newHourRaw >= 24) {
    suffix = ' (+1d)';
  } else if (newHourRaw < 0) {
    suffix = ' (-1d)';
  }
  
  return `${newHour.toString().padStart(2, '0')}:${minStr}${suffix}`;
};

const convertTimeAndDay = (day: string, timeStr: string, offset: number) => {
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  let dayIndex = days.indexOf(day);
  
  let newHour = hour + offset;
  if (newHour >= 24) {
    newHour = newHour - 24;
    dayIndex = (dayIndex + 1) % 7;
  } else if (newHour < 0) {
    newHour = newHour + 24;
    dayIndex = (dayIndex - 1 + 7) % 7;
  }
  
  return {
    day: days[dayIndex],
    time: `${newHour.toString().padStart(2, '0')}:${minStr}`
  };
};

const convertCombinedTime = (combinedTime: string, offset: number, targetTimezone: string) => {
  const match = combinedTime.match(/^(\w+) (\d{2}:\d{2}) - (\d{2}:\d{2})$/);
  if (!match) return combinedTime;
  const [_, day, start, end] = match;
  
  const convertedStart = convertTimeAndDay(day, start, offset);
  const convertedEnd = convertTimeAndDay(day, end, offset);
  
  if (convertedStart.day === convertedEnd.day) {
    return `${convertedStart.day} ${convertedStart.time} - ${convertedEnd.time} ${targetTimezone}`;
  } else {
    return `${convertedStart.day} ${convertedStart.time} - ${convertedEnd.day} ${convertedEnd.time} ${targetTimezone}`;
  }
};

const AvailabilityPage: React.FC = () => {
  const [visibleTimes, setVisibleTimes] = useState(['17:00', '18:00', '19:00', '20:00', '21:00', '22:00']);
  const [use30MinIncrements, setUse30MinIncrements] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('');
  const { teams } = useTournament();
  const { currentUser, captainTeamId, isTeamMember, isAdmin, isSub, subName } = useAuth();
  const { division } = useDivision();
  const { getPlayerById } = usePlayers();
  
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [compareTeamAId, setCompareTeamAId] = useState<number | null>(null);
  const [compareTeamBId, setCompareTeamBId] = useState<number | null>(null);
  
  const [availabilityData, setAvailabilityData] = useState<{ [teamId: number]: { slots: { [key: string]: number[] } } }>({});
  const [subAvailabilityData, setSubAvailabilityData] = useState<{ [subName: string]: { slots: { [key: string]: boolean } } }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (use30MinIncrements) {
      const newVisible: string[] = [];
      visibleTimes.forEach(t => {
        if (t.endsWith(':00')) {
          newVisible.push(t);
          const hour = t.split(':')[0];
          newVisible.push(`${hour}:30`);
        }
      });
      setVisibleTimes(newVisible);
    } else {
      setVisibleTimes(visibleTimes.filter(t => t.endsWith(':00')));
    }
  }, [use30MinIncrements]);

  const prefix = getFirebasePrefix();
  const docId = `${prefix}_${division}`;

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'availability', docId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setAvailabilityData(snapshot.data().teams || {});
          setSubAvailabilityData(snapshot.data().subs || {});
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [docId]);

  // Set initial selected team if captain
  useEffect(() => {
    if (captainTeamId) {
      const teamId = parseInt(captainTeamId, 10);
      setSelectedTeamId(teamId);
      setCompareTeamAId(teamId);
    }
  }, [captainTeamId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'availability', docId);
      if (isSub) {
        await setDoc(docRef, { subs: { [subName]: subAvailabilityData[subName] || { slots: {} } } }, { merge: true });
      } else {
        await setDoc(docRef, { teams: availabilityData }, { merge: true });
      }
      alert("Availability saved successfully!");
    } catch (error) {
      console.error("Failed to save availability:", error);
      alert("Failed to save availability.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSlot = (teamId: number, day: string, time: string, playerId: number) => {
    if (!currentUser) return; // Must be logged in
    const isAuthorized = isTeamMember && parseInt(captainTeamId, 10) === teamId;
    if (!isAuthorized) return; // Only authorized users can edit their team

    const key = `${day}-${time}`;
    setAvailabilityData(prev => {
      const teamAvail = prev[teamId] || { slots: {} };
      const currentSlots = teamAvail.slots[key] || [];
      
      let newSlots;
      if (currentSlots.includes(playerId)) {
        newSlots = currentSlots.filter(id => id !== playerId);
      } else {
        newSlots = [...currentSlots, playerId];
      }

      return {
        ...prev,
        [teamId]: {
          ...teamAvail,
          slots: {
            ...teamAvail.slots,
            [key]: newSlots
          }
        }
      };
    });
  };

  const toggleSubSlot = (day: string, time: string) => {
    if (!currentUser || !isSub) return;
    const key = `${day}-${time}`;
    setSubAvailabilityData(prev => {
      const myAvail = prev[subName] || { slots: {} };
      const currentSlots = myAvail.slots || {};
      const isSelected = currentSlots[key];
      
      return {
        ...prev,
        [subName]: {
          ...myAvail,
          slots: {
            ...currentSlots,
            [key]: !isSelected
          }
        }
      };
    });
  };

  const getBestSlots = (teamAId: number, teamBId: number) => {
    const availA = availabilityData[teamAId]?.slots || {};
    const availB = availabilityData[teamBId]?.slots || {};
    
    const allSlots: { day: string; time: string; score: number; teamACount: number; teamBCount: number }[] = [];
    
    days.forEach(day => {
      fullTimes.forEach(time => {
        const key = `${day}-${time}`;
        const playersA = availA[key] || [];
        const playersB = availB[key] || [];
        
        const score = playersA.length + playersB.length;
        
        allSlots.push({
          day,
          time,
          score,
          teamACount: playersA.length,
          teamBCount: playersB.length
        });
      });
    });
    
    return allSlots
      .filter(s => s.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const minA = Math.min(a.teamACount, a.teamBCount);
        const minB = Math.min(b.teamACount, b.teamBCount);
        if (minB !== minA) return minB - minA;
        return 0;
      })
      .slice(0, 5); // Top 5
  };

  const isAuthorized = isTeamMember && selectedTeamId === parseInt(captainTeamId, 10);
  const currentTeam = teams.find(t => t.id === selectedTeamId);

  const teamPlayers = currentTeam?.players || [];
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);

  useEffect(() => {
    if (teamPlayers.length > 0 && !activePlayerId) {
      setActivePlayerId(teamPlayers[0]);
    }
  }, [teamPlayers, activePlayerId]);

  const getStatusMessage = () => {
    if (!currentUser) return "Not logged in. View mode only.";
    if (isAdmin) return "Logged in as Admin.";
    if (isSub) return `Logged in as Substitute: ${subName}`;
    if (isTeamMember) {
      const myTeam = teams.find(t => t.id === parseInt(captainTeamId, 10));
      return `Logged in as member of Team: ${myTeam ? myTeam.name : captainTeamId}`;
    }
    return "Logged in.";
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError('');
    try {
      const auth = getAuth();
      const functions = getFunctions();
      const getToken = httpsCallable(functions, 'getAuthTokenForAccessCode');
      const year = getFirebasePrefix().replace('grumble', '');
      const result = await getToken({ accessCode, year });
      const token = (result.data as { token: string }).token;
      
      await signInWithCustomToken(auth, token);
      setAccessCode('');
    } catch (err: any) {
      setLoginError('Invalid access code.');
    } finally {
      setLoggingIn(false);
    }
  };

  const addHourAbove = () => {
    const firstVisible = visibleTimes[0];
    const activeTimesList = use30MinIncrements ? fullTimes30 : fullTimes;
    const firstIndex = activeTimesList.indexOf(firstVisible);
    if (firstIndex > 0) {
      setVisibleTimes([activeTimesList[firstIndex - 1], ...visibleTimes]);
    }
  };

  const addHourBelow = () => {
    const lastVisible = visibleTimes[visibleTimes.length - 1];
    const activeTimesList = use30MinIncrements ? fullTimes30 : fullTimes;
    const lastIndex = activeTimesList.indexOf(lastVisible);
    if (lastIndex < activeTimesList.length - 1) {
      setVisibleTimes([...visibleTimes, activeTimesList[lastIndex + 1]]);
    }
  };

  const isSubSlotSelected = (subName: string, day: string, time: string) => {
    const slots = subAvailabilityData[subName]?.slots || {};
    const key = `${day}-${time}`;
    
    if (use30MinIncrements) {
      return slots[key] || false;
    } else {
      const key00 = `${day}-${time}`;
      const key30 = `${day}-${time.split(':')[0]}:30`;
      
      const has00 = slots[key00] || false;
      const has30 = slots[key30] || false;
      
      const isNewFormat = Object.keys(slots).some(k => k.endsWith(':30'));
      
      if (isNewFormat) {
        return has00 && has30;
      } else {
        return has00;
      }
    }
  };

  const isPlayerSelected = (teamId: number, playerId: number, day: string, time: string) => {
    const slots = availabilityData[teamId]?.slots || {};
    const key = `${day}-${time}`;
    const avail = slots[key] || [];
    
    if (use30MinIncrements) {
      return avail.includes(playerId);
    } else {
      const key00 = `${day}-${time}`;
      const key30 = `${day}-${time.split(':')[0]}:30`;
      const avail00 = slots[key00] || [];
      const avail30 = slots[key30] || [];
      
      const isNewFormat = Object.keys(slots).some(k => k.endsWith(':30'));
      
      if (isNewFormat) {
        return avail00.includes(playerId) && avail30.includes(playerId);
      } else {
        return avail00.includes(playerId);
      }
    }
  };

  return (
    <AvailabilityPageContainer>
      <AvailabilitySectionTitle>Team Availability</AvailabilitySectionTitle>
      
      <AvailabilityStatusMessage>
        <div>{getStatusMessage()}</div>
        {!currentUser && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Input 
              type="text" 
              placeholder="Enter Team Access Code" 
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              style={{ width: 'auto', marginBottom: 0 }}
            />
            <Button onClick={handleLogin} disabled={loggingIn} variant="primary">
              {loggingIn ? 'Logging in...' : 'Log In'}
            </Button>
            {loginError && <ErrorMessage style={{ margin: 0 }}>{loginError}</ErrorMessage>}
          </div>
        )}
      </AvailabilityStatusMessage>
      
      <AvailabilityControlsContainer>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={use30MinIncrements} 
              onChange={(e) => setUse30MinIncrements(e.target.checked)} 
            />
            Use 30-minute increments
          </label>
        </div>
        <div>
          <label>View Timezone: </label>
          <AvailabilitySelect 
            value={selectedTimezone} 
            onChange={(e) => setSelectedTimezone(e.target.value)}
          >
            <option value="">-- None --</option>
            <option value="PT">Pacific (PT)</option>
            <option value="MT">Mountain (MT)</option>
            <option value="CT">Central (CT)</option>
            <option value="ET">Eastern (ET)</option>
            <option value="GMT">Western Europe (GMT)</option>
            <option value="CET">Central Europe (CET)</option>
            <option value="EET">Eastern Europe (EET)</option>
          </AvailabilitySelect>
        </div>
        <div>
          <label>Select Team: </label>
          <AvailabilitySelect 
            value={selectedTeamId || ''} 
            onChange={(e) => setSelectedTeamId(parseInt(e.target.value, 10))}
            disabled={!!isTeamMember || isSub}
          >
            <option value="">-- Select Team --</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </AvailabilitySelect>
        </div>

        {isAuthorized && teamPlayers.length > 0 && (
          <div>
            <label>Marking for Player: </label>
            <AvailabilitySelect 
              value={activePlayerId || ''} 
              onChange={(e) => setActivePlayerId(parseInt(e.target.value, 10))}
            >
              {teamPlayers.map(pid => {
                const player = getPlayerById(pid);
                return (
                  <option key={pid} value={pid}>
                    {player ? player.name : `Player ${pid}`}
                  </option>
                );
              })}
            </AvailabilitySelect>
          </div>
        )}

        {(isAuthorized || isSub) && (
          <Button onClick={handleSave} disabled={saving} variant="primary">
            {saving ? 'Saving...' : 'Save Availability'}
          </Button>
        )}
      </AvailabilityControlsContainer>

      {(selectedTeamId || isSub) && (
        <>
          {visibleTimes[0] !== fullTimes[0] && (
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <Button onClick={addHourAbove} variant="secondary">↑ Add Hour Above</Button>
            </div>
          )}
          <AvailabilityGridContainer>
            <AvailabilityGrid showTimezone={!!selectedTimezone}>
              <AvailabilityGridHeader>Time (PT)</AvailabilityGridHeader>
              {selectedTimezone && <AvailabilityGridHeader>Time ({selectedTimezone})</AvailabilityGridHeader>}
              {days.map(d => <AvailabilityGridHeader key={d}>{d}</AvailabilityGridHeader>)}
              
              {visibleTimes.map(time => {
                const ptLabel = `${time} PT`;
                const tzLabel = selectedTimezone ? `${convertTime(time, timezoneOffsets[selectedTimezone])} ${selectedTimezone}` : '';
                return (
                  <React.Fragment key={time}>
                    <AvailabilityTimeLabel>{ptLabel}</AvailabilityTimeLabel>
                    {selectedTimezone && <AvailabilityTimeLabel>{tzLabel}</AvailabilityTimeLabel>}
                    {days.map(day => {
                      const key = `${day}-${time}`;
                      const avail = isSub ? [] : (selectedTeamId ? (availabilityData[selectedTeamId]?.slots?.[key] || []) : []);
                      const isSelected = isSub ? 
                        isSubSlotSelected(subName, day, time) :
                        (activePlayerId && selectedTeamId ? isPlayerSelected(selectedTeamId, activePlayerId, day, time) : false);
                      
                      return (
                        <AvailabilitySlot 
                          key={key} 
                          isSelected={isSelected}
                          count={avail.length}
                          isEditable={isSub || (!!isAuthorized && !!activePlayerId)}
                          onClick={() => {
                            if (isSub) {
                              toggleSubSlot(day, time);
                            } else if (isAuthorized && activePlayerId && selectedTeamId) {
                              toggleSlot(selectedTeamId, day, time, activePlayerId);
                            }
                          }}
                        >
                          <AvailabilitySlotCount>{isSub ? (isSelected ? 'Yes' : 'No') : `${avail.length} Available`}</AvailabilitySlotCount>
                        </AvailabilitySlot>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </AvailabilityGrid>
          </AvailabilityGridContainer>
          {visibleTimes[visibleTimes.length - 1] !== fullTimes[fullTimes.length - 1] && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Button onClick={addHourBelow} variant="secondary">↓ Add Hour Below</Button>
            </div>
          )}
        </>
      )}

      <AvailabilitySectionTitle>Find Best Match Time</AvailabilitySectionTitle>
      <AvailabilityControlsContainer>
        {isTeamMember ? (
          <div>
            <label>Opponent: </label>
            <AvailabilitySelect 
              value={compareTeamBId || ''} 
              onChange={(e) => setCompareTeamBId(parseInt(e.target.value, 10))}
            >
              <option value="">-- Select Opponent --</option>
              {teams.filter(t => t.id !== parseInt(captainTeamId, 10)).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </AvailabilitySelect>
          </div>
        ) : (
          <>
            <div>
              <label>Team A: </label>
              <AvailabilitySelect 
                value={compareTeamAId || ''} 
                onChange={(e) => setCompareTeamAId(parseInt(e.target.value, 10))}
              >
                <option value="">-- Select Team A --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </AvailabilitySelect>
            </div>
            <div>
              <label>Team B: </label>
              <AvailabilitySelect 
                value={compareTeamBId || ''} 
                onChange={(e) => setCompareTeamBId(parseInt(e.target.value, 10))}
              >
                <option value="">-- Select Team B --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </AvailabilitySelect>
            </div>
          </>
        )}
      </AvailabilityControlsContainer>

      {compareTeamAId && compareTeamBId && (
        <AvailabilityBestSlotsContainer>
          {getBestSlots(compareTeamAId, compareTeamBId).map(slot => {
            const ptTime = `${slot.day} @ ${slot.time} PT`;
            let tzTime = '';
            if (selectedTimezone && selectedTimezone !== 'PT') {
              const converted = convertTimeAndDay(slot.day, slot.time, timezoneOffsets[selectedTimezone]);
              tzTime = ` (${converted.day} @ ${converted.time} ${selectedTimezone})`;
            }
            return (
              <AvailabilityBestSlotCard key={`${slot.day}-${slot.time}`}>
                <h3>{ptTime}{tzTime}</h3>
                <p>Score: <AvailabilityScoreBadge>{slot.score}</AvailabilityScoreBadge></p>
                <p>Team A: {slot.teamACount} players</p>
                <p>Team B: {slot.teamBCount} players</p>
              </AvailabilityBestSlotCard>
            );
          })}
          {getBestSlots(compareTeamAId, compareTeamBId).length === 0 && (
            <p>No overlapping availability found.</p>
          )}
        </AvailabilityBestSlotsContainer>
      )}
      <AvailabilitySectionTitle>Available Substitutes</AvailabilitySectionTitle>
      <AvailabilityBestSlotsContainer>
        {Object.entries(subAvailabilityData).map(([name, data]) => {
          const activeSlots = Object.entries(data.slots || {})
            .filter(([_, isAvail]) => isAvail)
            .map(([slot, _]) => slot);
          
          if (activeSlots.length === 0) return null;

          const combinedTimes = combineConsecutiveTimes(activeSlots, use30MinIncrements ? fullTimes30 : fullTimes);

          return (
            <AvailabilityBestSlotCard key={name}>
              <h3>{name}</h3>
              <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                {combinedTimes.map(slot => {
                  const ptTime = convertCombinedTime(slot, 0, 'PT');
                  if (selectedTimezone && selectedTimezone !== 'PT') {
                    const tzTime = convertCombinedTime(slot, timezoneOffsets[selectedTimezone], selectedTimezone);
                    return <li key={slot}>{ptTime} ({tzTime})</li>;
                  }
                  return <li key={slot}>{ptTime}</li>;
                })}
              </ul>
            </AvailabilityBestSlotCard>
          );
        })}
      </AvailabilityBestSlotsContainer>
    </AvailabilityPageContainer>
  );
};

export default AvailabilityPage;
