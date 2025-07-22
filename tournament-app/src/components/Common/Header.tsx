import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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
  return (
    <HeaderContainer>
      <Logo to="/">Tournament Platform</Logo>
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
    </HeaderContainer>
  );
};

export default Header;
