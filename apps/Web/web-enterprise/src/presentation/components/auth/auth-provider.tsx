"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { clearSession, loadSession, me } from "../../../application/auth/auth-api";
import type { AuthSession, AuthUser } from "../../../domain/auth/session";

type AuthState = {
  user: AuthUser | null;
  session: AuthSession | null;
  isReady: boolean;
  logout: () => void;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = loadSession();
    if (!stored) {
      setIsReady(true);
      return;
    }

    setSession(stored.session);
    me(stored.session.accessToken)
      .then((result) => setUser(result.user))
      .catch(() => {
        clearSession();
        setUser(null);
        setSession(null);
      })
      .finally(() => setIsReady(true));
  }, []);

  async function refreshSession() {
    if (!session) return;
    const result = await me(session.accessToken);
    setUser(result.user);
  }

  function logout() {
    clearSession();
    setUser(null);
    setSession(null);
    router.push("/");
  }

  const value = useMemo(
    () => ({ user, session, isReady, logout, refreshSession }),
    [user, session, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
