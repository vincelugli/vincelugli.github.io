import React, { createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

export type Division = 'gold' | 'master' | 'test';

interface DivisionContextType {
  division: Division;
  setDivision: Dispatch<SetStateAction<Division>>;
  urlDivision: string;
}
export const DivisionContext = createContext<DivisionContextType | undefined>(undefined);

export const DivisionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage, or default to 'gold'
  const [division, setDivision] = useState<Division>(
    () => (localStorage.getItem('selectedDivision') as Division) || 'gold'
  );

  // When the division changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('selectedDivision', division);
  }, [division]);

  const getUrlDivision = (div: Division): string => {
    if (div === 'master') return 'elder';
    if (div === 'gold') return 'elemental';
    return div;
  };

  const value = { division, setDivision, urlDivision: getUrlDivision(division) };

  return (
    <DivisionContext.Provider value={value}>
      {children}
    </DivisionContext.Provider>
  );
};

// Custom hook for easy access
export const useDivision = (): DivisionContextType => {
  const context = useContext(DivisionContext);
  if (context === undefined) {
    throw new Error('useDivision must be used within a DivisionProvider');
  }
  return context;
};
