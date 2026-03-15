# Phase 2 — Core Project Management (No AI)

## Background

Phase 1 delivered the full Auth + Organization foundation:
- **Models**: `User`, `Organization`, `Department`, `Invitation`
- **RBAC roles**: `ADMIN`, `MANAGER`, `EMPLOYEE`, `VIEWER`
- **Middleware**: [authMiddleware](file:///d:/projects/mini-project/backend/middleware/authMiddleware.js#3-20) (JWT) + `roleMiddleware` (role guard)
- **Frontend**: Vite + React + TypeScript with Zustand store, service layer ([api.ts](file:///d:/projects/mini-project/frontend/src/services/api.ts))

Phase 2 builds the **core project management loop** on top of that foundation — projects, tasks, updates, comments, notifications, and dashboards — **without any AI or voice features** (Phase 3).

---

## What Phase 2 Covers

| Feature                  | Actor(s)                        |
|--------------------------|---------------------------------|
| Project CRUD             | Admin, Manager                  |
| Project member assignment| Admin, Manager                  |
| Task CRUD                | Manager (create), Employee (update)|
| Task status tracking     | Employee                        |
| Task comments            | All authenticated users         |
| In-app Notifications     | System-generated (triggers)     |
| Dashboard & Analytics    | Admin, Manager, Viewer          |
| My Tasks view            | Employee                        |

---

## Backend — New Files

### Models

#### [NEW] `backend/models/Project.js`
```
Fields:
  title          String (required)
  description    String
  status         Enum: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED"
  priority       Enum: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  startDate      Date
  dueDate        Date
  organizationId ObjectId → Organization (required, multi-tenancy key)
  departmentId   ObjectId → Department
  managerId      ObjectId → User (the manager who owns this project)
  members        [ObjectId] → User (employees on this project)
  tags           [String]
  createdBy      ObjectId → User
  timestamps
```
> **Why**: Central entity. Every task belongs to a project. `organizationId` enforces tenant isolation.

---

#### [NEW] `backend/models/Task.js`
```
Fields:
  title          String (required)
  description    String
  status         Enum: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED"
  priority       Enum: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  projectId      ObjectId → Project (required)
  organizationId ObjectId → Organization (required)
  assignedTo     ObjectId → User (employee)
  assignedBy     ObjectId → User (manager)
  dueDate        Date
  completedAt    Date
  estimatedHours Number
  loggedHours    Number (accumulated from updates)
  tags           [String]
  order          Number (for Kanban drag ordering)
  timestamps
```
> **Why**: Core work unit. `assignedTo` drives the Employee's "My Tasks" view. `loggedHours` accumulates from task updates.

---

#### [NEW] `backend/models/TaskUpdate.js`
```
Fields:
  taskId         ObjectId → Task (required)
  projectId      ObjectId → Project
  organizationId ObjectId → Organization
  submittedBy    ObjectId → User
  updateText     String (required) — the raw text employee writes
  hoursLogged    Number
  statusChange   String (new status after this update)
  timestamps
```
> **Why**: Immutable audit log of all updates. In Phase 3, the AI layer will parse `updateText` and enrich these records.

---

#### [NEW] `backend/models/Comment.js`
```
Fields:
  entityType     Enum: "TASK" | "PROJECT"
  entityId       ObjectId (polymorphic ref to Task or Project)
  organizationId ObjectId → Organization
  author         ObjectId → User
  content        String (required)
  timestamps
```
> **Why**: Enables discussion on tasks and projects. Polymorphic design avoids separate `TaskComment` + `ProjectComment` models.

---

#### [NEW] `backend/models/Notification.js`
```
Fields:
  userId         ObjectId → User (recipient)
  organizationId ObjectId → Organization
  type           Enum: "TASK_ASSIGNED" | "TASK_STATUS_CHANGED" | "TASK_DUE_SOON" | 
                       "TASK_OVERDUE" | "PROJECT_CREATED" | "COMMENT_ADDED" | 
                       "MEMBER_ADDED"
  title          String
  message        String
  isRead         Boolean (default: false)
  relatedEntity  { entityType: String, entityId: ObjectId }
  timestamps
```
> **Why**: Single collection for all in-app notifications. `relatedEntity` lets the frontend deep-link to the relevant task/project.

---

### Controllers

#### [NEW] `backend/controllers/projectController.js`
```
createProject      POST   /api/projects          (ADMIN, MANAGER)
getProjects        GET    /api/projects          (ALL roles — filtered by org)
getProjectById     GET    /api/projects/:id      (members only)
updateProject      PUT    /api/projects/:id      (ADMIN, MANAGER)
deleteProject      DELETE /api/projects/:id      (ADMIN)
addProjectMember   POST   /api/projects/:id/members (ADMIN, MANAGER)
removeProjectMember DELETE /api/projects/:id/members/:userId (ADMIN, MANAGER)
getProjectStats    GET    /api/projects/:id/stats (summary metrics per project)
```

#### [NEW] `backend/controllers/taskController.js`
```
createTask         POST   /api/tasks             (MANAGER)
getTasks           GET    /api/tasks             (filtered by projectId, assignedTo, status)
getTaskById        GET    /api/tasks/:id
updateTask         PUT    /api/tasks/:id         (MANAGER updates meta; EMPLOYEE updates status)
deleteTask         DELETE /api/tasks/:id         (MANAGER, ADMIN)
getMyTasks         GET    /api/tasks/my-tasks    (EMPLOYEE — their assigned tasks)
```

#### [NEW] `backend/controllers/taskUpdateController.js`
```
submitUpdate       POST   /api/task-updates      (EMPLOYEE)
getUpdatesForTask  GET    /api/task-updates/:taskId
```
> Updates also trigger: `loggedHours` accumulation on Task + `Notification` to the manager.

#### [NEW] `backend/controllers/commentController.js`
```
addComment         POST   /api/comments
getComments        GET    /api/comments?entityType=TASK&entityId=:id
deleteComment      DELETE /api/comments/:id     (own comment or ADMIN/MANAGER)
```

#### [NEW] `backend/controllers/notificationController.js`
```
getNotifications   GET    /api/notifications        (current user's unread + recent)
markAsRead         PUT    /api/notifications/:id/read
markAllAsRead      PUT    /api/notifications/read-all
```

#### [NEW] `backend/controllers/dashboardController.js`
```
getOrgDashboard    GET    /api/dashboard/org         (ADMIN, MANAGER, VIEWER)
getProjectDashboard GET   /api/dashboard/project/:id (ADMIN, MANAGER, VIEWER)
getMyDashboard     GET    /api/dashboard/me          (EMPLOYEE — personal stats)
```
> Returns aggregated counts (tasks by status, projects by status, workload per member, overdue items).

---

### Routes

#### [NEW] `backend/routes/projectRoutes.js`
#### [NEW] `backend/routes/taskRoutes.js`
#### [NEW] `backend/routes/taskUpdateRoutes.js`
#### [NEW] `backend/routes/commentRoutes.js`
#### [NEW] `backend/routes/notificationRoutes.js`
#### [NEW] `backend/routes/dashboardRoutes.js`

All routes use [authMiddleware](file:///d:/projects/mini-project/backend/middleware/authMiddleware.js#3-20) + `roleMiddleware` as needed.

---

### Middleware

#### [MODIFY] [backend/middleware/roleMiddleware.js](file:///d:/projects/mini-project/backend/middleware/roleMiddleware.js)
> Currently only checks `req.user.role`. Will also need an **org-scoping guard** — confirm `req.user.organizationId` matches the resource's `organizationId` to prevent cross-tenant access.

#### [NEW] `backend/middleware/ownershipMiddleware.js`
```
checkProjectAccess  — ensures user is a project member or ADMIN/MANAGER of the org
checkTaskAccess     — ensures user is assignee or manager of the task
```

---

### Services

#### [NEW] `backend/services/notificationService.js`
```
createNotification(userId, type, title, message, relatedEntity, orgId)
```
> Central function called by controllers whenever a notification-worthy event occurs (task assigned, status change, comment posted, etc.). Keeps notification logic out of controllers.

#### [NEW] `backend/services/statsService.js`
```
getProjectStats(projectId)   — tasks by status, overdue count, completion %
getOrgStats(organizationId)  — project health, per-member workload
```

---

### Updated [app.js](file:///d:/projects/mini-project/backend/app.js)
Register all new route files:
```js
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/task-updates", taskUpdateRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
```

---

## Frontend — New Files

The frontend uses **Vite + React + TypeScript** with:
- **Services** → API calls (`services/`)
- **Stores** → Zustand global state (`store/`)
- **Pages** → Route-level components (`pages/`)
- **Components** → Shared/reusable UI (`components/`)

---

### Types

#### [NEW] `frontend/src/types/project.types.ts`
```ts
Project, ProjectStatus, ProjectPriority, ProjectStats
```

#### [NEW] `frontend/src/types/task.types.ts`
```ts
Task, TaskStatus, TaskPriority, TaskUpdate, Comment
```

#### [NEW] `frontend/src/types/notification.types.ts`
```ts
Notification, NotificationType
```

#### [NEW] `frontend/src/types/dashboard.types.ts`
```ts
OrgDashboard, ProjectDashboard, MyDashboard
```

---

### Services

#### [NEW] `frontend/src/services/projectService.ts`
Wraps all `/api/projects` calls.

#### [NEW] `frontend/src/services/taskService.ts`
Wraps all `/api/tasks` + `/api/task-updates` calls.

#### [NEW] `frontend/src/services/commentService.ts`
Wraps `/api/comments` calls.

#### [NEW] `frontend/src/services/notificationService.ts`
Wraps `/api/notifications` calls.

#### [NEW] `frontend/src/services/dashboardService.ts`
Wraps `/api/dashboard` calls.

---

### Stores (Zustand)

#### [MODIFY] [frontend/src/store/authStore.ts](file:///d:/projects/mini-project/frontend/src/store/authStore.ts)
> Add `organizationId` to the stored user so all service calls can scope by org.

#### [NEW] `frontend/src/store/projectStore.ts`
```ts
projects[], selectedProject, loading, error
actions: fetchProjects, createProject, updateProject, deleteProject, setSelectedProject
```

#### [NEW] `frontend/src/store/taskStore.ts`
```ts
tasks[], myTasks[], selectedTask, loading
actions: fetchTasks, fetchMyTasks, createTask, updateTask, deleteTask, submitUpdate
```

#### [NEW] `frontend/src/store/notificationStore.ts`
```ts
notifications[], unreadCount
actions: fetchNotifications, markAsRead, markAllAsRead
```

#### [NEW] `frontend/src/store/dashboardStore.ts`
```ts
orgStats, projectStats, myStats
actions: fetchOrgDashboard, fetchProjectDashboard, fetchMyDashboard
```

---

### Pages

#### [MODIFY] `frontend/src/pages/dashboard/`
Replace the current placeholder dashboard with real data-driven components.

```
pages/dashboard/
├── DashboardPage.tsx          (role-aware: shows OrgDashboard or MyDashboard)
├── components/
│   ├── StatsCard.tsx          (count + trend card)
│   ├── ProjectHealthChart.tsx (bar/pie chart of project statuses)
│   ├── TaskStatusChart.tsx    (doughnut chart of task status distribution)
│   ├── TeamWorkloadChart.tsx  (horizontal bar: tasks per member)
│   └── RecentActivityFeed.tsx (latest updates/comments)
```

#### [NEW] `frontend/src/pages/projects/`
```
pages/projects/
├── ProjectsPage.tsx           (list of all projects in the org — card/table view)
├── ProjectDetailPage.tsx      (single project: tasks, members, stats, activity)
├── CreateProjectPage.tsx      (form: title, description, dept, due date, priority)
├── EditProjectPage.tsx        (same form pre-filled)
└── components/
    ├── ProjectCard.tsx        (project summary card)
    ├── ProjectTable.tsx       (table view alternative)
    ├── ProjectMembersPanel.tsx(add/remove members)
    ├── ProjectStatsPanel.tsx  (tasks by status, completion %, overdue count)
    └── ProjectForm.tsx        (shared create/edit form)
```

#### [NEW] `frontend/src/pages/tasks/`
```
pages/tasks/
├── TasksPage.tsx              (Kanban + List view of tasks for a project)
├── TaskDetailPage.tsx         (task detail: description, updates, comments, timeline)
├── MyTasksPage.tsx            (Employee-only: all tasks assigned to them)
└── components/
    ├── KanbanBoard.tsx        (drag-and-drop columns: TODO / IN_PROGRESS / IN_REVIEW / DONE / BLOCKED)
    ├── KanbanColumn.tsx       (single column with task cards)
    ├── TaskCard.tsx           (compact task card for Kanban / list)
    ├── TaskDetailPanel.tsx    (right-side drawer with full task info)
    ├── TaskForm.tsx           (create/edit task form)
    ├── TaskUpdateForm.tsx     (employee submits a text update + hours logged)
    ├── TaskUpdateList.tsx     (ordered list of all updates for a task)
    └── CommentSection.tsx     (thread of comments with add/delete)
```

#### [NEW] `frontend/src/pages/notifications/`
```
pages/notifications/
└── NotificationsPage.tsx      (list of all user notifications with mark-as-read)
```

---

### Components (Shared)

#### [NEW] `frontend/src/components/shared/NotificationBell.tsx`
Badge icon in the top navbar showing `unreadCount`. Opens a dropdown of recent notifications.

#### [NEW] `frontend/src/components/shared/StatusBadge.tsx`
Reusable badge component for task/project statuses with color coding.

#### [NEW] `frontend/src/components/shared/PriorityBadge.tsx`
Reusable badge for LOW / MEDIUM / HIGH / CRITICAL.

#### [NEW] `frontend/src/components/shared/UserAvatar.tsx`
Consistent avatar rendering (initials fallback if no image).

#### [NEW] `frontend/src/components/shared/ConfirmDialog.tsx`
Generic confirmation modal (used for delete project/task/comment).

#### [MODIFY] `frontend/src/components/layout/`
Add `NotificationBell` to the main navigation header.

---

### Router

#### [MODIFY] `frontend/src/router/`
Add new routes:
```
/projects                    → ProjectsPage
/projects/create             → CreateProjectPage
/projects/:id                → ProjectDetailPage
/projects/:id/edit           → EditProjectPage
/projects/:id/tasks          → TasksPage
/tasks/my-tasks              → MyTasksPage (EMPLOYEE)
/tasks/:id                   → TaskDetailPage
/notifications               → NotificationsPage
```
Add role-based route guards:
- `/projects/create` → ADMIN, MANAGER only
- `/tasks/my-tasks` → EMPLOYEE only

---

## Complete Folder Structure After Phase 2

```
mini-project/
├── backend/
│   ├── app.js                          ← MODIFIED (add new routes)
│   ├── server.js
│   ├── config/
│   ├── constants/
│   ├── mail/
│   ├── middleware/
│   │   ├── authMiddleware.js           ← existing
│   │   ├── roleMiddleware.js           ← MODIFIED (org scoping)
│   │   └── ownershipMiddleware.js      ← NEW
│   ├── models/
│   │   ├── User.js                     ← existing
│   │   ├── Organization.js             ← existing
│   │   ├── Department.js               ← existing
│   │   ├── Invitation.js               ← existing
│   │   ├── Project.js                  ← NEW
│   │   ├── Task.js                     ← NEW
│   │   ├── TaskUpdate.js               ← NEW
│   │   ├── Comment.js                  ← NEW
│   │   └── Notification.js             ← NEW
│   ├── controllers/
│   │   ├── authController.js           ← existing
│   │   ├── userController.js           ← existing
│   │   ├── departmentController.js     ← existing
│   │   ├── invitationController.js     ← existing
│   │   ├── organizationController.js   ← existing
│   │   ├── projectController.js        ← NEW
│   │   ├── taskController.js           ← NEW
│   │   ├── taskUpdateController.js     ← NEW
│   │   ├── commentController.js        ← NEW
│   │   ├── notificationController.js   ← NEW
│   │   └── dashboardController.js      ← NEW
│   ├── routes/
│   │   ├── authRoutes.js               ← existing
│   │   ├── userRoutes.js               ← existing
│   │   ├── departmentRoutes.js         ← existing
│   │   ├── invitationRoutes.js         ← existing
│   │   ├── organizationRoutes.js       ← existing
│   │   ├── projectRoutes.js            ← NEW
│   │   ├── taskRoutes.js               ← NEW
│   │   ├── taskUpdateRoutes.js         ← NEW
│   │   ├── commentRoutes.js            ← NEW
│   │   ├── notificationRoutes.js       ← NEW
│   │   └── dashboardRoutes.js          ← NEW
│   ├── services/
│   │   ├── notificationService.js      ← NEW
│   │   └── statsService.js             ← NEW
│   └── utils/
│
└── frontend/
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── types/
        │   ├── project.types.ts        ← NEW
        │   ├── task.types.ts           ← NEW
        │   ├── notification.types.ts   ← NEW
        │   └── dashboard.types.ts      ← NEW
        ├── services/
        │   ├── api.ts                  ← existing
        │   ├── authService.ts          ← existing
        │   ├── organizationService.ts  ← existing
        │   ├── departmentService.ts    ← existing
        │   ├── userService.ts          ← existing
        │   ├── invitationService.ts    ← existing
        │   ├── projectService.ts       ← NEW
        │   ├── taskService.ts          ← NEW
        │   ├── commentService.ts       ← NEW
        │   ├── notificationService.ts  ← NEW
        │   └── dashboardService.ts     ← NEW
        ├── store/
        │   ├── authStore.ts            ← MODIFIED (add orgId)
        │   ├── projectStore.ts         ← NEW
        │   ├── taskStore.ts            ← NEW
        │   ├── notificationStore.ts    ← NEW
        │   └── dashboardStore.ts       ← NEW
        ├── hooks/
        │   ├── useProjects.ts          ← NEW (custom hook wrapping projectStore)
        │   ├── useTasks.ts             ← NEW
        │   └── useNotifications.ts     ← NEW
        ├── pages/
        │   ├── auth/                   ← existing
        │   ├── dashboard/
        │   │   ├── DashboardPage.tsx   ← MODIFIED (real data)
        │   │   └── components/
        │   │       ├── StatsCard.tsx            ← NEW
        │   │       ├── ProjectHealthChart.tsx    ← NEW
        │   │       ├── TaskStatusChart.tsx       ← NEW
        │   │       ├── TeamWorkloadChart.tsx     ← NEW
        │   │       └── RecentActivityFeed.tsx    ← NEW
        │   ├── projects/               ← NEW
        │   │   ├── ProjectsPage.tsx
        │   │   ├── ProjectDetailPage.tsx
        │   │   ├── CreateProjectPage.tsx
        │   │   ├── EditProjectPage.tsx
        │   │   └── components/
        │   │       ├── ProjectCard.tsx
        │   │       ├── ProjectTable.tsx
        │   │       ├── ProjectMembersPanel.tsx
        │   │       ├── ProjectStatsPanel.tsx
        │   │       └── ProjectForm.tsx
        │   ├── tasks/                  ← NEW
        │   │   ├── TasksPage.tsx
        │   │   ├── TaskDetailPage.tsx
        │   │   ├── MyTasksPage.tsx
        │   │   └── components/
        │   │       ├── KanbanBoard.tsx
        │   │       ├── KanbanColumn.tsx
        │   │       ├── TaskCard.tsx
        │   │       ├── TaskDetailPanel.tsx
        │   │       ├── TaskForm.tsx
        │   │       ├── TaskUpdateForm.tsx
        │   │       ├── TaskUpdateList.tsx
        │   │       └── CommentSection.tsx
        │   ├── notifications/          ← NEW
        │   │   └── NotificationsPage.tsx
        │   ├── departments/            ← existing
        │   ├── invitations/            ← existing
        │   ├── organization/           ← existing
        │   ├── users/                  ← existing
        │   └── NotFoundPage.tsx
        ├── components/
        │   ├── layout/                 ← MODIFIED (add NotificationBell)
        │   ├── shared/
        │   │   ├── NotificationBell.tsx    ← NEW
        │   │   ├── StatusBadge.tsx         ← NEW
        │   │   ├── PriorityBadge.tsx       ← NEW
        │   │   ├── UserAvatar.tsx          ← NEW
        │   │   └── ConfirmDialog.tsx       ← NEW
        │   └── ui/                     ← existing (shadcn components)
        ├── router/                     ← MODIFIED
        └── lib/                        ← existing
```

---

## RBAC Matrix for Phase 2

| Action                  | ADMIN | MANAGER | EMPLOYEE | VIEWER |
|-------------------------|:-----:|:-------:|:--------:|:------:|
| Create Project          | ✅    | ✅      | ❌       | ❌     |
| View All Projects       | ✅    | ✅      | ✅*      | ✅     |
| Edit/Delete Project     | ✅    | ✅      | ❌       | ❌     |
| Add Project Members     | ✅    | ✅      | ❌       | ❌     |
| Create Task             | ✅    | ✅      | ❌       | ❌     |
| View Tasks (project)    | ✅    | ✅      | ✅*      | ✅     |
| Update Task Status      | ✅    | ✅      | ✅*      | ❌     |
| Submit Task Update      | ✅    | ✅      | ✅*      | ❌     |
| Delete Task             | ✅    | ✅      | ❌       | ❌     |
| Add Comment             | ✅    | ✅      | ✅       | ✅     |
| Delete Comment          | ✅    | ✅      | own only | ❌     |
| View Org Dashboard      | ✅    | ✅      | ❌       | ✅     |
| View My Dashboard       | ✅    | ✅      | ✅       | ❌     |

✅* = only for projects/tasks they are a member of / assigned to

---

## Phase 3 Integration Points (Placeholders to Leave)

The following hooks in Phase 2 code will be empty/passthrough stubs — ready for Phase 3 to fill:

1. **`TaskUpdate.aiSummary`** — empty string field in `TaskUpdate` model
2. **`TaskUpdate.extractedStatus`** — null field (AI will populate)
3. **`taskUpdateController.js`** — after saving the update, call `aiService.processUpdate()` which is a no-op stub in Phase 2
4. **`TaskDetailPage.tsx`** — include an empty `<AIInsightsPanel />` placeholder component

---

## Implementation Order

1. **Backend Models** (Project → Task → TaskUpdate → Comment → Notification)
2. **Backend Services** (notificationService, statsService)
3. **Backend Controllers + Routes** (project → task → taskUpdate → comment → notification → dashboard)
4. **Frontend Types** (all type files)
5. **Frontend Services + Stores** (project → task → notification → dashboard)
6. **Frontend Pages** (projects → tasks → dashboard → notifications)
7. **Frontend Shared Components** (StatusBadge, PriorityBadge, NotificationBell, etc.)
8. **Router updates + RBAC guards**
