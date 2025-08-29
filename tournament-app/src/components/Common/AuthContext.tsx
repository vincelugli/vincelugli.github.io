import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';


interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  captainTeamId: string;
  authDivision: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authDivision, setAuthDivision] = useState('test');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [captainTeamId, setCaptainTeamId] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // When auth state changes, force a refresh of the ID token to get custom claims
        const idTokenResult = await user.getIdTokenResult(true);
        setIsAdmin(!!idTokenResult.claims.adminId);
        setCaptainTeamId(idTokenResult.claims.teamId as string);
        setAuthDivision(idTokenResult.claims.division as string);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [auth, setCurrentUser, setIsAdmin, setLoading]);

  const value = { currentUser, isAdmin, loading, captainTeamId, authDivision };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
