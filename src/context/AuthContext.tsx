import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { LoginCredentials } from "../types/auth";
import { authService } from "../services/authService";
import { clearAuthStorage, getStoredToken } from "../services/api/client";

const STORAGE_TOKEN_KEY = "infra_watch_token";
const STORAGE_USER_KEY = "infra_watch_user";

interface AuthUser {
  id: number;
  email: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredToken();

    if (!stored) {
      setIsLoading(false);
      return;
    }
    try {
      const userJson = localStorage.getItem(STORAGE_USER_KEY);
      const parsed = userJson ? (JSON.parse(userJson) as AuthUser) : null;
      setToken(stored);
      setUser(parsed);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await authService.login(credentials);

    if (!res.success || !res.data) {
      throw new Error(res.message ?? "Erro ao fazer login");
    }

    const { token: newToken, user_id, email } = res.data;
    const authUser: AuthUser = { id: user_id, email };
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));
    setToken(newToken);
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      clearAuthStorage();
      setToken(null);
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const value: AuthContextValue = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return ctx;
}
