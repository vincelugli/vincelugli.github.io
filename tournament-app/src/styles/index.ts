import styled, { createGlobalStyle, css } from 'styled-components';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';

// DoubleEliminationBracket
export const BracketContainer = styled.div`
  /* The key property: enables horizontal scrolling only when needed */
  overflow-x: auto;

  /* Optional: Add some nice styling for the scrollable area */
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background}
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};

  /* Improve scrollbar appearance on Webkit browsers (Chrome, Safari) */
  &::-webkit-scrollbar {
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.scrollbar};
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;

// Footer
export const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.background };
  padding: 1rem;
  text-align: center;
  margin-top: auto;
`;

// Header
export const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.background };
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.boxShadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; /* Needed for positioning the mobile menu */
`;

export const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  z-index: 10; /* Ensure logo is above the mobile menu if it overlaps */
`;

export const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;

  /* Hide the desktop nav on smaller screens */
  @media (max-width: 1000px) {
    display: none;
  }
`;

export const NavLink = styled(Link)`
  color: ${({ theme }) => theme.secondaryText};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

export const NavItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textAlt};
  cursor: pointer;
`;

export const SubMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: 0.5rem;
  margin-top: 0.75rem;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.2s ease-in-out;
  z-index: 100;

  /* Show on hover of the parent NavItem */
  ${NavItem}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const SubMenuItem = styled(RouterNavLink)`
  display: block;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  color: ${({ theme }) => theme.text};
  text-decoration: none;

  &:hover {
    background-color: ${({ theme }) => theme.body};
  }

  &.active {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }
`;

export const MobileNavItem = styled.div`
  width: 100%;
`;

export const MobileMainLink = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 600;
  padding: 0.5rem 0;
`;

export const MobileSubMenu = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 1rem;
  max-height: ${({ isOpen }) => (isOpen ? '500px' : '0')}; /* Animate height */
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
`;

export const MobileSubMenuItem = styled(RouterNavLink)`
  font-size: 1.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  &:hover {
    background-color: ${({ theme }) => theme.body};
  }

  &.active {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }
`;

// DraftAuthGate
export const GateContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
`;

export const AuthBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: ${({ theme }) => theme.background };
  border-radius: 8px;
  box-shadow: 0 5px 15px ${({ theme }) => theme.boxShadow};
  text-align: center;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box; /* Important for consistent sizing */
  margin-top: 1rem;
`;
export const ErrorMessage = styled.p` color: red; `;

export const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.secondaryText};
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
`;

export const Select = styled.select`
  padding: 0.8rem 2.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 5px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }
`;

export const DraftMetadataGroup = styled.div`
  display: flex;
  gap: 2rem;
`;

// DraftPage
export const DraftPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const DraftHeader = styled.div`
  background: ${({ theme }) => theme.background };
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  text-align: center;
`;

export const DraftStatus = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  margin: 0.5rem 0 0 0;
`;

export const DraftContent = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  align-items: start;
`;

export const TeamsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
`;

export const TeamCardContainer = styled.div<{ isPicking: boolean }>`
  background: ${({ theme }) => theme.background };
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px ${({ theme }) => theme.boxShadow};
  border: 2px solid ${props => props.isPicking ? props.theme.primary : '#transparent'};
  transition: border-color 0.3s ease;
`;

export const TeamHeader = styled.h3`
  margin-top: 0;
  color: ${({ theme }) => theme.text};
  border-bottom: 1px solid ${({ theme }) => theme.secondaryBorderBotton};
  padding-bottom: 0.75rem;
`;

export const PlayerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
`;

export const PlayerListItem = styled.li<{ isCaptain?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center; /* Vertically align the info block and the Elo */
  padding: 0.8rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderBottom};

  &:last-child {
    border-bottom: none;
  }
  
  /* Use color to distinguish captains */
  color: ${props => (props.isCaptain ? props.theme.captains : 'inherit')};
`;

export const PlayerInfoOnCard = styled.div`
  display: flex;
  flex-direction: column; /* Stack name and roles vertically */
  text-align: left;
`;

export const PlayerNameOnCard = styled.a`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.primaryHover}; /* A slightly different link color to fit the card */
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const PlayerRolesOnCard = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textAlt};
  margin-top: 3px;
`;

export const PlayerEloOnCard = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  padding-left: 1rem; /* Ensure space between roles and Elo */
`;

// DraftTimer
export const TimerWrapper = styled.div`
  background-color: ${({ theme }) => theme.background};
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 220px;
`;

export const TimerLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

export const TimerText = styled.div<{ color: string }>`export 
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  font-size: 2.75rem;
  font-weight: 700;
  color: ${(props) => props.color};
  line-height: 1.1;
  transition: color 0.5s ease-in-out;
`;

// PickOrderDisplay
export const PickOrderContainer = styled.div`
  background: ${({ theme }) => theme.background};
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow-x: auto; /* Crucial for horizontal scrolling */
  white-space: nowrap; /* Prevents items from wrapping to the next line */
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.scrollbar};
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primary};
    border-radius: 4px;
  }
`;

export const PickList = styled.div`
  display: inline-flex; /* Use inline-flex for horizontal layout inside the scroll container */
  gap: 1rem;
`;

export const PickItem = styled.div<{ isCurrent: boolean; isCompleted: boolean; isSkipped: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 90px;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.backgroundTwo};
  border: 2px solid ${({ theme }) => theme.border};
  text-align: center;
  transition: all 0.3s ease-in-out;
  
  /* Conditional styling */
  opacity: ${props => props.isCompleted ? 0.7 : 1};
  background-color: ${props => props.isSkipped ? props.theme.backgroundTwo : props.theme.backgroundTwo};
  border-color: ${props => props.isCurrent ? props.theme.primary : props.theme.border};
  transform: ${props => props.isCurrent ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${props => props.isCurrent ? '0 0 15px rgba(0, 123, 255, 0.5)' : 'none'};
`;

export const PickNumber = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textAlt};
`;

export const PickedTeamName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 4px 0;
`;

export const PickedPlayerName = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.success};
  font-weight: 500;
`;

export const SkippedText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.danger};
  text-decoration: line-through;
`;

// PlayerPool
export const PoolContainer = styled.div`
  background: ${({ theme }) => theme.background };
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px ${({ theme }) => theme.boxShadow};
  position: sticky;
  top: 2rem;
`;

export const PoolHeader = styled.h3`
  margin-top: 0;
  border-bottom: 1px solid ${({ theme }) => theme.secondaryBorderBotton};
  padding-bottom: 0.75rem;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 1rem;
  box-sizing: border-box;
`;

export const PlayerTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 0.5rem;
    text-align: left;
  }
`;

export const DraftButton = styled.button`
  background-color: ${({ theme }) => theme.success};
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: ${({ theme }) => theme.success};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.border};
    cursor: not-allowed;
  }
`;

export const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

export const PlayerName = styled.a`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const RolesContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  font-size: 0.85rem;
`;

export const PrimaryRole = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.primaryHover}; /* A distinct color for primary role */
`;

// MatchHistory
export const HistoryContainer = styled.div`
  background-color: ${({ theme }) => theme.background };
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.boxShadow};
`;

export const MatchHistoryTeamName = styled.h2`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.text};
`;

export const MatchList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const MatchItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.secondaryBorderBotton};
`;

export const MatchInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Opponent = styled.span`
  font-weight: 500;
`;

export const Score = styled.span<{ win: boolean }>`
  font-weight: bold;
  color: ${props => (props.win ? props.theme.success : props.theme.danger)};
`;

// PriorityListPage
export const PageContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

export const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
`;

export const Column = styled.div<{ isDraggingOver: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${props => props.isDraggingOver ? props.theme.backgroundThree : props.theme.backgroundTwo};
  padding: 1rem;
  border-radius: 8px;
  min-height: 500px;
  transition: background-color 0.2s ease;
`;

export const PlayerCard = styled.div<{ isDragging: boolean }>`
  user-select: none;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: ${props => props.isDragging ? props.theme.success : props.theme.background};
  border-radius: 4px;
  box-shadow: 0 1px 3px ${({ theme }) => theme.boxShadow};
  display: flex;
  justify-content: space-between;
`;


export const PlayerRole = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textAlt}; /* A muted gray color */
  font-style: italic;
  margin-top: 2px;
`;

export const SecondaryRoles = styled.span`
  font-style: italic;
  color: ${({ theme }) => theme.textAlt};
  font-size: 0.8rem;
  margin-top: 2px;
`;

// Group

export const GroupContainer = styled.div`
  background-color: ${({ theme }) => theme.background };
  border-radius: 8px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.boxShadow};
  padding: 1.5rem;
`;

export const GroupTitle = styled.h3`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.secondaryText};
  margin-top: 0;
`;

export const TeamList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const TeamName = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const GroupHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 60px 60px; /* Name | Match | Game */
  gap: 1rem;
  padding: 0 1rem 0.5rem 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.borderBottom};
`;

export const ColumnTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
  text-transform: uppercase;
  text-align: center;
`;

export const TeamItem = styled.li`
  display: grid;
  grid-template-columns: 1fr 60px 60px; /* Name | Match | Game */
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderBottom};

  &:last-child {
    border-bottom: none;
  }
`;

// UPDATE: Shared style for both record types
export const Record = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  text-align: center;
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 0.25rem 0;
  border-radius: 4px;
`;

// SwissStage
export const StageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

// AllTeamsPage
export const TeamsContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px ${({ theme }) => theme.boxShadow};
`;

// Page title
export const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1.5rem;
  border-bottom: 3px solid ${({ theme }) => theme.body};
  padding-bottom: 1rem;
`;

// Styled table for a clean layout
export const TeamsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

// Table header
export const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.background};
  
  th {
    padding: 1rem;
    font-size: 1rem;
    color: ${({ theme }) => theme.secondaryText};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

// Table body
export const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.secondaryBorderBotton};
    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 1.25rem 1rem;
    vertical-align: middle;
  }
`;

// Style for the team name to make it a prominent link
export const TeamNameLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-size: 1.1rem;

  &:hover {
    text-decoration: underline;
  }
`;

// TeamPage
export const TeamPageTeamName = styled.h1`
  font-size: 3rem;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

export const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.text};
  border-bottom: 2px solid ${({ theme }) => theme.secondaryBorderBotton};
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const UpcomingMatchCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.primaryHover});
  color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 8px 16px ${({ theme }) => theme.matchCard};
`;

export const OpponentInfo = styled.div`
  font-size: 1.2rem;
  span {
    font-weight: 700;
    font-size: 2rem;
  }
`;

export const TournamentCodeContainer = styled.div`
  margin-top: 1.5rem;
  label {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
`;

export const CodeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Code = styled.code`
  background-color: ${({ theme }) => theme.code};
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
`;

export const CopyButton = styled.button`
  background: ${({ theme }) => theme.background };
  color: ${({ theme }) => theme.primary};
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover { background: ${({ theme }) => theme.borderBottom}; }
`;


export const MatchHistoryList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MatchResult = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ResultIndicator = styled.span<{ win: boolean }>`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${(props) => (props.win ? props.theme.success : props.theme.danger)};
`;

export const TeamPageScore = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.body};
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
`;

// Tournament
export const TournamentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// App
export const GlobalStyle = createGlobalStyle`
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: all 0.25s linear;
  }
`;

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

// SchedulePage
export const SchedulePageContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 2rem auto;
`;

export const ScheduleTitle = styled.h1`
  font-size: 2.8rem;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 2.5rem;
`;

export const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* The central vertical line of the timeline */
  &::after {
    content: '';
    position: absolute;
    left: 20px;
    top: 15px;
    bottom: 15px;
    width: 4px;
    background-color: ${({ theme }) => theme.backgroundThree};
    border-radius: 2px;
  }
`;

export const StageCard = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
  padding-left: 60px; /* Space for the icon and line */
`;

export const StageIcon = styled.div<{ status: string }>`
  position: absolute;
  left: 0;
  top: 5px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  z-index: 1; /* Make sure it's on top of the line */
  
  /* Dynamic styling based on status */
  ${({ status }) =>
    status === 'completed' && css`
      background-color: ${({ theme }) => theme.success};
      color: white;
      border: 3px solid ${({ theme }) => theme.success};
    `}
  ${({ status }) =>
    status === 'in-progress' && css`
      background-color: ${({ theme }) => theme.primary}; /* Blue */
      color: white;
      border: 3px solid ${({ theme }) => theme.primaryHover};
    `}
  ${({ status }) =>
    status === 'upcoming' && css`
      background-color: ; /* Gray */
      color: ${({ theme }) => theme.textAlt};
      border: 3px solid #adb5bd;
    `}
`;

export const StageContent = styled.div`
  background-color: ${({ theme }) => theme.backgroundTwo};
  border-radius: 8px;
  padding: 1.5rem;
  flex-grow: 1;
`;

export const StageTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
`;

export const StageDescription = styled.p`
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.textAlt};
  font-size: 1rem;
`;

export const StageLink = styled(Link)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.primaryHover};
  }
`;

export const StageDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem; /* Space between icon and text */
  color: ${({ theme }) => theme.textAlt};
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0.25rem 0 1rem 0; /* Position it neatly between title and description */
`;

// AdminPage
export const AdminPageContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

export const AdminTitle = styled.h1`
  font-size: 2.8rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  min-height: 400px;
  resize: vertical;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

export const SelectionContainer = styled.div`
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 2rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const AdminLabel = styled.label`
  font-weight: 600;
  color: #555;
`;

export const AdminSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: white;
`;

// DivisionSelector
export const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// SubstitutePage
export const ControlsContainer = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SubsTableHead = styled.thead`
  th {
    padding: 1rem;
    font-size: 1rem;
    color: ${({ theme }) => theme.secondaryText};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 3px solid ${({ theme }) => theme.borderBottom};
    cursor: pointer;
    user-select: none; /* Prevent text selection on click */
    transition: background-color 0.2s;
    
    &:hover {
      background-color: ${({ theme }) => theme.backgroundTwo};
    }
  }
`;

export const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textAlt};
`;

export const ErrorText = styled(LoadingText)`
  color: ${({ theme }) => theme.danger};
`;

export const SubsPageContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

export const SubsTitle = styled.h1`
  font-size: 2.8rem;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 2rem;
`;

export const SubsPlayerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

export const SubsLabel = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondaryText};
`;

export const SubsSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 5px;
  font-size: 1rem;
`;

export const SubsTableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.borderBottom};
    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 1.25rem 1rem;
    vertical-align: middle;
  }
`;

export const SubsCopyButton = styled.button`
  background: ${({ theme }) => theme.backgroundThree};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover { background-color: ${({ theme }) => theme.border}; }
`;
