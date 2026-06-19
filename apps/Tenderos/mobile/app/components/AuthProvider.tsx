import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import type { AuthSession, AuthUser } from "@repo/api-contracts";

type User = AuthUser;
type Session = Pick<AuthSession, "accessToken" | "refreshToken">;

type StoredSession = {
  user: User;
  session: Session;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "savanhi-mobile-session";
const API_BASE_URL = process.env.EXPO_PUBLIC_TENDEROS_API_URL ?? "http://localhost:4300";

async function parseJson(response: Response) {
  return response.json().catch(() => {
    throw new Error("Respuesta invalida del backend.");
  });
}

async function persistSession(value: StoredSession | null) {
  if (value) {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(value));
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }
}

async function loadSession(): Promise<StoredSession | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return null;
  }
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadSession()
      .then((stored) => {
        if (!stored) return;
        setUser(stored.user);
        setSession(stored.session);
      })
      .finally(() => setIsReady(true));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJson(response);
    if (!response.ok) return false;

    const nextUser: User = data.user;
    const nextSession: Session = {
      accessToken: data.session.accessToken,
      refreshToken: data.session.refreshToken,
    };

    setUser(nextUser);
    setSession(nextSession);
    await persistSession({ user: nextUser, session: nextSession });
    return true;
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name, email, password, role: "tendero" }),
    });

    const data = await parseJson(response);
    if (!response.ok) return false;

    const nextUser: User = data.user;
    const nextSession: Session = {
      accessToken: data.session.accessToken ?? "",
      refreshToken: data.session.refreshToken ?? null,
    };

    setUser(nextUser);
    setSession(nextSession);
    await persistSession({ user: nextUser, session: nextSession });
    return true;
  };

  const logout = async () => {
    if (session) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
    }

    setUser(null);
    setSession(null);
    await persistSession(null);
  };

  const value = useMemo(
    () => ({
      isLoggedIn: user !== null,
      user,
      isReady,
      login,
      register,
      logout,
    }),
    [user, isReady]
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
