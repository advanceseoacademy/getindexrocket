"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export type User = {
  email: string;
  name: string | null;
  creditBalance: number;
  role?: string;
  isAdmin?: boolean;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);
const CACHE_KEY = "gir_user_cache";

function readCache(): User | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeCache(user: User | null) {
  try {
    if (user) sessionStorage.setItem(CACHE_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    writeCache(next);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/account", { credentials: "same-origin" });
    if (!res.ok) {
      setUser(null);
      router.replace("/login");
      return;
    }
    const data = await res.json();
    if (data?.user) setUser(data.user);
  }, [router, setUser]);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setUserState(cached);
      setLoading(false);
    }

    fetch("/api/account", { credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {
        setUser(null);
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router, setUser]);

  const value = useMemo(
    () => ({ user, loading, setUser, refreshUser }),
    [user, loading, setUser, refreshUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
