import type { Task } from "../types/task";
import { getAuthHeaders } from "./token";

const API_BASE = "http://localhost:5000/api/tasks";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error || response.statusText;
    throw new Error(message || "API request failed");
  }
  return response.json();
};

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch(API_BASE, {
    headers: getAuthHeaders(),
  });
  return handleResponse<Task[]>(res);
};

export const createTask = async (task: Omit<Task, "id">): Promise<Task> => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(res);
};

export const updateTask = async (id: number, update: Partial<Task>): Promise<Task> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(update),
  });
  return handleResponse<Task>(res);
};

export const deleteTask = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message = errorBody?.error || res.statusText;
    throw new Error(message || "Delete request failed");
  }
};
