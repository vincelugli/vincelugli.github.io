import React, { useState, useEffect } from 'react';
import {getAuth} from 'firebase/auth';
import {HamburgerIcon, MobileMenu, HeaderLeft, HeaderContainer, Logo, MobileMainLink, MobileNavItem, MobileSubMenu, MobileSubMenuItem, Nav, NavItem, SubMenu, SubMenuItem, SubMenuAction, MobileSubMenuAction, LogoutButton, UserNameDisplay} from '../../styles';
import { FaBars, FaChevronDown, FaTimes } from 'react-icons/fa';
import DivisionSelector from './DivisionSelector';
import ThemeToggleButton from './ThemeToggleButton';
import { getYearDisplayString } from '../../utils';
import {useAuth} from './AuthContext';
import {useTournament} from '../../context/TournamentContext';
import {usePlayers} from '../../context/PlayerContext';

const Header: React.FC = () => {
  const auth = getAuth();
  const {currentUser: user, isAdmin, isSub, subName, captainTeamId} = useAuth();
  const {teams} = useTournament();
  const {players} = usePlayers();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setOpenMobileSubMenu(null);
  };

  const toggleMobileSubMenu = (menu: string) => {
    setOpenMobileSubMenu(prev => (prev === menu ? null : menu));
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSubMenu(null);
  };

  const getDisplayName = () => {
    if (isAdmin) return "Admin";
    if (isSub) return subName || "Sub";
    if (captainTeamId) {
      const team = teams?.find(t => t.id === Number(captainTeamId));
      if (team) {
        const captain = players?.find(p => p.id === team.captainId);
        if (captain) {
          return captain.name;
        }
        return `Team ${team.id}`;
      }
      return "Captain";
    }
    return "User";
  };

  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const logoText = getYearDisplayString(hash);

  return (
    <HeaderContainer>
      <HeaderLeft>
        <Logo to="/" onClick={closeAllMenus}>{logoText}</Logo>
        <DivisionSelector />
      </HeaderLeft>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* --- DESKTOP NAV --- */}
        <Nav>
          <NavItem>
            Info <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuItem to="/schedule">Schedule</SubMenuItem>
              <SubMenuItem to="/availability">Availability</SubMenuItem>
              <SubMenuItem to="/players">Players</SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem>
            Stages <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuItem to="/draft-access">Draft</SubMenuItem>
              <SubMenuItem to="/swiss">{logoText === 'GRumble 2026' ? 'Swiss Stage' : 'Round Robin'}</SubMenuItem>
              <SubMenuItem to="/knockout">Knockout Stage</SubMenuItem>
              <SubMenuItem to="/teams">Teams</SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem>
            Captain <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuItem to="/draft-access">Draft</SubMenuItem>
              {user && (<SubMenuItem to="/pick-priority">Auto-Draft</SubMenuItem>)}
              <SubMenuItem to="/subs">Substitutes</SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem>
            Year <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuAction
                onClick={() => {
                  window.location.hash = `#/2025`;
                }}
              >
                Grumble 2025
              </SubMenuAction>
              <SubMenuAction
                onClick={() => {
                  window.location.hash = `#/2026`;
                }}
              >
                Grumble 2026
              </SubMenuAction>
            </SubMenu>
          </NavItem>
        </Nav>

        {/* DELETE, DEBUG ONLY */}
        {user && (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <LogoutButton onClick={() => auth.signOut()}>
              Logout
            </LogoutButton>
            <UserNameDisplay>  |  {getDisplayName()}</UserNameDisplay>
          </div>
        )}
        {/* DELETE, DEBUG ONLY */}
        <ThemeToggleButton />
        <HamburgerIcon onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </HamburgerIcon>
      </div>
      
      <MobileMenu isOpen={isMobileMenuOpen}>
        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('schedule')}>
            Schedule <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'schedule'}>
            <MobileSubMenuItem to="/schedule" onClick={closeAllMenus}>Overall Timeline</MobileSubMenuItem>
            <MobileSubMenuItem to="/availability" onClick={closeAllMenus}>Availability</MobileSubMenuItem>
          </MobileSubMenu>
        </MobileNavItem>
        
        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('stages')}>
            Stages <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'stages'}>
            <MobileSubMenuItem to="/draft-access" onClick={closeAllMenus}>Draft Lobby</MobileSubMenuItem>
            <MobileSubMenuItem to="/swiss" onClick={closeAllMenus}>{logoText === 'GRumble 2026' ? 'Swiss Stage' : 'Round Robin'}</MobileSubMenuItem>
            <MobileSubMenuItem to="/knockout" onClick={closeAllMenus}>Knockout Stage</MobileSubMenuItem>
            <MobileSubMenuItem to="/teams" onClick={closeAllMenus}>Teams</MobileSubMenuItem>
          </MobileSubMenu>
        </MobileNavItem>

        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('captain')}>
            Captain <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'captain'}>
            <MobileSubMenuItem to="/draft-access" onClick={closeAllMenus}>Draft</MobileSubMenuItem>
            {user && (<MobileSubMenuItem to="/pick-priority" onClick={closeAllMenus}>Auto-Draft</MobileSubMenuItem>)}
            <MobileSubMenuItem to="/subs" onClick={closeAllMenus}>Substitutes</MobileSubMenuItem>
          </MobileSubMenu>
        </MobileNavItem>

        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('year')}>
            Year <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'year'}>
            <MobileSubMenuAction
              onClick={() => {
                window.location.hash = `#/2025`;
                closeAllMenus();
              }}
            >
              Grumble 2025
            </MobileSubMenuAction>
            <MobileSubMenuAction
              onClick={() => {
                window.location.hash = `#/2026`;
                closeAllMenus();
              }}
            >
              Grumble 2026
            </MobileSubMenuAction>
          </MobileSubMenu>
        </MobileNavItem>

        {user && (
          <MobileNavItem>
            <div style={{padding: '0.75rem', fontSize: '1.2rem', opacity: 0.8}}>
              Logged in as: <strong>{getDisplayName()}</strong>
            </div>
            <MobileSubMenuAction
              onClick={() => {
                auth.signOut();
                closeAllMenus();
              }}
              style={{color: '#ff4d4f', fontWeight: 'bold'}}
            >
              Logout
            </MobileSubMenuAction>
          </MobileNavItem>
        )}
      </MobileMenu>


    </HeaderContainer>
  );
};

export default Header;
