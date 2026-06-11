import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const DEMO_USER = {
  name: "Tendero Demo",
  email: "demo@tenderos.app",
  password: "123456",
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [credentialStore, setCredentialStore] = useState(DEMO_USER);

  const login = (email: string, password: string) => {
    const isValid =
      email.trim().toLowerCase() === credentialStore.email.toLowerCase() &&
      password === credentialStore.password;

    if (!isValid) return false;

    setUser({ name: credentialStore.name, email: credentialStore.email });
    return true;
  };

  const register = (name: string, email: string, password: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || cleanPassword.length < 6) return false;

    setCredentialStore({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
    });
    setUser({ name: cleanName, email: cleanEmail });
    return true;
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({
      isLoggedIn: user !== null,
      user,
      login,
      register,
      logout,
    }),
    [user]
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
