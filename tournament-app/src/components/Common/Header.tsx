import React, { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import { HeaderContainer, Logo, Nav, NavLink } from '../../styles';
import styled from 'styled-components';
import { FaBars, FaTimes } from 'react-icons/fa';
import DivisionSelector from './DivisionSelector';

const HamburgerIcon = styled.div`
  display: none; /* Hidden by default on desktop */
  font-size: 1.8rem;
  color: #333;
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
  gap: 2rem;
  align-items: center;
  
  background-color: #ffffff;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; /* Full screen height */
  padding-top: 6rem; /* Space for header */

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
  const [isOpen, setIsOpen] = useState(false);

  // Listen to auth state to show/hide the captain link
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, [auth]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <HeaderContainer>
      <HeaderLeft>
        <Logo to="/">GRumble 2025</Logo>
        <DivisionSelector />
      </HeaderLeft>
      <Nav>
        <NavLink to="/">Home</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/schedule">Schedule</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/swiss">Round Robin</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/knockout">Knockout</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/teams">Teams</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/draft-access">Draft</NavLink>
      </Nav>
      <Nav>
        {user && (
          <NavLink to="/pick-priority">My Auto-Draft</NavLink>
        )}
      </Nav>
      <Nav>
        <NavLink to="/subs">Subs</NavLink>
      </Nav>
      <Nav>
        {user && (
          <NavLink to="/admin-access">Admin</NavLink>
        )}
      </Nav>

      <HamburgerIcon onClick={toggleMenu}>
        {/* Intelligently switch between the bars and the 'X' icon */}
        {isOpen ? <FaTimes /> : <FaBars />}
      </HamburgerIcon>
      
      <MobileMenu isOpen={isOpen}>
        <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
        <NavLink to="/schedule" onClick={toggleMenu}>Schedule</NavLink>
        <NavLink to="/swiss" onClick={toggleMenu}>Round Robin</NavLink>
        <NavLink to="/knockouts" onClick={toggleMenu}>Knockouts</NavLink>
        <NavLink to="/teams" onClick={toggleMenu}>Teams</NavLink>
        <NavLink to="/drafts" onClick={toggleMenu}>Draft</NavLink>
        <NavLink to="/pick-priority" onClick={toggleMenu}>My Auto-Draft</NavLink>
        <NavLink to="/subs" onClick={toggleMenu}>Subs</NavLink>
        <NavLink to="/admin" onClick={toggleMenu}>Admin</NavLink>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
