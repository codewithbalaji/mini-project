# Database Seed Script

This seed script populates your MongoDB database with realistic dummy data for testing and development.

## What Gets Created

### Organization 1: TechCorp Solutions (Software Development)

**Departments:**
- Engineering
- Product Management
- Design
- Marketing

**Users (7):**
- Alice Admin (ADMIN) - alice@techcorp.com
- Bob Manager (MANAGER) - bob@techcorp.com
- Carol Manager (MANAGER) - carol@techcorp.com
- David Developer (EMPLOYEE) - david@techcorp.com
- Emma Engineer (EMPLOYEE) - emma@techcorp.com
- Frank Designer (EMPLOYEE) - frank@techcorp.com
- Grace Viewer (VIEWER) - grace@techcorp.com

**Projects (4):**
1. E-Commerce Platform Redesign (ACTIVE, HIGH priority)
2. Mobile App Development (PLANNING, MEDIUM priority)
3. API Integration Project (IN_PROGRESS, CRITICAL priority)
4. Marketing Website Refresh (COMPLETED, LOW priority)

**Tasks:** Multiple tasks across different statuses (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)

**Additional Data:**
- Task updates with logged hours
- Comments on tasks and projects
- Notifications (read and unread)
- Pending and expired invitations

### Organization 2: DesignHub Agency (Creative Services)

**Departments:**
- Creative
- Client Services

**Users (4):**
- Helen Admin (ADMIN) - helen@designhub.com
- Ian Manager (MANAGER) - ian@designhub.com
- Julia Designer (EMPLOYEE) - julia@designhub.com
- Kevin Designer (EMPLOYEE) - kevin@designhub.com

**Projects (2):**
1. Brand Identity for StartupXYZ (ACTIVE, HIGH priority)
2. Website Redesign for TechFirm (PLANNING, MEDIUM priority)

**Tasks:** Multiple tasks with various statuses and priorities

**Additional Data:**
- Task updates
- Comments
- Notifications

## How to Run

### Prerequisites

Make sure you have:
1. MongoDB running locally or connection string in `.env`
2. All dependencies installed (`npm install`)
3. `.env` file configured with `MONGODB_URI`

### Run the Seed Script

```bash
cd backend
npm run seed
```

Or directly:

```bash
node seed.js
```

## What Happens

1. **Clears all existing data** from all collections
2. Creates 2 organizations with complete data hierarchies
3. Populates realistic relationships between entities
4. Displays summary statistics
5. Shows test user credentials

## Test Credentials

All users have the same password: `password123`

### TechCorp Solutions Users:
- `alice@techcorp.com` - Full admin access
- `bob@techcorp.com` - Manager (Engineering)
- `carol@techcorp.com` - Manager (Product)
- `david@techcorp.com` - Developer
- `emma@techcorp.com` - Engineer
- `frank@techcorp.com` - Designer
- `grace@techcorp.com` - Viewer (read-only)

### DesignHub Agency Users:
- `helen@designhub.com` - Full admin access
- `ian@designhub.com` - Manager
- `julia@designhub.com` - Designer
- `kevin@designhub.com` - Designer

## Data Features

- **Multi-tenancy:** Data is properly scoped by organizationId
- **Realistic dates:** Projects and tasks have appropriate start/due dates
- **Time tracking:** Tasks include estimated and logged hours
- **Status variety:** Mix of TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED
- **Priority levels:** LOW, MEDIUM, HIGH, CRITICAL
- **Relationships:** Proper linking between users, projects, tasks, comments
- **Notifications:** Both read and unread notifications
- **Comments:** Discussion threads on tasks and projects

## Use Cases

Perfect for:
- Testing the application with realistic data
- Demonstrating features to stakeholders
- Development and debugging
- Testing role-based access control
- Validating multi-tenancy isolation
- Performance testing with meaningful data

## Warning

⚠️ This script will **DELETE ALL EXISTING DATA** before seeding. Only run this in development environments!
