/**
 * Centralized API Client for CyberShield AI Frontend
 * Interacts with Laravel Sanctum API backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAuthToken(isAdmin = false): string | null {
  if (typeof window === "undefined") return null;
  const key = isAdmin ? "cybershield_admin_token" : "cybershield_user_token";
  return window.localStorage.getItem(key);
}

export function setAuthToken(token: string | null, isAdmin = false): void {
  if (typeof window === "undefined") return;
  const key = isAdmin ? "cybershield_admin_token" : "cybershield_user_token";
  if (token) {
    window.localStorage.setItem(key, token);
  } else {
    window.localStorage.removeItem(key);
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { isAdmin?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { isAdmin = false, headers: customHeaders, ...fetchOptions } = options;
  const token = getAuthToken(isAdmin);

  const isFormData = fetchOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const json = await response.json().catch(() => ({
      success: false,
      message: response.statusText || "Server error occurred.",
      data: null,
    }));

    if (!response.ok) {
      throw new ApiError(
        json.message || `Request failed with status ${response.status}`,
        response.status,
        json.errors || {}
      );
    }

    return json as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError((error as Error).message || "Network request failed.", 500);
  }
}
