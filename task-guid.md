# Task Management Run Instructions

## Prerequisites

- Node.js installed
- Dependencies installed in project root:

```bash
npm install
```

## Run the backend

In the project root, start the Express backend:

```bash
npm run server
```

This launches the API on:

```text
http://localhost:5000
```

The task routes are available at:

- `GET /api/tasks`
- `GET /api/tasks?filter=active`
- `GET /api/tasks?filter=inactive`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Run the frontend

In a separate terminal from the backend, start the Vite frontend:

```bash
npm run dev
```

Then open the local frontend URL shown by Vite, typically:

```text
http://localhost:5173
```

## Notes

- Keep both the backend and frontend terminals running at the same time.
- The frontend is configured to call the backend API at `http://localhost:5000/api/tasks`.
- If you change the backend port, update the API base URL in `src/frontend/api/taskApi.ts`.

## Add a task with activity status

Use `POST http://localhost:5000/api/tasks` with raw JSON body and `Content-Type: application/json`.

Example body for a new inactive task:

```json
{
  "title": "New inactive task",
  "description": "Task created as inactive",
  "completed": false
}
```

Example body for a new active task:

```json
{
  "title": "New active task",
  "description": "Task created as active",
  "completed": true
}
```

- `completed: false` creates an inactive task.
- `completed: true` creates an active task.
- If `completed` is omitted, it defaults to `false`.

## Filter tasks in Postman

Use the filter query parameter to get active or inactive tasks:

- `GET http://localhost:5000/api/tasks?filter=active`
- `GET http://localhost:5000/api/tasks?filter=inactive`

This makes it easy to view task activity sessions by completion state.

## Verify with Postman

1. Make sure the backend is running:

```bash
npm run server
```

2. In Postman, create a new request using these URLs:

- `GET http://localhost:5000/api/tasks`
- `POST http://localhost:5000/api/tasks`
- `PATCH http://localhost:5000/api/tasks/{id}`
- `DELETE http://localhost:5000/api/tasks/{id}`

3. For `POST` and `PATCH`, set body type to `raw` and choose `JSON`.

Example `POST` body:

```json
{
  "title": "New task",
  "description": "Test the API"
}
```

Example `PATCH` body:

```json
{
  "completed": true
}
```

4. Expected responses:

- `GET` returns a JSON array of tasks
- `POST` returns the created task object
- `PATCH` returns the updated task object
- `DELETE` returns `204 No Content`

5. If you get errors:

- confirm backend is running on `http://localhost:5000`
- verify the URL and HTTP method
- add `Content-Type: application/json` for POST and PATCH
