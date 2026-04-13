# Quick Start - Database Seeding

## Run the Seed Script

```bash
cd backend
npm run seed
```

## Login Credentials

All users have password: `password123`

### TestOrg (Software Company)

| Email | Role | Department |
|-------|------|------------|
| admin@testorg.com | ADMIN | Engineering |
| manager1@testorg.com | MANAGER | Engineering |
| manager2@testorg.com | MANAGER | Product Management |
| employee1@testorg.com | EMPLOYEE | Engineering |
| employee2@testorg.com | EMPLOYEE | Engineering |
| employee3@testorg.com | EMPLOYEE | Design |
| viewer@testorg.com | VIEWER | Marketing |

### TestOrg2 (Creative Services)

| Email | Role | Department |
|-------|------|------------|
| admin@testorg2.com | ADMIN | Creative |
| manager@testorg2.com | MANAGER | Creative |
| employee1@testorg2.com | EMPLOYEE | Creative |
| employee2@testorg2.com | EMPLOYEE | Creative |

## What You Get

- **2 Organizations** with complete data isolation
- **6 Departments** across both organizations
- **11 Users** with different roles
- **6 Projects** in various states (PLANNING, ACTIVE, COMPLETED)
- **10 Tasks** with different statuses (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)
- **8 Task Updates** with logged hours
- **7 Comments** on tasks and projects
- **7 Notifications** (read and unread)
- **2 Invitations** (pending and expired)

## Testing Scenarios

### Test Multi-tenancy
- Login as admin@testorg.com - should only see TestOrg data
- Login as admin@testorg2.com - should only see TestOrg2 data

### Test Role-Based Access
- **ADMIN** (admin@testorg.com, admin@testorg2.com): Full access to all features
- **MANAGER** (manager1, manager2@testorg.com, manager@testorg2.com): Can create projects, assign tasks
- **EMPLOYEE** (employee1/2/3@testorg.com, employee1/2@testorg2.com): Can work on assigned tasks
- **VIEWER** (viewer@testorg.com): Read-only access

### Test Project Management
- Active projects with ongoing tasks
- Completed projects with historical data
- Projects in planning phase

### Test Task Workflows
- Tasks in different statuses
- Time tracking with logged hours
- Task updates and progress logs
- Comments and discussions

## Warning

⚠️ Running this script will **DELETE ALL EXISTING DATA**. Only use in development!
