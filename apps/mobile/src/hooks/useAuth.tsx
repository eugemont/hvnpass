import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserRole } from "@heaven-pass/types";
import { api } from "../api/client";
import { clearToken, getToken, setToken } from "./authStorage";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  /** Dev-only: exchanges an email for a session, no password (see apps/api routes/auth.dev.ts). */
  loginWithEmail: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken()
      .then((token) => {
        // A stored token means a previous dev-login happened; the user identity
        // itself isn't persisted, so a fresh login is required after app restart.
        if (!token) setIsLoading(false);
        else setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const loginWithEmail = useCallback(async (email: string, name?: string) => {
    const result = await api.post<{ token: string; user: AuthUser }>("/auth/dev-token", { email, name });
    await setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isLoading, loginWithEmail, logout }), [user, isLoading, loginWithEmail, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
