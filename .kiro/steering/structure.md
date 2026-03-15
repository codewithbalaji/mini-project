# Project Structure

## Monorepo Layout

```
/
├── backend/          # Node.js Express API
└── frontend/         # React TypeScript SPA
```

## Backend Structure (`/backend`)

```
backend/
├── config/           # Database connection configuration
├── constants/        # Shared constants (e.g., roles.js)
├── controllers/      # Request handlers for each domain
├── cron/            # Scheduled jobs (task email reminders)
├── mail/            # Email service and templates
│   └── templates/   # HTML email templates
├── middleware/      # Auth, role-based access, ownership checks
├── models/          # Mongoose schemas (User, Project, Task, etc.)
├── routes/          # Express route definitions
├── services/        # Business logic (notifications, stats)
├── utils/           # Helper functions (JWT generation)
├── app.js           # Express app setup and route mounting
└── server.js        # Entry point (DB connection, server start)
```

### Backend Conventions

- **ES Modules**: Use `import/export` syntax
- **Route Organization**: Routes grouped by domain (auth, projects, tasks, etc.)
- **Middleware Chain**: `authMiddleware` → `roleMiddleware` → `ownershipMiddleware`
- **Multi-tenancy**: All queries must filter by `organizationId`
- **Model Indexes**: Critical fields indexed for performance (organizationId, status, assignedTo)

## Frontend Structure (`/frontend`)

```
frontend/src/
├── assets/          # Static assets (images, icons)
├── components/
│   ├── layout/      # DashboardLayout, AuthLayout
│   ├── shared/      # Reusable components (ProtectedRoute, RoleGuard, badges)
│   └── ui/          # shadcn/ui primitives (button, card, dialog, etc.)
├── hooks/           # Custom React hooks (useAuth, useTasks, useProjects)
├── lib/             # Utility functions (cn for className merging)
├── pages/           # Page components organized by feature
│   ├── auth/        # Login, Register, VerifyEmail, etc.
│   ├── dashboard/   # Dashboard and Analytics pages
│   ├── projects/    # Project CRUD pages
│   ├── tasks/       # Task pages (MyTasks, TaskDetail)
│   └── [feature]/   # Other feature pages
├── router/          # React Router configuration
├── App.tsx          # Empty (routing handled by RouterProvider)
├── main.tsx         # App entry point (QueryClient, Router setup)
└── index.css        # Global Tailwind styles
```

### Frontend Conventions

- **Path Aliases**: Use `@/` for imports from `src/`
- **Component Naming**: PascalCase with descriptive suffixes (Page, Layout, Dialog)
- **Page Structure**: Each feature has its own folder under `pages/`
- **Route Protection**: `ProtectedRoute` wrapper + `RoleGuard` for role-specific pages
- **State Management**: 
  - Server state: React Query hooks
  - Global state: Zustand stores
  - Form state: React Hook Form
- **Styling**: Tailwind utility classes + `cn()` helper for conditional classes

## Key Models

- **User**: Authentication, roles, organization/department membership
- **Organization**: Multi-tenant root entity
- **Department**: Organizational units within an organization
- **Project**: Work containers with status, priority, budget, members
- **Task**: Work items assigned to users with time tracking
- **TaskUpdate**: Progress logs with hours worked
- **Comment**: Discussion threads on tasks
- **Notification**: In-app notifications for users
- **Invitation**: Email-based user onboarding

## API Route Patterns

```
/api/auth/*           # Authentication endpoints
/api/users/*          # User management
/api/organizations/*  # Organization settings
/api/departments/*    # Department CRUD
/api/projects/*       # Project management
/api/tasks/*          # Task operations
/api/notifications/*  # Notification feed
/api/dashboard/*      # Analytics and stats
```

## Authentication Flow

1. User registers → Email OTP sent
2. User verifies email → Account activated
3. User logs in → JWT token issued
4. Token stored in frontend state (Zustand)
5. Token sent in `Authorization: Bearer <token>` header
6. Backend middleware validates token and attaches user to `req.user`
