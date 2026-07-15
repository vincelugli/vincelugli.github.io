import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { ThemeToggleIconButton } from '../../styles';

const ThemeToggleButton: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <ThemeToggleIconButton onClick={toggleTheme}>
      {themeMode === 'light' ? <FaMoon /> : <FaSun />}
    </ThemeToggleIconButton>
  );
};

export default ThemeToggleButton;