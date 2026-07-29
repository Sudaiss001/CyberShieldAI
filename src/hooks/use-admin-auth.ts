"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Mock Admin Authentication Context
 *
 * This is a FRONTEND-ONLY mock authentication system using localStorage.
 * It exists solely to demonstrate route protection and login flow.
 *
 * When Laravel backend is integrated later, replace `loginAdmin` /
 * `logoutAdmin` with real API calls that validate credentials server-side
 * and return a session token / role. The `useAdminAuth` hook signature
 * is designed to stay stable across that migration.
 *
 * RBAC roles supported (for future backend):
 *   - Super Admin  → full access to every admin module
 *   - Admin        → administrative access to most modules
 *   - Moderator    → can moderate content, users, scans
 *   - User         → standard user (no admin access)
 *
 * The current mock always authenticates as "Super Admin" for demo
 * purposes. Real role enforcement will happen server-side.
 *
 * Implementation note: we use `useSyncExternalStore` to subscribe to
 * localStorage. This is the React 18+ recommended pattern for external
 * stores — it avoids setState-in-effect lint warnings, handles SSR
 * correctly (via getServerSnapshot), and automatically re-renders when
 * the store changes (including cross-tab sync via the storage event).
 *
 * CRITICAL: `getSnapshot` must return a cached value (same reference)
 * when the underlying data hasn't changed, otherwise React enters an
 * infinite loop. We achieve this by caching the parsed state keyed on
 * the raw localStorage string.
 */

const ADMIN_AUTH_KEY = "cybershield_admin_auth";
const ADMIN_AUTH_TIMESTAMP_KEY = "cybershield_admin_auth_ts";

// Mock admin credentials — for demo only.
// In production, Laravel will validate these server-side.
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

// ============================================
// External store (module-level singleton)
// ============================================
// A tiny pub/sub wrapper around localStorage so useSyncExternalStore
// can subscribe to changes. We cache the last-read snapshot so that
// `getSnapshot` returns a stable reference when localStorage hasn't
// changed — this is required by React's useSyncExternalStore.

type Listener = () => void;
const listeners = new Set<Listener>();

// Cached snapshot — only re-parsed when the raw localStorage string changes.
let cachedRaw: string | null = undefined; // undefined = "not yet read"
let cachedState: AdminAuthState = INITIAL_STATE;

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    const handler = (e: StorageEvent) => {
      if (e.key === ADMIN_AUTH_KEY || e.key === ADMIN_AUTH_TIMESTAMP_KEY || e.key === null) {
        // Invalidate cache so the next getSnapshot() re-reads localStorage.
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
  // Only re-parse if the raw value changed — this keeps the returned
  // reference stable across calls when nothing has changed.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseState(raw);
  }
  return cachedState;
}

// SSR snapshot — no localStorage on the server, always return initial state.
function getServerSnapshot(): AdminAuthState {
  return INITIAL_STATE;
}

function writeAuthState(state: AdminAuthState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(state));
    window.localStorage.setItem(ADMIN_AUTH_TIMESTAMP_KEY, String(Date.now()));
    // Invalidate cache so the next getSnapshot() picks up the new value.
    cachedRaw = undefined;
    emitChange();
  } catch {
    // localStorage might be unavailable (private mode, etc.) — fail silently.
  }
}

/**
 * Validates mock admin credentials.
 * Returns the assigned role on success, or null on failure.
 *
 * When Laravel is integrated, this function becomes an async API call:
 *   POST /api/admin/login { email, password }
 *   → { token, user: { email, role } }
 */
export function validateAdminCredentials(email: string, password: string): AdminRole | null {
  if (
    email.trim().toLowerCase() === MOCK_ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === MOCK_ADMIN_CREDENTIALS.password
  ) {
    return "Super Admin";
  }
  return null;
}

/**
 * Hook that exposes admin auth state + login/logout actions.
 * State is persisted to localStorage so a page refresh keeps the
 * admin session (until logout or the user clears storage).
 */
export function useAdminAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // `hydrated` is true once we're on the client (i.e. the snapshot is
  // no longer the SSR initial state). useSyncExternalStore guarantees
  // a client render with the real snapshot after hydration.
  const hydrated = typeof window !== "undefined";

  const login = useCallback((email: string, password: string): boolean => {
    const role = validateAdminCredentials(email, password);
    if (!role) return false;
    writeAuthState({
      isAuthenticated: true,
      email: email.trim(),
      role,
      loginAt: Date.now(),
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      window.localStorage.removeItem(ADMIN_AUTH_TIMESTAMP_KEY);
      cachedRaw = undefined;
      emitChange();
    }
  }, []);

  return {
    ...state,
    hydrated,
    login,
    logout,
  };
}
