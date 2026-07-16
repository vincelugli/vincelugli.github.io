import React, { useState } from 'react';
import { FaCalendarAlt, FaEdit, FaTimes, FaSave, FaClock, FaTwitch } from 'react-icons/fa';
import {
  SchedulePageContainer,
  ScheduleTitle,
  TimelineContainer,
  StageCard,
  StageIcon,
  StageContent,
  StageTitle,
  StageDescription,
  StageLink,
  StageDate,
  TabHeader,
  TabButton,
  MatchesContainer,
  RoundGroup,
  RoundTitle,
  ScheduleMatchList,
  ScheduleMatchItem,
  MatchTeams,
  MatchupInfoGroup,
  TeamNameContainer,
  ScheduleTeamNameLink,
  TeamNameSpan,
  VersusSpan,
  MatchTimeDetails,
  TimeDisplay,
  MainTime,
  SecondaryTime,
  EditButton,
  BroadcastBadge,
  BroadcastLink,
  BroadcastContainer,
  DrawerOverlay,
  DrawerContainer,
  DrawerHeader,
  DrawerTitle,
  CloseIconButton,
  DrawerContent,
  DrawerSection,
  SectionHeaderTitle,
  MatchInfoBanner,
  DrawerLabel,
  DrawerInput,
  DrawerCheckboxLabel,
  DrawerFooter,
  DrawerButton
} from '../../styles';
import { useDivision } from '../../context/DivisionContext';
import { useGameMatches } from '../../context/MatchesContext';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../Common/AuthContext';
import { Match } from '../../types';
import { getYearFromHash, getNextSunday3PMPT, formatToPMPT, formatToLocal } from '../../utils';

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
                <ScheduleMatchList>
                  {groupedMatches[groupName].map(match => {
                    const team1 = teams.find(t => t.id === match.team1Id);
                    const team2 = teams.find(t => t.id === match.team2Id);
                    const team1Name = team1?.name || (match.team1Id === -1 ? 'Bye' : 'Unknown Team');
                    const team2Name = team2?.name || (match.team2Id === -1 ? 'Bye' : 'Unknown Team');

                    return (
                      <ScheduleMatchItem key={match.id}>
                        <MatchupInfoGroup>
                          <MatchTeams>
                            <TeamNameContainer align="right">
                              {team1 ? (
                                <ScheduleTeamNameLink to={`/teams/${team1.id}`}>{team1Name}</ScheduleTeamNameLink>
                              ) : (
                                <TeamNameSpan>{team1Name}</TeamNameSpan>
                              )}
                            </TeamNameContainer>
                            <VersusSpan>vs</VersusSpan>
                            <TeamNameContainer align="left">
                              {team2 ? (
                                <ScheduleTeamNameLink to={`/teams/${team2.id}`}>{team2Name}</ScheduleTeamNameLink>
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
                      </ScheduleMatchItem>
                    );
                  })}
                </ScheduleMatchList>
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
