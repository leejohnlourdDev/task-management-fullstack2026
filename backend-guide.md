# Express.js Backend Setup Guide for Task Management App

This guide shows how to connect your React task manager to a properly structured Express backend.
It uses a layered REST API architecture with route, controller, data, middleware, and utility separation.

---

## Architecture choice

### System architecture
- `Client-Server`: React frontend communicates with Express backend over HTTP.
- `RESTful API`: Backend exposes task CRUD endpoints.
- `Layered backend`: separates routes, controllers, data, middleware, and utilities.

This architecture makes validation, error handling, and future database integration easy.

---

## Folder structure

Create this backend structure at project root:

- `server/`
  - `index.ts`
  - `routes/`
    - `tasks.ts`
  - `controllers/`
    - `taskController.ts`
  - `data/`
    - `tasks.ts`
  - `middleware/`
    - `errorHandler.ts`
  - `utils/`
    - `apiError.ts`
  - `types/`
    - `task.ts`

Also add this frontend shared type file:

- `src/frontend/types/task.ts`

---

## CRUD API schema

| Route | Method | Request body | Success | Error |
|---|---|---|---|---|
| `/api/tasks` | GET | none | `200` list of tasks | `500` server error |
| `/api/tasks` | POST | `{ title, description }` | `201` created task | `400` validation error |
| `/api/tasks/:id` | PATCH | `{ title?, description?, completed? }` | `200` updated task | `400` validation or `404` not found |
| `/api/tasks/:id` | DELETE | none | `204` no content | `400` invalid id or `404` not found |

---

## Step 1: Install dependencies

Run in the project root:

```bash
npm install express cors
npm install -D typescript ts-node @types/node @types/express @types/cors
```

If `typescript` already exists, only install the dev dependencies.

---

## Step 2: Create the task model type

Create `server/types/task.ts`:

```ts
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}
```

Create `src/frontend/types/task.ts` with the same definition.

---

## Step 3: Create the in-memory data store

Create `server/data/tasks.ts`:

```ts
import type { Task } from "../types/task.js";

export let tasks: Task[] = [];
```

This stores tasks in memory for development.

---

## Step 4: Add error utilities

Create `server/utils/apiError.ts`:

```ts
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
```

---

## Step 5: Add centralized error middleware

Create `server/middleware/errorHandler.ts`:

```ts
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  console.error(err);
  res.status(500).json({ error: message });
};
```

This returns JSON error responses consistently.

---

## Step 6: Implement controller logic and validation

Create `server/controllers/taskController.ts`:

```ts
import type { Request, Response, NextFunction } from "express";
import type { Task } from "../types/task.js";
import { tasks } from "../data/tasks.js";
import { ApiError } from "../utils/apiError.js";

const validateTaskPayload = (body: unknown) => {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Request body must be a JSON object.");
  }

  const { title, description } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new ApiError(400, "Title is required and must be a non-empty string.");
  }

  if (typeof description !== "string") {
    throw new ApiError(400, "Description is required and must be a string.");
  }

  return {
    title: title.trim(),
    description: description.trim(),
  };
};

export const getAllTasks = (_req: Request, res: Response) => {
  res.json(tasks);
};

export const createTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = validateTaskPayload(req.body);

    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      completed: false,
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

export const updateTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new ApiError(400, "Task id must be a number.");
    }

    const existingTaskIndex = tasks.findIndex((task) => task.id === id);
    if (existingTaskIndex === -1) {
      throw new ApiError(404, "Task not found.");
    }

    const update = req.body as Record<string, unknown>;
    const updatedTask = { ...tasks[existingTaskIndex] };

    if (update.title !== undefined) {
      if (typeof update.title !== "string" || update.title.trim().length === 0) {
        throw new ApiError(400, "Title must be a non-empty string.");
      }
      updatedTask.title = update.title.trim();
    }

    if (update.description !== undefined) {
      if (typeof update.description !== "string") {
        throw new ApiError(400, "Description must be a string.");
      }
      updatedTask.description = update.description.trim();
    }

    if (update.completed !== undefined) {
      if (typeof update.completed !== "boolean") {
        throw new ApiError(400, "Completed must be a boolean.");
      }
      updatedTask.completed = update.completed;
    }

    tasks[existingTaskIndex] = updatedTask;
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new ApiError(400, "Task id must be a number.");
    }

    const existingTaskIndex = tasks.findIndex((task) => task.id === id);
    if (existingTaskIndex === -1) {
      throw new ApiError(404, "Task not found.");
    }

    tasks.splice(existingTaskIndex, 1);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
```

This controller handles payload validation, missing data, and invalid inputs.

---

## Step 7: Create route definitions

Create `server/routes/tasks.ts`:

```ts
import { Router } from "express";
import * as taskController from "../controllers/taskController.js";

const router = Router();

router.get("/", taskController.getAllTasks);
router.post("/", taskController.createTask);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
```

---

## Step 8: Create the Express app entry point

Create `server/index.ts`:

```ts
import express from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Task API running on http://localhost:${PORT}`);
});
```

---

## Step 9: Add the frontend API helper

Create `src/frontend/api/taskApi.ts`:

```ts
import type { Task } from "../types/task";

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
  const res = await fetch(API_BASE);
  return handleResponse<Task[]>(res);
};

export const createTask = async (task: Omit<Task, "id">): Promise<Task> => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(res);
};

export const updateTask = async (id: number, update: Partial<Task>): Promise<Task> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return handleResponse<Task>(res);
};

export const deleteTask = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message = errorBody?.error || res.statusText;
    throw new Error(message || "Delete request failed");
  }
};
```

---

## Step 10: Connect React to the backend

### HomePage task load

Update `src/frontend/pages/HomePage.tsx`:

```ts
import React, { useEffect } from "react";
import { getTasks } from "../api/taskApi";
```

Inside the component:

```ts
useEffect(() => {
  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  };

  fetchTasks();
}, [setTasks]);
```

### Task operations

Update `src/frontend/components/logic/TaskOperations.tsx` to use API functions for:
- creating tasks
- deleting tasks
- toggling completion
- updating title and description

This keeps the UI in sync with the server.

---

## Step 11: Add the backend run script

Update `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "server": "ts-node server/index.ts"
}
```

Then start the backend:

```bash
npm run server
```

---

## Step 12: Error handling and validation

The backend handles:
- invalid JSON request bodies
- missing or empty `title`
- missing or non-string `description`
- invalid `id` path parameters
- non-existent tasks
- invalid `completed` values

Errors are returned as JSON:

```json
{ "error": "Title must be a non-empty string." }
```

---

## Step 13: Notes on anonymous access

This backend does not require user login.
The `GET STARTED` button can still navigate directly to `/homepage`.

If authentication is added later, protect only the task routes that need it.

---

## Quick checklist

- [ ] install `express`, `cors`, and TypeScript tooling
- [ ] create `server/` and backend files
- [ ] add `src/frontend/types/task.ts`
- [ ] add `src/frontend/api/taskApi.ts`
- [ ] update `HomePage.tsx` to fetch tasks
- [ ] update `TaskOperations.tsx` to call backend APIs
- [ ] run backend with `npm run server`
