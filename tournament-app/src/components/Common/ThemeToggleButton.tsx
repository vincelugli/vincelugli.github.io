import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ToggleButton = styled.button`
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

const ThemeToggleButton: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <ToggleButton onClick={toggleTheme}>
      {themeMode === 'light' ? <FaMoon /> : <FaSun />}
    </ToggleButton>
  );
};

export default ThemeToggleButton;