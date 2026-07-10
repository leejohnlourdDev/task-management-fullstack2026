const TOKEN_KEY = "task_manager_token";

export const saveAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No auth token found.");
  }
  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
};
