# Product Overview

Multi-tenant project management system with role-based access control for organizations to manage projects, tasks, and team collaboration.

## Core Features

- Organization management with departments and user roles (ADMIN, MANAGER, EMPLOYEE, VIEWER)
- Project lifecycle management (PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
- Task tracking with status workflow (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)
- Time logging and hour tracking per task
- Email notifications for task assignments, due dates, and status changes
- Analytics dashboard with project/task metrics and financial tracking
- Invitation system for onboarding users to organizations
- Real-time notifications and activity feeds

## User Roles

- **ADMIN**: Full system access, organization settings, user management
- **MANAGER**: Project creation/management, task assignment, analytics access
- **EMPLOYEE**: Task execution, time logging, project participation
- **VIEWER**: Read-only access to projects and tasks

## Multi-tenancy

All data is scoped by `organizationId` to ensure complete data isolation between organizations.
