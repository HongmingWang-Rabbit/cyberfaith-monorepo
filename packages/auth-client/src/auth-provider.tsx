"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User, AuthSession, AuthTokens } from "@cyberfaith/types";

const STORAGE_KEY = "cyberfaith_auth";
const CORE_API_URL =
  typeof window !== "undefined"
    ? (window as unknown as Record<string, unknown>).__CYBERFAITH_CORE_API_URL__ as string | undefined
    : undefined;

function getApiBase(): string {
  return CORE_API_URL || process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:4000";
}

interface StoredAuth {
  tokens: AuthTokens;
  user: User;
}

function loadStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function saveAuth(data: StoredAuth | null) {
  if (typeof window === "undefined") return;
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  handleAuthCallback: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  coreApiUrl,
}: {
  children: ReactNode;
  coreApiUrl?: string;
}) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiBase = coreApiUrl || getApiBase();

  // Validate token on mount (check URL callback token first, then stored token)
  useEffect(() => {
    // Check URL for callback token (from OAuth redirect)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const callbackToken = params.get("token");
      if (callbackToken) {
        // Remove token from URL immediately
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
        validateAndSetToken(callbackToken);
        return;
      }
    }

    // No callback token — validate stored token
    const stored = loadStoredAuth();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    validateAndSetToken(stored.tokens.accessToken, stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function validateAndSetToken(
    accessToken: string,
    fallback?: StoredAuth
  ) {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const user: User = data.user || data;
        const tokens: AuthTokens = fallback?.tokens || {
          accessToken,
          refreshToken: "",
        };
        const newSession: AuthSession = { user, tokens };
        setSession(newSession);
        saveAuth({ tokens, user });
      } else {
        // Token invalid, clear
        setSession(null);
        saveAuth(null);
      }
    } catch {
      // Network error — keep stored session as fallback
      if (fallback) {
        setSession({ user: fallback.user, tokens: fallback.tokens });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiBase}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Login failed");
        }
        const data = await res.json();
        const newSession: AuthSession = {
          user: data.user,
          tokens: data.tokens,
        };
        setSession(newSession);
        saveAuth({ tokens: data.tokens, user: data.user });
      } finally {
        setIsLoading(false);
      }
    },
    [apiBase]
  );

  const loginWithGoogle = useCallback(() => {
    const redirectUrl =
      typeof window !== "undefined" ? window.location.href : "/";
    window.location.href = `${apiBase}/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
  }, [apiBase]);

  const logout = useCallback(() => {
    setSession(null);
    saveAuth(null);
  }, []);

  const handleAuthCallback = useCallback(
    async (token: string) => {
      await validateAndSetToken(token);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBase]
  );

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        isLoading,
        isAuthenticated: !!session?.user,
        login,
        loginWithGoogle,
        logout,
        handleAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
