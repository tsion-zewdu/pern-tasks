# PERN Task Manager

A full-stack task manager built during the Codveda Technology Full-Stack Development internship. Users sign up, log in and manage their own tasks. Admins can also see every user's tasks and a list of all users.

## Tech stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL |
| Backend | Node.js, Express |
| Frontend | React (Vite) |
| Auth | bcryptjs (password hashing), JSON Web Tokens |

## Features

- REST API with full CRUD operations on tasks
- Signup and login with hashed passwords (bcrypt)
- JWT authentication, with tokens expiring after 1 day
- Role-based access: `user` and `admin`
- Users see and change only their own tasks. Admins see all tasks.
- Input validation and proper HTTP status codes (400, 401, 403, 404, 409, 500)
- Database relationship (`tasks.user_id` links to `users.id`) and an index on `tasks.user_id`
- Responsive React UI with loading and error states

## Project structure

```
pern-tasks/
  client/            React frontend
    src/
      components/    AuthForm, TaskForm, TaskItem, UsersPanel
      api.js         shared fetch helper that adds the token
      App.jsx
  server/            Express backend
    middleware/      auth.js (requireAuth, requireRole)
    routes/          auth.js (signup, login, me)
    db.js            PostgreSQL connection
    index.js         server and task routes
```

## Run it locally

### 1. Requirements
Node.js (LTS), PostgreSQL, Git.

### 2. Database
```sql
CREATE DATABASE tasksdb;
\c tasksdb

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

### 3. Backend
```bash
cd server
npm install
```
Create `server/.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/tasksdb
JWT_SECRET=a_long_random_string
```
Start it:
```bash
npm run dev
```

### 4. Frontend
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173

### 5. Make an admin
Signup always creates a normal user. To promote one:
```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```
Then log in again to get a new token.

## API endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/signup | Public | Create an account |
| POST | /api/auth/login | Public | Log in, returns a token |
| GET | /api/auth/me | Logged in | Current user |
| GET | /api/tasks | Logged in | Own tasks (admins: all tasks) |
| POST | /api/tasks | Logged in | Create a task |
| PUT | /api/tasks/:id | Owner or admin | Update a task |
| DELETE | /api/tasks/:id | Owner or admin | Delete a task |
| GET | /api/users | Admin only | List all users |

Protected routes need the header `Authorization: Bearer <token>`.

## Security notes

- Passwords are hashed with bcrypt and never stored in plain text.
- All database queries are parameterized, which prevents SQL injection.
- The role is set by the server and can never be chosen in the signup request.
- The token is stored in `localStorage` for simplicity. HTTP-only cookies would be safer against XSS attacks and would be the next improvement.

## Screenshots

## Internship progress

| Level | Tasks completed |
|---|---|
| Level 1 (Basic) | Task 1: development environment, Task 2: REST API |
| Level 2 (Intermediate) | Task 2: authentication and authorization, Task 3: database integration |
| Level 3 (Advanced) | TODO: Task 1 (full-stack app, deployment) |

## Live demo


## Author

Tsion Zewdu: [GitHub](https://github.com/tsion-zewdu)