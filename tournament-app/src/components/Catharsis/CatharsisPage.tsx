import React, { useState, useEffect, useMemo } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaDiscord,
  FaTrophy,
  FaSkull,
  FaShieldAlt,
  FaTree,
  FaFire,
  FaCrosshairs,
  FaHeart,
  FaRandom,
  FaExternalLinkAlt,
  FaExclamationTriangle,
  FaUsers,
  FaGamepad,
  FaCrown,
  FaArrowRight
} from 'react-icons/fa';
import {
  CatharsisPageContainer,
  CatharsisHero,
  BadgeContainer,
  CategoryBadge,
  FormatBadge,
  LiveIndicatorBadge,
  CatharsisTitle,
  CatharsisSubtitle,
  MetaGrid,
  MetaCard,
  MetaIcon,
  MetaLabel,
  MetaValue,
  MetaSubValue,
  CountdownCard,
  CountdownHeader,
  CountdownTitle,
  CountdownSubtitle,
  TimerGrid,
  TimerBlock,
  TimerNumber,
  TimerUnit,
  ActionButton,
  StorylineSection,
  SectionHeader,
  SectionHeading,
  SectionDescription,
  StorylineGrid,
  StoryCard,
  StoryCardTitle,
  StoryCardText,
  TeamsVersusContainer,
  TeamsGrid,
  VsBadgeContainer,
  VsCircle,
  TeamCard,
  TeamCardHeader,
  TeamCardTitleRow,
  TeamCardTitle,
  TeamSubtitle,
  TeamVoiceChannel,
  PlayerList,
  PlayerItem,
  PlayerLeft,
  RoleIconContainer,
  PlayerNameInfo,
  PlayerProfileLink,
  SummonerLink,
  GrumbleProfileBadge,
  DiscordHandle,
  SummonerAndRank,
  RankPill,
  PlayerRight,
  OriginTeamBadge,
  AccoladeBadge,
  ExternalProfileLink,
  AgendaContainer,
  AgendaList,
  AgendaItem,
  AgendaBullet,
  AgendaItemContent,
  AgendaTimeHeader,
  AgendaStepTitle,
  AgendaTimeTag,
  AgendaItemDesc,
  RulesGrid,
  RuleCard,
  RuleCardHeader,
  RuleCardIcon,
  RuleCardTitle,
  RuleBulletList,
  PenaltyCard,
  PenaltyQuote,
  FearlessTrackerCard,
  GameTabsContainer,
  GameTabButton,
  FearlessInfoBanner,
  LockCountDisplay,
  LockNumber,
  LockLabel,
  ChampPoolGrid,
  ChampPill,
  ChampIcon,
  ChampName,
  DiscordCallout,
  DiscordCalloutLeft,
  DiscordLogoIcon,
  DiscordCalloutInfo,
  DiscordCalloutTitle,
  DiscordCalloutText,
  BackNavigationRow,
  NavBackLink
} from '../../styles/catharsisStyles';
import { createOpGgUrl, createOpGgMultiSearchUrl } from '../../utils';

interface PlayerData {
  discord: string;
  oldTeam: string;
  summoner: string;
  playerId: number;
  isSub?: boolean;
  role: 'top' | 'jungle' | 'mid' | 'adc' | 'support' | 'fill';
  roleName: string;
  rankTier: string;
  rankColor: string;
  accolade?: string;
  note?: string;
}

const TEAM_1_ROSTER: PlayerData[] = [
  {
    discord: '@Dom',
    oldTeam: 'Working From Homeguard',
    summoner: 'dsps#NA1',
    playerId: 100,
    role: 'top',
    roleName: 'Top Lane',
    rankTier: 'Emerald 1',
    rankColor: '#10b981',
    note: 'Homeguard anchor holdout'
  },
  {
    discord: '@qwertyisme.',
    oldTeam: 'Working From Homeguard',
    summoner: 'the last terran#NA1',
    playerId: 20,
    role: 'adc',
    roleName: 'Bot Lane (ADC)',
    rankTier: 'Platinum 3',
    rankColor: '#06b6d4',
    note: 'Homeguard marksman'
  },
  {
    discord: '@Pqmz',
    oldTeam: '0TP',
    summoner: 'Pqmz#NA1',
    playerId: 66,
    role: 'jungle',
    roleName: 'Jungle / Fill',
    rankTier: 'Platinum 2',
    rankColor: '#06b6d4',
    note: '0TP refugee seeking vengeance'
  },
  {
    discord: '@Christmas13',
    oldTeam: '0TP',
    summoner: 'Christmas13#NA1',
    playerId: 116,
    role: 'support',
    roleName: 'Support',
    rankTier: 'Silver 4',
    rankColor: '#94a3b8',
    accolade: '2024 Winner • 2025 Runner-Up',
    note: 'ADC-whisperer ankle weight legend'
  },
  {
    discord: '@lucidorangee',
    oldTeam: 'Platinum Digger sub',
    summoner: 'lucidorangee#na1',
    playerId: 15,
    isSub: true,
    role: 'jungle',
    roleName: 'Jungle / Flex',
    rankTier: 'Emerald 3',
    rankColor: '#10b981',
    accolade: 'Turncoat Mercenary',
    note: 'Former Platinum Digger sub hunting former team'
  }
];

const TEAM_2_ROSTER: PlayerData[] = [
  {
    discord: '@Chonky Chip',
    oldTeam: 'Platinum Digger',
    summoner: 'chonkychip#cooki',
    playerId: 78,
    role: 'support',
    roleName: 'Support / ADC',
    rankTier: 'Emerald 4',
    rankColor: '#10b981',
    accolade: '2025 Gold Winner',
    note: 'Reigning Elemental champion'
  },
  {
    discord: '@jeremy',
    oldTeam: 'Platinum Digger',
    summoner: 'misterpander#na1',
    playerId: 54,
    role: 'top',
    roleName: 'Top / Flex',
    rankTier: 'Gold',
    rankColor: '#f59e0b',
    note: 'Platinum Digger frontliner'
  },
  {
    discord: '@GuoooooJing',
    oldTeam: 'Platinum Digger',
    summoner: 'BanBanDD#NA1',
    playerId: 38,
    role: 'jungle',
    roleName: 'Jungle / Mid',
    rankTier: 'Platinum 2',
    rankColor: '#06b6d4',
    accolade: '2025 Gold Winner',
    note: '2025 champion jungler'
  },
  {
    discord: '@conanjoey',
    oldTeam: '0TP',
    summoner: 'conanjoey#UOFT',
    playerId: 88,
    role: 'mid',
    roleName: 'Mid / Jungle',
    rankTier: 'Platinum 4',
    rankColor: '#06b6d4',
    accolade: '2025 Gold Winner',
    note: '0TP ace facing former duo'
  },
  {
    discord: '@zzzz',
    oldTeam: '0TP',
    summoner: 'ryan38538a1#1164',
    playerId: 102,
    role: 'mid',
    roleName: 'Mid / Flex',
    rankTier: 'Emerald 2',
    rankColor: '#10b981',
    note: '0TP midlane powerhouse'
  }
];

// Target event time: Friday, September 11, 2026, 6:00 PM PDT (UTC-7) / 9:00 PM EDT (UTC-4)
const TARGET_EVENT_DATE = new Date('2026-09-11T18:00:00-07:00');

// Curated pool of signature champions for Fearless Draft showcase
const SIGNATURE_CHAMPIONS = [
  'Aatrox', 'Ahri', 'Akali', 'Amumu', 'Ashe', 'Blitzcrank', 'Camille', 'Darius',
  'Diana', 'Draven', 'Ezreal', 'Fiora', 'Garen', 'Gnar', 'Graves', 'Hecarim',
  'Janna', 'JarvanIV', 'Jax', 'Jhin', 'Jinx', 'Kaisa', 'Karma', 'Kassadin',
  'Katarina', 'Kayn', 'LeeSin', 'Leona', 'Lillia', 'Lucian', 'Lulu', 'Lux',
  'Malphite', 'Maokai', 'Milio', 'MissFortune', 'Morgana', 'Nami', 'Nautilus',
  'Nocturne', 'Orianna', 'Ornn', 'Pantheon', 'Pyke', 'Rakan', 'Renekton',
  'Riven', 'Samira', 'Sejuani', 'Seraphine', 'Sett', 'Shen', 'Sion', 'Sivir',
  'Sona', 'Sylas', 'Syndra', 'Thresh', 'Tristana', 'TwistedFate', 'Varus',
  'Vayne', 'Vi', 'Viego', 'Viktor', 'Volibear', 'Warwick', 'Wukong', 'Xayah',
  'XinZhao', 'Yasuo', 'Yone', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean'
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'top': return <FaShieldAlt />;
    case 'jungle': return <FaTree />;
    case 'mid': return <FaFire />;
    case 'adc': return <FaCrosshairs />;
    case 'support': return <FaHeart />;
    default: return <FaRandom />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'top': return '#ef4444';
    case 'jungle': return '#10b981';
    case 'mid': return '#f59e0b';
    case 'adc': return '#3b82f6';
    case 'support': return '#a855f7';
    default: return '#6b7280';
  }
};

function shuffleChampions(arr: string[]): string[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

const CatharsisPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  const [selectedGameTab, setSelectedGameTab] = useState<number>(1);
  const [userLocalTime, setUserLocalTime] = useState<string>('');
  const [userTimeZone, setUserTimeZone] = useState<string>('');

  // Randomized fearless draft order across series (10 random picks per round)
  const [randomPicksOrder, setRandomPicksOrder] = useState<string[]>(() =>
    shuffleChampions(SIGNATURE_CHAMPIONS)
  );

  const handleReroll = () => {
    setRandomPicksOrder(shuffleChampions(SIGNATURE_CHAMPIONS));
  };

  // Live countdown effect
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = TARGET_EVENT_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detect local timezone string
  useEffect(() => {
    try {
      const timeStr = TARGET_EVENT_DATE.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserLocalTime(timeStr);
      setUserTimeZone(tzName);
    } catch {
      setUserLocalTime('6:00 PM PST / 9:00 PM EST');
    }
  }, []);

  const team1MultiSearchUrl = useMemo(() => {
    return createOpGgMultiSearchUrl(TEAM_1_ROSTER.map(p => p.summoner));
  }, []);

  const team2MultiSearchUrl = useMemo(() => {
    return createOpGgMultiSearchUrl(TEAM_2_ROSTER.map(p => p.summoner));
  }, []);

  // Calculate cumulative locked champion count for Fearless draft simulator
  const lockedCountForTab = (selectedGameTab - 1) * 10;

  const lockedChampionsList = useMemo(() => {
    return randomPicksOrder.slice(0, lockedCountForTab);
  }, [randomPicksOrder, lockedCountForTab]);

  const championPickIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    randomPicksOrder.forEach((champ, idx) => {
      map.set(champ, idx);
    });
    return map;
  }, [randomPicksOrder]);

  return (
    <CatharsisPageContainer>
      {/* --- HERO SECTION --- */}
      <CatharsisHero>
        <BadgeContainer>
          <CategoryBadge>
            <FaTrophy /> Elemental Division Special Showmatch
          </CategoryBadge>
          <FormatBadge>
            <FaGamepad /> Best of 5 Fearless • No Bans
          </FormatBadge>
          {timeLeft.isPast && (
            <LiveIndicatorBadge>
              ● LIVE OR CONCLUDED
            </LiveIndicatorBadge>
          )}
        </BadgeContainer>

        <CatharsisTitle>GRUMBLE CATHARSIS</CatharsisTitle>
        <CatharsisSubtitle>
          Ten eliminated Elemental Division competitors refuse to go quietly into the night.
          Old grudges ignite, former teammates face off, and fearless picks take over Summoner's Rift.
        </CatharsisSubtitle>

        <MetaGrid>
          <MetaCard>
            <MetaIcon><FaCalendarAlt /></MetaIcon>
            <MetaLabel>Date</MetaLabel>
            <MetaValue>Friday, Sept 11, 2026</MetaValue>
            <MetaSubValue>Elemental Knockout Week</MetaSubValue>
          </MetaCard>

          <MetaCard>
            <MetaIcon><FaClock /></MetaIcon>
            <MetaLabel>Start Time</MetaLabel>
            <MetaValue>6:00 PM PST / 9:00 PM EST</MetaValue>
            <MetaSubValue>{userLocalTime ? `(${userLocalTime} local: ${userTimeZone})` : 'Pacific Time'}</MetaSubValue>
          </MetaCard>

          <MetaCard>
            <MetaIcon><FaDiscord /></MetaIcon>
            <MetaLabel>Discord Gathering</MetaLabel>
            <MetaValue>#lol-inhouse-lobby</MetaValue>
            <MetaSubValue>Google League Discord</MetaSubValue>
          </MetaCard>

          <MetaCard>
            <MetaIcon><FaGamepad /></MetaIcon>
            <MetaLabel>Series Format</MetaLabel>
            <MetaValue>Best of 5 Fearless</MetaValue>
            <MetaSubValue>0 Bans • No Repeats</MetaSubValue>
          </MetaCard>
        </MetaGrid>
      </CatharsisHero>

      {/* --- LIVE COUNTDOWN CARD --- */}
      <CountdownCard>
        <CountdownHeader>
          <CountdownTitle>
            <FaClock style={{ color: '#ff4757' }} />
            {timeLeft.isPast ? 'Showmatch Has Begun!' : 'Countdown to Catharsis'}
          </CountdownTitle>
          <CountdownSubtitle>
            {timeLeft.isPast
              ? 'Check Discord #lol-inhouse-lobby for live match status and fearless game score.'
              : 'Prepare your pocket picks and muster your mental fortitude.'}
          </CountdownSubtitle>
        </CountdownHeader>

        {!timeLeft.isPast && (
          <TimerGrid>
            <TimerBlock>
              <TimerNumber>{String(timeLeft.days).padStart(2, '0')}</TimerNumber>
              <TimerUnit>Days</TimerUnit>
            </TimerBlock>
            <TimerBlock>
              <TimerNumber>{String(timeLeft.hours).padStart(2, '0')}</TimerNumber>
              <TimerUnit>Hours</TimerUnit>
            </TimerBlock>
            <TimerBlock>
              <TimerNumber>{String(timeLeft.minutes).padStart(2, '0')}</TimerNumber>
              <TimerUnit>Minutes</TimerUnit>
            </TimerBlock>
            <TimerBlock>
              <TimerNumber>{String(timeLeft.seconds).padStart(2, '0')}</TimerNumber>
              <TimerUnit>Seconds</TimerUnit>
            </TimerBlock>
          </TimerGrid>
        )}
      </CountdownCard>

      {/* --- STORYLINE & NARRATIVE SECTION --- */}
      <StorylineSection>
        <SectionHeader>
          <SectionHeading>
            <FaFire style={{ color: '#f59e0b' }} />
            The Road to Catharsis
          </SectionHeading>
          <SectionDescription>
            Elimination from the main bracket was merely the prologue. Three eliminated elemental teams reunite to settle unfinished business.
          </SectionDescription>
        </SectionHeader>

        <StorylineGrid>
          <StoryCard>
            <StoryCardTitle>
              <FaUsers style={{ color: '#3b82f6' }} />
              The 0TP Civil War
            </StoryCardTitle>
            <StoryCardText>
              Eliminated team <strong>0TP</strong> had its roster torn straight down the middle.
              <strong> @Pqmz</strong> and <strong>@Christmas13</strong> spearhead Team 1, while
              <strong> @conanjoey</strong> and <strong>@zzzz</strong> hold down Team 2.
              Former comrades must now ruthlessly target each other's champion pools.
            </StoryCardText>
          </StoryCard>

          <StoryCard>
            <StoryCardTitle>
              <FaSkull style={{ color: '#ef4444' }} />
              The Former Sub Vengeance
            </StoryCardTitle>
            <StoryCardText>
              <strong>@lucidorangee</strong> served as the substitute for <em>Platinum Digger</em> throughout the season.
              In this showmatch, they suit up in opposing colors for <em>Working From Homeguard V2</em>,
              itching to prove what Platinum Digger was missing.
            </StoryCardText>
          </StoryCard>

          <StoryCard>
            <StoryCardTitle>
              <FaCrown style={{ color: '#d97706' }} />
              Championship Pedigree
            </StoryCardTitle>
            <StoryCardText>
              This isn't an amateur scrap. <strong>@Chonky Chip</strong> and <strong>@GuoooooJing</strong> are reigning
              GRumble 2025 Gold Winners, while <strong>@Christmas13</strong> boasts a 2024 GRumble Championship.
              High-stakes pride and bragging rights are fully on the line.
            </StoryCardText>
          </StoryCard>
        </StorylineGrid>
      </StorylineSection>

      {/* --- TEAMS & ROSTERS SECTION --- */}
      <TeamsVersusContainer>
        <SectionHeader style={{ textAlign: 'center', alignItems: 'center' }}>
          <SectionHeading>
            <FaShieldAlt style={{ color: '#3b82f6' }} />
            The Rosters
          </SectionHeading>
          <SectionDescription>
            Best of 5 showdown featuring 10 elite competitors across two remixed squads.
          </SectionDescription>
        </SectionHeader>

        <TeamsGrid>
          {/* TEAM 1: Working From Homeguard V2 */}
          <TeamCard accentColor="#3b82f6">
            <TeamCardHeader>
              <TeamCardTitleRow>
                <TeamCardTitle>Working From Homeguard V2</TeamCardTitle>
                <ActionButton
                  as="a"
                  href={team1MultiSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  <FaExternalLinkAlt /> Team OP.GG
                </ActionButton>
              </TeamCardTitleRow>
              <TeamSubtitle>"Defend the nexus, clock out of work"</TeamSubtitle>

              <TeamVoiceChannel>
                <FaDiscord style={{ color: '#5865f2' }} />
                Voice Room: <strong>#lol-inhouse-lobby</strong>
              </TeamVoiceChannel>
            </TeamCardHeader>

            <PlayerList>
              {TEAM_1_ROSTER.map((p) => {
                const profilePath = `/players/${p.playerId}?division=elemental${p.isSub ? '&isSub=true' : ''}`;
                return (
                  <PlayerItem key={p.discord}>
                    <PlayerLeft>
                      <RoleIconContainer roleColor={getRoleColor(p.role)}>
                        {getRoleIcon(p.role)}
                      </RoleIconContainer>
                      <PlayerNameInfo>
                        <PlayerProfileLink to={profilePath} title={`View ${p.discord} profile on grumble.cc`}>
                          <DiscordHandle>{p.discord}</DiscordHandle>
                        </PlayerProfileLink>
                        <SummonerAndRank>
                          <SummonerLink to={profilePath} title={`View ${p.summoner} on grumble.cc`}>
                            {p.summoner}
                          </SummonerLink>
                          <RankPill tierColor={p.rankColor}>{p.rankTier}</RankPill>
                        </SummonerAndRank>
                      </PlayerNameInfo>
                    </PlayerLeft>

                    <PlayerRight>
                      <OriginTeamBadge>{p.oldTeam}</OriginTeamBadge>
                      {p.accolade && (
                        <AccoladeBadge>
                          <FaCrown size={10} /> {p.accolade}
                        </AccoladeBadge>
                      )}
                      <GrumbleProfileBadge to={profilePath} title={`View ${p.discord} profile on grumble.cc`}>
                        grumble.cc profile →
                      </GrumbleProfileBadge>
                      <ExternalProfileLink
                        href={createOpGgUrl(p.summoner)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on OP.GG"
                      >
                        <FaExternalLinkAlt />
                      </ExternalProfileLink>
                    </PlayerRight>
                  </PlayerItem>
                );
              })}
            </PlayerList>
          </TeamCard>

          {/* VS CIRCLE */}
          <VsBadgeContainer>
            <VsCircle>VS</VsCircle>
          </VsBadgeContainer>

          {/* TEAM 2: Platinum Digger V2 */}
          <TeamCard accentColor="#f59e0b">
            <TeamCardHeader>
              <TeamCardTitleRow>
                <TeamCardTitle>Platinum Digger V2</TeamCardTitle>
                <ActionButton
                  as="a"
                  href={team2MultiSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  <FaExternalLinkAlt /> Team OP.GG
                </ActionButton>
              </TeamCardTitleRow>
              <TeamSubtitle>"Mining for victory, leaving no LP behind"</TeamSubtitle>

              <TeamVoiceChannel>
                <FaDiscord style={{ color: '#5865f2' }} />
                Voice Room: <strong>#peanut-gallery</strong>
              </TeamVoiceChannel>
            </TeamCardHeader>

            <PlayerList>
              {TEAM_2_ROSTER.map((p) => {
                const profilePath = `/players/${p.playerId}?division=elemental${p.isSub ? '&isSub=true' : ''}`;
                return (
                  <PlayerItem key={p.discord}>
                    <PlayerLeft>
                      <RoleIconContainer roleColor={getRoleColor(p.role)}>
                        {getRoleIcon(p.role)}
                      </RoleIconContainer>
                      <PlayerNameInfo>
                        <PlayerProfileLink to={profilePath} title={`View ${p.discord} profile on grumble.cc`}>
                          <DiscordHandle>{p.discord}</DiscordHandle>
                        </PlayerProfileLink>
                        <SummonerAndRank>
                          <SummonerLink to={profilePath} title={`View ${p.summoner} on grumble.cc`}>
                            {p.summoner}
                          </SummonerLink>
                          <RankPill tierColor={p.rankColor}>{p.rankTier}</RankPill>
                        </SummonerAndRank>
                      </PlayerNameInfo>
                    </PlayerLeft>

                    <PlayerRight>
                      <OriginTeamBadge>{p.oldTeam}</OriginTeamBadge>
                      {p.accolade && (
                        <AccoladeBadge>
                          <FaCrown size={10} /> {p.accolade}
                        </AccoladeBadge>
                      )}
                      <GrumbleProfileBadge to={profilePath} title={`View ${p.discord} profile on grumble.cc`}>
                        grumble.cc profile →
                      </GrumbleProfileBadge>
                      <ExternalProfileLink
                        href={createOpGgUrl(p.summoner)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on OP.GG"
                      >
                        <FaExternalLinkAlt />
                      </ExternalProfileLink>
                    </PlayerRight>
                  </PlayerItem>
                );
              })}
            </PlayerList>
          </TeamCard>
        </TeamsGrid>
      </TeamsVersusContainer>

      {/* --- AGENDA & TIMELINE SECTION --- */}
      <AgendaContainer>
        <SectionHeader>
          <SectionHeading>
            <FaClock style={{ color: '#007BFF' }} />
            Showmatch Agenda
          </SectionHeading>
          <SectionDescription>
            Punctuality is mandatory. Any tardiness triggers the severe and emotionally devastating late penalty.
          </SectionDescription>
        </SectionHeader>

        <AgendaList>
          <AgendaItem>
            <AgendaBullet active={true}>1</AgendaBullet>
            <AgendaItemContent>
              <AgendaTimeHeader>
                <AgendaStepTitle>Lobby Assembly & Roll Call</AgendaStepTitle>
                <AgendaTimeTag>6:00 PM PST / 9:00 PM EST SHARP</AgendaTimeTag>
              </AgendaTimeHeader>
              <AgendaItemDesc>
                All 10 competitors assemble in the Google League Discord in the <strong>#lol-inhouse-lobby</strong> voice channel.
                Spectators and casters take their seats.
              </AgendaItemDesc>
            </AgendaItemContent>
          </AgendaItem>

          <AgendaItem>
            <AgendaBullet>2</AgendaBullet>
            <AgendaItemContent>
              <AgendaTimeHeader>
                <AgendaStepTitle>Intros, Greetings & Psychological Warfare</AgendaStepTitle>
                <AgendaTimeTag>6:00 – 6:05 PM PST (5 min)</AgendaTimeTag>
              </AgendaTimeHeader>
              <AgendaItemDesc>
                Five dedicated minutes of formal trash-talk, team banter, and mental conditioning before game clients launch.
              </AgendaItemDesc>
            </AgendaItemContent>
          </AgendaItem>

          <AgendaItem>
            <AgendaBullet>3</AgendaBullet>
            <AgendaItemContent>
              <AgendaTimeHeader>
                <AgendaStepTitle>Team Strategy & Draft Deliberation</AgendaStepTitle>
                <AgendaTimeTag>6:05 – 6:10 PM PST (5 min)</AgendaTimeTag>
              </AgendaTimeHeader>
              <AgendaItemDesc>
                Teams split into breakout voice rooms to plot their fearless champion conservation strategy:
                <br />
                • <strong>Team 1:</strong> Remains in <em>#lol-inhouse-lobby</em>
                <br />
                • <strong>Team 2:</strong> Moves to <em>#peanut-gallery</em>
              </AgendaItemDesc>
            </AgendaItemContent>
          </AgendaItem>

          <AgendaItem>
            <AgendaBullet>4</AgendaBullet>
            <AgendaItemContent>
              <AgendaTimeHeader>
                <AgendaStepTitle>Game 1 Kickoff (Fearless Draft)</AgendaStepTitle>
                <AgendaTimeTag>6:10 PM PST onwards</AgendaTimeTag>
              </AgendaTimeHeader>
              <AgendaItemDesc>
                Custom game lobby opens. 0 bans. Both teams lock in their first 5 champions.
                Once locked, these 10 champions are permanently banned for the rest of the Bo5 series.
              </AgendaItemDesc>
            </AgendaItemContent>
          </AgendaItem>

          <AgendaItem>
            <AgendaBullet>5</AgendaBullet>
            <AgendaItemContent>
              <AgendaTimeHeader>
                <AgendaStepTitle>Inter-Game Breaks & Fearless Adjustments</AgendaStepTitle>
                <AgendaTimeTag>5 min between every game</AgendaTimeTag>
              </AgendaTimeHeader>
              <AgendaItemDesc>
                A mandatory 5-minute break follows each game to hydrate, de-tilt, and scramble for new champions
                as the available pool rapidly diminishes across Games 2, 3, 4, and 5.
              </AgendaItemDesc>
            </AgendaItemContent>
          </AgendaItem>
        </AgendaList>
      </AgendaContainer>

      {/* --- RULES & LATE PENALTY SECTION --- */}
      <RulesGrid>
        {/* FEARLESS RULES */}
        <RuleCard>
          <RuleCardHeader>
            <RuleCardIcon color="#007BFF">
              <FaGamepad />
            </RuleCardIcon>
            <RuleCardTitle>Best of 5 Fearless (No Bans)</RuleCardTitle>
          </RuleCardHeader>
          <RuleBulletList>
            <li>
              <strong>0 Bans Allowed:</strong> No champions are banned in champion select. Pure picks only.
            </li>
            <li>
              <strong>Fearless Lockout:</strong> Any champion picked by either team in an earlier game CANNOT be picked again by either team for the rest of the series.
            </li>
            <li>
              <strong>Pool Depletion:</strong> Game 1 uses 10 champions; Game 2 locks out 10; Game 3 locks out 20; Game 4 locks out 30; Game 5 locks out 40.
            </li>
            <li>
              <strong>Champion Mastery:</strong> Up to 50 unique champions can be drafted in a full 5-game clash.
            </li>
          </RuleBulletList>
        </RuleCard>

        {/* THE LATE PENALTY */}
        <PenaltyCard>
          <RuleCardHeader>
            <RuleCardIcon color="#dc3545">
              <FaExclamationTriangle />
            </RuleCardIcon>
            <RuleCardTitle style={{ color: '#dc3545' }}>The Official Late Penalty</RuleCardTitle>
          </RuleCardHeader>

          <PenaltyQuote>
            "Your team will play with one fewer player, and you’ll feel guilty, and they'll need a catharsis against you."
          </PenaltyQuote>

          <RuleBulletList>
            <li>
              <strong>4v5 on the Rift:</strong> If a player fails to show up by 6:00 PM PST sharp, their team starts short-handed without pause or pardon.
            </li>
            <li>
              <strong>Immeasurable Guilt:</strong> The late player must endure the crushing emotional weight of letting down 4 teammates fighting for their lives.
            </li>
            <li>
              <strong>Cathartic Retribution:</strong> Your teammates reserve the explicit tournament right to seek in-game and verbal catharsis upon your arrival.
            </li>
          </RuleBulletList>
        </PenaltyCard>
      </RulesGrid>

      {/* --- INTERACTIVE FEARLESS TRACKER & SIMULATOR --- */}
      <FearlessTrackerCard>
        <SectionHeader>
          <SectionHeading>
            <FaSkull style={{ color: '#ff4757' }} />
            Fearless Draft Pool Tracker
          </SectionHeading>
          <SectionDescription>
            Simulate how the champion pool shrinks across the Best of 5 series. See the mounting chaos as signature picks disappear.
          </SectionDescription>
        </SectionHeader>

        <GameTabsContainer>
          {[1, 2, 3, 4, 5].map((gameNum) => (
            <GameTabButton
              key={gameNum}
              active={selectedGameTab === gameNum}
              onClick={() => setSelectedGameTab(gameNum)}
            >
              Game {gameNum} {gameNum === 1 ? '(Full Pool)' : `(${ (gameNum - 1) * 10 } Locked)`}
            </GameTabButton>
          ))}
        </GameTabsContainer>

        <FearlessInfoBanner>
          <LockCountDisplay>
            <LockNumber>{lockedCountForTab}</LockNumber>
            <LockLabel>
              Champions Permanently Banned in Game {selectedGameTab}
              <br />
              {selectedGameTab === 5
                ? 'Final Game decider: only deep champion pools survive!'
                : `${SIGNATURE_CHAMPIONS.length - lockedCountForTab} picks remaining in pool`}
            </LockLabel>
          </LockCountDisplay>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#adb5bd' }}>
              {selectedGameTab === 1
                ? 'Game 1: 0 bans, all champions open.'
                : `10 random picks locked per game (Games 1 to ${selectedGameTab - 1}).`}
            </span>
            <ActionButton
              onClick={handleReroll}
              variant="secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              title="Reroll random champion locks"
            >
              <FaRandom /> Reroll Random Picks
            </ActionButton>
          </div>
        </FearlessInfoBanner>

        {lockedChampionsList.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.85rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(255, 71, 87, 0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 71, 87, 0.2)'
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#ff4757',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                marginRight: '0.25rem'
              }}
            >
              <FaSkull size={11} /> Locked ({lockedChampionsList.length}):
            </span>
            {lockedChampionsList.map((champ) => {
              const pickIndex = championPickIndexMap.get(champ) ?? 0;
              const gNum = Math.floor(pickIndex / 10) + 1;
              return (
                <span
                  key={champ}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: 'rgba(255, 71, 87, 0.15)',
                    color: '#ff6b81',
                    border: '1px solid rgba(255, 71, 87, 0.3)',
                    fontWeight: 600
                  }}
                  title={`Locked after Game ${gNum}`}
                >
                  {champ} <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>G{gNum}</span>
                </span>
              );
            })}
          </div>
        )}

        <ChampPoolGrid>
          {SIGNATURE_CHAMPIONS.map((champ) => {
            const pickIndex = championPickIndexMap.get(champ) ?? -1;
            const isLocked = pickIndex >= 0 && pickIndex < lockedCountForTab;
            const gamePlayed = isLocked ? Math.floor(pickIndex / 10) + 1 : null;

            return (
              <ChampPill
                key={champ}
                locked={isLocked}
                title={isLocked ? `${champ} (Locked in Game ${gamePlayed})` : `${champ} (Available)`}
              >
                <ChampIcon
                  src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${champ}.png`}
                  alt={champ}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png';
                  }}
                />
                <ChampName style={{ textDecoration: isLocked ? 'line-through' : 'none' }}>
                  {champ}
                </ChampName>
                {isLocked && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#ff4757',
                      marginLeft: 'auto',
                      background: 'rgba(255, 71, 87, 0.15)',
                      padding: '1px 4px',
                      borderRadius: '3px'
                    }}
                    title={`Locked after Game ${gamePlayed}`}
                  >
                    G{gamePlayed}
                  </span>
                )}
              </ChampPill>
            );
          })}
        </ChampPoolGrid>
      </FearlessTrackerCard>

      {/* --- DISCORD CALLOUT SECTION --- */}
      <DiscordCallout>
        <DiscordCalloutLeft>
          <DiscordLogoIcon>
            <FaDiscord />
          </DiscordLogoIcon>
          <DiscordCalloutInfo>
            <DiscordCalloutTitle>Google League Discord Hub</DiscordCalloutTitle>
            <DiscordCalloutText>
              Join the official lobby voice channel before 6:00 PM PST sharp.
              Team 1 gathers in <strong>#lol-inhouse-lobby</strong>; Team 2 moves to <strong>#peanut-gallery</strong>.
            </DiscordCalloutText>
          </DiscordCalloutInfo>
        </DiscordCalloutLeft>
      </DiscordCallout>

      {/* --- BACK NAVIGATION LINKS --- */}
      <BackNavigationRow>
        <NavBackLink to="/schedule">
          <FaCalendarAlt style={{ marginRight: '0.4rem' }} /> Tournament Schedule
        </NavBackLink>
        <NavBackLink to="/swiss">
          <FaTrophy style={{ marginRight: '0.4rem' }} /> Swiss Stage Standings
        </NavBackLink>
        <NavBackLink to="/knockout">
          <FaArrowRight style={{ marginRight: '0.4rem' }} /> Knockout Bracket
        </NavBackLink>
      </BackNavigationRow>
    </CatharsisPageContainer>
  );
};

export default CatharsisPage;
