import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getMe } from '../api/endpoints';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  pendingInviteCode: string | null;
  clearPendingInvite: () => void;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // NOTE: Storing JWT in localStorage is an XSS tradeoff accepted for MVP.
  // A production hardening pass should evaluate httpOnly cookies or in-memory
  // token storage with silent refresh. See OWASP Token Storage Cheat Sheet.
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(!!token);
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(
    localStorage.getItem('PENDING_INVITE_CODE')
  );

  useEffect(() => {
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsLoading(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('PENDING_INVITE_CODE');
    setToken(null);
    setUser(null);
  };

  const clearPendingInvite = () => {
    localStorage.removeItem('PENDING_INVITE_CODE');
    setPendingInviteCode(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, pendingInviteCode, clearPendingInvite, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
