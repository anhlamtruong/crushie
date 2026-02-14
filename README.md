# Monorepo Starter

A full-stack monorepo template featuring:

- **Web Client**: Next.js 16 + TypeScript + tRPC + Drizzle ORM + Clerk Auth + Tailwind CSS
- **LLM Service**: Express + TypeScript + MongoDB + Google Gemini AI
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Edge Functions**: Deno-based Supabase Edge Functions

## 📁 Project Structure

```
monorepo-starter/
├── apps/
│   ├── web-client/          # Next.js frontend
│   └── llm/                  # Express backend
├── supabase/
│   ├── config.toml          # Supabase configuration
│   └── functions/           # Edge Functions
└── package.json             # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker (for Supabase local development)
- npm or pnpm

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start Supabase (Local)

```bash
npm run supa:start
```

### 4. Run Database Migrations

```bash
npm run db:migrate
```

### 5. Start Development Servers

**Web Client:**

```bash
npm run dev:web
```

**LLM Service:**

```bash
npm run dev:llm
```

## 🔧 Available Scripts

| Script        | Description                     |
| ------------- | ------------------------------- |
| `dev:web`     | Start web client dev server     |
| `build:web`   | Build web client for production |
| `dev:llm`     | Start LLM service dev server    |
| `build:llm`   | Build LLM service               |
| `db:generate` | Generate Drizzle migrations     |
| `db:migrate`  | Run database migrations         |
| `db:push`     | Push schema changes (dev only)  |
| `db:studio`   | Open Drizzle Studio             |
| `supa:start`  | Start local Supabase            |
| `supa:stop`   | Stop local Supabase             |
| `func:serve`  | Serve Edge Functions locally    |
| `func:deploy` | Deploy Edge Functions           |

## 📚 Stack Details

### Web Client (`apps/web-client`)

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **API**: tRPC + Hono
- **Database**: Drizzle ORM + PostgreSQL
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Query + Zustand

### LLM Service (`apps/llm`)

- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **AI**: Google Gemini
- **Language**: TypeScript

### Database

- **Provider**: Supabase (PostgreSQL)
- **ORM**: Drizzle
- **Security**: Row Level Security (RLS)

## 🔐 Authentication Flow

1. User signs in via Clerk
2. Clerk JWT is passed to Supabase via `secure-client.ts`
3. Supabase RLS policies enforce data access based on `auth.uid()`

## 📝 Adding New Features

### 1. Add a New Database Table

```typescript
// apps/web-client/src/services/your-feature/schema/index.ts
export const yourTable = pgTable("your_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  // ... fields
});
```

### 2. Add tRPC Procedures

```typescript
// apps/web-client/src/services/your-feature/procedures/index.ts
export const yourRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // ...
  }),
});
```

### 3. Register Router

```typescript
// apps/web-client/src/server/routers/app.ts
export const appRouter = router({
  // ...
  yourFeature: yourRouter,
});
```

## 📄 License

MIT
