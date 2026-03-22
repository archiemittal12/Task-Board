# Task-Board (Jira-inspired Project Management App)

A project management and issue-tracking application inspired by Jira. It enables teams to plan, track, and manage work using boards, issues, workflows, and more.

## Repository
GitHub: https://github.com/archiemittal12/Task-Board

---

## Tech Stack

### Frontend (React + TypeScript + Vite)
- **React**: UI library for component-based development.
- **TypeScript**: static typing for safer refactors and better DX.
- **Vite**: fast dev server + production build tooling.
- **React Router**: client-side routing.
- **lucide-react**: icon set.
- **clsx**: conditional className builder.
- **ESLint + Prettier**: code style enforcement.

Frontend scripts (from `frontend/package.json`):
- `npm run dev` → dev server
- `npm run build` → compile TypeScript + bundle with Vite
- `npm run preview` → preview production build locally
- `npm run format` → auto-format all source files with Prettier
- `npm run lint` → run ESLint
- `npm run lint:fix` → auto-fix ESLint issues

### Backend (Node.js + Express)
- **Express**: REST API server.
- **cors**: enables cross-origin requests from frontend (configured for `http://localhost:5173`).
- **cookie-parser**: reads cookies (used for refresh token flow).
- **dotenv**: environment variables from `.env`.
- **multer**: file upload handling for avatars.

### Auth & Security
- **JWT access tokens** (short-lived, `15m`) for API authorization (`Authorization: Bearer <token>`).
- **JWT refresh tokens** (longer-lived, `7d`) stored as httpOnly cookie and in DB (`RefreshToken` table) so tokens can be invalidated on logout.
- **bcrypt**: password hashing.

### Database & ORM
- **PostgreSQL** as DB.
- **Prisma ORM**: schema in `backend/prisma/schema.prisma`, client in `backend/config/db.js`.

---

## Project Structure

```
Task-Board/
  README.md
  backend/
    index.js
    package.json
    prisma/schema.prisma
    config/db.js
    middleware/
      auth.middleware.js
      adminMiddleware.js
      upload.middleware.js
    routes/
      auth.routes.js
      user.routes.js
      project.routes.js
      board.routes.js
      column.routes.js
      task.routes.js
      story.routes.js
      comment.routes.js
      transition.routes.js
      member.routes.js
      notification.routes.js
    services/
      auth.service.js
      project.service.js
      board.service.js
      column.service.js
      task.service.js
      comment.service.js
      transition.service.js
      member.service.js
      notification.service.js
    utils/
      generateToken.js
      projectAuth.js
    uploads/
      avatars/
  frontend/
    package.json
    vite.config.ts
    eslint.config.js
    .prettierrc
    src/
      api/client.ts
      context/AuthContext.tsx
      layouts/
      pages/
        admin/AdminPage.tsx
        auth/
        boards/
          BoardPage.tsx
          components/
            Column.tsx
            TaskCard.tsx
            TaskModal.tsx
            StoryCard.tsx
            CreateTaskModal.tsx
            CreateStoryModal.tsx
            EditStoryModal.tsx
            AddColumnModal.tsx
            RenameColumnModal.tsx
            WorkflowModal.tsx
            ActivityPanel.tsx
        dashboard/DashboardPage.tsx
        notifications/NotificationsPage.tsx
        projects/
          ProjectsPage.tsx
          ProjectDetailPage.tsx
          tabs/
            SummaryTab.tsx
            BoardsTab.tsx
            MembersTab.tsx
      routes/AppRoutes.tsx
```

---

## Prerequisites

- Node.js (recommended: latest LTS)
- npm
- PostgreSQL (local or hosted)

---

## Environment Variables

Create a `backend/.env` file:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/task_board?schema=public"
JWT_SECRET="replace_with_strong_secret"
REFRESH_TOKEN_SECRET="replace_with_strong_secret_2"
NODE_ENV="development"
```

---

## Database Setup (Prisma)

From the `backend/` directory:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

To inspect the DB:
```bash
npx prisma studio
```

---

## Install & Run (Development)

### 1) Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend starts on: `http://localhost:3000`

### 2) Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on: `http://localhost:5173`

---

## Global Admin

The **first user to register** is automatically assigned the `ADMIN` global role. All subsequent users receive the `USER` global role by default.

Global Admins can:
- Access the `/admin` panel (visible only in the sidebar for global admins)
- View all users across the platform
- Promote any user to Global Admin or demote them back to User
- View all projects across the platform
- Create projects (only Global Admins can create projects)

To manually set a Global Admin (e.g. for existing users before this feature was added):
1. Open Prisma Studio: `npx prisma studio`
2. Find the user in the `User` table
3. Set `globalRole` to `ADMIN`
4. Log out and log back in

---

## Authentication Model

Most protected endpoints require:

```
Authorization: Bearer <access_token>
```

Refresh token workflow:
- `POST /auth/login` sets a `refreshToken` cookie (httpOnly).
- `POST /auth/refresh` uses the cookie to return a new access token.
- `POST /auth/logout` deletes refresh token record(s) from DB and clears the cookie.

---

## REST API Documentation

Base URL: `http://localhost:3000`

### Auth (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user. First user becomes Global Admin. |
| POST | `/auth/login` | Login, returns access token + sets refresh cookie. |
| POST | `/auth/refresh` | Get new access token using refresh cookie. |
| POST | `/auth/logout` | Invalidate refresh token and clear cookie. |

### Users (`/users`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile. |
| PATCH | `/users/avatar` | Upload/update avatar (multipart/form-data, field: `avatar`). |
| GET | `/users/all` | Get all users — Global Admin only. |
| PATCH | `/users/:userId/role` | Change a user's global role — Global Admin only. |

### Projects (`/projects`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects` | Create project — Global Admin only. Creator becomes Project Admin. |
| GET | `/projects` | List projects the user belongs to. |
| GET | `/projects/all` | List ALL projects — Global Admin only. |
| GET | `/projects/:id` | Get project details (requires membership). |
| PUT | `/projects/:id` | Update name/description/isArchived. |
| DELETE | `/projects/:id` | Delete project and all related data. |

### Members (`/projects/:projectId/members`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/members` | List members. |
| POST | `/projects/:projectId/members` | Add member by username. Body: `{ username, role }` |
| PUT | `/projects/:projectId/members/:userId` | Update member role. |
| DELETE | `/projects/:projectId/members/:userId` | Remove member. |

### Boards (`/projects/:projectId/boards`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/:projectId/boards` | Create board (Project Admin only). |
| GET | `/projects/:projectId/boards` | List boards. |
| PUT | `/projects/:projectId/boards/:boardId` | Update board name. |
| DELETE | `/projects/:projectId/boards/:boardId` | Delete board (blocked if tasks exist). |

### Columns (`/projects/:projectId/boards/:boardId/columns`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `…/columns` | Create column. Body: `{ name, status, wipLimit?, beforeColumnId?, afterColumnId? }` |
| GET | `…/columns` | List columns with nested tasks (ordered by position). |
| PUT | `…/columns/:columnId` | Update name/status/wipLimit/position. |
| DELETE | `…/columns/:columnId` | Delete column (blocked if tasks exist). |

### Transitions (`/projects/:projectId/boards/:boardId/transitions`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `…/transitions` | List transition rules for a board. |
| POST | `…/transitions` | Add a transition rule. Body: `{ fromColumnId, toColumnId }` |
| DELETE | `…/transitions` | Remove a rule. Body: `{ fromColumnId, toColumnId }` |

### Stories (`/projects/:projectId/stories`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `…/stories` | Create story. Body: `{ title, description?, priority, dueDate? }` |
| GET | `…/stories` | List stories for project. |
| PUT | `…/stories/:storyId` | Update story. |
| DELETE | `…/stories/:storyId` | Delete story and all child tasks. |

### Tasks (`/projects/:projectId/boards/:boardId/columns/:columnId/tasks`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `…/tasks` | Create task/bug. Body: `{ type, title, description?, priority, dueDate?, assigneeId?, parentId }` |
| GET | `…/tasks/:taskId` | Get task with assignee, reporter, comments. |
| PUT | `…/tasks/:taskId` | Update task fields (assignee or admin only). |
| PATCH | `…/tasks/:taskId/move` | Move task between columns. Enforces WIP + transitions. |
| DELETE | `…/tasks/:taskId` | Delete task (admin only). |
| GET | `…/tasks/:taskId/activity` | Activity timeline (comments + audit logs merged). |

### Comments (`…/tasks/:taskId/comments`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `…/comments` | Create comment. Supports `@username` mentions. |
| PUT | `…/comments/:commentId` | Edit own comment. |
| DELETE | `…/comments/:commentId` | Delete own comment (or admin can delete any). |

### Notifications (`/notifications`) — protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get notifications. Use `?all=true` for full history. Returns `unreadCount`. |
| PATCH | `/notifications/read-all` | Mark all as read. |
| PATCH | `/notifications/:id/read` | Mark one as read. |

---

## Notification Triggers

| Event | Who Gets Notified |
|-------|-------------------|
| Task assigned | New assignee |
| Task unassigned | Old assignee |
| Task status changed (moved) | Assignee + Reporter |
| Comment added | Assignee + Reporter |
| @username mention in comment | Mentioned user |

---

## Role-Based Access Control Summary

| Action | Required Role |
|--------|---------------|
| Register / Login | Anyone |
| Create project | Global Admin only |
| View project | Project Member (any role) |
| Create/edit tasks | Project Member or Admin |
| Edit task fields | Task Assignee or Project Admin |
| Edit story | Project Admin only |
| Delete task/story | Project Admin only |
| Manage board columns/workflow | Project Admin only |
| Manage project members | Project Admin or Global Admin |
| View/manage all users | Global Admin only |
| View all projects | Global Admin only |
| Promote/demote Global Admin | Global Admin only |

---

## Code Quality

- TypeScript strict mode enabled (`strict: true` in `tsconfig.json`)
- ESLint v9 flat config (`eslint.config.js`)
- Prettier for consistent formatting (`.prettierrc`)
- Run `npm run format && npm run lint:fix` in `frontend/` to enforce style

---

## Notes / Known Constraints

- CORS is hard-coded to `http://localhost:5173`. Update for deployment.
- Ensure `backend/uploads/avatars/` directory exists before running.
- Refresh token cookie is `sameSite: 'strict'`; cross-site deployments need adjustments.
- The first registered user automatically becomes Global Admin.
