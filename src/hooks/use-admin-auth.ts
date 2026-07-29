"use client";

import { useSyncExternalStore, useCallback } from "react";
import { apiRequest, setAuthToken } from "@/lib/api-client";

const ADMIN_AUTH_KEY = "cybershield_admin_auth";
const ADMIN_AUTH_TIMESTAMP_KEY = "cybershield_admin_auth_ts";

export const MOCK_ADMIN_CREDENTIALS = {
  email: "admin@cyberguardian.ai",
  password: "Admin123!",
};

export type AdminRole = "Super Admin" | "Admin" | "Moderator" | "User";

export interface AdminAuthState {
  isAuthenticated: boolean;
  email: string | null;
  role: AdminRole | null;
  loginAt: number | null;
}

const INITIAL_STATE: AdminAuthState = {
  isAuthenticated: false,
  email: null,
  role: null,
  loginAt: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();

let cachedRaw: string | null = undefined;
let cachedState: AdminAuthState = INITIAL_STATE;

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    const handler = (e: StorageEvent) => {
      if (e.key === ADMIN_AUTH_KEY || e.key === ADMIN_AUTH_TIMESTAMP_KEY || e.key === null) {
        cachedRaw = undefined;
        listener();
      }
    };
    window.addEventListener("storage", handler);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", handler);
    };
  }
  return () => listeners.delete(listener);
}

function parseState(raw: string | null): AdminAuthState {
  if (!raw) return INITIAL_STATE;
  try {
    const parsed = JSON.parse(raw) as AdminAuthState;
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      email: parsed.email ?? null,
      role: parsed.role ?? null,
      loginAt: parsed.loginAt ?? null,
    };
  } catch {
    return INITIAL_STATE;
  }
}

function getSnapshot(): AdminAuthState {
  if (typeof window === "undefined") return INITIAL_STATE;
  const raw = window.localStorage.getItem(ADMIN_AUTH_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseState(raw);
  }
  return cachedState;
}

function getServerSnapshot(): AdminAuthState {
  return INITIAL_STATE;
}

function writeAuthState(state: AdminAuthState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(state));
    window.localStorage.setItem(ADMIN_AUTH_TIMESTAMP_KEY, String(Date.now()));
    cachedRaw = undefined;
    emitChange();
  } catch {
    // Fail silently
  }
}

export function useAdminAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = typeof window !== "undefined";

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiRequest<{ token: string; user: { email: string; role: string } }>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token, true);
        writeAuthState({
          isAuthenticated: true,
          email: res.data.user.email || email.trim(),
          role: "Super Admin",
          loginAt: Date.now(),
        });
        return true;
      }
    } catch {
      // Fallback to demo credential check if backend is offline
      if (
        email.trim().toLowerCase() === MOCK_ADMIN_CREDENTIALS.email.toLowerCase() &&
        password === MOCK_ADMIN_CREDENTIALS.password
      ) {
        writeAuthState({
          isAuthenticated: true,
          email: email.trim(),
          role: "Super Admin",
          loginAt: Date.now(),
        });
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/admin/auth/logout", { method: "POST", isAdmin: true });
    } catch {
      // ignore errors
    } finally {
      setAuthToken(null, true);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(ADMIN_AUTH_KEY);
        window.localStorage.removeItem(ADMIN_AUTH_TIMESTAMP_KEY);
        cachedRaw = undefined;
        emitChange();
      }
    }
  }, []);

  return {
    ...state,
    hydrated,
    login,
    logout,
  };
}
