import React, { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import { HeaderContainer, Logo, MobileMainLink, MobileNavItem, MobileSubMenu, MobileSubMenuItem, Nav, NavItem, NavLink, SubMenu, SubMenuItem } from '../../styles';
import styled from 'styled-components';
import { FaBars, FaChevronDown, FaTimes } from 'react-icons/fa';
import DivisionSelector from './DivisionSelector';
import ThemeToggleButton from './ThemeToggleButton';

const HamburgerIcon = styled.div`
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

const MobileMenu = styled.nav<{ isOpen: boolean }>`
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

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

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
          <NavLink to="/schedule">Schedule</NavLink>

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
        {/* <MobileMainLink to="/schedule" onClick={closeAllMenus}>Schedule</MobileMainLink> */}
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
