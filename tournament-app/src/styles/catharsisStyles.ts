import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.85; }
  100% { transform: scale(1); opacity: 1; }
`;

export const CatharsisPageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    padding: 1.25rem 1rem 3rem;
  }
`;

export const CatharsisHero = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 30px ${({ theme }) => theme.boxShadow};
  margin-bottom: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff4757, #ffa502, #2ed573, #1e90ff);
  }

  @media (max-width: 768px) {
    padding: 2rem 1.25rem;
  }
`;

export const BadgeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

export const CategoryBadge = styled.span`
  background-color: rgba(255, 71, 87, 0.12);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

export const FormatBadge = styled.span`
  background-color: rgba(0, 123, 255, 0.12);
  color: ${({ theme }) => theme.primary};
  border: 1px solid rgba(0, 123, 255, 0.3);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

export const LiveIndicatorBadge = styled.span`
  background-color: #ff4757;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  animation: ${pulseAnimation} 2s infinite ease-in-out;
`;

export const CatharsisTitle = styled.h1`
  font-size: 3.25rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem 0;
  line-height: 1.15;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.85rem;
  }
`;

export const CatharsisSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 780px;
  margin: 0 auto 2rem;
  color: ${({ theme }) => theme.secondaryText};
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

export const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 960px;
  margin: 0 auto;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const MetaCard = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 12px;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.boxShadow};
  }
`;

export const MetaIcon = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.25rem;
`;

export const MetaLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textAlt};
`;

export const MetaValue = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

export const MetaSubValue = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondaryText};
`;

export const CountdownCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 16px ${({ theme }) => theme.boxShadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
`;

export const CountdownHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const CountdownTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

export const CountdownSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
`;

export const TimerGrid = styled.div`
  display: flex;
  gap: 1.25rem;
  justify-content: center;
  align-items: center;

  @media (max-width: 540px) {
    gap: 0.65rem;
  }
`;

export const TimerBlock = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 12px;
  min-width: 80px;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: inset 0 1px 3px ${({ theme }) => theme.boxShadow};

  @media (max-width: 540px) {
    min-width: 65px;
    padding: 0.75rem 0.4rem;
  }
`;

export const TimerNumber = styled.span`
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.text};

  @media (max-width: 540px) {
    font-size: 1.6rem;
  }
`;

export const TimerUnit = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textAlt};
  margin-top: 0.35rem;
`;

export const CalendarButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${({ variant, theme }) =>
    variant === 'primary' ? theme.primary :
    variant === 'danger' ? theme.danger :
    theme.backgroundTwo};
  color: ${({ variant, theme }) =>
    variant === 'primary' || variant === 'danger' ? '#ffffff' : theme.text};
  border: 1px solid ${({ variant, theme }) =>
    variant === 'primary' ? theme.primaryHover :
    variant === 'danger' ? theme.danger :
    theme.borderColor};
  border-radius: 8px;
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${({ variant, theme }) =>
      variant === 'primary' ? theme.primaryHover :
      variant === 'danger' ? '#c82333' :
      theme.backgroundThree};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const StorylineSection = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2.5rem;
`;

export const SectionHeader = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const SectionHeading = styled.h2`
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: ${({ theme }) => theme.text};
`;

export const SectionDescription = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
  line-height: 1.5;
`;

export const StorylineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const StoryCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

export const StoryCardTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

export const StoryCardText = styled.p`
  font-size: 0.9rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
`;

export const TeamsVersusContainer = styled.div`
  margin-bottom: 3rem;
`;

export const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const VsBadgeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-top: 140px;

  @media (max-width: 960px) {
    height: auto;
    padding-top: 0;
    margin: -0.5rem 0;
  }
`;

export const VsCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.background};
  border: 2px solid ${({ theme }) => theme.border};
  box-shadow: 0 4px 12px ${({ theme }) => theme.boxShadow};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.primary};
`;

export const TeamCard = styled.div<{ accentColor: string }>`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-top: 4px solid ${({ accentColor }) => accentColor};
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 20px ${({ theme }) => theme.boxShadow};
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

export const TeamCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
`;

export const TeamCardTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TeamCardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

export const TeamSubtitle = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondaryText};
  font-style: italic;
`;

export const TeamVoiceChannel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  width: fit-content;
`;

export const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

export const PlayerItem = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition: transform 0.15s, border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    transform: translateX(3px);
  }

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

export const PlayerLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

export const RoleIconContainer = styled.div<{ roleColor: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ roleColor }) => `${roleColor}18`};
  color: ${({ roleColor }) => roleColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`;

export const PlayerNameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

export const PlayerProfileLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

export const DiscordHandle = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.primary};
    text-decoration: underline;
  }
`;

export const SummonerLink = styled(Link)`
  color: ${({ theme }) => theme.textAlt};
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.primary};
    text-decoration: underline;
  }
`;

export const SummonerAndRank = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textAlt};
  flex-wrap: wrap;
`;

export const GrumbleProfileBadge = styled(Link)`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  background: rgba(0, 123, 255, 0.1);
  color: ${({ theme }) => theme.primary};
  border: 1px solid rgba(0, 123, 255, 0.25);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.primary};
    color: #ffffff;
    transform: translateY(-1px);
  }
`;

export const RankPill = styled.span<{ tierColor: string }>`
  background: ${({ tierColor }) => `${tierColor}20`};
  color: ${({ tierColor }) => tierColor};
  border: 1px solid ${({ tierColor }) => `${tierColor}40`};
  font-weight: 700;
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const PlayerRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const OriginTeamBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.backgroundThree};
  color: ${({ theme }) => theme.secondaryText};
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

export const AccoladeBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
`;

export const ExternalProfileLink = styled.a`
  color: ${({ theme }) => theme.textAlt};
  font-size: 0.85rem;
  padding: 0.3rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

export const AgendaContainer = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 16px ${({ theme }) => theme.boxShadow};
`;

export const AgendaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 24px;
    bottom: 24px;
    left: 20px;
    width: 2px;
    background: ${({ theme }) => theme.borderColor};

    @media (max-width: 600px) {
      left: 16px;
    }
  }
`;

export const AgendaItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  position: relative;

  @media (max-width: 600px) {
    gap: 0.85rem;
  }
`;

export const AgendaBullet = styled.div<{ active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ active, theme }) => (active ? theme.primary : theme.backgroundTwo)};
  border: 2px solid ${({ active, theme }) => (active ? theme.primaryHover : theme.borderColor)};
  color: ${({ active, theme }) => (active ? '#ffffff' : theme.text)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 800;
  flex-shrink: 0;
  z-index: 1;

  @media (max-width: 600px) {
    width: 34px;
    height: 34px;
    font-size: 0.85rem;
  }
`;

export const AgendaItemContent = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  padding: 1rem 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const AgendaTimeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const AgendaStepTitle = styled.h4`
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

export const AgendaTimeTag = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 123, 255, 0.12);
  color: ${({ theme }) => theme.primary};
  border: 1px solid rgba(0, 123, 255, 0.25);
`;

export const AgendaItemDesc = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
  line-height: 1.5;
`;

export const RulesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const RuleCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 16px ${({ theme }) => theme.boxShadow};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RuleCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const RuleCardIcon = styled.div<{ color?: string }>`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: ${({ color }) => (color ? `${color}18` : 'rgba(0, 123, 255, 0.12)')};
  color: ${({ color, theme }) => color || theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

export const RuleCardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

export const RuleBulletList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.92rem;
  color: ${({ theme }) => theme.secondaryText};
  line-height: 1.5;

  li strong {
    color: ${({ theme }) => theme.text};
  }
`;

export const PenaltyCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid rgba(220, 53, 69, 0.35);
  border-left: 6px solid #dc3545;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 16px ${({ theme }) => theme.boxShadow};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PenaltyQuote = styled.blockquote`
  margin: 0;
  padding: 1rem 1.25rem;
  background: rgba(220, 53, 69, 0.08);
  border-radius: 8px;
  border-left: 3px solid #dc3545;
  font-size: 1.05rem;
  font-style: italic;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
`;

export const FearlessTrackerCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 16px ${({ theme }) => theme.boxShadow};
`;

export const GameTabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 0.75rem;
`;

export const GameTabButton = styled.button<{ active: boolean }>`
  background: ${({ active, theme }) => (active ? theme.primary : theme.backgroundTwo)};
  color: ${({ active, theme }) => (active ? '#ffffff' : theme.text)};
  border: 1px solid ${({ active, theme }) => (active ? theme.primaryHover : theme.borderColor)};
  border-radius: 8px;
  padding: 0.55rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ active, theme }) => (active ? theme.primaryHover : theme.backgroundThree)};
  }
`;

export const FearlessInfoBanner = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

export const LockCountDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const LockNumber = styled.span`
  font-size: 1.75rem;
  font-weight: 900;
  color: #ff4757;
`;

export const LockLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.secondaryText};
`;

export const ChampPoolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
  max-height: 380px;
  overflow-y: auto;
  padding: 0.5rem 0.25rem;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.scrollbar};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 4px;
  }
`;

export const ChampPill = styled.div<{ locked?: boolean }>`
  background: ${({ locked, theme }) => (locked ? 'rgba(220, 53, 69, 0.12)' : theme.backgroundTwo)};
  border: 1px solid ${({ locked, theme }) => (locked ? 'rgba(220, 53, 69, 0.35)' : theme.borderColor)};
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${({ locked }) => (locked ? 0.6 : 1)};
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ locked, theme }) => (locked ? '#dc3545' : theme.primary)};
  }
`;

export const ChampIcon = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  object-fit: cover;
`;

export const ChampName = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.text};
`;

export const DiscordCallout = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const DiscordCalloutLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

export const DiscordLogoIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #5865f2;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
`;

export const DiscordCalloutInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const DiscordCalloutTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

export const DiscordCalloutText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
`;

export const CopiedNotification = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.success};
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

export const BackNavigationRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
`;

export const NavBackLink = styled(Link)`
  color: ${({ theme }) => theme.secondaryText};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: ${({ theme }) => theme.background};
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.backgroundTwo};
    border-color: ${({ theme }) => theme.primary};
  }
`;

export const TournamentCodesSection = styled.section`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 2.25rem 2rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 20px ${({ theme }) => theme.boxShadow};
  position: relative;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

export const TournamentCodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const TournamentCodeCard = styled.div<{ $isCompleted?: boolean; $isActive?: boolean }>`
  background: ${({ theme, $isCompleted }) =>
    $isCompleted ? 'rgba(46, 213, 115, 0.05)' : theme.backgroundTwo};
  border: 1px solid ${({ theme, $isCompleted, $isActive }) =>
    $isCompleted ? 'rgba(46, 213, 115, 0.4)' :
    $isActive ? theme.primary : theme.border};
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${({ theme }) => theme.boxShadow};
  }
`;

export const CodeCardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const CodeGameTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
`;

export const CodeStatusBadge = styled.span<{ $status?: string }>`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  ${({ $status }) => {
    switch ($status) {
      case 'completed':
        return `
          background: rgba(46, 213, 115, 0.15);
          color: #2ed573;
          border: 1px solid rgba(46, 213, 115, 0.3);
        `;
      case 'in_progress':
      case 'active':
        return `
          background: rgba(30, 144, 255, 0.15);
          color: #1e90ff;
          border: 1px solid rgba(30, 144, 255, 0.3);
        `;
      default:
        return `
          background: rgba(255, 165, 2, 0.15);
          color: #ffa502;
          border: 1px solid rgba(255, 165, 2, 0.3);
        `;
    }
  }}
`;

export const CodeBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
  padding: 0.35rem 0.5rem 0.35rem 0.85rem;
  gap: 0.5rem;
`;

export const CodeText = styled.code`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CopyCodeButton = styled.button<{ $copied?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ $copied, theme }) => ($copied ? '#2ed573' : theme.primary)};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CodeCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.secondaryText};
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const CodeInstructionsCallout = styled.div`
  margin-top: 1.5rem;
  background: rgba(0, 123, 255, 0.06);
  border: 1px dashed rgba(0, 123, 255, 0.35);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondaryText};
  line-height: 1.5;

  strong {
    color: ${({ theme }) => theme.text};
  }

  ol {
    margin: 0.4rem 0 0;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.25rem;
  }
`;

export const SeriesScoreBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(245, 158, 11, 0.12));
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  text-align: center;
`;

export const EmptyCodesCard = styled.div`
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px dashed ${({ theme }) => theme.border};
  border-radius: 12px;
  margin-top: 1.5rem;
`;

