# Technology Stack

## Backend

- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt/bcryptjs for password hashing
- **Email**: NodeMailer for transactional emails
- **Scheduling**: node-cron for automated tasks
- **AI Services**: OpenAI SDK (OpenRouter AI integration)
- **Voice Processing**: ElevenLabs integration via axios

### Backend Dependencies

```json
{
  "axios": "^1.13.6",
  "bcrypt": "^6.0.0",
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.2.4",
  "multer": "^2.1.1",
  "node-cron": "^4.2.1",
  "nodemailer": "^8.0.1",
  "openai": "^6.29.0"
}
```

## Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite v7
- **Routing**: React Router DOM v7
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query) v5
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner (toast notifications)
- **HTTP Client**: Axios

### Frontend Dependencies

```json
{
  "@tanstack/react-query": "^5.90.21",
  "axios": "^1.13.6",
  "react": "^19.2.0",
  "react-router-dom": "^7.13.1",
  "zustand": "^5.0.11",
  "react-hook-form": "^7.71.2",
  "zod": "^4.3.6",
  "tailwindcss": "^4.2.1",
  "recharts": "^3.8.0",
  "sonner": "^2.0.7"
}
```

## Common Commands

### Backend

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# Seed database with sample data
npm run seed
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Configuration

Both frontend and backend require `.env` files for configuration:

- **Backend**: Database connection, JWT secrets, email credentials, AI API keys
- **Frontend**: API base URL, environment-specific settings

## Code Style

- **Backend**: ES modules with `.js` extensions, async/await patterns
- **Frontend**: TypeScript with strict mode, functional components with hooks
- **Import Aliases**: Frontend uses `@/` alias for `src/` directory
