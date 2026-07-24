import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useGameMatches } from '../../context/MatchesContext';
import { useTournament } from '../../context/TournamentContext';
import { usePlayers } from '../../context/PlayerContext';
import { getTeamOrPlaceholder } from '../../utils';
import { Team } from '../../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';


// Styled Components for Casting Overlay (1920x1080 stream canvas)
const CastingWrapper = styled.div<{ chromaBg: string }>`
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  background-color: ${props => props.chromaBg};
  color: #f0e6d2;
  font-family: 'Beaufort for LOL', 'Arial Black', sans-serif;
  user-select: none;
`;

const StreamCanvas = styled.div`
  width: 1920px;
  height: 1080px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 40px;
  pointer-events: none; /* Allows click-through in OBS */
`;

const TeamGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const TeamTitleBanner = styled.div<{ isBlue: boolean }>`
  font-size: 28px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 3px;
  text-shadow: 0 4px 8px rgba(0,0,0,0.9);
  text-align: center;
  color: ${props => props.isBlue ? '#00e5ff' : '#ff3366'};
`;

const TeamRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
  pointer-events: auto;
`;

const PlayerCard = styled.div<{ isBlue: boolean }>`
  width: 140px;
  height: 255px;
  position: relative;
  border: 2px solid ${props => props.isBlue ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 51, 102, 0.4)'};
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  background: #050d12;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: all 0.3s ease;
`;

const SplashFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const SplashImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
`;

const CardVignette = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(5,13,18,0.95) 95%);
  z-index: 2;
`;

const PlayerDetails = styled.div`
  position: relative;
  z-index: 3;
  text-align: center;
  padding: 10px 5px;
  width: 100%;
`;

const PlayerNameDisplay = styled.div`
  font-size: 14px;
  color: #f0e6d2;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
`;

const ChampNameDisplay = styled.div<{ isBlue: boolean }>`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 2px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  color: ${props => props.isBlue ? '#00e5ff' : '#ff3366'};
`;

// Control Panel styles
const ControlPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(10, 20, 30, 0.95);
  border: 2.5px solid #c8aa6e;
  padding: 20px;
  color: #f0e6d2;
  z-index: 100;
  border-radius: 8px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  pointer-events: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
`;

const PanelHeader = styled.h3`
  border-bottom: 1px solid #c8aa6e;
  padding-bottom: 8px;
  margin-bottom: 15px;
  font-size: 18px;
  letter-spacing: 1px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CtrlRow = styled.div`
  margin-bottom: 12px;
  display: flex;
  gap: 10px;
  align-items: center;

  label {
    width: 80px;
    font-size: 12px;
    text-transform: uppercase;
  }

  input, select {
    flex-grow: 1;
    background: #1e2328;
    border: 1px solid #a09b8c;
    color: #f0e6d2;
    padding: 6px;
    font-size: 13px;
  }

  input:focus, select:focus {
    outline: 1px solid #c8aa6e;
  }
`;

const TeamHeaderCtrl = styled.div`
  font-weight: bold;
  color: #c8aa6e;
  margin: 15px 0 10px 0;
  font-size: 14px;
  border-bottom: 1px dashed rgba(200, 170, 110, 0.3);
  padding-bottom: 4px;
`;

const HotkeyBadge = styled.span`
  background: #c8aa6e;
  color: #091420;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #f0e6d2;
  }
`;

const ShowUiBtn = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(10, 20, 30, 0.9);
  border: 1.5px solid #c8aa6e;
  color: #f0e6d2;
  padding: 10px 15px;
  font-size: 12px;
  cursor: pointer;
  z-index: 99;
  border-radius: 4px;
  pointer-events: auto;

  &:hover {
    background: #f0e6d2;
    color: #091420;
  }
`;

const ROLE_PRIORITY: { [key: string]: number } = {
  top: 1,
  jungle: 2,
  mid: 3,
  adc: 4,
  support: 5,
  fill: 6
};

interface ChampData {
  id: string;
  name: string;
  key: string;
}

const CastingPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches } = useGameMatches();
  const { teams } = useTournament();
  const { getPlayerById } = usePlayers();

  // Find the match
  const match = matches.find(m => String(m.id) === matchId);

  // Settings
  const [chromaColor, setChromaColor] = useState('#00ff00');
  const [showControls, setShowControls] = useState(true);

  // Team configurations
  const [blueTeamName, setBlueTeamName] = useState('Blue Team');
  const [redTeamName, setRedTeamName] = useState('Red Team');
  
  const [bluePlayers, setBluePlayers] = useState<string[]>(Array(5).fill(''));
  const [redPlayers, setRedPlayers] = useState<string[]>(Array(5).fill(''));

  const [blueChamps, setBlueChamps] = useState<string[]>(Array(5).fill('Aatrox'));
  const [redChamps, setRedChamps] = useState<string[]>(Array(5).fill('Ahri'));

  // Dynamic Riot DDragon Champions List
  const [championsList, setChampionsList] = useState<ChampData[]>([]);



  const getSortedPlayerNames = (team: Team | undefined) => {
    if (!team || !team.players) return [];
    return [...team.players]
      .map(id => getPlayerById(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .sort((a, b) => {
        const priorityA = ROLE_PRIORITY[a.role.toLowerCase()] || 99;
        const priorityB = ROLE_PRIORITY[b.role.toLowerCase()] || 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.name.localeCompare(b.name);
      })
      .map(p => p.name);
  };

  // Load champions from Riot DDragon
  useEffect(() => {
    const fetchChamps = async () => {
      try {
        const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await versionRes.json();
        const patch = versions[0];
        
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`);
        const data = await res.json();
        const list = Object.values(data.data) as ChampData[];
        setChampionsList(list.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Error connecting to Data Dragon, utilizing fallback list:", err);
        setChampionsList([
          { name: 'Aatrox', id: 'Aatrox', key: '266' },
          { name: 'Ahri', id: 'Ahri', key: '103' },
          { name: 'Lee Sin', id: 'LeeSin', key: '64' },
          { name: 'Jinx', id: 'Jinx', key: '222' },
          { name: 'Thresh', id: 'Thresh', key: '412' }
        ]);
      }
    };
    fetchChamps();
  }, []);

  // Initialize data once match, teams and players have loaded
  useEffect(() => {
    if (match && teams.length > 0) {
      const team1Info = getTeamOrPlaceholder(match.team1Id, teams, matches);
      const team2Info = getTeamOrPlaceholder(match.team2Id, teams, matches);

      const t1 = teams.find(t => t.id === team1Info?.id);
      const t2 = teams.find(t => t.id === team2Info?.id);

      const isTeam2Blue = match.firstGameSideSelection === 'red';
      const bTeam = isTeam2Blue ? t2 : t1;
      const rTeam = isTeam2Blue ? t1 : t2;

      setBlueTeamName(isTeam2Blue ? (team2Info?.name || 'Blue Team') : (team1Info?.name || 'Blue Team'));
      setRedTeamName(isTeam2Blue ? (team1Info?.name || 'Red Team') : (team2Info?.name || 'Red Team'));

      const sortedBlue = getSortedPlayerNames(bTeam);
      const sortedRed = getSortedPlayerNames(rTeam);

      while (sortedBlue.length < 5) {
        sortedBlue.push(`PLAYER ${sortedBlue.length + 1}`);
      }
      while (sortedRed.length < 5) {
        sortedRed.push(`PLAYER ${sortedRed.length + 1}`);
      }

      setBluePlayers(sortedBlue);
      setRedPlayers(sortedRed);
    }
  }, [match, teams, matches]);

  // Set default champions in selector when championsList is fetched
  useEffect(() => {
    if (championsList.length > 0) {
      setBlueChamps(Array.from({ length: 5 }, (_, i) => championsList[i % championsList.length].id));
      setRedChamps(Array.from({ length: 5 }, (_, i) => championsList[(i + 5) % championsList.length].id));
    }
  }, [championsList]);


  // Listen to Firestore live draft changes
  useEffect(() => {
    if (!matchId || championsList.length === 0) return;

    const docRef = doc(db, 'liveDrafts', matchId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.blueTeamName) setBlueTeamName(data.blueTeamName);
        if (data.redTeamName) setRedTeamName(data.redTeamName);
        if (data.bluePlayers) setBluePlayers(data.bluePlayers);
        if (data.redPlayers) setRedPlayers(data.redPlayers);

        // Map LCU champion numerical keys back to DDragon IDs (names)
        if (data.blueChamps) {
          const mappedBlue = data.blueChamps.map((cid: string) => {
            if (cid === '0') return 'Aatrox';
            const found = championsList.find(c => String(c.key) === cid);
            return found ? found.id : cid;
          });
          setBlueChamps(mappedBlue);
        }
        if (data.redChamps) {
          const mappedRed = data.redChamps.map((cid: string) => {
            if (cid === '0') return 'Ahri';
            const found = championsList.find(c => String(c.key) === cid);
            return found ? found.id : cid;
          });
          setRedChamps(mappedRed);
        }
      }
    });

    return () => unsubscribe();
  }, [matchId, championsList]);

  // Toggle UI via Keyboard Hotkey 'H'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT')) {
          return;
        }
        setShowControls(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!match) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading match casting overlay...</div>;
  }

  const getChampName = (key: string) => {
    const found = championsList.find(c => c.id === key);
    return found ? found.name : key;
  };

  const handlePlayerNameChange = (team: 'blue' | 'red', index: number, value: string) => {
    if (team === 'blue') {
      const updated = [...bluePlayers];
      updated[index] = value;
      setBluePlayers(updated);
    } else {
      const updated = [...redPlayers];
      updated[index] = value;
      setRedPlayers(updated);
    }
  };

  const handleChampChange = (team: 'blue' | 'red', index: number, value: string) => {
    if (team === 'blue') {
      const updatedChamps = [...blueChamps];
      updatedChamps[index] = value;
      setBlueChamps(updatedChamps);
    } else {
      const updatedChamps = [...redChamps];
      updatedChamps[index] = value;
      setRedChamps(updatedChamps);
    }
  };

  return (
    <CastingWrapper chromaBg={chromaColor}>
      {/* Tiny overlay open button */}
      {!showControls && (
        <ShowUiBtn onClick={() => setShowControls(true)}>⚙️ Show Controls [H]</ShowUiBtn>
      )}

      {showControls && (
        <ControlPanel>
          <PanelHeader>
            <span>OBS Production Panel</span>
            <HotkeyBadge onClick={() => setShowControls(false)}>Hide [H]</HotkeyBadge>
          </PanelHeader>

          <CtrlRow>
            <label>Chroma Color</label>
            <select value={chromaColor} onChange={(e) => setChromaColor(e.target.value)}>
              <option value="#00ff00">Pure Green Screen (#00ff00)</option>
              <option value="#0000ff">Pure Blue Screen (#0000ff)</option>
              <option value="#ff00ff">Magenta Screen (#ff00ff)</option>
              <option value="transparent">Transparent Background (OBS Browser Source)</option>
            </select>
          </CtrlRow>

          <CtrlRow>
            <label>Blue Team</label>
            <input type="text" value={blueTeamName} onChange={(e) => setBlueTeamName(e.target.value)} />
          </CtrlRow>
          <CtrlRow>
            <label>Red Team</label>
            <input type="text" value={redTeamName} onChange={(e) => setRedTeamName(e.target.value)} />
          </CtrlRow>

          <div style={{ marginTop: '15px', marginBottom: '20px', padding: '12px', background: '#0a192f', border: '1.5px solid #c8aa6e', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#c8aa6e', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🖥️ Sync Live Champ Select</span>
            </div>
            <p style={{ fontSize: '11px', margin: '0 0 10px 0', color: '#8892b0', lineHeight: '1.4' }}>
              First, <a href="/lcu_relay.py" download="lcu_relay.py" style={{ color: '#64ffda', textDecoration: 'underline', fontWeight: 'bold', cursor: 'pointer' }}>download the python relay script (lcu_relay.py)</a> on your streaming computer. Then run this command in your terminal:
            </p>
            <code style={{ display: 'block', padding: '8px', background: '#020c1b', fontSize: '10px', wordBreak: 'break-all', userSelect: 'all', fontFamily: 'monospace', color: '#64ffda', border: '1px solid rgba(100, 255, 218, 0.2)', borderRadius: '4px' }}>
              python lcu_relay.py {matchId} &lt;your_caster_access_code&gt;
            </code>
          </div>

          {/* Blue Controls */}
          <TeamHeaderCtrl>Blue Side Picks</TeamHeaderCtrl>
          {bluePlayers.map((player, idx) => (
            <CtrlRow key={`blue-ctrl-${idx}`}>
              <input
                type="text"
                value={player}
                placeholder={`Summoner ${idx + 1}`}
                onChange={(e) => handlePlayerNameChange('blue', idx, e.target.value)}
              />
              <select value={blueChamps[idx] || ''} onChange={(e) => handleChampChange('blue', idx, e.target.value)}>
                {championsList.map(c => (
                  <option key={`blue-opt-${c.id}`} value={c.id}>{c.name}</option>
                ))}
              </select>
            </CtrlRow>
          ))}

          {/* Red Controls */}
          <TeamHeaderCtrl>Red Side Picks</TeamHeaderCtrl>
          {redPlayers.map((player, idx) => (
            <CtrlRow key={`red-ctrl-${idx}`}>
              <input
                type="text"
                value={player}
                placeholder={`Summoner ${idx + 1}`}
                onChange={(e) => handlePlayerNameChange('red', idx, e.target.value)}
              />
              <select value={redChamps[idx] || ''} onChange={(e) => handleChampChange('red', idx, e.target.value)}>
                {championsList.map(c => (
                  <option key={`red-opt-${c.id}`} value={c.id}>{c.name}</option>
                ))}
              </select>
            </CtrlRow>
          ))}
        </ControlPanel>
      )}

      <StreamCanvas>
        {/* Blue Team Row */}
        <TeamGroup>
          <TeamTitleBanner isBlue={true}>{blueTeamName}</TeamTitleBanner>
          <TeamRow>
            {bluePlayers.map((player, idx) => (
              <PlayerCard key={`blue-card-${idx}`} isBlue={true}>
                <SplashFrame>
                  <SplashImg
                    src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${blueChamps[idx]}_0.jpg`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aatrox_0.jpg";
                    }}
                  />
                </SplashFrame>
                <CardVignette />
                <PlayerDetails>
                  <PlayerNameDisplay>{player}</PlayerNameDisplay>
                  <ChampNameDisplay isBlue={true}>{getChampName(blueChamps[idx])}</ChampNameDisplay>
                </PlayerDetails>
              </PlayerCard>
            ))}
          </TeamRow>
        </TeamGroup>

        {/* Red Team Row */}
        <TeamGroup>
          <TeamTitleBanner isBlue={false}>{redTeamName}</TeamTitleBanner>
          <TeamRow>
            {redPlayers.map((player, idx) => (
              <PlayerCard key={`red-card-${idx}`} isBlue={false}>
                <SplashFrame>
                  <SplashImg
                    src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${redChamps[idx]}_0.jpg`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aatrox_0.jpg";
                    }}
                  />
                </SplashFrame>
                <CardVignette />
                <PlayerDetails>
                  <PlayerNameDisplay>{player}</PlayerNameDisplay>
                  <ChampNameDisplay isBlue={false}>{getChampName(redChamps[idx])}</ChampNameDisplay>
                </PlayerDetails>
              </PlayerCard>
            ))}
          </TeamRow>
        </TeamGroup>
      </StreamCanvas>
    </CastingWrapper>
  );
};

export default CastingPage;
