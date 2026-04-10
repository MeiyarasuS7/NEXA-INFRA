# NEXA INFRA

NEXA INFRA is a full-stack construction management platform for connecting clients, contractors, and administrators in one workflow. The application supports contractor discovery, project requests, approval-based assignment, project conversations, reviews, disputes, payments, and role-based dashboards.

## Project Structure

```text
NEXA-INFRA/
|-- backend/    # Express + TypeScript + MongoDB API
|-- frontend/   # React + Vite + TypeScript web app
|-- FRONTEND-BACKEND-CONNECTION.md
|-- PROJECT_APPROVAL_WORKFLOW.md
|-- SYSTEM_STATUS.md
```

## Core Features

- Role-based authentication for users, contractors, and super admins
- Contractor browsing, profile pages, and review visibility
- Project creation, approval, rejection, and assignment workflow
- Real-time and persisted conversations tied to projects
- Admin dashboards for contractors, projects, payments, disputes, reviews, and analytics
- Payment and dispute management APIs
- Optional AI chatbot integration through Groq on the frontend

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS
- Radix UI

### Backend

- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Socket.IO
- Stripe
- Nodemailer

## Getting Started

### 1. Install dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=your-admin-email@example.com
FRONTEND_URL=http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GROQ_API_KEY=
VITE_GROQ_MODEL=llama-3.1-70b-versatile
VITE_CHATBOT_TEMPERATURE=0.7
VITE_CHATBOT_MAX_TOKENS=1024
```

### 3. Start the backend

```powershell
cd backend
npm run dev
```

The API runs on `http://localhost:5000` and exposes a health check at `http://localhost:5000/health`.

### 4. Start the frontend

```powershell
cd frontend
npm run dev
```

The Vite app is configured to run on `http://localhost:8080`.

## Available Scripts

### Backend

- `npm run dev` - start the API in development
- `npm run build` - compile TypeScript
- `npm start` - run the compiled server
- `npm run seed:contractors` - seed contractor data
- `npm run debug:auth` - debug authentication setup

### Frontend

- `npm run dev` - start the web app
- `npm run build` - build for production
- `npm run preview` - preview the production build
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode

## Main Application Areas

### Frontend routes

- Public: landing page, login, register, browse contractors, contractor profile
- User: dashboard, project requests, project list, chat, profile
- Contractor: dashboard, projects, reviews, chat, profile
- Admin: dashboard, approvals, contractors, projects, payments, disputes, reviews, analytics, settings

### Backend API groups

- `/api/auth`
- `/api/projects`
- `/api/contractors`
- `/api/conversations`
- `/api/payments`
- `/api/reviews`
- `/api/disputes`
- `/api/notifications`
- `/api/admin`

## Approval Workflow

The project approval flow is a central part of the platform:

1. A user creates a project request.
2. A super admin reviews pending requests.
3. The admin approves or rejects the request.
4. On approval, a contractor is assigned.
5. A conversation is created automatically for the user and contractor.

See `PROJECT_APPROVAL_WORKFLOW.md` for the full flow.

## Deployment Notes

### Frontend

- Vercel config is included in `frontend/vercel.json`
- Netlify SPA redirects are included in `frontend/public/_redirects`
- Set `VITE_API_BASE_URL` to your deployed backend URL

### Backend

- Set production values for `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `FRONTEND_URL`
- Ensure your deployment allows WebSocket traffic for Socket.IO
- Configure Stripe and email credentials before enabling those integrations in production

## Additional Documentation

- `backend/API_DOCUMENTATION.md`
- `backend/DATABASE_SCHEMA.md`
- `FRONTEND-BACKEND-CONNECTION.md`
- `PROJECT_APPROVAL_WORKFLOW.md`
- `SYSTEM_STATUS.md`
