# Team Task Management System

A MERN-stack team task management system.

## Stack

### Frontend
- React
- React Router
- Axios
- Socket.io Client
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Socket.io
- bcryptjs

## Features

- Register/login with JWT
- Protected routes
- Role-based authorization
- Admin, Manager and Employee roles
- Workspace creation, editing and archiving
- Task creation, assignment and tracking
- Task flow enforcement:
  `Todo → In Progress → Review → Done`
- Employees limited to 8 active tasks
- Deleted users' tasks become unassigned
- Workspaces with active sprints cannot be deleted
- Activity logging
- Dashboard statistics
- Real-time task events with Socket.io
- Centralized API error handling

## Architecture

The backend follows a controller/service/model/route structure.

```text
Request
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service / Model
  ↓
MongoDB
```

The frontend is separated into pages, reusable components, API client, authentication context and socket hooks.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Adwaitha0/team-task-management.git
cd team-task-management
```

### 2. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the values.

Start MongoDB, then:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

### 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`.

Then:

```bash
npm run dev
```

Frontend runs at the Vite development URL, normally:

```text
http://localhost:5173
```

## Seed data

From `backend`:

```bash
npm run seed
```

Demo credentials:

```text
Admin
admin@example.com
Password@123

Manager
manager@example.com
Password@123

Employee
employee@example.com
Password@123
```

## Main API endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Users

```text
GET    /api/users
POST   /api/users
DELETE /api/users/:id
```

### Workspaces

```text
GET    /api/workspaces
GET    /api/workspaces/:id
POST   /api/workspaces
PATCH  /api/workspaces/:id
PATCH  /api/workspaces/:id/archive
DELETE /api/workspaces/:id
```

### Sprints

```text
GET    /api/sprints/workspace/:workspaceId
POST   /api/sprints
PATCH  /api/sprints/:id
DELETE /api/sprints/:id
```

### Tasks

```text
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Filters:

```text
GET /api/tasks?workspace=<id>
GET /api/tasks?status=Review
GET /api/tasks?priority=High
GET /api/tasks?assignedTo=<id>
GET /api/tasks?sprint=<id>
```

### Activity

```text
GET /api/activities
```

### Dashboard

```text
GET /api/dashboard
```

## Business rules

### Task workflow

The backend only permits:

```text
Todo → In Progress
In Progress → Review
Review → Done
```

Skipping a stage returns `400 Bad Request`.

### Employee task limit

An employee can have a maximum of 8 active tasks. `Done` tasks are not counted as active.

### Workspace deletion

A workspace with an `active` sprint cannot be deleted.

### Deleted users

When an admin deletes a user, all tasks assigned to that user are changed to `assignedTo: null`.

### Activity log

Important modifications create an activity record.

## Socket.io events

The backend emits:

```text
taskCreated
taskUpdated
taskDeleted
```

The frontend listens for these events and refreshes the task board.

## Environment variables

### Backend

```text
PORT
MONGO_URI
JWT_SECRET
CLIENT_URL
```

### Frontend

```text
VITE_API_URL
VITE_SOCKET_URL
```
