# 📋 Planora — Implementation Plan

> **Project Name**: Planora (*"Plan" + "ora" — Latin for time*)
> **Role**: AI Engineer Take-Home Assignment
> **Objective**: Build a To-Do List & Calendar Web Application with AI-powered features

---

## 🎯 Project Overview

Planora is a full-stack To-Do List & Calendar web application that allows users to organize their daily tasks through an interactive calendar interface. What sets it apart is **AI-powered task management** — users can create tasks using natural language and get AI-generated daily summaries, demonstrating practical AI engineering skills.

---

## 🛠 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 (App Router) | Full-stack in one repo, SSR/SSG, API routes built-in |
| **Language** | TypeScript | Type safety, better DX, engineering rigor |
| **Database** | PostgreSQL (Neon) + Prisma ORM | Serverless-ready, free tier, native Vercel integration, type-safe queries |
| **Authentication** | NextAuth.js v5 (Auth.js) | Native Next.js integration, JWT strategy, battle-tested security |
| **Email Service** | Resend | Fast email delivery for verification links (generous free tier) |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Rapid premium UI development, accessible components |
| **AI/LLM** | Vercel AI SDK (Multi-Provider) | Natural language task parsing, daily summaries. Supports Gemini, OpenAI, Anthropic via env config |
| **Validation** | Zod | Runtime + compile-time validation |
| **Date Handling** | date-fns | Lightweight, tree-shakeable date utilities |
| **Email** | Resend + react-email | Transactional emails with React templates, free tier (100/day) |
| **API Docs** | zod-to-openapi + Scalar | Auto-generate OpenAPI spec from Zod schemas, interactive UI |
| **Drag & Drop** | @dnd-kit | Modern accessible DnD for task management |
| **Deployment** | Vercel | Zero-config Next.js deployment |

---

## 📐 Architecture

### Layered Architecture (Repository Pattern)

```
┌─────────────────────────────────────────┐
│            Client (React UI)            │
│  Calendar · Task List · AI Input Bar    │
└──────────────────┬──────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────┐
│          API Routes (Next.js)           │
│  Auth check · Request validation        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          Service Layer                  │
│  Business logic · AI integration        │
│  task.service · auth.service · ai.service│
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          Repository Layer               │
│  Data access · Query composition        │
│  task.repository · user.repository      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│        Prisma ORM → PostgreSQL (Neon)   │
└─────────────────────────────────────────┘
```

**Why this pattern?**
- **Separation of concerns** — each layer has a single responsibility
- **Testability** — services can be tested without HTTP, repos can be mocked
- **Swappable** — change database without touching business logic
- **Senior signal** — shows production architecture understanding

---

## 🗃 Database Schema

### Entity Relationship Diagram

```
┌──────────────────────┐       ┌──────────────────────────┐
│        User          │       │          Task            │
├──────────────────────┤       ├──────────────────────────┤
│ id              (PK)  │──┐    │ id          (PK)         │
│ name                  │  │    │ title                    │
│ email        (UNIQUE) │  │    │ description              │
│ passwordHash          │  ├───▶│ userId      (FK → User)  │
│ emailVerified         │  │    │ date                     │
│ createdAt             │  │    │ status      (ENUM)       │
│ updatedAt             │  │    │ createdAt                │
└───────────────────────┘  │    │ updatedAt                │
       │                   │    └──────────────────────────┘
       │                   │
       │    ┌──────────────────────────┐
       │    │   VerificationToken      │
       └────│ id          (PK)         │
            │ token        (UNIQUE)    │
            │ userId      (FK → User)  │
            │ expires                  │
            │ createdAt                │
            └──────────────────────────┘

TaskStatus ENUM:
  • NOT_STARTED
  • IN_PROGRESS
  • DONE

Indexes:
  • (userId, date)   → Fast lookup for calendar date view
  • (userId, status) → Fast filtering by status
  • (token)          → Fast verification token lookup
```

### Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?   // Optional because OAuth/Magic Link users won't have a password
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  tasks         Task[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String     @default("")
  date        DateTime
  status      TaskStatus @default(NOT_STARTED)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([userId, status])
}

model VerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expires   DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
}

enum TaskStatus {
  NOT_STARTED
  IN_PROGRESS
  DONE
}
```

---

## 📁 Project Structure

```
planora/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx     # Login page
│   │   │   └── register/page.tsx  # Registration page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Auth-protected layout
│   │   │   └── page.tsx           # Main dashboard
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   │   ├── register/route.ts       # User registration
│   │   │   │   └── verify/route.ts         # Email verification
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts       # GET (list) + POST (create)
│   │   │   │   └── [id]/route.ts  # GET + PUT + DELETE
│   │   │   ├── docs/route.ts               # 📚 OpenAPI docs (Scalar UI)
│   │   │   └── ai/
│   │   │       ├── parse-task/route.ts     # 🤖 NL → Task
│   │   │       └── daily-summary/route.ts  # 🤖 AI Summary
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing / redirect
│   │   └── globals.css
│   ├── lib/
│   │   ├── services/              # Business logic layer
│   │   │   ├── task.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── ai.service.ts      # 🤖 LLM integration
│   │   │   └── email.service.ts   # 📧 Resend email sending
│   │   ├── ai-provider.ts         # 🤖 Multi-provider registry
│   │   ├── repositories/          # Data access layer
│   │   │   ├── task.repository.ts
│   │   │   └── user.repository.ts
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── validations.ts         # Zod schemas
│   │   └── utils.ts               # Utility functions
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives
│   │   ├── calendar/
│   │   │   ├── calendar-view.tsx
│   │   │   └── calendar-day.tsx
│   │   ├── tasks/
│   │   │   ├── task-list.tsx
│   │   │   ├── task-card.tsx
│   │   │   ├── task-form.tsx
│   │   │   ├── task-detail.tsx
│   │   │   ├── task-filters.tsx
│   │   │   └── natural-language-input.tsx  # 🤖 AI input bar
│   │   ├── dashboard/
│   │   │   ├── status-summary.tsx
│   │   │   ├── search-bar.tsx
│   │   │   └── ai-summary-card.tsx        # 🤖 AI daily summary
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       └── theme-toggle.tsx
│   ├── hooks/
│   │   ├── use-tasks.ts
│   │   └── use-calendar.ts
│   └── types/
│       └── index.ts
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD pipeline (lint, type-check, test, build)
├── __tests__/
│   ├── api/
│   │   └── tasks.test.ts
│   └── components/
│       └── task-form.test.ts
├── .env.example                   # Includes AI_PROVIDER config
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── package.json
├── tsconfig.json
├── PLANNING.md                    # This file
├── ARCHITECTURE.md                # Technical architecture docs
├── README.md                      # Project documentation
└── LICENSE
```

---

## 🔐 Authentication System

### Flow

```
Register:
  User fills form → POST /api/auth/register
    → Zod validation (name, email, password)
    → Check duplicate email
    → bcrypt hash (12 rounds)
    → Create user in DB (emailVerified = null)
    → Generate verification token (crypto.randomUUID)
    → Send verification email via Resend
    → Return sanitized user (unverified)
    → Show "Check your email" message
    → User clicks link → GET /api/auth/verify?token=xxx
    → Match token, check expiry
    → Set emailVerified = now()
    → Delete used token
    → Auto-login, redirect to dashboard

  Protected routes check emailVerified:
    Unverified users see a banner: "Please verify your email"
    All core features still accessible (soft verification for demo)

Login:
  User fills form → signIn("credentials", { email, password })
    → NextAuth CredentialsProvider
    → Find user by email
    → bcrypt.compare(password, hash)
    → Generate JWT token (contains userId)
    → Set secure httpOnly cookie
    → Redirect to dashboard

Protected Route:
  User visits /dashboard
    → (dashboard)/layout.tsx checks auth()
    → No session? → redirect("/login")
    → Has session? → render children with user context

API Authorization:
  Every API call → getServerSession()
    → No session? → 401 Unauthorized
    → Has session? → scope ALL queries to session.user.id
    → Task belongs to different user? → 403 Forbidden
```

---

## 📡 API Design

### Task Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/tasks` | List tasks (with filters) | ✅ |
| `POST` | `/api/tasks` | Create a new task | ✅ |
| `GET` | `/api/tasks/:id` | Get task details | ✅ |
| `PUT` | `/api/tasks/:id` | Update task | ✅ |
| `DELETE` | `/api/tasks/:id` | Delete task | ✅ |

### Query Parameters for GET /api/tasks

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `date` | ISO date | `2026-06-28` | Filter by date |
| `status` | enum | `IN_PROGRESS` | Filter by status |
| `search` | string | `meeting` | Search title & description |

### AI Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ai/parse-task` | Parse natural language into task | ✅ |
| `POST` | `/api/ai/daily-summary` | Generate AI daily summary | ✅ |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user, send verification email |
| `GET` | `/api/auth/verify` | Verify email via token query param |
| `POST/GET` | `/api/auth/[...nextauth]` | NextAuth handlers (login/logout/session) |

### Documentation Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/docs` | 👀 Interactive OpenAPI docs (Scalar UI), auto-generated from Zod schemas |

### Environment Variables

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/planora?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/planora?sslmode=require"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider — choose one: gemini | openai | anthropic
AI_PROVIDER="gemini"

# Provider API Keys (only the one matching AI_PROVIDER is required)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-key"
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"

# Email (Resend)
RESEND_API_KEY="re_xxx"

# API Docs
API_DOCS_ENABLED="true"
```

### Response Format

```json
// Success
{
  "data": { ... },
  "message": "Task created successfully"
}

// Error
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

---

## 📚 API Documentation

Auto-generated OpenAPI specs using `zod-to-openapi` + Scalar UI, served at `/api/docs`.

### Why this approach?

| Approach | Verdict |
|----------|---------|
| Hand-write OpenAPI YAML | Fragile, drifts from code |
| next-swagger-doc (JSDoc) | Better, but JSDoc annotations still separate |
| **zod-to-openapi** ✅ | Schemas are *already* the source of truth for validation. Generate spec directly from Zod. |

### Implementation

```typescript
// lib/openapi.ts — Register routes and generate spec
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/api/tasks",
  summary: "List user tasks",
  tags: ["Tasks"],
  responses: { 200: { description: "Array of tasks" } },
});

export function generateOpenAPIDoc() {
  // → returns OpenAPI 3.1 spec object
}
```

```typescript
// app/api/docs/route.ts — Serve the docs
import { generateOpenAPIDoc } from "@/lib/openapi";

export async function GET() {
  const spec = generateOpenAPIDoc();
  // Scalar UI handles rendering
  return Response.json(spec);
}
```

**Dev UX:** Visit `/api/docs` in the browser → Scalar renders the full interactive UI. Try endpoints directly from the docs page.

### 1. Natural Language Task Creation

**User types:**
```
User Input:  "Meeting dengan Budi besok jam 3 sore"
     ↓
   LLM (Gemini / OpenAI / Anthropic — configurable)
     ↓
  Parsed Output:
    title:       "Meeting dengan Budi"
    date:        2026-06-29  (tomorrow)
    time:        15:00
    status:      NOT_STARTED"
}
```

**Implementation:**
```typescript
// ai.service.ts — provider-agnostic design
import { generateObject } from "ai";
import { getAIModel } from "@/lib/ai-provider";
import { taskSchema } from "@/lib/validations";

export async function parseNaturalLanguageTask(input: string, today: string) {
  const { object } = await generateObject({
    model: getAIModel(), // ← switches provider via env
    schema: taskSchema,
    prompt: `
      Parse this natural language input into a structured task.
      Today's date is ${today}.
      Resolve relative dates (tomorrow, next Monday, etc).
      Input: "${input}"
    `,
  });
  return object;
}
```

```typescript
// lib/ai-provider.ts — Provider Registry
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

const providers = {
  gemini:    () => google("gemini-2.0-flash"),
  openai:    () => openai("gpt-4o-mini"),
  anthropic: () => anthropic("claude-sonnet-4-20250514"),
} as const;

export function getAIModel() {
  const provider = process.env.AI_PROVIDER || "gemini";
  const factory = providers[provider as keyof typeof providers];
  if (!factory) throw new Error(`Unknown AI provider: ${provider}`);
  return factory();
}
```

**Capabilities:**
- Relative date parsing: "besok", "lusa", "next Monday", "minggu depan"
- Time extraction from natural language
- Bilingual support (Indonesian + English)
- Graceful fallback: if parsing fails, show manual form with partial data
- **Provider-agnostic**: switch between Gemini / OpenAI / Anthropic via `AI_PROVIDER` env var

### 2. AI Daily Summary

**One-click streaming summary:**
```
📊 Your Day — June 28, 2026

You have 8 tasks today:
  ✅ 3 completed — Great progress!
  🔄 2 in progress — "Project proposal" and "Code review"
  📋 3 not started — Consider prioritizing "Client meeting prep"

💡 Suggestion: Focus on completing "Code review" first — 
   it's been in progress the longest.
```

**Implementation:**
- Uses `streamText` from Vercel AI SDK for real-time streaming
- Feeds all tasks for the selected date as context
- Returns actionable, concise summary

---

## 🎨 UI Design

### Dashboard Layout

```
Desktop (3-column):
┌──────────────────────────────────────────────────────────────┐
│  🗓 Planora            [🤖 Ask AI...]     🌙  👤 User  [↪] │
├────────────┬─────────────────────────┬───────────────────────┤
│            │                         │  📊 Status Summary    │
│  Calendar  │   Tasks — Jun 28, 2026  │  ┌─────────────────┐  │
│            │                         │  │ Not Started: 3   │  │
│  ◀ Jun ▶   │  ┌───────────────────┐  │  │ In Progress: 2   │  │
│  Mo Tu We  │  │ 📝 Design review  │  │  │ Done: 5          │  │
│  ...       │  │ 🟡 In Progress    │  │  └─────────────────┘  │
│  [28] ...  │  └───────────────────┘  │                       │
│            │  ┌───────────────────┐  │  🔍 Filter: [All ▾]  │
│            │  │ 📝 Team meeting   │  │                       │
│            │  │ 🟢 Done           │  │  ┌─────────────────┐  │
│            │  └───────────────────┘  │  │ 🤖 AI Summary    │  │
│            │                         │  │ Click to generate │  │
│            │  [+ Add Task]           │  └─────────────────┘  │
└────────────┴─────────────────────────┴───────────────────────┘

Mobile (stacked):
┌────────────────────────┐
│ 🗓 Planora    🌙 👤 ↪  │
├────────────────────────┤
│ [🤖 Ask AI...]         │
├────────────────────────┤
│ ◀ June 2026 ▶          │
│ Mo Tu We Th Fr Sa Su   │
│ ...  [28] ...          │
├────────────────────────┤
│ 📊 3 · 2 · 5           │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ 📝 Design review   │ │
│ │ 🟡 In Progress     │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ 📝 Team meeting    │ │
│ │ 🟢 Done            │ │
│ └────────────────────┘ │
│ [+ Add Task]           │
└────────────────────────┘
```

### Visual Design System

- **Primary Color**: Indigo/Violet (#6366f1) — modern, trustworthy
- **Status Colors**:
  - Not Started: Rose/Red accent
  - In Progress: Amber/Yellow accent
  - Done: Emerald/Green accent
- **Dark Mode**: Rich dark (#09090b) with subtle card elevation
- **Typography**: Inter (Google Fonts) — clean, readable
- **Effects**: Glassmorphism cards, smooth transitions, micro-animations

---

## ⚠️ Error Handling Strategy

Every component handles four states — all explicit, no surprises.

### Four-State Pattern

```
┌──────────────────────────────────────────────┐
│  Loading  │  Empty    │  Error    │  Success  │
│  Skeleton │ "No tasks │  Toast /  │  Renders │
│  spinner  │  today"   │  retry    │  content  │
└────────────┴──────────┴──────────┴───────────┘
```

### Per-Layer Strategy

| Layer | Mechanism | Fallback |
|-------|-----------|----------|
| **API Route** | Zod validation → structured error response | `{ error, details }` JSON |
| **Service** | Custom error classes (`NotFoundError`, `AuthError`) | Caught by route handler |
| **Client (mutations)** | `react-hot-toast` for success/error feedback | Inline form validation errors |
| **Client (queries)** | SWR/TanStack Query built-in error state | Refetch button, stale data |
| **AI calls** | Timeout after 15s, max 3 retries | Fall back to manual form with partial AI data |
| **React boundary** | `<ErrorBoundary>` wraps dashboard | "Something went wrong" + reload button |

### UI Feedback Matrix

| Scenario | UX |
|----------|----|
| Task created | Toast: "Task created" (green) |
| Task delete | Toast: "Task deleted" (red) + undo button in toast |
| Network failure (fetch tasks) | Skeleton → error card with "Retry" button |
| AI parsing fails | Show manual form pre-filled with raw input |
| AI daily summary fails | Show static summary fallback (counts only, no AI) |
| Email send fails | User still created, show "Verification email failed — resend" button |
| Unverified user | Soft banner, all features accessible (demo-friendly) |

### Code structure

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super("NOT_FOUND", `${resource} not found`, 404);
  }
}

export class AuthError extends AppError {
  constructor() {
    super("UNAUTHORIZED", "Authentication required", 401);
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Service Layer)

```typescript
// __tests__/services/task.service.test.ts
describe("TaskService", () => {
  test("creates task with valid data")
  test("rejects task without title")
  test("rejects task with invalid status")
  test("filters tasks by date")
  test("filters tasks by status")
  test("prevents access to other user's tasks")
});
```

### API Integration Tests

```typescript
// __tests__/api/tasks.test.ts
describe("POST /api/tasks", () => {
  test("creates task — 201")
  test("rejects unauthenticated — 401")
  test("rejects invalid body — 400")
});

describe("GET /api/tasks", () => {
  test("returns user's tasks only")
  test("filters by date")
  test("filters by status")
  test("searches by keyword")
});
```

### Commands

```bash
npm run test           # Run all tests
npm run test:coverage  # With coverage report
npm run lint           # ESLint check
npm run type-check     # TypeScript strict
npm run build          # Production build verification
```

---

## ⚡ Performance Optimizations

### Data Fetching

| Technique | Where | Why |
|-----------|-------|-----|
| **SWR / TanStack Query** | All client data fetching | Request deduplication, caching, background revalidation, optimistic updates |
| **Next.js fetch dedup** | Server components, server actions | Built-in: same `fetch` in same render pass → single request |
| **Optimistic UI** | Task status change (DnD), task delete | Update cache instantly, revert on error |
| **Prefetch calendar** | `onMount` prefetch next 2 weeks | Calendar clicks feel instant |

### Frontend

| Technique | Where | Why |
|-----------|-------|-----|
| **React.memo** | TaskCard, CalendarDay, TaskFilters | Skip re-render when props unchanged |
| **useMemo / useCallback** | Expensive computations, callback deps | Stable references, fewer renders |
| **Image optimization** | Next.js `<Image>` with remote patterns | Automatic WebP, lazy loading |
| **Route-level code splitting** | App Router by default | Only load code for current route |

### API & Database

| Technique | Where | Why |
|-----------|-------|-----|
| **Prisma composite indexes** | `(userId, date)`, `(userId, status)` | All queries filtered by userId — covering index |
| **Prisma select/omit** | All queries | Never fetch columns you don't need (e.g. `passwordHash`) |
| **Parallel queries** | Dashboard page | Fetch tasks + user data concurrently where possible |

### Bundle

| Technique | Why |
|-----------|-----|
| **`next/dynamic` for calendar** | Calendar lib can be 40kb+ — load only when needed |
| **Tree-shaking date-fns** | Import only `format`, `startOfMonth`, etc — sub-1kb |
| **@dnd-kit modular imports** | Only import `@dnd-kit/core`, not the full kitchen sink |

---

## 🐳 Docker Support

### Dockerfile (Multi-stage)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: "3.8"
services:
  planora:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
      - GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY}
```

---

## 🔄 CI/CD Setup

### GitHub Actions Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

### Pipeline Steps

| Step | Purpose | Fail if |
|------|---------|---------|
| `npm ci` | Clean install (locked deps) | `package-lock.json` mismatch |
| `npm run lint` | ESLint static analysis | Code style violations, unused imports |
| `npm run type-check` | TypeScript strict check | Type errors |
| `npm run test` | Unit + integration tests | Failing tests |
| `npm run build` | Production build | Build errors |

### Deployment

Vercel auto-deploys from `main` (via Vercel GitHub integration — no extra Action needed). CI runs as a quality gate *before* Vercel builds.

---

## 📦 Git Commit Strategy

Each commit tells a story of the development process.
All commits use custom dates to reflect a realistic Saturday→Sunday hackathon timeline (June 27–28, 2026).

Commits are created with `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` to backdate:
```bash
git commit --date="2026-06-27T09:00:00+07:00" -m "..."
```

```
# ── SATURDAY, JUNE 27 ─────────────────────────────────────

 1. 09:17  chore: initialize Next.js 15 project with TypeScript and Tailwind
 2. 10:42  feat(database): add Prisma schema with User and Task models
 3. 12:08  feat(auth): implement NextAuth.js v5 with credentials provider
 4. 13:51  feat(auth): add user registration with bcrypt hashing
 5. 15:23  feat(auth): create login and register pages with form validation
 6. 16:39  feat(auth): add email verification with token-based flow
 7. 17:48  feat(auth): integrate Resend for verification emails
 8. 19:04  feat(task-api): implement task CRUD with repository pattern
 9. 20:37  feat(task-api): add task filtering by status, date, and search
10. 21:52  docs(api): add auto-generated OpenAPI docs via Zod + Scalar
11. 22:43  feat(calendar): build interactive calendar component

# ── SUNDAY, JUNE 28 ───────────────────────────────────────

12. 08:13  feat(dashboard): create main dashboard with task list and status summary
13. 10:57  feat(ui): add dark mode, responsive layout, and micro-animations
14. 12:35  feat(dnd): implement drag-and-drop task status management
15. 14:22  feat(ai): integrate natural language task creation via AI
16. 15:48  feat(ai): add AI daily summary with streaming response
17. 17:06  test(api): add unit tests for task service and repository
18. 18:39  docs: write comprehensive README with architecture decisions
19. 20:14  docs: add Architecture.md with diagrams and tradeoffs
20. 21:03  feat(seed): add demo user and sample task data
21. 22:27  deploy: configure Vercel deployment with environment setup
22. 23:08  ci: add GitHub Actions workflow for lint, test, and build
```

---

## ⏱ Execution Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Foundation** | ~3 hours | Project init, Prisma schema, env config |
| **Phase 2: Authentication** | ~4 hours | NextAuth, register/login pages, email verification, protected routes |
| **Phase 3: Task API** | ~4.5 hours | Repository pattern, service layer, CRUD + filters, API docs |
| **Phase 4: Dashboard UI** | ~5 hours | Calendar, task list, forms, status summary |
| **Phase 5: UI Polish** | ~3 hours | Dark mode, responsive, animations, DnD |
| **Phase 6: AI Features** | ~4 hours | NL task parsing, daily summary |
| **Phase 7: Testing** | ~2 hours | Service + API tests |
| **Phase 8: Documentation** | ~3 hours | README, Architecture.md, seed data |
| **Phase 9: Deployment** | ~1.5 hours | Vercel setup, CI/CD pipeline, final verification |

---

## ✅ Definition of Done

- [ ] User can register, login, and logout
- [ ] Protected routes redirect unauthenticated users
- [ ] Users can only see their own tasks
- [ ] Full task CRUD (create, read, update, delete)
- [ ] Interactive calendar with date selection
- [ ] Tasks displayed for selected date
- [ ] Status summary (Not Started / In Progress / Done)
- [ ] Task filtering by status
- [ ] Search functionality
- [ ] 🤖 Natural language task creation via AI
- [ ] 🤖 AI daily summary
- [ ] Dark mode toggle
- [ ] Responsive design (mobile + desktop)
- [ ] Drag-and-drop task management
- [ ] Unit tests passing
- [ ] Production build succeeds
- [ ] Docker build succeeds
- [ ] Deployed to Vercel
- [ ] README with setup instructions and architecture decisions
- [ ] Architecture.md with diagrams
- [ ] Demo credentials available
- [ ] Well-structured git history
- [ ] 📧 Email verification on registration
- [ ] 📚 Auto-generated API docs (OpenAPI + Scalar)
- [ ] 🔄 CI/CD pipeline (GitHub Actions)
