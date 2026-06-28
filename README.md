# Planora — To-Do List & Calendar

AI-powered to-do list and calendar web application built with Next.js 15.

## Features

- **User Authentication** — Register, login, logout with NextAuth.js v5
- **Email Verification** — Token-based email verification via Resend
- **Task Management** — Full CRUD with title, description, date, status
- **Calendar View** — Interactive calendar with date selection
- **Task Filtering** — By status, date, and keyword search
- **Status Summary** — Dashboard with counts per status
- **Dark Mode** — Toggle theme with persistence
- **Responsive UI** — Desktop and mobile layouts
- **AI Task Creation** — Natural language parsing (Gemini / OpenAI / Anthropic / DeepSeek)
- **AI Daily Summary** — One-click streaming daily summary
- **API Documentation** — Auto-generated OpenAPI docs via Scalar UI
- **Drag & Drop** — Task status management via @dnd-kit

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | Next.js 15 (App Router)        |
| Language  | TypeScript                     |
| Database  | PostgreSQL (Neon) + Prisma ORM |
| Auth      | NextAuth.js v5 (JWT)           |
| Styling   | Tailwind CSS 4                 |
| AI        | Vercel AI SDK (multi-provider) |
| Email     | Resend                         |
| API Docs  | zod-to-openapi + Scalar        |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
```

Edit `.env` and fill in your values:

| Variable          | Required | Description                                 |
| ----------------- | -------- | ------------------------------------------- |
| `DATABASE_URL`    | ✅       | Neon PostgreSQL connection string           |
| `DIRECT_URL`      | ✅       | Direct connection for migrations            |
| `NEXTAUTH_SECRET` | ✅       | Any random string                           |
| `NEXTAUTH_URL`    | ✅       | `http://localhost:3000` for dev             |
| `RESEND_API_KEY`  | ❌       | For email verification (skip if not needed) |

### Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed
```

### Run

```bash
npm run dev
```

Visit `http://localhost:3000`

### Docker (Alternative)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run manually
docker build -t planora .
docker run -p 3000:3000 --env-file .env planora
```

### Demo Credentials

After seeding:

- Email: `demo@planora.app`
- Password: `demo123456`

### API Docs

Visit `http://localhost:3000/api/docs` (set `API_DOCS_ENABLED=true` in .env)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register pages
│   ├── (dashboard)/     # Main dashboard (calendar + task list)
│   └── api/
│       ├── auth/        # NextAuth, register, verify
│       ├── tasks/       # CRUD endpoints
│       ├── ai/          # NL parsing & daily summary
│       └── docs/        # OpenAPI docs
├── components/
│   ├── auth/            # Login form
│   ├── layout/          # Header, theme toggle
│   └── ui/              # shadcn/ui primitives
├── hooks/               # useTasks, useCalendar
├── lib/
│   ├── services/        # Business logic
│   ├── repositories/    # Data access
│   └── ...
└── types/               # TypeScript types
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed design decisions, tradeoffs, and diagrams.

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:

- Service layer unit tests (task.service.test.ts)
- Validation schema tests
- Authorization tests (ForbiddenError, NotFoundError)

## API Endpoints

### Auth

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |
| GET    | `/api/auth/logout`   | Logout user       |
| GET    | `/api/auth/verify`   | Verify email      |

### Tasks

| Method | Endpoint         | Description                                                  |
| ------ | ---------------- | ------------------------------------------------------------ |
| GET    | `/api/tasks`     | List tasks (with filters: date, status, search, page, limit) |
| POST   | `/api/tasks`     | Create task                                                  |
| GET    | `/api/tasks/:id` | Get task details                                             |
| PUT    | `/api/tasks/:id` | Update task                                                  |
| DELETE | `/api/tasks/:id` | Delete task                                                  |

### AI Features

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| POST   | `/api/ai/parse-task`    | Parse natural language to task |
| POST   | `/api/ai/daily-summary` | Generate AI daily summary      |

Full API documentation: `/api/docs`

## Deployment

This project is deployed on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Environment Variables (Production)

Set the following in Vercel dashboard:

- `DATABASE_URL` - Neon PostgreSQL
- `DIRECT_URL` - Neon PostgreSQL (for migrations)
- `NEXTAUTH_SECRET` - Random string
- `NEXTAUTH_URL` - Your production URL
- `AI_PROVIDER` - gemini/openai/anthropic/deepseek
- Provider API keys

## License

MIT License - feel free to use this project for learning.
