import type { ApiError } from "../../types/api";

const STORAGE_TOKEN_KEY = "infra_watch_token";
const STORAGE_USER_KEY = "infra_watch_user";

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

export function clearAuthStorage(): void {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> {
  const { method = "GET", body, token = getStoredToken() } = options;
  const baseUrl = import.meta.env.VITE_API_URL ?? "";
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && method !== "GET" && method !== "DELETE") {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);

  if (response.status === 401) {
    clearAuthStorage();
    window.location.href = "/login";
    throw new ApiClientError("Unauthorized. Please sign in again.", 401);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      "Invalid server response. Please try again.",
      response.status
    );
  }

  if (!response.ok) {
    const err = json as ApiError;
    throw new ApiClientError(
      err.message ?? "Request error",
      response.status,
      err.errors
    );
  }

  return json as T;
}
