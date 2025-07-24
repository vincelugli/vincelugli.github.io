import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getAuth, User } from 'firebase/auth';

const HeaderContainer = styled.header`
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: #555;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    color: #000;
  }
`;

const Header: React.FC = () => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);

  // Listen to auth state to show/hide the captain link
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, [auth]);

  return (
    <HeaderContainer>
      <Logo to="/">GRumble 2025</Logo>
      <Nav>
        <NavLink to="/">Home</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/swiss">Swiss (Round 1)</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/knockout">Knockout (Round 2)</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/teams">Teams</NavLink>
      </Nav>
      <Nav>
        <NavLink to="/draft-access">Draft</NavLink>
      </Nav>
      {user && (
          <NavLink to="/pick-priority">My Draft Board</NavLink>
        )}
    </HeaderContainer>
  );
};

export default Header;
