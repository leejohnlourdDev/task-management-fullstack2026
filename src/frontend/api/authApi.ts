import type { User } from "../types/user";

const API_BASE = "http://localhost:5000/api/auth";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error || response.statusText;
    throw new Error(message || "API request failed");
  }
  return response.json();
};

export const register = async (name: string, email: string, password: string): Promise<User & { token: string }> => {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse<User & { token: string }>(res);
};

export const login = async (email: string, password: string): Promise<User & { token: string }> => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<User & { token: string }>(res);
};

export const getProfile = async (token: string): Promise<User> => {
  const res = await fetch(`${API_BASE}/profile`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<User>(res);
};
