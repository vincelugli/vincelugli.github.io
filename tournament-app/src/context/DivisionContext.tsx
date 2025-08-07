import React, { createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

export type Division = 'gold' | 'master';

interface DivisionContextType {
  division: Division;
  setDivision: Dispatch<SetStateAction<Division>>;
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

  const value = { division, setDivision };

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
