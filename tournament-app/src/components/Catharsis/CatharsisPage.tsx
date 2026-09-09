import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { AdhocTournamentCode } from '../../types';
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
  FaArrowRight,
  FaKey,
  FaCopy,
  FaCheck,
  FaCheckCircle
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
  NavBackLink,
  TournamentCodesSection,
  TournamentCodesGrid,
  TournamentCodeCard,
  CodeCardTopRow,
  CodeGameTitle,
  CodeStatusBadge,
  CodeBoxWrapper,
  CodeText,
  CopyCodeButton,
  CodeCardFooter,
  SeriesScoreBanner,
  EmptyCodesCard
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

// All League of Legends champions pool for Fearless Draft showcase
const SIGNATURE_CHAMPIONS = [
  'Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Ambessa', 'Amumu', 'Anivia',
  'Annie', 'Aphelios', 'Ashe', 'Aurelion Sol', 'Aurora', 'Azir', 'Bard', "Bel'Veth",
  'Blitzcrank', 'Brand', 'Braum', 'Briar', 'Caitlyn', 'Camille', 'Cassiopeia',
  "Cho'Gath", 'Corki', 'Darius', 'Diana', 'Dr. Mundo', 'Draven', 'Ekko', 'Elise',
  'Evelynn', 'Ezreal', 'Fiddlesticks', 'Fiora', 'Fizz', 'Galio', 'Gangplank',
  'Garen', 'Gnar', 'Gragas', 'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Hwei',
  'Illaoi', 'Irelia', 'Ivern', 'Janna', 'Jarvan IV', 'Jax', 'Jayce', 'Jhin',
  'Jinx', "K'Sante", "Kai'Sa", 'Kalista', 'Karma', 'Karthus', 'Kassadin',
  'Katarina', 'Kayle', 'Kayn', 'Kennen', "Kha'Zix", 'Kindred', 'Kled', "Kog'Maw",
  'LeBlanc', 'Lee Sin', 'Leona', 'Lillia', 'Lissandra', 'Locke', 'Lucian', 'Lulu',
  'Lux', 'Malphite', 'Malzahar', 'Maokai', 'Master Yi', 'Mel', 'Milio',
  'Miss Fortune', 'Mordekaiser', 'Morgana', 'Naafiri', 'Nami', 'Nasus', 'Nautilus',
  'Neeko', 'Nidalee', 'Nilah', 'Nocturne', 'Nunu & Willump', 'Olaf', 'Orianna',
  'Ornn', 'Pantheon', 'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan', 'Rammus',
  "Rek'Sai", 'Rell', 'Renata Glasc', 'Renekton', 'Rengar', 'Riven', 'Rumble',
  'Ryze', 'Samira', 'Sejuani', 'Senna', 'Seraphine', 'Sett', 'Shaco', 'Shen',
  'Shyvana', 'Singed', 'Sion', 'Sivir', 'Skarner', 'Smolder', 'Sona', 'Soraka',
  'Swain', 'Sylas', 'Syndra', 'Tahm Kench', 'Taliyah', 'Talon', 'Taric', 'Teemo',
  'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'Twisted Fate', 'Twitch', 'Udyr',
  'Urgot', 'Varus', 'Vayne', 'Veigar', "Vel'Koz", 'Vex', 'Vi', 'Viego', 'Viktor',
  'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xayah', 'Xerath', 'Xin Zhao',
  'Yasuo', 'Yone', 'Yorick', 'Yunara', 'Yuumi', 'Zaahen', 'Zac', 'Zed', 'Zeri',
  'Ziggs', 'Zilean', 'Zoe', 'Zyra'
];

const formatChampNameForDdragon = (name: string): string => {
  const clean = name.trim();
  const lower = clean.toLowerCase();
  if (lower === 'wukong') return 'MonkeyKing';
  if (lower === 'nunu & willump') return 'Nunu';
  if (lower === 'renata glasc') return 'Renata';
  if (lower === 'leblanc') return 'Leblanc';
  if (lower === 'khazix' || lower === "kha'zix") return 'Khazix';
  if (lower === 'chogath' || lower === "cho'gath") return 'Chogath';
  if (lower === 'kaisa' || lower === "kai'sa") return 'Kaisa';
  if (lower === 'velkoz' || lower === "vel'koz") return 'Velkoz';
  if (lower === 'belveth' || lower === "bel'veth") return 'Belveth';
  return clean.replace(/[\s'.]/g, '');
};

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
  const [adhocCodes, setAdhocCodes] = useState<AdhocTournamentCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string>('');

  // Randomized fearless draft order across series (10 random picks per round)
  const [randomPicksOrder, setRandomPicksOrder] = useState<string[]>(() =>
    shuffleChampions(SIGNATURE_CHAMPIONS)
  );

  const handleReroll = () => {
    setRandomPicksOrder(shuffleChampions(SIGNATURE_CHAMPIONS));
  };

  // Real-time Firestore subscription to adhoc tournament codes
  useEffect(() => {
    try {
      const adhocRef = collection(db, 'adhocTournamentCodes');
      const unsubscribe = onSnapshot(
        adhocRef,
        (snapshot) => {
          const list: AdhocTournamentCode[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data() as AdhocTournamentCode, code: docSnap.id });
          });
          setAdhocCodes(list);
        },
        (err) => {
          console.warn('Error subscribing to adhoc tournament codes:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Failed to initialize adhoc codes subscription:', e);
    }
  }, []);

  // Filter and sort codes relevant to the Catharsis showmatch
  const catharsisCodes = useMemo(() => {
    const specific = adhocCodes.filter((c) => {
      const matchId = String(c.matchId || '').toLowerCase();
      const title = String(c.title || '').toLowerCase();
      const division = String(c.division || '').toLowerCase();
      return (
        matchId.includes('catharsis') ||
        title.includes('catharsis') ||
        division === 'showmatch' ||
        division === 'catharsis'
      );
    });

    const list = specific.length > 0 ? specific : adhocCodes;

    return [...list].sort((a, b) => {
      const extractNum = (item: AdhocTournamentCode) => {
        const m = String(item.matchId || '').match(/_g(\d+)/i) ||
          String(item.title || '').match(/Game\s*(\d+)/i);
        return m ? parseInt(m[1], 10) : 999;
      };
      const numA = extractNum(a);
      const numB = extractNum(b);
      if (numA !== numB) return numA - numB;
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
      return timeA - timeB;
    });
  }, [adhocCodes]);

  // Derive series win scores from completed games
  const seriesScore = useMemo(() => {
    let team1Wins = 0; // Working From Homeguard V2 (Blue)
    let team2Wins = 0; // Platinum Digger V2 (Red)

    catharsisCodes.forEach((c) => {
      if (c.status === 'completed' && c.winner) {
        const w = String(c.winner).toLowerCase();
        if (w.includes('blue') || w.includes('homeguard') || c.winnerId === 1) {
          team1Wins++;
        } else if (w.includes('red') || w.includes('digger') || c.winnerId === 2) {
          team2Wins++;
        }
      }
    });

    return {
      team1Wins,
      team2Wins,
      hasGamesCompleted: team1Wins > 0 || team2Wins > 0
    };
  }, [catharsisCodes]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
  };

  const handleCopyAllCodes = () => {
    const text = catharsisCodes
      .map((c, i) => `Game ${i + 1}: ${c.code}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCode('ALL');
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
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
          {catharsisCodes.length > 0 && (
            <FormatBadge
              as="a"
              href="#tournament-codes"
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                borderColor: 'rgba(245, 158, 11, 0.4)'
              }}
            >
              <FaKey /> {catharsisCodes.length} Tournament Codes Ready
            </FormatBadge>
          )}
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

      {/* --- TOURNAMENT CODES SECTION --- */}
      <TournamentCodesSection id="tournament-codes">
        <SectionHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
            <div>
              <SectionHeading>
                <FaKey style={{ color: '#f59e0b' }} />
                Official Tournament Codes
              </SectionHeading>
              <SectionDescription>
                Riot custom lobby codes for all 5 games of the Fearless Best of 5 series. Paste into your League client to enter each match lobby.
              </SectionDescription>
            </div>

            {catharsisCodes.length > 1 && (
              <ActionButton
                onClick={handleCopyAllCodes}
                variant="secondary"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                title="Copy all tournament codes"
              >
                {copiedCode === 'ALL' ? (
                  <>
                    <FaCheck style={{ color: '#2ed573' }} /> All Codes Copied!
                  </>
                ) : (
                  <>
                    <FaCopy /> Copy All Codes
                  </>
                )}
              </ActionButton>
            )}
          </div>
        </SectionHeader>

        {seriesScore.hasGamesCompleted && (
          <SeriesScoreBanner>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '1.05rem' }}>
                Working From Homeguard V2:
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3b82f6' }}>
                {seriesScore.team1Wins}
              </span>
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6b7280' }}>—</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f59e0b' }}>
                {seriesScore.team2Wins}
              </span>
              <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.05rem' }}>
                Platinum Digger V2
              </span>
            </div>
            <div style={{ width: '100%', fontSize: '0.8rem', color: '#94a3b8' }}>
              First team to 3 wins takes the Catharsis title
            </div>
          </SeriesScoreBanner>
        )}

        {catharsisCodes.length > 0 ? (
          <TournamentCodesGrid>
            {catharsisCodes.map((item, index) => {
              const gameNumber = index + 1;
              const isCompleted = item.status === 'completed';
              const isCopied = copiedCode === item.code;
              const isCurrentSelectedTab = selectedGameTab === gameNumber;

              return (
                <TournamentCodeCard
                  key={item.code}
                  $isCompleted={isCompleted}
                  $isActive={isCurrentSelectedTab}
                >
                  <CodeCardTopRow>
                    <CodeGameTitle>
                      <FaGamepad style={{ color: isCompleted ? '#2ed573' : '#3b82f6' }} />
                      <span>{item.title || `Game ${gameNumber}`}</span>
                    </CodeGameTitle>
                    <CodeStatusBadge $status={item.status || 'active'}>
                      {isCompleted ? (
                        <>
                          <FaCheckCircle size={11} /> Completed
                        </>
                      ) : (
                        'Ready to Play'
                      )}
                    </CodeStatusBadge>
                  </CodeCardTopRow>

                  <CodeBoxWrapper>
                    <CodeText title={item.code}>{item.code}</CodeText>
                    <CopyCodeButton
                      onClick={() => handleCopyCode(item.code)}
                      $copied={isCopied}
                      title="Copy tournament code to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <FaCheck size={12} /> Copied!
                        </>
                      ) : (
                        <>
                          <FaCopy size={12} /> Copy
                        </>
                      )}
                    </CopyCodeButton>
                  </CodeBoxWrapper>

                  <CodeCardFooter>
                    {isCompleted ? (
                      <span style={{ color: '#2ed573', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaCrown size={12} style={{ color: '#f59e0b' }} />
                        Winner: {item.winner ? (String(item.winner).toUpperCase() === 'BLUE' ? 'Team 1 (Blue)' : String(item.winner).toUpperCase() === 'RED' ? 'Team 2 (Red)' : item.winner) : 'Recorded'}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>
                        Draft: Tournament Draft • 0 Bans
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedGameTab(gameNumber)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isCurrentSelectedTab ? '#3b82f6' : '#94a3b8',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                      title={`View banned champion simulation for Game ${gameNumber}`}
                    >
                      {isCurrentSelectedTab ? '• Viewing Pool' : 'View Draft Pool →'}
                    </button>
                  </CodeCardFooter>
                </TournamentCodeCard>
              );
            })}
          </TournamentCodesGrid>
        ) : (
          <EmptyCodesCard>
            <FaKey size={36} style={{ color: '#f59e0b', marginBottom: '0.75rem', opacity: 0.8 }} />
            <h4 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>
              Tournament Codes Pending Generation
            </h4>
            <p style={{ margin: '0 auto 1.25rem', maxWidth: '500px', fontSize: '0.88rem', color: '#94a3b8' }}>
              Official Riot tournament codes for Games 1 through 5 will appear here before match time.
              Players will be able to copy codes with 1 click to automatically join each game lobby.
            </p>
            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Admins: Generate Codes in Admin Panel →
            </Link>
          </EmptyCodesCard>
        )}
      </TournamentCodesSection>

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

        {catharsisCodes[selectedGameTab - 1] && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 1rem',
              background: 'rgba(0, 123, 255, 0.08)',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(0, 123, 255, 0.25)',
              flexWrap: 'wrap',
              gap: '0.6rem'
            }}
          >
            <span style={{ fontSize: '0.88rem', color: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaKey style={{ color: '#f59e0b' }} />
              <strong>Game {selectedGameTab} Tournament Code:</strong>
              <code
                style={{
                  color: '#60a5fa',
                  fontWeight: 700,
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}
              >
                {catharsisCodes[selectedGameTab - 1].code}
              </code>
            </span>
            <button
              onClick={() => handleCopyCode(catharsisCodes[selectedGameTab - 1].code)}
              style={{
                background: copiedCode === catharsisCodes[selectedGameTab - 1].code ? '#2ed573' : '#007BFF',
                color: '#fff',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
              title="Copy code for current game"
            >
              {copiedCode === catharsisCodes[selectedGameTab - 1].code ? (
                <>
                  <FaCheck size={12} /> Copied!
                </>
              ) : (
                <>
                  <FaCopy size={12} /> Copy Code
                </>
              )}
            </button>
          </div>
        )}

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
                  src={`https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/${formatChampNameForDdragon(champ)}.png`}
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
