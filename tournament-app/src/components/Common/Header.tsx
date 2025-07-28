import React, { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import { HeaderContainer, Logo, Nav, NavLink } from '../styles';

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
