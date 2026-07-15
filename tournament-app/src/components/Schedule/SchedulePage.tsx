import React, { useState } from 'react';
import { FaCalendarAlt, FaEdit, FaTimes, FaSave, FaClock, FaTwitch } from 'react-icons/fa';
import styled from 'styled-components';
import { SchedulePageContainer, ScheduleTitle, TimelineContainer, StageCard, StageIcon, StageContent, StageTitle, StageDescription, StageLink, StageDate } from '../../styles';
import { useDivision } from '../../context/DivisionContext';
import { useGameMatches } from '../../context/MatchesContext';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../Common/AuthContext';
import { Match } from '../../types';
import { getYearFromHash, getNextSunday3PMPT, formatToPMPT, formatToLocal } from '../../utils';
import { Link } from 'react-router-dom';

const TabHeader = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.backgroundThree};
  margin-bottom: 2.5rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  color: ${({ active, theme }) => (active ? theme.primary : theme.textAlt)};
  border-bottom: 3px solid ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const MatchesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RoundGroup = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px ${({ theme }) => theme.boxShadow};
`;

const RoundTitle = styled.h3`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.text};
  margin-top: 0;
  margin-bottom: 1.25rem;
  border-bottom: 1.5px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 0.5rem;
`;

const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MatchItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 6px;
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 4px 10px ${({ theme }) => theme.boxShadow};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const MatchTeams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  width: 480px;

  @media (max-width: 900px) {
    width: 400px;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MatchupInfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TeamNameContainer = styled.div<{ align: 'left' | 'right' }>`
  text-align: ${({ align }) => align};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TeamNameLink = styled(Link)`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const TeamNameSpan = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 600;
`;

const VersusSpan = styled.span`
  color: ${({ theme }) => theme.textAlt};
  font-size: 0.9rem;
`;

const MatchTimeDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const TimeDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MainTime = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SecondaryTime = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textAlt};
`;

const EditButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textAlt};
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    border-color: ${({ theme }) => theme.primary};
  }
`;

const EditForm = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const DateTimeInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.backgroundTwo};
  color: ${({ theme }) => theme.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ variant?: 'success' | 'danger' }>`
  background: ${({ variant, theme }) => (variant === 'success' ? theme.success : variant === 'danger' ? theme.danger : theme.primary)};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const BroadcastBadge = styled.span`
  background-color: #9146ff; /* Twitch Purple */
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const BroadcastLink = styled.a`
  color: #9146ff;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const BroadcastContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.6rem;
`;

const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: ${({ theme }) => theme.background};
  border-left: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: -4px 0 15px ${({ theme }) => theme.boxShadow};
  z-index: 1001;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-sizing: border-box;
  animation: slideIn 0.25s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 1rem;
`;

const DrawerTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
`;

const CloseIconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textAlt};
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  overflow-y: auto;
`;

const DrawerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.backgroundTwo};
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

const SectionHeaderTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 0.35rem;
  margin-bottom: 0.5rem;
`;

const MatchInfoBanner = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  padding: 0.75rem;
  background: ${({ theme }) => theme.body};
  border-radius: 6px;
  color: ${({ theme }) => theme.text};
`;

const DrawerLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
`;

const DrawerInput = styled.input`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  box-sizing: border-box;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DrawerCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
`;

const DrawerFooter = styled.div`
  display: flex;
  gap: 1rem;
  border-top: 1px solid ${({ theme }) => theme.borderColor};
  padding-top: 1rem;
`;

const DrawerButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: ${({ variant, theme }) => (variant === 'secondary' ? `1px solid ${theme.borderColor}` : 'none')};
  background: ${({ variant, theme }) => (variant === 'secondary' ? 'transparent' : theme.primary)};
  color: ${({ variant, theme }) => (variant === 'secondary' ? theme.text : 'white')};

  &:hover {
    background: ${({ variant, theme }) => (variant === 'secondary' ? theme.body : theme.primaryHover)};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const tournamentStagesMaster = [
  {
    number: 1,
    title: "Sign-ups",
    description: "Team captains register their teams and access codes are distributed.",
    link: null,
    date: new Date("08/11/2025"),
    endDate: new Date("08/22/2025")
  },
  {
    number: 2,
    title: "Draft",
    description: "Captains build their rosters through a live, snake-style draft.",
    link: "/draft-access",
    date: new Date("08/26/2025"),
    endDate: new Date("08/31/2025")
  },
  {
    number: 3,
    title: "Swiss Stage",
    description: "Teams play in a swiss stage to determine top seeds.",
    link: "/swiss",
    date: new Date("09/01/2025"),
    endDate: new Date("09/21/2025")
  },
  {
    number: 4,
    title: "Knockout Stage",
    description: "The top teams from each group advance to a double-elimination bracket.",
    link: "/knockout",
    date: new Date("9/22/2025"),
    endDate: new Date("10/19/2025")
  },
  {
    number: 5,
    title: "Finals",
    description: "The Grand Finals determine the tournament champion.",
    link: null,
    date: new Date("10/20/2025"),
    endDate: new Date("10/21/2025")
  }
];
const tournamentStagesGold = [
  {
    number: 1,
    title: "Sign-ups",
    description: "Team captains register their teams and access codes are distributed.",
    link: null,
    date: new Date("08/11/2025"),
    endDate: new Date("08/22/2025")
  },
  {
    number: 2,
    title: "Draft",
    description: "Captains build their rosters through a live, snake-style draft.",
    link: "/draft-access",
    date: new Date("09/02/2025"),
    endDate: new Date("09/06/2025")
  },
  {
    number: 3,
    title: "Round Robin",
    description: "Teams play in a round robin group stage to determine top seeds.",
    link: "/swiss",
    date: new Date("09/08/2025"),
    endDate: new Date("09/28/2025")
  },
  {
    number: 4,
    title: "Knockout Stage",
    description: "The top teams from each group advance to a double-elimination bracket.",
    link: "/knockout",
    date: new Date("9/29/2025"),
    endDate: new Date("10/26/2025")
  },
  {
    number: 5,
    title: "Finals",
    description: "The Grand Finals determine the tournament champion.",
    link: null,
    date: new Date("10/27/2025"),
    endDate: new Date("10/28/2025")
  }
];

const tournamentStages2026 = [
  {
    number: 1,
    title: "Sign-ups",
    description: "Team captains register their teams and access codes are distributed.",
    link: null,
    date: new Date("06/15/2026"),
    endDate: new Date("07/05/2026")
  },
  {
    number: 2,
    title: "Draft",
    description: "Captains build their rosters through a live, snake-style draft.",
    link: "/draft-access",
    date: new Date("07/06/2026"),
    endDate: new Date("07/07/2026")
  },
  {
    number: 1,
    title: "Practice",
    description: "Teams get to know each other and practice some comps.",
    link: null,
    date: new Date("07/07/2026"),
    endDate: new Date("07/12/2026")
  },
  {
    number: 3,
    title: "Swiss Stage",
    description: "Teams play in a swiss stage to determine top seeds.",
    link: "/swiss",
    date: new Date("07/13/2026"),
    endDate: new Date("08/16/2026")
  },
  {
    number: 4,
    title: "Knockout Stage",
    description: "The top teams from each group advance to a double-elimination bracket.",
    link: "/knockout",
    date: new Date("08/17/2026"),
    endDate: new Date("09/13/2026")
  },
  {
    number: 5,
    title: "Finals",
    description: "The Grand Finals determine the tournament champion.",
    link: null,
    date: new Date("09/14/2026"),
    endDate: new Date("09/15/2026")
  }
];

const SchedulePage: React.FC = () => {
  const { division } = useDivision();
  const year = getYearFromHash(window.location.hash) || '2026';
  const is2026 = year === '2026';

  const { matches, loading: matchesLoading, updateMatch } = useGameMatches();
  const { teams, loading: teamsLoading } = useTournament();
  const { currentUser, isAdmin, captainTeamId, authDivision, isCaster, casterName } = useAuth();

  const [activeTab, setActiveTab] = useState<'matches' | 'timeline'>('matches');
  const [selectedMatchForEdit, setSelectedMatchForEdit] = useState<Match | null>(null);
  const [editTimeValue, setEditTimeValue] = useState<string>('');
  const [broadcastCastedValue, setBroadcastCastedValue] = useState<boolean>(false);
  const [broadcastChannelValue, setBroadcastChannelValue] = useState<string>('');

  const getIconContent = (startDate: Date, endDate: Date, number: number) => {
    if (getStatusFromDate(startDate, endDate) === 'completed') return '✓';
    return number;
  };

  const getStatusFromDate = (startDate: Date, endDate: Date) => {
    const now = Date.now();
    if (now >= endDate.getTime()) return "completed";
    if (now >= startDate.getTime() && now <= endDate.getTime()) {
      return "in-progress";
    }
    return "upcoming";
  };

  const toLocalDateTimeLocalString = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenEditPanel = (match: Match) => {
    setSelectedMatchForEdit(match);
    const currentMatchTime = match.scheduledTime ? new Date(match.scheduledTime) : getNextSunday3PMPT();
    setEditTimeValue(toLocalDateTimeLocalString(currentMatchTime));
    setBroadcastCastedValue(!!match.isCasted);
    setBroadcastChannelValue(match.twitchChannel || 'grumbleofficial');
  };

  const handleSaveMatchDetails = async () => {
    if (!selectedMatchForEdit) return;
    try {
      const newDate = new Date(editTimeValue);
      if (isNaN(newDate.getTime())) {
        alert("Invalid date/time selected.");
        return;
      }

      const updatedMatch = {
        ...selectedMatchForEdit,
        scheduledTime: newDate.toISOString(),
        isCasted: broadcastCastedValue,
        twitchChannel: broadcastChannelValue.trim()
      };

      await updateMatch(updatedMatch);
      setSelectedMatchForEdit(null);
    } catch (error) {
      alert("Failed to save match details. Please try again.");
    }
  };

  const isAuthorizedToEdit = (match: Match) => {
    if (isAdmin) return true;
    if (!currentUser || !captainTeamId || authDivision !== division) return false;
    const captainTeamNum = Number(captainTeamId);
    return match.team1Id === captainTeamNum || match.team2Id === captainTeamNum;
  };

  const renderTimeDisplay = (match: Match) => {
    const dateStr = match.scheduledTime || getNextSunday3PMPT().toISOString();
    const date = new Date(dateStr);
    const ptTime = formatToPMPT(date);
    const localTime = formatToLocal(date);
    const isLocalPT = Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/Los_Angeles';

    return (
      <TimeDisplay>
        <MainTime>
          <FaClock /> {ptTime}
        </MainTime>
        {!isLocalPT && <SecondaryTime>({localTime} Local Time)</SecondaryTime>}
      </TimeDisplay>
    );
  };

  const tournamentStages = is2026 ? tournamentStages2026 : (division === 'master' ? tournamentStagesMaster : tournamentStagesGold);

  // Group and sort matches
  const groupedMatches = getGroupedMatches();
  const sortedGroupKeys = getSortedGroupKeys(groupedMatches);

  function getGroupedMatches() {
    const groups: { [key: string]: Match[] } = {};
    matches.forEach(match => {
      const groupName = match.isKnockout
        ? (match.stage || 'Knockout Stage')
        : `Swiss Round ${match.weekPlayed}`;

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(match);
    });
    return groups;
  }

  function getSortedGroupKeys(groups: { [key: string]: Match[] }) {
    return Object.keys(groups).sort((a, b) => {
      const aIsSwiss = a.startsWith('Swiss Round');
      const bIsSwiss = b.startsWith('Swiss Round');

      if (aIsSwiss && bIsSwiss) {
        const aNum = parseInt(a.replace('Swiss Round ', ''), 10);
        const bNum = parseInt(b.replace('Swiss Round ', ''), 10);
        return aNum - bNum;
      }
      if (aIsSwiss && !bIsSwiss) return -1;
      if (!aIsSwiss && bIsSwiss) return 1;

      return a.localeCompare(b);
    });
  }

  return (
    <SchedulePageContainer>
      <ScheduleTitle>Tournament Schedule</ScheduleTitle>
      
      <TabHeader>
        <TabButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')}>
          Match Schedule
        </TabButton>
        <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')}>
          Tournament Timeline
        </TabButton>
      </TabHeader>

      {activeTab === 'timeline' ? (
        <TimelineContainer>
          {tournamentStages.map(stage => (
            <StageCard key={stage.number}>
              <StageIcon status={getStatusFromDate(stage.date, stage.endDate)}>
                {getIconContent(stage.date, stage.endDate, stage.number)}
              </StageIcon>
              <StageContent>
                <StageTitle>{stage.title}</StageTitle>
                <StageDate>
                  <FaCalendarAlt />
                  <span>{stage.date?.toDateString()}</span>
                </StageDate>
                <StageDescription>{stage.description}</StageDescription>
                {stage.link && (
                  <StageLink to={stage.link}>
                    Go to Page
                  </StageLink>
                )}
              </StageContent>
            </StageCard>
          ))}
        </TimelineContainer>
      ) : (
        <MatchesContainer>
          {matchesLoading || teamsLoading ? (
            <p style={{ textAlign: 'center' }}>Loading matches schedule...</p>
          ) : matches.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>No matches have been generated yet.</p>
          ) : (
            sortedGroupKeys.map(groupName => (
              <RoundGroup key={groupName}>
                <RoundTitle>{groupName}</RoundTitle>
                <MatchList>
                  {groupedMatches[groupName].map(match => {
                    const team1 = teams.find(t => t.id === match.team1Id);
                    const team2 = teams.find(t => t.id === match.team2Id);
                    const team1Name = team1?.name || (match.team1Id === -1 ? 'Bye' : 'Unknown Team');
                    const team2Name = team2?.name || (match.team2Id === -1 ? 'Bye' : 'Unknown Team');

                    return (
                      <MatchItem key={match.id}>
                        <MatchupInfoGroup>
                          <MatchTeams>
                            <TeamNameContainer align="right">
                              {team1 ? (
                                <TeamNameLink to={`/teams/${team1.id}`}>{team1Name}</TeamNameLink>
                              ) : (
                                <TeamNameSpan>{team1Name}</TeamNameSpan>
                              )}
                            </TeamNameContainer>
                            <VersusSpan>vs</VersusSpan>
                            <TeamNameContainer align="left">
                              {team2 ? (
                                <TeamNameLink to={`/teams/${team2.id}`}>{team2Name}</TeamNameLink>
                              ) : (
                                <TeamNameSpan>{team2Name}</TeamNameSpan>
                              )}
                            </TeamNameContainer>
                          </MatchTeams>

                          {match.isCasted && (
                            <BroadcastContainer>
                              <BroadcastBadge>
                                <FaTwitch /> CASTED
                              </BroadcastBadge>
                              {match.twitchChannel && (
                                <BroadcastLink
                                  href={`https://twitch.tv/${match.twitchChannel}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FaTwitch /> {match.twitchChannel}
                                </BroadcastLink>
                              )}
                            </BroadcastContainer>
                          )}
                        </MatchupInfoGroup>

                        <MatchTimeDetails>
                          {renderTimeDisplay(match)}
                          {(isAuthorizedToEdit(match) || isCaster || isAdmin) && (
                            <EditButton onClick={() => handleOpenEditPanel(match)}>
                              <FaEdit /> Edit Match
                            </EditButton>
                          )}
                        </MatchTimeDetails>
                      </MatchItem>
                    );
                  })}
                </MatchList>
              </RoundGroup>
            ))
          )}
        </MatchesContainer>
      )}

      {selectedMatchForEdit && (() => {
        const team1 = teams.find(t => t.id === selectedMatchForEdit.team1Id);
        const team2 = teams.find(t => t.id === selectedMatchForEdit.team2Id);
        const team1Name = team1?.name || (selectedMatchForEdit.team1Id === -1 ? 'Bye' : 'Unknown Team');
        const team2Name = team2?.name || (selectedMatchForEdit.team2Id === -1 ? 'Bye' : 'Unknown Team');
        const canEditTime = isAuthorizedToEdit(selectedMatchForEdit);
        const canEditCasting = isCaster || isAdmin;

        return (
          <>
            <DrawerOverlay onClick={() => setSelectedMatchForEdit(null)} />
            <DrawerContainer>
              <DrawerHeader>
                <DrawerTitle>Edit Match Details</DrawerTitle>
                <CloseIconButton onClick={() => setSelectedMatchForEdit(null)}>
                  <FaTimes />
                </CloseIconButton>
              </DrawerHeader>

              <DrawerContent>
                <MatchInfoBanner>
                  {team1Name} vs {team2Name}
                </MatchInfoBanner>

                {/* Section 1: Reschedule Match Time */}
                <DrawerSection>
                  <SectionHeaderTitle>Schedule Match</SectionHeaderTitle>
                  <DrawerLabel htmlFor="drawer-datetime-input">Match Time (Local Timezone)</DrawerLabel>
                  <DrawerInput
                    id="drawer-datetime-input"
                    type="datetime-local"
                    value={editTimeValue}
                    onChange={(e) => setEditTimeValue(e.target.value)}
                    disabled={!canEditTime}
                  />
                  {!canEditTime && (
                    <span style={{ fontSize: '0.8rem', color: '#ff4d4f', fontStyle: 'italic' }}>
                      Only team captains or admins can reschedule match times.
                    </span>
                  )}
                </DrawerSection>

                {/* Section 2: Casting & Broadcast details */}
                <DrawerSection>
                  <SectionHeaderTitle>Casting Details</SectionHeaderTitle>
                  <DrawerCheckboxLabel>
                    <input
                      type="checkbox"
                      checked={broadcastCastedValue}
                      onChange={(e) => setBroadcastCastedValue(e.target.checked)}
                      disabled={!canEditCasting}
                    />
                    <span>Will be casted</span>
                  </DrawerCheckboxLabel>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                    <DrawerLabel htmlFor="drawer-twitch-input">Twitch Username</DrawerLabel>
                    <DrawerInput
                      id="drawer-twitch-input"
                      type="text"
                      placeholder="e.g. CaptainFlowers"
                      value={broadcastChannelValue}
                      onChange={(e) => setBroadcastChannelValue(e.target.value)}
                      disabled={!canEditCasting}
                    />
                  </div>
                  {!canEditCasting && (
                    <span style={{ fontSize: '0.8rem', color: '#ff4d4f', fontStyle: 'italic' }}>
                      Only registered casters or admins can edit broadcast details.
                    </span>
                  )}
                </DrawerSection>
              </DrawerContent>

              <DrawerFooter>
                <DrawerButton variant="secondary" onClick={() => setSelectedMatchForEdit(null)}>
                  Cancel
                </DrawerButton>
                <DrawerButton onClick={handleSaveMatchDetails}>
                  Save Changes
                </DrawerButton>
              </DrawerFooter>
            </DrawerContainer>
          </>
        );
      })()}
    </SchedulePageContainer>
  );
};

export default SchedulePage;
