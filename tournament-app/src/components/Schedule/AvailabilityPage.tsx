import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
import { Input, ErrorMessage } from '../../styles';

const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.body};
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.borderBottom};
  background-color: ${({ theme }) => theme.backgroundTwo};
  color: ${({ theme }) => theme.text};
`;

const GridContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 3rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  gap: 5px;
  min-width: 800px;
`;

const GridHeader = styled.div`
  font-weight: bold;
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.body};
  border-radius: 4px;
`;

const TimeLabel = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.body};
  border-radius: 4px;
`;

const Slot = styled.div<{ isSelected: boolean; count: number; isEditable: boolean }>`
  height: 50px;
  background-color: ${({ isSelected, count, theme }) => 
    isSelected ? theme.primary : 
    count > 0 ? `${theme.primary}40` : // Light primary if some players
    theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderBottom};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${({ isEditable }) => (isEditable ? 'pointer' : 'default')};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ isEditable, theme }) => (isEditable ? theme.primaryHover : '')};
  }
`;

const SlotCount = styled.span`
  font-size: 0.8rem;
  font-weight: bold;
`;

const BestSlotsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const BestSlotCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.borderBottom};
  text-align: center;
`;

const ScoreBadge = styled.span`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
`;

const StatusMessage = styled.div`
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.borderBottom};
  font-weight: 500;
`;

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

const AvailabilityPage: React.FC = () => {
  const [visibleTimes, setVisibleTimes] = useState(['17:00', '18:00', '19:00', '20:00', '21:00', '22:00']);
  const [use30MinIncrements, setUse30MinIncrements] = useState(false);
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
  
  // For now, let's assume we just toggle for player 1 (dummy player) or all players if we don't have player selection
  // Realistically, we need a player selector or we just assume the captain marks availability for the *team* as a whole (binary)
  // But prompt says "Prioritize slots that have as many players available as possible."
  // Let's assume captain can select which player they are marking for.
  // For simplicity, let's add a dummy player ID 1 for now if we don't have a player list for the team easily accessible here
  // Wait, `useTournament` gives us teams, and teams have `players` array (player IDs).
  // Let's use the actual player IDs from the team!

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
    <PageContainer>
      <SectionTitle>Team Availability</SectionTitle>
      
      <StatusMessage>
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
      </StatusMessage>
      
      <ControlsContainer>
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
          <label>Select Team: </label>
          <Select 
            value={selectedTeamId || ''} 
            onChange={(e) => setSelectedTeamId(parseInt(e.target.value, 10))}
            disabled={!!isTeamMember || isSub}
          >
            <option value="">-- Select Team --</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>

        {isAuthorized && teamPlayers.length > 0 && (
          <div>
            <label>Marking for Player: </label>
            <Select 
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
            </Select>
          </div>
        )}

        {(isAuthorized || isSub) && (
          <Button onClick={handleSave} disabled={saving} variant="primary">
            {saving ? 'Saving...' : 'Save Availability'}
          </Button>
        )}
      </ControlsContainer>

      {(selectedTeamId || isSub) && (
        <>
          {visibleTimes[0] !== fullTimes[0] && (
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <Button onClick={addHourAbove} variant="secondary">↑ Add Hour Above</Button>
            </div>
          )}
          <GridContainer>
            <Grid>
              <GridHeader>Time</GridHeader>
              {days.map(d => <GridHeader key={d}>{d}</GridHeader>)}
              
              {visibleTimes.map(time => (
              <React.Fragment key={time}>
                <TimeLabel>{time}</TimeLabel>
                {days.map(day => {
                  const key = `${day}-${time}`;
                  const avail = isSub ? [] : (selectedTeamId ? (availabilityData[selectedTeamId]?.slots?.[key] || []) : []);
                  const isSelected = isSub ? 
                    isSubSlotSelected(subName, day, time) :
                    (activePlayerId && selectedTeamId ? isPlayerSelected(selectedTeamId, activePlayerId, day, time) : false);
                  
                  return (
                    <Slot 
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
                      <SlotCount>{isSub ? (isSelected ? 'Yes' : 'No') : `${avail.length} Available`}</SlotCount>
                    </Slot>
                  );
                })}
              </React.Fragment>
            ))}
          </Grid>
          </GridContainer>
          {visibleTimes[visibleTimes.length - 1] !== fullTimes[fullTimes.length - 1] && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Button onClick={addHourBelow} variant="secondary">↓ Add Hour Below</Button>
            </div>
          )}
        </>
      )}

      <SectionTitle>Find Best Match Time</SectionTitle>
      <ControlsContainer>
        {isTeamMember ? (
          <div>
            <label>Opponent: </label>
            <Select 
              value={compareTeamBId || ''} 
              onChange={(e) => setCompareTeamBId(parseInt(e.target.value, 10))}
            >
              <option value="">-- Select Opponent --</option>
              {teams.filter(t => t.id !== parseInt(captainTeamId, 10)).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>
        ) : (
          <>
            <div>
              <label>Team A: </label>
              <Select 
                value={compareTeamAId || ''} 
                onChange={(e) => setCompareTeamAId(parseInt(e.target.value, 10))}
              >
                <option value="">-- Select Team A --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label>Team B: </label>
              <Select 
                value={compareTeamBId || ''} 
                onChange={(e) => setCompareTeamBId(parseInt(e.target.value, 10))}
              >
                <option value="">-- Select Team B --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
          </>
        )}
      </ControlsContainer>

      {compareTeamAId && compareTeamBId && (
        <BestSlotsContainer>
          {getBestSlots(compareTeamAId, compareTeamBId).map(slot => (
            <BestSlotCard key={`${slot.day}-${slot.time}`}>
              <h3>{slot.day} @ {slot.time}</h3>
              <p>Score: <ScoreBadge>{slot.score}</ScoreBadge></p>
              <p>Team A: {slot.teamACount} players</p>
              <p>Team B: {slot.teamBCount} players</p>
            </BestSlotCard>
          ))}
          {getBestSlots(compareTeamAId, compareTeamBId).length === 0 && (
            <p>No overlapping availability found.</p>
          )}
        </BestSlotsContainer>
      )}
      <SectionTitle>Available Substitutes</SectionTitle>
      <BestSlotsContainer>
        {Object.entries(subAvailabilityData).map(([name, data]) => {
          const activeSlots = Object.entries(data.slots || {})
            .filter(([_, isAvail]) => isAvail)
            .map(([slot, _]) => slot);
          
          if (activeSlots.length === 0) return null;

          const combinedTimes = combineConsecutiveTimes(activeSlots, use30MinIncrements ? fullTimes30 : fullTimes);

          return (
            <BestSlotCard key={name}>
              <h3>{name}</h3>
              <ul style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                {combinedTimes.map(slot => <li key={slot}>{slot}</li>)}
              </ul>
            </BestSlotCard>
          );
        })}
      </BestSlotsContainer>
    </PageContainer>
  );
};

export default AvailabilityPage;
