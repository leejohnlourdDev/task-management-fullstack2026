# Task Management App

## Project Version
- Package version: `0.0.0`
- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript + MySQL (optional SQLite fallback)
- Node scripts: `npm run dev` and `npm run server`

## Full Stack Overview
This is a full-stack task management application with:
- user authentication (register/login)
- JWT-based session management
- user-specific task storage
- MySQL persistence (recommended for production)
- a demo/local mode for UI-only testing without MySQL
- personalized profile and dashboard views

The app is split into two main layers:

1. **Backend**
   - `server/index.ts`: main Express entry point
   - `server/routes/auth.ts`: auth routes for register, login, and profile
   - `server/routes/tasks.ts`: protected task routes
   - `server/controllers/authController.ts`: handles registration, login, and profile lookup
   - `server/controllers/taskController.ts`: handles create, read, update, delete for user-specific tasks
   - `server/middleware/authMiddleware.ts`: JWT token authentication middleware
   - `server/db.ts`: MySQL connection pool using `mysql2/promise`
   - `server/db/schema.sql`: database schema for `users` and `tasks`

2. **Frontend**
   - `src/App.tsx`: routing with React Router
   - `src/frontend/pages/AuthPage.tsx`: login/signup form and token saving
   - `src/frontend/pages/HomePage.tsx`: task list page with active/inactive filter and task modal
   - `src/frontend/pages/ProfilePage.tsx`: user profile page loaded from backend
   - `src/frontend/pages/Dashboard.tsx`: dashboard page with task status histogram and task statistics
   - `src/frontend/api/authApi.ts`: auth API helpers for login/register/profile
   - `src/frontend/api/taskApi.ts`: protected task API helpers
   - `src/frontend/api/token.ts`: localStorage token helpers

## Technologies and Versions
- `react`: `^19.2.7`
- `react-dom`: `^19.2.7`
- `react-router-dom`: `^7.18.0`
- `vite`: `^8.1.0`
- `typescript`: `~6.0.2`
- `express`: `^5.2.1`
- `mysql2`: `^3.6.0`
- `jsonwebtoken`: `^9.0.2`
- `bcrypt`: `^5.1.0`
- `dotenv`: `^16.3.1`
- `recharts`: `^3.9.0`

## Database Schema
The MySQL schema is located at `server/db/schema.sql`.

### Users table
- `id`: auto-increment user ID
- `name`: user name
- `email`: unique login email
- `password_hash`: hashed password
- `created_at`: registration timestamp

### Tasks table
- `id`: auto-increment task ID
- `user_id`: foreign key to users
- `title`: task title
- `description`: task description
- `completed`: boolean status stored as `TINYINT(1)`
- `created_at`: created timestamp
- `updated_at`: updated timestamp
- `user_id` is enforced with `ON DELETE CASCADE`

## Important Details
### How backend works
- `POST /api/auth/register`: registers a new user, hashes password, returns JWT token
- `POST /api/auth/login`: verifies credentials, returns JWT token
- `GET /api/auth/profile`: returns current user profile after JWT verification
- `GET /api/tasks`: returns all tasks for authenticated user
- `POST /api/tasks`: creates a new task for authenticated user
- `PATCH /api/tasks/:id`: updates a task only if it belongs to authenticated user
- `DELETE /api/tasks/:id`: deletes a task only if it belongs to authenticated user

### How frontend works
- Login and signup are handled in `src/frontend/pages/AuthPage.tsx`
- On successful auth, JWT is saved to `localStorage` under the key `task_manager_token`
- The full current user object is stored under `task_manager_user` (JSON)
- A one-time welcome flag is stored as `task_manager_welcome` to show post-login messages
- Task API calls include `Authorization: Bearer <token>` headers provided by `src/frontend/api/token.ts`
- `HomePage` chooses between demo/local handlers and API-backed handlers using an `ops` abstraction
- Demo (unauthenticated) mode uses a local in-memory handler so UI work can proceed without a DB
- Logout clears `task_manager_token` and `task_manager_user` and redirects to login

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root with these values (example):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your-db-password
   DB_NAME=task_management
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```
   - If you do not want to configure MySQL locally, the frontend supports a demo/local mode (no DB required) for UI work.
3. Create the database and schema in MySQL using `server/db/schema.sql`.
   - Option 1: run the SQL file in a MySQL client or `mysql` CLI
   - Option 2: use a GUI tool like MySQL Workbench

Troubleshooting DB access
- If you see errors like `Access denied for user 'root'@'localhost' (using password: YES)`, verify the `.env` credentials and that the MySQL user has privileges for the specified `DB_NAME`.
- Quick commands (Windows PowerShell) to apply schema:
```powershell
# create database (if not exists) and apply schema
mysql -u your_user -p -e "CREATE DATABASE IF NOT EXISTS task_management;"
mysql -u your_user -p task_management < server/db/schema.sql
```
Or use `Invoke-RestMethod` or Postman to call the API when testing auth endpoints (PowerShell `curl` differs):
```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' -Method POST -ContentType 'application/json' -Body '{"name":"Test","email":"t@test.com","password":"pass"}'
```

## Running the App
### Start the backend server
```bash
npm run server
```
- Runs `ts-node server/index.ts`
- Backend listens on `http://localhost:5000` (by default)

### Start the frontend app
```bash
npm run dev
```
- Runs Vite development server
- Frontend typically listens on `http://localhost:5176` (check terminal output)

## Useful Scripts
- `npm run dev`: start frontend dev server
- `npm run build`: compile TypeScript and build production frontend
- `npm run preview`: preview built frontend
- `npm run server`: start the backend API server

## Completion Report
This project is a personalized, full-stack task manager with:
- separate backend and frontend layers
- optional persistent MySQL storage (recommended for multi-user persistence)
- user authentication using JWT
- task operations bound to the authenticated user
- profile and dashboard screens for user-specific data
- protected task routes and identity enforcement

### What is fully complete
- Frontend login/signup flows and local token/user storage
- Demo/local mode for UI development without a DB
- Token persistence and protected API call wiring
- User profile fetch and display (requires backend)
- Task CRUD operations for authenticated users (requires DB)

### What is functionally included
- Personalized task listing by user
- Dashboard task status overview
- Logout behavior clearing auth token
- Filtered active/inactive task views
- MySQL database persistence

### Notes for contributors
- Main localStorage keys: `task_manager_token`, `task_manager_user`, `task_manager_welcome`
- UI behavior: "Get Started" (public/demo) is intentionally not wired to a personalized account; only `Login`/`Sign Up` use the backend authentication.
- The Add-task button is placed for both empty demo state and logged-in header placement; `ops.handleAddTask` abstracts demo vs API-backed creation.
- If you want a DB-less development experience, I can add a small SQLite fallback or seed script—ask and I will implement it.

## How to Test Personalization
1. Register as a new user
2. Create tasks in the HomePage
3. Log out
4. Register or login as another user
5. Confirm the new user sees only their own tasks

If desired, I can also add a short Postman collection or sample request list for the API next.