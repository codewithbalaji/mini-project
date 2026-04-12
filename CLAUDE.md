# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role & Approach

Operate as a **Full Stack MERN + AI Integration Expert and Project Lead**. Decisions should reflect production-grade thinking: data isolation, RBAC enforcement, AI reliability, and maintainability across the full stack.

---

## Development Commands

### Starting the App
Run both servers simultaneously (Windows):
```
start-dev.bat
```

Or manually in separate terminals:
```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

### Backend
```bash
cd backend
npm run dev        # nodemon auto-reload
npm start          # production
npm run seed       # seed MongoDB with sample data
```

### Frontend
```bash
cd frontend
npm run dev        # Vite dev server
npm run build      # tsc + vite build
npm run lint       # ESLint
npm run preview    # preview production build
```

---

## Environment Variables

**Backend** (`/backend/.env`):
| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `OPENROUTER_API_KEY` | OpenRouter AI — model: `arcee-ai/trinity-large-preview` |
| `GEMINI_API_KEY` | Google Gemini flash-latest — used for reliable JSON responses |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS — model: `turbo_v2_5` |
| `SMTP_*` | Brevo SMTP credentials for transactional email |

**Frontend** (`/frontend/.env`):
- `VITE_API_URL=http://localhost:5000/api`

---

## Architecture Overview

**AI-powered multi-tenant SaaS project management platform.** All backend data is scoped by `organizationId` — every Mongoose model carries this field with an index for isolation. Middleware enforces users can never cross tenant boundaries.

### User Roles & Capabilities
| Role | Capabilities |
|---|---|
| **Admin** | Org owner — manages settings, users, departments, invitations |
| **Manager** | Creates projects, assigns tasks, monitors team analytics |
| **Employee** | Submits task updates via voice or text |
| **Viewer** | Read-only access to analytics/dashboards |

---

## Backend Architecture (`/backend`)

**Runtime**: Node.js ES modules (`"type": "module"`) — always use `.js` extensions on imports.

### Layer Responsibilities
- **`server.js`** — entry point: MongoDB connection, cron job bootstrap, server start
- **`app.js`** — Express v5 setup: CORS, middleware mounting, route registration
- **`routes/`** — domain-based routing; organized by phase (auth/org/users/dept/invitations → projects/tasks/task-updates/comments/notifications/dashboard/AI)
- **`controllers/`** — HTTP request handlers only; delegate to services
- **`services/`** — all business logic; reusable across controllers
  - `ai.service.js` — OpenRouter + Gemini orchestration
  - `voice.service.js` — ElevenLabs integration
  - `notificationService.js` — in-app + email notification dispatch
  - `statsService.js` — dashboard analytics aggregations
- **`middleware/`** — `authMiddleware` (JWT validation), `roleMiddleware` (RBAC), `ownershipMiddleware` (resource access)
- **`models/`** — Mongoose schemas; all include `organizationId: { type: ObjectId, ref: "Organization", index: true }`
- **`cron/taskEmails.js`** — `node-cron` scheduled jobs: deadline reminders, overdue alerts, daily summaries
- **`mail/templates/`** — HTML email templates (8 scenarios: invite, task assigned, overdue, status changed, etc.)
- **`constants/roles.js`** — single source of truth for role definitions

### API Routes
```
/api/auth           — login, register, verify email, reset password
/api/users          — user management (Admin)
/api/organization   — org settings
/api/departments    — department management
/api/invitations    — invite users to org
/api/projects       — project CRUD
/api/tasks          — task CRUD + assignment
/api/task-updates   — employee progress submissions
/api/comments       — task comments
/api/notifications  — per-user notification feed
/api/dashboard      — analytics and statistics
/api/ai             — AI processing endpoints (see below)
```

---

## Frontend Architecture (`/frontend/src`)

**Framework**: React 19 + TypeScript (strict mode) + Vite 7. Path alias `@/` → `src/`.

### State Management (layered)
1. **Server state** — TanStack Query v5 for API caching, stale-while-revalidate
2. **Global state** — Zustand v5 stores with `persist` middleware (localStorage): `authStore`, `taskStore`, `projectStore`, `dashboardStore`, `notificationStore`
3. **Form state** — React Hook Form + Zod v4 for validation
4. **Local state** — `useState`/`useReducer` for component-scoped state

### Key Files
| File | Role |
|---|---|
| `main.tsx` | App bootstrap: `QueryClient` + `RouterProvider` |
| `router/index.tsx` | All route definitions; wraps routes in `ProtectedRoute` + `RoleGuard` |
| `services/api.ts` | Axios instance with JWT interceptors |
| `store/authStore.ts` | Auth state and user session |
| `hooks/usePermissions.ts` | Role-based permission checks used in UI guards |

### Component Conventions
- `components/ui/` — shadcn/ui primitives (Radix UI + Tailwind CSS v4); do not add business logic here
- `components/shared/` — reusable business components (`ProtectedRoute`, `RoleGuard`, badges, avatars)
- `components/layout/` — `DashboardLayout`, `AuthLayout`, `Sidebar`, `Topbar`
- `components/ai/` — `AICopilotModal`: voice/text → backend AI → TTS playback
- Feature-specific sub-components live in `pages/{feature}/components/`

---

## AI Integration Pattern

```
Frontend (voice/text input)
    ↓
POST /api/ai/task-detail-assistant   ← for per-task context
POST /api/ai/my-tasks-assistant      ← for user's full task list Q&A
    ↓
Backend ai.service.js
    ├── Gemini flash-latest           ← primary: reliable structured JSON parsing
    └── OpenRouter (arcee-ai)         ← fallback / alternative
    ↓
POST /api/ai/text-to-speech          ← proxies to ElevenLabs turbo_v2_5
    ↓
POST /api/ai/task-insights           ← save AI recommendations to DB
GET  /api/ai/task-insights/:taskId   ← retrieve saved insights
```

**Rule**: Always use Gemini when the response must be parsed as JSON. OpenRouter free tier is unreliable for structured output.

---

## Key Data Models

| Model | Key Fields |
|---|---|
| `Organization` | Top-level tenant; all other models reference it |
| `User` | `organizationId`, `role` (from `constants/roles.js`), `departmentId` |
| `Project` | `organizationId`, `managerId`, status, dates |
| `Task` | `projectId`, `organizationId`, `assignedTo`, status, priority, progress % |
| `TaskUpdate` | `taskId`, `submittedBy`, raw text/voice input, AI-extracted structured data |
| `Department` | `organizationId`, users belong via `User.departmentId` |
| `Notification` | Per-user, `organizationId`, read/unread state |
| `Invitation` | Pending email invites; token-based acceptance flow |
