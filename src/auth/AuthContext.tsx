import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { ApiClient } from '../services/ApiClient';
import { AuthService } from '../services/AuthService';
import type { AuthResponseDTO, Role, SignInDTO } from '../types/api';

interface AuthContextValue {
  session: AuthResponseDTO | null;
  isLoggedIn: boolean;
  hasLoggedOut: boolean;
  login: (data: SignInDTO) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const sessionKey = 'movie-ticket-session';

interface StoredSession extends AuthResponseDTO {
  expiresAt: number;
}

function restoreSession(): StoredSession | null {
  ApiClient.setToken(null);
  try {
    const saved = sessionStorage.getItem(sessionKey);
    if (!saved) return null;
    const session: StoredSession = JSON.parse(saved);
    if (
      !session ||
      typeof session.token !== 'string' ||
      !session.token ||
      !session.user?.id ||
      !['ADMIN', 'CUSTOMER'].includes(session.user.role) ||
      !Number.isFinite(session.expiresAt) ||
      session.expiresAt <= Date.now()
    ) {
      sessionStorage.removeItem(sessionKey);
      return null;
    }
    ApiClient.setToken(session.token);
    return session;
  } catch {
    sessionStorage.removeItem(sessionKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(restoreSession);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  async function login(data: SignInDTO) {
    const response = await AuthService.signIn(data);
    const saved = { ...response, expiresAt: Date.now() + response.expiresIn * 1000 };
    sessionStorage.setItem(sessionKey, JSON.stringify(saved));
    ApiClient.setToken(response.token);
    setHasLoggedOut(false);
    setSession(saved);
  }

  function logout() {
    sessionStorage.removeItem(sessionKey);
    ApiClient.setToken(null);
    setHasLoggedOut(true);
    setSession(null);
  }

  useEffect(() => {
    const timer = session ? window.setTimeout(logout, session.expiresAt - Date.now()) : undefined;
    window.addEventListener('session-expired', logout);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('session-expired', logout);
    };
  }, [session]);

  function hasRole(roles: Role[]) {
    return session !== null && roles.includes(session.user.role);
  }

  return (
    <AuthContext.Provider
      value={{ session, isLoggedIn: session !== null, hasLoggedOut, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
