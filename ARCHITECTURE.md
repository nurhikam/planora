# 🏗 Planora — Architecture Document

> This document describes the technical architecture, design decisions, and tradeoffs behind Planora. It's intended for reviewers who want to understand not just *what* was built, but *why* it was built this way.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│                                                         │
│   ┌─────────────┐  ┌──────────┐  ┌──────────────────┐  │
│   │  Calendar    │  │  Task    │  │  AI Input Bar    │  │
│   │  Component   │  │  List    │  │  (NL → Task)     │  │
│   └──────┬──────┘  └────┬─────┘  └────────┬─────────┘  │
│          │              │                  │             │
│          └──────────────┼──────────────────┘             │
│                         │ fetch / SWR                    │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────┐
│                   Next.js Server                         │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │              API Routes Layer                     │  │
│   │  /api/auth/*  ·  /api/tasks/*  ·  /api/ai/*      │  │
│   │  • Auth check (getServerSession)                  │  │
│   │  • Request validation (Zod)                       │  │
│   │  • HTTP response formatting                       │  │
│   └──────────────────────┬───────────────────────────┘  │
│                          │                               │
│   ┌──────────────────────▼───────────────────────────┐  │
│   │              Service Layer                        │  │
│   │  task.service  ·  auth.service  ·  ai.service     │  │
│   │  • Business logic & rules                         │  │
│   │  • Data transformation                            │  │
│   │  • LLM integration (ai.service)                   │  │
│   └──────────────────────┬───────────────────────────┘  │
│                          │                               │
│   ┌──────────────────────▼───────────────────────────┐  │
│   │              Repository Layer                     │  │
│   │  task.repository  ·  user.repository              │  │
│   │  • Data access abstraction                        │  │
│   │  • Query composition                              │  │
│   │  • No business logic                              │  │
│   └──────────────────────┬───────────────────────────┘  │
│                          │                               │
│   ┌──────────────────────▼───────────────────────────┐  │
│   │              Prisma ORM                           │  │
│   └──────────────────────┬───────────────────────────┘  │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                ┌───────────▼───────────┐
                │   PostgreSQL (Neon)   │
                │   Serverless-ready    │
                └───────────────────────┘

               ┌───────────────────────┐
               │   AI Provider Layer   │
               │  (Provider Registry)  │
               │                       │
               │  Gemini │ OpenAI │    │
               │  Anthropic │ etc.  │  │
               │  via Vercel AI SDK    │
               └───────────────────────┘
```

---

## Authentication Flow

### Registration

```
┌──────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐    ┌────────────┐    ┌────────┐
│Client│    │API Route │    │Auth Service │    │User Repo │    │Token Repo  │    │Resend  │
└──┬───┘    └────┬─────┘    └──────┬──────┘    └────┬─────┘    └─────┬──────┘    └───┬────┘
   │ POST /reg  │               │                │                │               │
   │ {name,em..}│               │                │                │               │
   │───────────▶│               │                │                │               │
   │            │ Zod validate  │                │                │               │
   │            │──────┐        │                │                │               │
   │            │◀─────┘        │                │                │               │
   │            │               │                │                │               │
   │            │ registerUser()│                │                │               │
   │            │──────────────▶│                │                │               │
   │            │               │ findByEmail()  │                │               │
   │            │               │───────────────▶│                │               │
   │            │               │◀───────────────│                │               │
   │            │               │                │                │               │
   │            │               │ bcrypt.hash()  │                │               │
   │            │               │──────┐         │                │               │
   │            │               │◀─────┘         │                │               │
   │            │               │ create user    │                │               │
   │            │               │ (emailVeri-    │                │               │
   │            │               │  fied=null)    │                │               │
   │            │               │───────────────▶│                │               │
   │            │               │◀───────────────│                │               │
   │            │               │                │                │               │
   │            │               │ gen token +    │                │               │
   │            │               │ store          │                │               │
   │            │               │───────────────▶│                │               │
   │            │               │◀───────────────│                │               │
   │            │               │                │                │               │
   │            │               │ send email     │                │               │
   │            │               │──────────────────────────────────────────────▶│
   │            │               │◀──────────────────────────────────────────────│
   │            │               │                │                │               │
   │            │◀──────────────│                │                │               │
   │ 201 +      │                │                │                │               │
   │ "check     │                │                │                │               │
   │  email"    │                │                │                │               │
   │◀───────────│                │                │                │               │
   │            │                │                │                │               │
   │ User click │                │                │                │               │
   │ verify link│                │                │                │               │
   │───────────▶│                │                │                │               │
   │  GET /ver  │                │                │                │               │
   │ ?token=xxx │                │                │                │               │
   │            │ verifyEmail()  │                │                │               │
   │            │──────────────▶│                │                │               │
   │            │               │ find token     │                │               │
   │            │               │───────────────▶│                │               │
   │            │               │◀───────────────│                │               │
   │            │               │                │                │               │
   │            │               │ update user    │                │               │
   │            │               │ (emailVerified │                │               │
   │            │               │  = now())      │                │               │
   │            │               │───────────────▶│                │               │
   │            │               │ delete token   │                │               │
   │            │               │───────────────▶│                │               │
   │            │               │                │                │               │
   │            │◀──────────────│                │                │               │
   │ 200 +      │                │                │                │               │
   │ auto-login │                │                │                │               │
   │◀───────────│                │                │                │               │
```

### Protected API Request

```
┌──────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│Client│       │API Route │       │ Service  │       │Repository│
└──┬───┘       └────┬─────┘       └────┬─────┘       └────┬─────┘
   │ GET /api/tasks │               │                  │
   │ Cookie: JWT    │               │                  │
   │───────────────▶│               │                  │
   │                │               │                  │
   │         getServerSession()     │                  │
   │                │─────┐         │                  │
   │                │◀────┘         │                  │
   │                │               │                  │
   │          No session?           │                  │
   │          → 401 Unauthorized    │                  │
   │                │               │                  │
   │          Has session?          │                  │
   │                │ getTasksByDate(userId, date)      │
   │                │──────────────▶│                  │
   │                │               │ findByUserAndDate│
   │                │               │─────────────────▶│
   │                │               │◀─────────────────│
   │                │◀──────────────│                  │
   │ 200 + tasks[]  │               │                  │
   │◀───────────────│               │                  │
```

---

## AI Integration Flow

### Natural Language Task Creation

```
┌──────┐       ┌──────────┐       ┌──────────┐       ┌─────────┐
│Client│       │API Route │       │AI Service│       │ Gemini  │
└──┬───┘       └────┬─────┘       └────┬─────┘       └────┬────┘
   │                │               │                  │
   │ "Meeting Budi  │               │                  │
   │  besok jam 3"  │               │                  │
   │───────────────▶│               │                  │
   │                │               │                  │
   │          Auth check ✓          │                  │
   │                │               │                  │
   │                │ parseTask()   │                  │
   │                │──────────────▶│                  │
   │                │               │ generateObject() │
   │                │               │ schema: taskZod  │
   │                │               │─────────────────▶│
   │                │               │                  │
   │                │               │  Structured JSON │
   │                │               │◀─────────────────│
   │                │               │                  │
   │                │  Validated    │                  │
   │                │  task object  │                  │
   │                │◀──────────────│                  │
   │                │               │                  │
   │ {title, date,  │               │                  │
   │  description,  │               │                  │
   │  status}       │               │                  │
   │◀───────────────│               │                  │
   │                │               │                  │
   │ User confirms  │               │                  │
   │ → POST /tasks  │               │                  │
   │───────────────▶│ (normal CRUD flow)               │
```

**Key Design Decisions:**
1. **Provider Registry Pattern** — `getAIModel()` reads `AI_PROVIDER` env var and returns the correct model. Switching from Gemini to OpenAI is changing one env variable, not refactoring code
2. **Structured Output** — Using `generateObject` with a Zod schema ensures the LLM always returns valid, typed data regardless of provider
3. **Confirmation Step** — AI parses, user confirms before saving. Prevents hallucinated data from being stored silently
4. **Graceful Fallback** — If parsing fails, the manual form opens with whatever the AI could extract

### Provider Architecture

```
              ┌─────────────────────────────────┐
              │        ai.service.ts            │
              │   parseTask() / summarize()     │
              └────────────────┬────────────────┘
                               │
                               │ getAIModel()
                               ▼
              ┌─────────────────────────────────┐
              │      ai-provider.ts             │
              │      Provider Registry           │
              │                                 │
              │  reads AI_PROVIDER env var       │
              └──────────┬───────┬───────────────┘
                         │       │
              ┌─────────▼─┐   ┌─▼──────────┐   ┌───────────┐
              │  Gemini    │   │  OpenAI    │   │ Anthropic │
              │  2.0 Flash │   │  gpt-4o-  │   │ Claude    │
              │            │   │  mini     │   │ Sonnet    │
              └────────────┘   └────────────┘   └───────────┘

   All providers use the same Vercel AI SDK interface.
   Switching = change AI_PROVIDER env var. Zero code changes.
```

---

## Data Flow: Task Lifecycle

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   NOT_STARTED  │────▶│  IN_PROGRESS   │────▶│     DONE       │
│                │     │                │     │                │
│  🔴 Rose       │     │  🟡 Amber      │     │  🟢 Emerald    │
└───────┬────────┘     └───────┬────────┘     └────────────────┘
        │                      │
        │◀─────────────────────│  (can move backwards)
        │
        ▼
  Can also directly → DONE (skip In Progress)
```

**Status transitions are unrestricted** — users can move tasks freely between any status. This is a deliberate UX decision: enforcing linear workflows adds complexity without value in a personal task manager.

---

## Design Decisions & Tradeoffs

### Why PostgreSQL (Neon) over SQLite?

| Factor | PostgreSQL (Neon) | SQLite |
|--------|-------------------|--------|
| **Vercel Compatibility** | Serverless-ready, natively supported | Ephemeral filesystem — data lost between invocations |
| **Setup** | One-click from Vercel dashboard, instant | Zero-config local file |
| **Reviewer Experience** | `git clone && npm i && npm run dev` (Neon is cloud-hosted, no local install) | `git clone && npm i && npm run dev` |
| **Performance** | Connection pooling, concurrent reads/writes | Fast single-user, no network |
| **Scalability** | Scales to production seamlessly | Limited concurrent writes |
| **Free Tier** | 0.5 GB storage, generous compute | N/A (local only) |

**Decision**: Neon (serverless PostgreSQL). SQLite cannot persist on Vercel's ephemeral serverless filesystem — writes would be lost between requests. Neon is free-tier, one-click setup from the Vercel dashboard, and Prisma supports it natively. Same developer experience as SQLite (just a connection string) with production-grade reliability.

### Why Auth.js over Custom JWT?

| Factor | Auth.js (NextAuth v5) | Custom JWT |
|--------|----------------------|------------|
| **Security** | CSRF protection, secure cookies, token rotation | Must implement manually |
| **Code** | ~30 lines config | ~200+ lines middleware |
| **Extensibility** | Add Google/GitHub OAuth trivially | Significant effort |
| **Risk** | Battle-tested by thousands of apps | Potential security gaps |

**Decision**: Auth.js. Don't roll your own auth unless you have a specific reason.

### Why REST API over Server Actions?

| Factor | REST API | Server Actions |
|--------|----------|---------------|
| **Documentation** | Easily documentable (OpenAPI) | Hard to document |
| **Testability** | Standard HTTP testing | Requires Next.js test setup |
| **Separation** | Clear frontend/backend boundary | Coupled to React components |
| **Portability** | API usable by mobile apps, CLI | Next.js only |
| **Evaluation** | Shows backend engineering skills | Shows React-specific skills |

**Decision**: REST API. For an AI Engineer role, demonstrating backend API design is more valuable than using framework-specific shortcuts.

### Why Repository Pattern over Direct Prisma?

| Factor | Repository Pattern | Direct Prisma in Routes |
|--------|-------------------|------------------------|
| **Files** | More files (6-8 extra) | Fewer files |
| **Testing** | Mock repositories easily | Must mock Prisma client |
| **Readability** | Clear responsibility per layer | Business logic mixed with HTTP |
| **Flexibility** | Swap data source without touching business logic | Prisma-coupled |

**Decision**: Repository Pattern. The extra files are worth the clean separation and testability. This is what production codebases look like.

### Why Multi-Provider AI over Single Provider?

| Factor | Single Provider (e.g., Gemini only) | Multi-Provider (Registry Pattern) |
|--------|-------------------------------------|-----------------------------------|
| **Vendor lock-in** | Locked to one provider | Switch via env var |
| **Resilience** | One provider down = AI down | Fallback to another provider |
| **Cost optimization** | Fixed pricing | Choose cheapest for each use case |
| **Code complexity** | Simpler | ~20 extra lines (provider registry) |
| **Flexibility** | Limited | Users/reviewers can use their own API key |

**Decision**: Multi-provider with a registry pattern. The Vercel AI SDK's unified interface makes this almost free — only ~20 lines of code for the provider registry, but it demonstrates production-level thinking about vendor independence.

**Supported Providers:**
| Provider | Model | Best For |
|----------|-------|----------|
| **Gemini** (default) | `gemini-2.0-flash` | Fast, free tier (15 RPM) |
| **OpenAI** | `gpt-4o-mini` | Widely available, reliable |
| **Anthropic** | `claude-sonnet-4-20250514` | Strong at structured output |

---

## Scalability Considerations

### Current Architecture (Demo Scale: 1-100 users)

- PostgreSQL (Neon) free tier — sufficient for demo and small teams
- Single Next.js server on Vercel serverless
- JWT auth is stateless — no session store needed

### Growth Path (100-10K users)

| Component | Current | Scaled |
|-----------|---------|--------|
| **Database** | Neon (PostgreSQL) free tier | Neon Scale / larger plan |
| **Caching** | None | Redis for session/task cache |
| **Search** | SQL LIKE | Full-text search index |
| **AI** | Synchronous | Queue-based (Bull/BullMQ) |
| **File Storage** | Local | S3/Cloudflare R2 |

### Growth Path (10K+ users)

- Separate API microservice from frontend
- Connection pooling (PgBouncer)
- CDN for static assets
- Rate limiting on AI endpoints
- Background job processing for AI tasks
- WebSocket for real-time collaboration

---

## Security Measures

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **CSRF Protection**: Built into NextAuth.js
3. **SQL Injection**: Prevented by Prisma's parameterized queries
4. **XSS**: React's default escaping + Content Security Policy headers
5. **Auth Isolation**: Every DB query scoped to `session.user.id`
6. **Email Verification**: Token-based verification via `crypto.randomUUID`, stored in DB with expiry
7. **Input Validation**: Zod schemas on all API inputs
8. **Rate Limiting**: Recommended for production AI endpoints
9. **Environment Variables**: Secrets never committed, `.env.example` provided
10. **CI Pipeline**: GitHub Actions runs lint, type-check, test, build on every push/PR

---

## Future AI Integration Ideas

If this were a production product, here are AI features worth exploring:

1. **Smart Scheduling** — "When should I do this?" → AI suggests optimal time based on workload
2. **Task Priority Suggestion** — AI analyzes tasks and suggests High/Medium/Low priority
3. **Habit Analysis** — "You complete 40% more tasks when you start before 9 AM"
4. **Recurring Pattern Detection** — Auto-suggest recurring tasks based on history
5. **Natural Language Search** — "Find all meetings from last week" → semantic search
6. **RAG-powered Context** — Search past tasks to provide context for new ones
7. **Email Integration** — Parse emails into tasks automatically
8. **Voice Input** — Speech-to-text → NL parsing → task creation
