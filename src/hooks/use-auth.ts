"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest, setAuthToken, getAuthToken, ApiError } from "@/lib/api-client";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    const token = getAuthToken(false);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiRequest<{ user: User }>("/auth/me");
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setAuthToken(null, false);
        setUser(null);
      }
    } catch {
      setAuthToken(null, false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await apiRequest<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token, false);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login failed. Please check your network connection.");
      }
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await apiRequest<{ user: User; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token, false);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Registration failed.");
      }
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout request errors
    } finally {
      setAuthToken(null, false);
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    register,
    logout,
    refreshUser: fetchUser,
  };
}
