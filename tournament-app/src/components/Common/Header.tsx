import React, { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import {  HamburgerIcon, MobileMenu, HeaderLeft, HeaderContainer, Logo, MobileMainLink, MobileNavItem, MobileSubMenu, MobileSubMenuItem, Nav, NavItem, SubMenu, SubMenuItem } from '../../styles';
import { FaBars, FaChevronDown, FaTimes } from 'react-icons/fa';
import DivisionSelector from './DivisionSelector';
import ThemeToggleButton from './ThemeToggleButton';

const Header: React.FC = () => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setOpenMobileSubMenu(null); // Close sub-menus when main menu is toggled
  };

  const toggleMobileSubMenu = (menu: string) => {
    setOpenMobileSubMenu(prev => (prev === menu ? null : menu));
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileSubMenu(null);
  }

  // Listen to auth state to show/hide the captain link
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, [auth]);

  return (
    <HeaderContainer>
      <HeaderLeft>
        <Logo to="/" onClick={closeAllMenus}>GRumble 2025</Logo>
        <DivisionSelector />
      </HeaderLeft>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* --- DESKTOP NAV --- */}
        <Nav>
          <NavItem>
            Info <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuItem to="/schedule">Schedule</SubMenuItem>
              <SubMenuItem to="/players">Players</SubMenuItem>
              <SubMenuItem to="/match/:matchId"></SubMenuItem>
            </SubMenu>
          </NavItem>

          <NavItem>
            Stages <FaChevronDown size={12} />
            <SubMenu>
              <SubMenuItem to="/draft-access">Draft</SubMenuItem>
              <SubMenuItem to="/swiss">Round Robin</SubMenuItem>
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
        </Nav>

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
          </MobileSubMenu>
        </MobileNavItem>
        
        <MobileNavItem>
          <MobileMainLink onClick={() => toggleMobileSubMenu('stages')}>
            Stages <FaChevronDown size={16} />
          </MobileMainLink>
          <MobileSubMenu isOpen={openMobileSubMenu === 'stages'}>
            <MobileSubMenuItem to="/draft-access" onClick={closeAllMenus}>Draft Lobby</MobileSubMenuItem>
            <MobileSubMenuItem to="/swiss" onClick={closeAllMenus}>Round Robin</MobileSubMenuItem>
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
      </MobileMenu>


    </HeaderContainer>
  );
};

export default Header;
