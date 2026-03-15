# Technology Stack

## Backend

- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt for password hashing
- **Email**: Nodemailer for transactional emails (OTP, invitations, task notifications)
- **Scheduling**: node-cron for automated task reminder emails
- **Environment**: dotenv for configuration

### Backend Commands

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.x
- **Routing**: React Router DOM 7.x
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query) with 30s stale time
- **Forms**: React Hook Form + Zod validation + @hookform/resolvers
- **UI Components**: Radix UI primitives + shadcn/ui component library
- **Styling**: Tailwind CSS 4.x with class-variance-authority for variants
- **Icons**: Lucide React
- **Charts**: Recharts for analytics visualizations
- **Notifications**: Sonner for toast messages

### Frontend Commands

```bash
# Development server
npm run dev

# Production build (TypeScript check + Vite build)
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

## Development Patterns

- **API Communication**: Axios for HTTP requests
- **Path Aliases**: `@/` maps to `frontend/src/`
- **Type Safety**: Strict TypeScript configuration
- **Code Quality**: ESLint with React-specific rules
- **Component Architecture**: Functional components with hooks
- **Query Caching**: React Query handles server state with automatic refetching
