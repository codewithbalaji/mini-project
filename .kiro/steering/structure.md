# Project Structure

## Monorepo Layout

The project uses a monorepo structure with separate frontend and backend directories at the root level.

```
/
├── backend/          # Node.js/Express API server
├── frontend/         # React/TypeScript client
└── .kiro/           # Kiro configuration and steering
```

## Backend Structure

```
backend/
├── config/          # Database and configuration setup
├── constants/       # Shared constants (roles, enums)
├── controllers/     # Request handlers for each domain
├── cron/           # Scheduled jobs (email reminders, alerts)
├── mail/           # Email service and templates
│   └── templates/  # HTML email templates
├── middleware/     # Auth, role-based access, ownership checks
├── models/         # Mongoose schemas
├── routes/         # Express route definitions
├── services/       # Business logic layer (AI, notifications, stats)
├── utils/          # Helper functions (token generation, etc.)
├── app.js          # Express app configuration
├── server.js       # Server entry point
└── seed.js         # Database seeding script
```

### Backend Conventions

- **Models**: Mongoose schemas with multi-tenant `organizationId` field for data isolation
- **Controllers**: Handle HTTP requests, call services, return responses
- **Services**: Contain business logic, reusable across controllers
- **Routes**: Organized by domain (auth, users, projects, tasks, etc.)
- **Middleware**: `authMiddleware` for JWT validation, `roleMiddleware` for RBAC, `ownershipMiddleware` for resource access control

### Key Backend Files

- `app.js`: Express app setup with CORS and route mounting
- `server.js`: Server initialization, DB connection, cron job setup
- `config/db.js`: MongoDB connection configuration
- `constants/roles.js`: Role definitions (ADMIN, MANAGER, EMPLOYEE, VIEWER)

## Frontend Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, icons
│   ├── components/     # React components
│   │   ├── ai/        # AI-related components (copilot modal)
│   │   ├── layout/    # Layout components (header, sidebar)
│   │   ├── shared/    # Reusable components (badges, avatars, guards)
│   │   └── ui/        # shadcn/ui components (button, dialog, form, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components organized by feature
│   │   ├── auth/      # Login, register, password reset
│   │   ├── dashboard/ # Analytics and overview pages
│   │   ├── departments/
│   │   ├── invitations/
│   │   ├── notifications/
│   │   ├── organization/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── users/
│   ├── router/        # React Router configuration
│   ├── services/      # API client functions (one per domain)
│   ├── store/         # Zustand state management stores
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Empty (routing handled by router/index.tsx)
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles and Tailwind imports
└── components.json     # shadcn/ui configuration
```

### Frontend Conventions

- **Pages**: Feature-based organization, each page is a route component
- **Components**: 
  - `ui/` for primitive shadcn/ui components
  - `shared/` for reusable business components
  - `layout/` for structural components
  - Feature-specific components in `pages/{feature}/components/`
- **Services**: API client functions using axios, organized by domain
- **Stores**: Zustand stores for global state (auth, notifications, projects, tasks)
- **Types**: TypeScript interfaces matching backend models
- **Hooks**: Custom hooks for auth, permissions, data fetching
- **Router**: Centralized routing in `router/index.tsx`, bootstrapped in `main.tsx`

### Key Frontend Files

- `main.tsx`: App initialization with QueryClient and RouterProvider
- `router/index.tsx`: Route definitions and protected routes
- `services/api.ts`: Axios instance with interceptors for auth tokens
- `store/authStore.ts`: Authentication state and user session
- `hooks/useAuth.ts`: Authentication helpers
- `hooks/usePermissions.ts`: Role-based permission checks

## Multi-Tenant Architecture

All backend models include `organizationId` field with index for data isolation:

```javascript
organizationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Organization",
  index: true
}
```

Middleware ensures users can only access data within their organization.

## API Structure

RESTful API with domain-based routing:

- `/api/auth` - Authentication (login, register, verify, reset password)
- `/api/users` - User management
- `/api/organization` - Organization settings
- `/api/departments` - Department management
- `/api/invitations` - User invitation system
- `/api/projects` - Project CRUD
- `/api/tasks` - Task management
- `/api/task-updates` - Task update submissions
- `/api/comments` - Task comments
- `/api/notifications` - User notifications
- `/api/dashboard` - Analytics and statistics
- `/api/ai` - AI processing endpoints

## State Management Pattern

Frontend uses layered state management:

1. **Server State**: TanStack Query for API data caching
2. **Global State**: Zustand for auth, notifications, UI state
3. **Local State**: React hooks for component-specific state
4. **Form State**: React Hook Form for form management
