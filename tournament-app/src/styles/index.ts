import styled, { createGlobalStyle, css, keyframes } from 'styled-components';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

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
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.background};
  padding: 1rem;
  text-align: center;
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.borderColor};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }
`;

export const CopyrightText = styled.p`
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

export const BugReportButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textAlt};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }
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

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

export const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  z-index: 10; /* Ensure logo is above the mobile menu if it overlaps */

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
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

export const MatchNavLink = styled(Link)`
  color: white;
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

export const SubMenuAction = styled.div`
  display: block;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.body};
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

export const MobileSubMenuAction = styled.div`
  font-size: 1.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  color: ${({ theme }) => theme.text};

  &:hover {
    background-color: ${({ theme }) => theme.body};
  }
`;

export const HamburgerIcon = styled.div`
  display: none; /* Hidden by default on desktop */
  font-size: 1.8rem;
  color: ${({ theme }) => theme.text}};
  cursor: pointer;
  z-index: 10;

  /* Show the icon on smaller screens */
  @media (max-width: 1000px) {
    display: block;
  }
`;

export const MobileMenu = styled.nav<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  
  align-items: flex-start; /* Align to the left for a cleaner look */
  gap: 1rem;
  padding: 6rem 2rem 2rem 2rem;
  
  background-color: ${({ theme }) => theme.background};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; /* Full screen height */

  /* Animate the menu sliding in from the top */
  transition: transform 0.3s ease-in-out;
  transform: translateY(${({ isOpen }) => (isOpen ? '0' : '-100%')});
  z-index: 5; /* Sit below the header but above other content */

  /* Style the links specifically for the mobile menu */
  ${NavLink} {
    font-size: 1.5rem;
    padding: 0;
    border: none;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 600px) {
    gap: 1rem;
  }

  @media (max-width: 400px) {
    gap: 0.5rem;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 400px) {
    gap: 0.5rem;
  }
`;

export const LogoutButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textAlt};
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
  }

  /* Hide on smaller screens */
  @media (max-width: 1000px) {
    display: none;
  }
`;

export const UserNameDisplay = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
  font-weight: 500;
  margin-right: 0.5rem;

  @media (max-width: 1000px) {
    display: none;
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

  @media (max-width: 600px) {
    padding: 0.8rem 0.5rem 0.8rem 0;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

export const Select = styled.select`
  padding: 0.8rem 2.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 5px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: border-color 0.2s;
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }

  @media (max-width: 600px) {
    padding: 0.6rem 1.5rem 0.6rem 1rem;
    font-size: 0.95rem;
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

const timerPulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
  }
  100% {
    transform: scale(1);
  }
`;

export const DraftTimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

export const DraftTimerLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.secondaryText};
  margin-bottom: 0.4rem;
`;

export const DraftTimerDisplay = styled.div<{ isLowTime?: boolean }>`
  font-size: 3rem;
  font-weight: 700;
  font-family: monospace;
  color: ${({ theme, isLowTime }) => isLowTime ? theme.danger : theme.primary};
  text-shadow: 0 2px 4px ${({ theme }) => theme.boxShadow};
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  background: ${({ theme }) => theme.backgroundTwo};
  border: 2px solid ${({ theme, isLowTime }) => isLowTime ? theme.danger : theme.borderColor};
  display: inline-block;
  transition: all 0.3s ease;
  animation: ${({ isLowTime }) => isLowTime ? timerPulse : 'none'} 1.5s infinite ease-in-out;
`;

export const DraftContent = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const TeamsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 750px) {
    grid-template-columns: 1fr;
  }
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
  align-items: center;
`;

export const PickItem = styled.div<{ isCurrent: boolean; isCompleted: boolean; isSkipped: boolean; isPredicted?: boolean }>`
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

  ${props => props.isPredicted && css`
    background-image: repeating-linear-gradient(
      -45deg,
      ${props.theme.backgroundTwo},
      ${props.theme.backgroundTwo} 10px,
      ${props.theme.backgroundThree || props.theme.body} 10px,
      ${props.theme.backgroundThree || props.theme.body} 20px
    );
  `}

@media(max - width: 600px) {
  width: 110px;
  height: 70px;
  padding: 0.25rem;
  border - radius: 4px;
}
`;

export const RoundDivider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 90px;
  position: relative;
  margin: 0 0.5rem;
  flex-shrink: 0;

@media(max - width: 600px) {
  height: 70px;
  width: 30px;
  margin: 0 0.25rem;
}
`;

export const DividerLine = styled.div`
  width: 0;
  height: 100%;
  border-left: 2px dashed ${({ theme }) => theme.border};
  opacity: 0.6;
`;

export const DividerLabel = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.textAlt};
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  box-shadow: 0 2px 4px ${({ theme }) => theme.boxShadow};
  
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-90deg);
  transform-origin: center;
`;

export const PickNumber = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textAlt};

@media(max - width: 600px) {
  font - size: 0.65rem;
}
`;

export const PickedTeamName = styled.p`
  font-size: .8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 4px 0;

  white-space: nowrap;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

@media(max - width: 600px) {
  font - size: 0.7rem;
  margin: 2px 0;
}
`;

export const PickedPlayerName = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.success};
  font-weight: 500;

  white-space: nowrap;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

@media(max - width: 600px) {
  font - size: 0.75rem;
}
`;

export const SkippedText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.danger};
  text-decoration: line-through;

@media(max - width: 600px) {
  font - size: 0.75rem;
}
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

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

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
  padding: 2rem;
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

export const TableScrollWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1.5rem;
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
  td {
    padding: 1.25rem 1rem;
    vertical-align: middle;
  }
`;

export const TableRow = styled.tr<{ status?: 'qualified' | 'eliminated' | 'active' }>`
  border-bottom: 1px solid ${({ theme }) => theme.secondaryBorderBotton};
  background-color: ${({ status, theme }) => {
    if (status === 'qualified') return theme.success + '15';
    if (status === 'eliminated') return theme.danger + '15';
    return 'transparent';
  }};

  &:last-child {
    border-bottom: none;
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
  margin-top: 2rem;
  box-shadow: 0 8px 16px ${({ theme }) => theme.matchCard};

  @media (max-width: 600px) {
    padding: 1.25rem;
  }
`;

export const OpponentInfo = styled.div`
  font-size: 1.2rem;
  span {
    font-weight: 700;
    font-size: 2rem;

    @media (max-width: 600px) {
      font-size: 1.5rem;
    }
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

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

export const Code = styled.code`
  background-color: ${({ theme }) => theme.code};
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  word-break: break-all;

  @media (max-width: 600px) {
    font-size: 1.1rem;
    text-align: center;
  }
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
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
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

  @media (max-width: 600px) {
    padding: 1rem;
  }
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

export const TabHeader = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.backgroundThree};
  margin-bottom: 2.5rem;
`;

export const TabButton = styled.button<{ active: boolean }>`
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

export const MatchesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const RoundGroup = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px ${({ theme }) => theme.boxShadow};
`;

export const RoundTitle = styled.h3`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.text};
  margin-top: 0;
  margin-bottom: 1.25rem;
  border-bottom: 1.5px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 0.5rem;
`;

export const ScheduleMatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ScheduleMatchItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
  gap: 1.5rem;

  &:hover {
    box-shadow: 0 4px 10px ${({ theme }) => theme.boxShadow};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const MatchTeams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  width: 100%;
  min-width: 0;
`;


export const MatchupInfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
`;


export const TeamNameContainer = styled.div<{ align: 'left' | 'right' }>`
  text-align: ${({ align }) => align};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ScheduleTeamNameLink = styled(Link)`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export const TeamNameSpan = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 600;
`;

export const VersusSpan = styled.span`
  color: ${({ theme }) => theme.textAlt};
  font-size: 0.9rem;
`;

export const MatchTimeDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;



export const TimeDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const MainTime = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SecondaryTime = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textAlt};
`;

export const EditButton = styled.button`
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

export const CastingOverlayButton = styled.a`
  background: none;
  border: 1px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textAlt};
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    border-color: ${({ theme }) => theme.primary};
  }
`;


export const BroadcastBadge = styled.span`
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

export const BroadcastLink = styled.a`
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

export const BroadcastContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.6rem;
`;

export const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

export const DrawerContainer = styled.div`
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

export const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 1rem;
`;

export const DrawerTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
`;

export const CloseIconButton = styled.button`
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

export const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  overflow-y: auto;
`;

export const DrawerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.backgroundTwo};
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

export const SectionHeaderTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 0.35rem;
  margin-bottom: 0.5rem;
`;

export const MatchInfoBanner = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  padding: 0.75rem;
  background: ${({ theme }) => theme.body};
  border-radius: 6px;
  color: ${({ theme }) => theme.text};
`;

export const DrawerLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
`;

export const DrawerInput = styled.input`
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

export const DrawerCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
`;

export const DrawerFooter = styled.div`
  display: flex;
  gap: 1rem;
  border-top: 1px solid ${({ theme }) => theme.borderColor};
  padding-top: 1rem;
`;

export const DrawerButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
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

// AdminPage
export const AdminPageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: 0 4px 12px ${({ theme }) => theme.boxShadow};
`;

export const AdminTitle = styled.h1`
  font-size: 2.8rem;
  color: ${({ theme }) => theme.text};
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
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 5px;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  background-color: ${({ theme }) => theme.backgroundThree};
  color: ${({ theme }) => theme.text};
  min-height: 400px;
  resize: vertical;
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

export const SelectionContainer = styled.div`
  margin-bottom: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 2rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const AdminLabel = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
`;

export const AdminSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 5px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
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
  max-width: 1080px;
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

// AllPlayersPage
export const PlayersPageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
`;

export const PlayersHeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

export const PlayersPageTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: ${({theme}) => theme.text};
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, ${({theme}) => theme.primary}, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const PlayersPageSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${({theme}) => theme.textAlt};
`;

export const PlayersControlsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 3rem auto;
  align-items: center;
  
  @media (max-width: 650px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

export const PlayersSearchBarContainer = styled.div`
  flex: 1;
  position: relative;
  min-width: 0;
`;

export const PlayersDropdownContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 650px) {
    justify-content: space-between;
  }
`;

export const PlayersDropdownLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({theme}) => theme.textAlt};
  white-space: nowrap;
`;

export const PlayersDropdownSelect = styled.select`
  box-sizing: border-box;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  border: 1px solid ${({theme}) => theme.border};
  background-color: ${({theme}) => theme.background};
  color: ${({theme}) => theme.text};
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: ${({theme}) => theme.boxShadow};
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${({theme}) => theme.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
  }
`;

export const PlayersSearchInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  border: 1px solid ${({theme}) => theme.border};
  background-color: ${({theme}) => theme.background};
  color: ${({theme}) => theme.text};
  font-size: 1rem;
  box-shadow: ${({theme}) => theme.boxShadow};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({theme}) => theme.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
  }
`;

export const PlayersRoleSection = styled.div`
  margin-bottom: 3.5rem;
`;

export const PlayersRoleHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${({theme}) => theme.border};
  padding-bottom: 0.5rem;
`;

export const PlayersRoleIconWrapper = styled.span<{roleColor: string}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.roleColor};
`;

export const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

export const PlayersTierSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const PlayersTierHeader = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({theme}) => theme.border};
    margin-left: 0.5rem;
  }
`;

const getTierColor = (tier: string): { bg: string; text: string } => {
  const t = tier.toLowerCase();
  switch (t) {
    case 'challenger':
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
    case 'grandmaster':
    case 'grandmasters':
      return { bg: 'rgba(220, 38, 38, 0.15)', text: '#dc2626' };
    case 'master':
    case 'masters':
      return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' };
    case 'diamond':
      return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
    case 'emerald':
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
    case 'platinum':
      return { bg: 'rgba(45, 212, 191, 0.15)', text: '#2dd4bf' };
    case 'gold':
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
    case 'silver':
      return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' };
    case 'bronze':
      return { bg: 'rgba(180, 83, 9, 0.15)', text: '#b45309' };
    case 'iron':
      return { bg: 'rgba(75, 85, 99, 0.15)', text: '#4b5563' };
    default:
      return { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280' };
  }
};

export const PlayersTierBadge = styled.span<{ tier: string }>`
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${({ tier }) => getTierColor(tier).bg};
  color: ${({ tier }) => getTierColor(tier).text};
`;

export const PlayersPlayerCard = styled.div`
  background-color: ${({theme}) => theme.background};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({theme}) => theme.boxShadow};
  border: 1px solid ${({theme}) => theme.border};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
    border-color: ${({theme}) => theme.primary};
  }
`;

export const PlayersCaptainBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #f59e0b;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const PlayersAchievementBadgeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: -0.5rem;
  margin-bottom: 0.75rem;
`;

export const PlayersAchievementBadge = styled.span<{ type: 'winner' | 'runner_up'; division: 'gold' | 'master' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ type, division }) => {
    if (type === 'winner') {
      if (division === 'master') {
        return `
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        `;
      } else {
        return `
          background-color: rgba(245, 158, 11, 0.15);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.3);
        `;
      }
    } else {
      if (division === 'master') {
        return `
          background-color: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          border: 1px solid rgba(139, 92, 246, 0.25);
        `;
      } else {
        return `
          background-color: rgba(100, 116, 139, 0.12);
          color: #475569;
          border: 1px solid rgba(100, 116, 139, 0.25);
        `;
      }
    }
  }}
`;


export const PlayersPlayerName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
  margin: 0 0 1rem 0;
  padding-right: 4.5rem; /* Avoid overlap with captain badge */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PlayersRanksContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  background-color: ${({theme}) => theme.body};
  padding: 0.75rem;
  border-radius: 8px;
`;

export const PlayersRankInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PlayersRankLabel = styled.span`
  font-size: 0.7rem;
  color: ${({theme}) => theme.textAlt};
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

export const PlayersRankValue = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({theme}) => theme.text};
`;

export const PlayersRolesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
`;

export const PlayersRoleBadge = styled.span<{isPrimary: boolean}>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  text-transform: capitalize;
  background-color: ${props => props.isPrimary ? 'rgba(0, 123, 255, 0.15)' : 'rgba(108, 117, 125, 0.15)'};
  color: ${props => props.isPrimary ? props.theme.primary : props.theme.textAlt};
  border: 1px solid ${props => props.isPrimary ? props.theme.primary : 'transparent'};
`;

export const PlayersLoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: 1.2rem;
  color: ${({theme}) => theme.textAlt};
`;

export const PlayersNoPlayersMessage = styled.p`
  color: ${({theme}) => theme.textAlt};
  font-style: italic;
  font-size: 1rem;
`;

export const PlayersFilterToggleBtn = styled.button<{ isOpen: boolean }>`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  border: 1px solid ${({theme, isOpen}) => isOpen ? theme.primary : theme.border};
  background-color: ${({theme, isOpen}) => isOpen ? 'rgba(0, 123, 255, 0.1)' : theme.background};
  color: ${({theme, isOpen}) => isOpen ? theme.primary : theme.text};
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({theme}) => theme.boxShadow};
  
  &:hover {
    border-color: ${({theme}) => theme.primary};
    background-color: rgba(0, 123, 255, 0.05);
  }
`;

export const PlayersFilterPanel = styled.div<{ isOpen: boolean }>`
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
  background-color: ${({theme}) => theme.background};
  border: ${({isOpen, theme}) => isOpen ? `1px solid ${theme.border}` : 'none'};
  border-radius: 16px;
  box-shadow: ${({isOpen, theme}) => isOpen ? theme.boxShadow : 'none'};
  overflow: hidden;
  max-height: ${({isOpen}) => isOpen ? '500px' : '0'};
  opacity: ${({isOpen}) => isOpen ? '1' : '0'};
  margin-bottom: ${({isOpen}) => isOpen ? '3rem' : '0'};
  padding: ${({isOpen}) => isOpen ? '1.5rem' : '0 1.5rem'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const PlayersFilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`;

export const PlayersFilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const PlayersFilterLabel = styled.h4`
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({theme}) => theme.textAlt};
  margin: 0;
`;

export const PlayersFilterPillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const PlayersFilterPill = styled.button<{ selected: boolean }>`
  box-sizing: border-box;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  border: 1px solid ${({theme, selected}) => selected ? theme.primary : theme.border};
  background-color: ${({theme, selected}) => selected ? 'rgba(0, 123, 255, 0.15)' : 'transparent'};
  color: ${({theme, selected}) => selected ? theme.primary : theme.textAlt};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: capitalize;

  &:hover {
    border-color: ${({theme}) => theme.primary};
    color: ${({theme}) => theme.text};
  }
`;

export const PlayersClearFiltersBtn = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  color: ${({theme}) => theme.primary};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: opacity 0.2s;
  
  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
`;

// PlayerProfilePage
export const ProfilePageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
`;

export const ProfileLoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textAlt};
  margin-top: 5rem;
`;

export const ProfileHeader = styled.div`
  padding: 2.5rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  margin-bottom: 2rem;
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;

  @media (max-width: 550px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }
`;

export const ProfileHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 550px) {
    align-items: center;
  }
`;

export const ProfilePlayerName = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;

  @media (max-width: 550px) {
    font-size: 2rem;
  }
`;

export const ProfileTeamLink = styled(Link)`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

export const ProfileFreeAgentText = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
`;

export const ProfileRoleBadgesList = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;

  @media (max-width: 550px) {
    justify-content: center;
  }
`;

export const ProfilePrimaryBadge = styled.span`
  background-color: rgba(0, 123, 255, 0.15);
  color: ${({ theme }) => theme.primary};
  border: 1px solid ${({ theme }) => theme.primary};
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
`;

export const ProfileSecondaryBadge = styled.span`
  background-color: rgba(108, 117, 125, 0.15);
  color: ${({ theme }) => theme.textAlt};
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
`;

export const ProfileCaptainBadge = styled.span`
  background-color: #f59e0b;
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const ProfileAchievementBadge = styled.span<{ type: 'winner' | 'runner_up'; division: 'gold' | 'master' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  ${({ type, division }) => {
    if (type === 'winner') {
      if (division === 'master') {
        return `
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        `;
      } else {
        return `
          background-color: rgba(245, 158, 11, 0.15);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.3);
        `;
      }
    } else {
      if (division === 'master') {
        return `
          background-color: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          border: 1px solid rgba(139, 92, 246, 0.25);
        `;
      } else {
        return `
          background-color: rgba(100, 116, 139, 0.12);
          color: #475569;
          border: 1px solid rgba(100, 116, 139, 0.25);
        `;
      }
    }
  }}
`;


export const ProfileExternalLinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #5383e8; /* OP.GG Blue */
  color: white;
  text-decoration: none;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: background-color 0.2s;
  box-shadow: 0 4px 6px rgba(83, 131, 232, 0.2);

  &:hover {
    background-color: #3b6bd4;
  }
`;

export const ProfileStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

export const ProfileStatCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: ${({ theme }) => theme.boxShadow};
  border: 1px solid ${({ theme }) => theme.border};
`;

export const ProfileSectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-top: 0;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid ${({ theme }) => theme.border};
  padding-bottom: 0.5rem;
`;

export const ProfileStatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ProfileStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export const ProfileStatLabel = styled.span`
  color: ${({ theme }) => theme.textAlt};
  font-weight: 500;
`;

export const ProfileStatValue = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 700;
`;

export const ProfileChampRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ProfileChampIcon = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
`;

export const ProfileChampInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ProfileChampName = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

export const ProfileChampStats = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textAlt};
`;

export const ProfileChampWinrate = styled.span<{ winrate?: number }>`
  font-weight: 700;
  color: ${props => props.winrate && props.winrate >= 55 ? props.theme.success : props.winrate && props.winrate < 47 ? props.theme.danger : props.theme.text};
  font-size: 1rem;
`;

export const ProfileChampRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  text-align: right;
`;

export const ProfilePreferenceRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.85rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ProfilePreferenceRoleLabel = styled.span`
  width: 90px;
  font-weight: 600;
  text-transform: capitalize;
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;

  @media (max-width: 400px) {
    width: 70px;
    font-size: 0.85rem;
  }
`;

export const ProfilePreferenceBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background-color: ${({ theme }) => theme.body};
  border-radius: 4px;
  overflow: hidden;
  margin-right: 1rem;
`;

export const ProfilePreferenceBarFill = styled.div<{ value: number }>`
  height: 100%;
  width: ${props => (props.value / 10) * 100}%;
  background-color: ${props => {
    if (props.value >= 9) return props.theme.primary;
    if (props.value >= 7) return '#10b981';
    if (props.value >= 5) return '#f59e0b';
    return '#6c757d';
  }};
  border-radius: 4px;
`;

export const ProfilePreferenceValue = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textAlt};
  width: 80px;
  text-align: right;

  @media (max-width: 400px) {
    width: 65px;
    font-size: 0.75rem;
  }
`;

export const ProfileMatchHeader = styled.div<{ win: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  border-left: 5px solid ${({ theme, win }) => (win ? theme.success : theme.danger)};
  border-radius: 8px 8px 0 0;
`;

export const ProfileMatchHistoryList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ProfileMatchItem = styled.li`
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid ${({ theme }) => theme.border};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  }
`;

export const ProfileGamesContainer = styled.div`
  padding: 0.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ProfileGameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ProfileGameResultIndicator = styled.span<{ win: boolean }>`
  font-weight: 700;
  font-size: 0.8rem;
  color: ${({ theme, win }) => (win ? theme.success : theme.danger)};
  width: 30px;
`;

export const ProfileChampionIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

export const ProfileKDA = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
  margin-top: 2px;
  font-weight: 500;

  span {
    color: ${({ theme }) => theme.text};
    font-weight: 700;
  }
`;

export const ProfileRankValue = styled.span<{ tier: string }>`
  font-weight: 700;
  color: ${({ tier }) => getTierColor(tier).text};
`;

// UpcomingMatch
export const UpcomingMatchGameSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;

  option {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
  }
`;

// SwissSystemPage
export const SwissPageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

export const SwissSectionTitle = styled.h2`
  font-size: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.body};
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const SwissRoundsContainer = styled.div`
  margin-top: 2rem;
`;

export const SwissTabHeader = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.body};
  margin-bottom: 1.5rem;
  overflow-x: auto;
`;

export const SwissTabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: ${({ active, theme }) => (active ? theme.primary : theme.textAlt)};
  border-bottom: 3px solid ${({ active, theme }) => (active ? theme.primary : 'transparent')};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

export const SwissMatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 1.5rem;
`;

export const SwissMatchCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const SwissMatchTeamSpan = styled.span<{ winner?: boolean }>`
  font-weight: ${({ winner }) => (winner ? '700' : '400')};
  color: ${({ winner, theme }) => (winner ? theme.success : 'inherit')};
`;

export const SwissMatchTeamLink = styled(Link)<{ winner?: boolean }>`
  font-weight: ${({ winner }) => (winner ? '700' : '400')};
  color: ${({ winner, theme }) => (winner ? theme.success : 'inherit')};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const SwissVersus = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
`;

export const SwissScoreText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  background-color: ${({ theme }) => theme.body};
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
`;

export const SwissBracketContainer = styled.div`
  position: relative;
  display: flex;
  gap: 1.5rem;
  padding: 1rem 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-top: 1.5rem;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.scrollbar};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primary};
  }
`;

export const SwissRoundColumn = styled.div`
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 1rem;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  border: 1px solid ${({ theme }) => theme.border};
`;

export const SwissRoundHeader = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  border-bottom: 2px solid ${({ theme }) => theme.primary};
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.text};
`;

export const SwissRecordGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SwissRecordGroupTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.textAlt};
  margin-bottom: 0.25rem;
  border-left: 3px solid ${({ theme }) => theme.primary};
  padding-left: 0.4rem;
`;

export const SwissMatchupCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.boxShadow};
  }
`;

export const SwissTeamRow = styled.div<{ isWinner?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background-color: ${({ isWinner }) => isWinner ? 'rgba(46, 204, 113, 0.08)' : 'transparent'};
`;

export const SwissTeamName = styled.div<{ isWinner?: boolean }>`
  font-size: 0.85rem;
  font-weight: ${({ isWinner }) => isWinner ? '700' : '500'};
  color: ${({ isWinner, theme }) => isWinner ? theme.success : theme.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 170px;
`;

export const SwissTeamScore = styled.div<{ isWinner?: boolean }>`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ isWinner, theme }) => isWinner ? theme.success : theme.textAlt};
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 0.05rem 0.35rem;
  border-radius: 3px;
  min-width: 18px;
  text-align: center;
`;

export const SwissMatchMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textAlt};
  border-top: 1px solid ${({ theme }) => theme.border};
  padding-top: 0.3rem;
  margin-top: 0.15rem;
`;

export const SwissStatusBadge = styled.span<{ status?: string }>`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.65rem;
  color: ${({ status, theme }) => status === 'completed' ? theme.textAlt : theme.primary};
`;


// SwissStandings
export const SwissStandingsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

export const SwissStandingCard = styled.div<{ type: 'advanced' | 'eliminated' | 'active' }>`
  background-color: ${({ theme }) => theme.backgroundTwo};
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 5px solid ${({ theme, type }) =>
    type === 'advanced' ? theme.success :
      type === 'eliminated' ? theme.danger :
        theme.primary};
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

export const SwissStandingCardTitle = styled.h3`
  margin-top: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.secondaryText};
`;

export const SwissStandingTeamList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const SwissStandingTeamItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderBottom};
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:last-child {
    border-bottom: none;
  }
`;

// TwitchEmbed
export const TwitchEmbedContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000; /* Black background for loading */
  border-radius: 8px;
  overflow: hidden; /* Ensures the iframe respects the border-radius */
`;

export const TwitchStyledIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

// BugReportModal
export const BugReportModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const BugReportModalContainer = styled.div`
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  position: relative;
`;

export const BugReportModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 1rem;
`;

export const BugReportModalTitle = styled.h2`
  margin: 0;
  font-size: 1.8rem;
`;

export const BugReportModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textAlt};
  &:hover { color: ${({ theme }) => theme.text}; }
`;

export const BugReportModalTextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  min-height: 50px;
  resize: vertical;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

export const BugReportModalStatusMessage = styled.p<{ status: string }>`
  /* ... */
`;

// ThemeToggleButton
export const ThemeToggleIconButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.text};
  border-radius: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.body};
  }
`;

// TeamPage
export const TeamPageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

export const TeamPageHeaderCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: 2.5rem;
  border: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 600px) {
    padding: 1.5rem;
  }
`;

export const TeamPageTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 1.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const TeamPageHeaderTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;

  @media (max-width: 600px) {
    font-size: 2.25rem;
  }
`;

export const TeamPageActionButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const TeamPageActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.backgroundTwo};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${({ theme }) => theme.backgroundThree || theme.body};
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const TeamPageOpGgMultiSearchLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #5383e8, #2a58b8);
  color: white;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(83, 131, 232, 0.15);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(83, 131, 232, 0.3);
    background: linear-gradient(135deg, #6493f8, #3b69c8);
    color: white;
    text-decoration: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const TeamPagePlayerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
`;

export const TeamPagePlayerCard = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.75rem 1rem;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px ${({ theme }) => theme.boxShadow};
    border-color: ${({ theme }) => theme.primary};
  }
`;

export const TeamPagePlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  width: 100%;
`;

export const TeamPagePlayerNameLink = styled(Link)`
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  width: 100%;

  &:hover {
    color: ${({ theme }) => theme.primary};
    text-decoration: underline;
  }
`;

export const TeamPagePlayerOpGgLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.textAlt};
  opacity: 0.6;
  transition: opacity 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
    opacity: 1;
  }
`;

export const TeamPagePlayerRole = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textAlt};
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

export const TeamPageCaptainIndicator = styled(FaStar)`
  color: #ffc107;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

export const TeamPageSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const TeamPageSectionHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin: 0;
  position: relative;
  padding-left: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.2rem;
    bottom: 0.2rem;
    width: 4px;
    background-color: ${({ theme }) => theme.primary};
    border-radius: 2px;
  }
`;

export const TeamPageEmptyStateCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textAlt};
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

export const TeamPageMatchHistoryCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 600px) {
    padding: 1.25rem;
  }

  & > h1 {
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0 0 1.5rem 0;
    color: ${({ theme }) => theme.text};
    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding-bottom: 1rem;
  }

  & > h2 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 1.5rem 0 0.75rem 0;
    color: ${({ theme }) => theme.textAlt};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

export const TeamPageMatchesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Header
export const HeaderModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

export const HeaderModalBox = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.borderColor};
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px ${({ theme }) => theme.boxShadow};
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
`;

export const HeaderModalTitle = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.text};
`;

export const HeaderModalInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 6px;
  font-size: 1rem;
  background: ${({ theme }) => theme.backgroundTwo};
  color: ${({ theme }) => theme.text};
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

export const HeaderModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

export const HeaderModalButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ variant, theme }) => (variant === 'secondary' ? 'transparent' : theme.primary)};
  color: ${({ variant, theme }) => (variant === 'secondary' ? theme.text : 'white')};
  border: ${({ variant, theme }) => (variant === 'secondary' ? `1px solid ${theme.borderColor}` : 'none')};
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ variant, theme }) => (variant === 'secondary' ? theme.body : theme.primaryHover)};
    opacity: 0.95;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const HeaderErrorMsg = styled.p`
  color: ${({ theme }) => theme.danger};
  font-size: 0.9rem;
  margin: 0;
`;

export const HeaderLoginButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }

  @media (max-width: 1000px) {
    display: none;
  }
`;

export const HeaderMobileLoginButton = styled.div`
  font-size: 1.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-weight: bold;

  &:hover {
    background-color: ${({ theme }) => theme.body};
  }
`;

// Common/Button
interface CommonFormButtonProps {
  variant?: 'primary' | 'secondary';
}

const commonButtonVariants = {
  primary: css`
    background-color: ${({ theme }) => theme.primary};
    color: white;
    border: 2px solid transparent;

    &:hover {
      background-color: ${({ theme }) => theme.primaryHover};
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.textAlt};
    color: white;
    border: 2px solid transparent;

    &:hover {
      background-color: #5a6268;
    }
  `,
};

export const CommonFormButton = styled.button<CommonFormButtonProps>`
  /* Base styles that apply to all buttons */
  width: 100%;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1rem;

  &:disabled {
    background-color: ${({ theme }) => theme.border};
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  /* Apply variant styles, defaulting to 'primary' */
  ${({ variant = 'primary' }) => commonButtonVariants[variant]}
`;

// Tournament
export const TournamentSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 2px solid ${({ theme }) => theme.secondaryBorderBotton};
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const TournamentInlineSectionTitle = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

export const TournamentViewStageLink = styled(Link)`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;

// AdminPage
export const AdminTabBar = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.borderColor};
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
`;

export const AdminTabButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: ${({ active, theme }) => active ? theme.primary : 'transparent'};
  color: ${({ active, theme }) => active ? '#ffffff' : theme.text};
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ active, theme }) => active ? theme.primaryHover : theme.backgroundTwo};
  }
`;

export const AdminCard = styled.div`
  background: ${({ theme }) => theme.backgroundTwo};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px ${({ theme }) => theme.boxShadow};
`;

export const AdminDryRunCard = styled(AdminCard)`
  border: 1px dashed ${({ theme }) => theme.primary};
  background: ${({ theme }) => theme.backgroundThree};
`;

export const AdminCardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const AdminGrid = styled.div<{ columns?: string }>`
  display: grid;
  grid-template-columns: ${({ columns }) => columns || '1fr 1fr'};
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const AdminTableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1rem;
`;

export const AdminStyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
`;

export const AdminStyledTh = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid ${({ theme }) => theme.borderColor};
  background-color: ${({ theme }) => theme.backgroundThree};
  font-weight: 600;
`;

export const AdminStyledTd = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  vertical-align: middle;
`;

export const AdminFormLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const AdminFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const AdminFormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
`;

export const AdminTextInput = styled.input`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

export const AdminSelectInput = styled.select`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

export const AdminCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.5rem;
`;

export const AdminSearchInput = styled(AdminTextInput)`
  margin-bottom: 1rem;
  width: 100%;
  max-width: 320px;
`;

export const AdminBadge = styled.span<{ variant?: 'primary' | 'success' | 'danger' | 'warning' }>`
  display: inline-block;
  white-space: nowrap;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return theme.success + '22';
      case 'danger': return theme.danger + '22';
      case 'warning': return '#ffc10722';
      case 'primary':
      default: return theme.primary + '22';
    }
  }};
  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return theme.success;
      case 'danger': return theme.danger;
      case 'warning': return '#ffc107';
      case 'primary':
      default: return theme.primary;
    }
  }};
  border: 1px solid ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return theme.success;
      case 'danger': return theme.danger;
      case 'warning': return '#ffc107';
      case 'primary':
      default: return theme.primary;
    }
  }};
`;

export const AdminButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const AdminStatusText = styled.p<{ status: 'success' | 'error' | 'loading' }>`
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  margin: 1rem 0;
  background-color: ${({ status, theme }) => status === 'success' ? theme.success + '22' : status === 'error' ? theme.danger + '22' : theme.backgroundThree};
  color: ${({ status, theme }) => status === 'success' ? theme.success : status === 'error' ? theme.danger : theme.text};
  border: 1px solid ${({ status, theme }) => status === 'success' ? theme.success : status === 'error' ? theme.danger : theme.borderColor};
`;

export const AdminActionButton = styled(CommonFormButton)`
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

export const AdminClearButton = styled(AdminActionButton)`
  background-color: ${({ theme }) => theme.danger};
  &:hover {
    background-color: #c82333;
  }
`;

export const AdminIconButton = styled.button<{ variant?: 'success' | 'danger' }>`
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

export const AdminEditBox = styled.div`
  border: 2px solid ${({ theme }) => theme.primary};
  padding: 1.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.background};
  margin-bottom: 1.5rem;
`;

export const AdminFloatingConfirm = styled.div`
  border: 1px solid #ffc107;
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

// AvailabilityPage
export const AvailabilityPageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

export const AvailabilitySectionTitle = styled.h2`
  font-size: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.body};
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const AvailabilityControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`;

export const AvailabilitySelect = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.borderBottom};
  background-color: ${({ theme }) => theme.backgroundTwo};
  color: ${({ theme }) => theme.text};
`;

export const AvailabilityGridContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 3rem;
`;

export const AvailabilityGrid = styled.div<{ showTimezone: boolean }>`
  display: grid;
  grid-template-columns: 100px ${({ showTimezone }) => showTimezone ? '130px' : ''} repeat(7, 1fr);
  gap: 5px;
  min-width: 800px;
`;

export const AvailabilityGridHeader = styled.div`
  font-weight: bold;
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.body};
  border-radius: 4px;
`;

export const AvailabilityTimeLabel = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.body};
  border-radius: 4px;
`;

export const AvailabilitySlot = styled.div<{ isSelected: boolean; count: number; isEditable: boolean }>`
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

export const AvailabilitySlotCount = styled.span`
  font-size: 0.8rem;
  font-weight: bold;
`;

export const AvailabilityBestSlotsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

export const AvailabilityBestSlotCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.borderBottom};
  text-align: center;
`;

export const AvailabilityScoreBadge = styled.span`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
`;

export const AvailabilityStatusMessage = styled.div`
  background-color: ${({ theme }) => theme.backgroundTwo};
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.borderBottom};
  font-weight: 500;
`;

// SignUpPage
export const SignUpPageContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

export const SignUpPageTitle = styled.h1`
  font-size: 2.8rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

export const SignUpPageForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const SignUpPageFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SignUpPageLabel = styled.label`
  font-weight: 600;
  color: #555;
`;

export const SignUpPageInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

export const SignUpPageSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: white;
`;

export const SignUpPageTextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

export const SignUpPageSubmitButton = styled.button`
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover { background-color: #0056b3; }
  &:disabled {
    background-color: #a0c7e4;
    cursor: not-allowed;
  }
`;

export const SignUpPageStatusMessage = styled.p<{ status: string }>`
  text-align: center;
  font-weight: 600;
  padding: 1rem;
  border-radius: 5px;
  color: white;
  background-color: ${({ status }) => status === 'success' ? '#28a745' : '#dc3545'};
`;

// MatchResult
export const MatchResultContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  font-family: 'Roboto', sans-serif;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

export const MatchResultTeamPanelContainer = styled.div<{ teamColor: 'blue' | 'red'; isWinner: boolean }>`
  flex: 1;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  border-top: 5px solid ${({ teamColor }) => (teamColor === 'blue' ? '#007bff' : '#dc3545')};
  box-shadow: ${({ theme }) => theme.boxShadow};
  transition: all 0.3s ease-in-out;

  /* Apply special styling if this team is the winner */
  ${({ isWinner, theme }) =>
    isWinner &&
    css`
      /* Make the shadow more prominent */
      box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);

      /* Add a subtle background gradient */
      background: linear-gradient(180deg, ${theme.background}, ${theme.body});
    `}

  /* If the team is NOT the winner, make them slightly faded */
  ${({ isWinner }) =>
    !isWinner &&
    css`
      opacity: 0.7;
      transform: scale(0.98);
    `}
`;

export const MatchResultBansContainer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 0.75rem;
  background: ${({ theme }) => theme.body};
  border-radius: 6px 6px 0 0;
`;

export const MatchResultBanIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  opacity: 0.7;
  filter: grayscale(80%);
`;

export const MatchResultPlayersContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MatchResultPlayerRowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};

  &:last-child {
    border-bottom: none;
  }
`;

export const MatchResultChampionIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

export const MatchResultSummonerSpells = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MatchResultSpellIcon = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 4px;
`;

export const MatchResultPlayerName = styled.span`
  font-weight: 600;
`;

export const MatchResultItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

export const MatchResultItemIcon = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 4px;
`;

export const MatchResultEmptyItemSlot = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

export const MatchResultPlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* This will now be the element that expands */
  min-width: 0; /* Important for allowing text to truncate if needed */
`;

export const MatchResultKDA = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
  margin-top: 2px;
  font-weight: 500;

  span {
    color: ${({ theme }) => theme.text};
    font-weight: 700;
  }
`;

export const MatchResultDuration = styled.div`
  text-align: center;
  font-size: 1rem;
  color: ${({ theme }) => theme.textAlt || '#6c757d'};
  margin-bottom: 0.75rem;
  font-weight: 500;
`;

export const MatchResultTeamHeader = styled.h3<{ teamColor: 'blue' | 'red' }>`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ teamColor }) => (teamColor === 'blue' ? '#007bff' : '#dc3545')};
  text-align: center;
`;

export const MatchResultColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const pulseLive = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(220, 53, 69, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
`;

export const LiveBadge = styled.span`
  background-color: #dc3545; /* Bootstrap danger / red */
  color: white;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  margin-left: 0.75rem;
  animation: ${pulseLive} 2s infinite;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  vertical-align: middle;
`;

export const PowerRankingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1000px;
  margin: 0 auto;
`;

export const PowerRankingsHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

export const PowerRankingsTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

export const PowerRankingsSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
`;

export const PowerRankingsUpdateInfo = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
  text-align: right;
  margin: 0;
  font-style: italic;
`;

export const PowerRankingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PowerRankingCard = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px ${({ theme }) => theme.boxShadow};
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px ${({ theme }) => theme.boxShadow};
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.2rem;
  }
`;

export const PowerRankingRankSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  text-align: center;

  @media (max-width: 600px) {
    flex-direction: row;
    gap: 1rem;
    min-width: unset;
    align-items: center;
  }
`;

export const PowerRankingRankNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.primary};
  line-height: 1;
`;

export const PowerRankingChange = styled.div<{ changeType: 'up' | 'down' | 'neutral' | 'new' }>`
  font-size: 0.9rem;
  font-weight: 700;
  margin-top: 0.25rem;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  
  background-color: ${({ changeType }) => 
    changeType === 'up' ? 'rgba(40, 167, 69, 0.15)' :
    changeType === 'down' ? 'rgba(220, 53, 69, 0.15)' :
    changeType === 'new' ? 'rgba(0, 123, 255, 0.15)' :
    'rgba(108, 117, 125, 0.15)'
  };
  
  color: ${({ theme, changeType }) => 
    changeType === 'up' ? theme.success :
    changeType === 'down' ? theme.danger :
    changeType === 'new' ? theme.primary :
    theme.textAlt
  };
`;

export const PowerRankingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
`;

export const PowerRankingTeamName = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

export const PowerRankingTeamLink = styled(Link)`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const PowerRankingRoster = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.secondaryText};
  font-weight: 500;
`;

export const PowerRankingComments = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
  border-left: 3px solid ${({ theme }) => theme.borderColor};
  padding-left: 0.75rem;
  margin-top: 0.25rem;
`;

export const PowerRankingsLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.secondaryText};
`;

export const PowerRankingsError = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.danger};
`;

export const PowerRankingsEmpty = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
  text-align: center;
  gap: 1rem;
  color: ${({ theme }) => theme.secondaryText};
`;

export const PowerRankingsControlsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
  gap: 1rem;
  align-items: center;

  @media (max-width: 600px) {
    justify-content: flex-start;
  }
`;

export const PowerRankingsDropdownContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const PowerRankingsDropdownLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textAlt};
`;

export const PowerRankingsDropdownSelect = styled.select`
  padding: 0.5rem 2rem 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

export const CoinFlipContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
`;

export const CoinFlipTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.text};
`;

export const CoinFlipText = styled.p`
  margin: 0 0 0.25rem 0;
  color: ${({ theme }) => theme.text};
`;

export const CoinFlipSecondaryText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0 0 1rem 0;
  line-height: 1.4;
  font-style: italic;
  text-align: center;
`;

export const CoinFlipResultText = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.text};
`;

export const CoinFlipSubText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondaryText};
  margin: 0;
`;


export const CoinFlipButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.background};
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.textAlt};
    cursor: not-allowed;
  }
`;

export const SideSelectContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export const SideSelectButton = styled.button<{ selected?: boolean; side: 'blue' | 'red' }>`
  background-color: ${props => props.selected 
    ? (props.side === 'blue' ? '#0070f3' : '#e00000') 
    : 'transparent'};
  color: ${props => props.selected ? 'white' : (props.side === 'blue' ? '#0070f3' : '#e00000')};
  border: 2px solid ${props => props.side === 'blue' ? '#0070f3' : '#e00000'};
  border-radius: 4px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.side === 'blue' ? 'rgba(0, 112, 243, 0.1)' : 'rgba(224, 0, 0, 0.1)'};
  }
`;




