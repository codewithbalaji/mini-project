# Quick Start - Database Seeding

## Run the Seed Script

```bash
cd backend
npm run seed
```

## Login Credentials

All users have password: `password123`

### TechCorp Solutions (Software Company)

| Email | Role | Department |
|-------|------|------------|
| alice@techcorp.com | ADMIN | Engineering |
| bob@techcorp.com | MANAGER | Engineering |
| carol@techcorp.com | MANAGER | Product Management |
| david@techcorp.com | EMPLOYEE | Engineering |
| emma@techcorp.com | EMPLOYEE | Engineering |
| frank@techcorp.com | EMPLOYEE | Design |
| grace@techcorp.com | VIEWER | Marketing |

### DesignHub Agency (Creative Services)

| Email | Role | Department |
|-------|------|------------|
| helen@designhub.com | ADMIN | Creative |
| ian@designhub.com | MANAGER | Creative |
| julia@designhub.com | EMPLOYEE | Creative |
| kevin@designhub.com | EMPLOYEE | Creative |

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
- Login as alice@techcorp.com - should only see TechCorp data
- Login as helen@designhub.com - should only see DesignHub data

### Test Role-Based Access
- **ADMIN** (alice, helen): Full access to all features
- **MANAGER** (bob, carol, ian): Can create projects, assign tasks
- **EMPLOYEE** (david, emma, frank, julia, kevin): Can work on assigned tasks
- **VIEWER** (grace): Read-only access

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
