/**
 * Staff session state.
 *
 * The token lives in localStorage and is revalidated against `/auth/me` on
 * every app boot, so a revoked or expired session is cleared rather than
 * leaving the portal in a half-signed-in state.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, setToken, getToken } from '@/lib/api';
import type { StaffUser } from '@/types';

interface AuthContextValue {
  user: StaffUser | null;
  /** True until the stored token has been checked. Gate redirects on this. */
  initialising: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  /** True when the account may read and write the given branch. */
  canAccess: (clinicSlug: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setInitialising(false);
      return;
    }

    let active = true;
    api
      .me()
      .then((result) => {
        if (active) setUser(result);
      })
      .catch(() => {
        // api.ts already clears the token on a 401.
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setInitialising(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const canAccess = useCallback(
    (clinicSlug: string) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // An empty branch list means every branch — see the backend seed file.
      if (user.clinicSlugs.length === 0) return true;
      return user.clinicSlugs.includes(clinicSlug);
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, initialising, signIn, signOut, canAccess }),
    [user, initialising, signIn, signOut, canAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an <AuthProvider>.');
  return context;
}
