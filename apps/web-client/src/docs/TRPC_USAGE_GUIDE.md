# tRPC Usage Guide — On-Board & Analyze-Profile

> Instructions for implementing the **On-Board** (Flow 1: Vibe Generation)
> and **Analyze-Profile** (Flow 2: Profile Analyzer) pages using tRPC,
> `AsyncBoundary`, and `ErrorDisplay`.

---

## Table of Contents

1. [Architecture Recap](#architecture-recap)
2. [tRPC Hooks & Utilities](#trpc-hooks--utilities)
3. [On-Board — Flow 1: Vibe Generation](#on-board--flow-1-vibe-generation)
4. [Analyze-Profile — Flow 2: Profile Analyzer](#analyze-profile--flow-2-profile-analyzer)
5. [Error Boundary Patterns](#error-boundary-patterns)
6. [SSR Prefetching (Optional)](#ssr-prefetching-optional)

---

## Architecture Recap

```
┌─────────────────────────────────────────────────────────────────────────┐
│  tRPC Client Setup                                                      │
│                                                                         │
│  trpc/client.tsx      → useTRPC()       (client-side React hook)       │
│  trpc/server.tsx      → trpc            (server-side proxy, RSC)       │
│                       → HydrateClient   (SSR dehydration boundary)     │
│                                                                         │
│  server/init.ts       → authedProcedure (requires Clerk session)       │
│                       → publicProcedure (no auth)                      │
│                                                                         │
│  server/routers/app.ts → appRouter.llm.generateVibe  (mutation)        │
│                        → appRouter.llm.analyzeProfile (mutation)        │
│                        → appRouter.vibeProfiles.getMe (query)          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key imports

```tsx
// Client component
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { AsyncBoundary } from "@/components/async-boundary";
import { PageError, CardError, InlineError } from "@/components/error-display";

// Server component (RSC prefetch)
import { trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
```

---

## tRPC Hooks & Utilities

### `useTRPC()`

Returns a tRPC proxy tied to `AppRouter`. Use it to build TanStack Query options:

```tsx
const trpc = useTRPC();

// Query options (for useQuery / useSuspenseQuery)
const opts = trpc.llm.analyzeProfile.mutationOptions();
const opts = trpc.vibeProfiles.getMe.queryOptions();

// Direct usage with TanStack hooks
const query = useQuery(trpc.vibeProfiles.getMe.queryOptions());
const mutation = useMutation(trpc.llm.generateVibe.mutationOptions());
```

### `useSuspenseQuery` vs `useQuery`

| Hook               | Suspense? | Error Boundary? | When to use                  |
| ------------------ | --------- | --------------- | ---------------------------- |
| `useSuspenseQuery` | Yes       | Yes             | Inside `<AsyncBoundary>`     |
| `useQuery`         | No        | No              | Manual `isLoading` / `error` |

**Rule of thumb:** Use `useSuspenseQuery` inside `AsyncBoundary` for automatic
loading/error states. Use `useQuery` when you need granular control.

---

## On-Board — Flow 1: Vibe Generation

### What this page does

1. User uploads 3-5 photos (Supabase Storage)
2. User answers a vibe quiz (rainyFriday, travelStyle, socialBattery, etc.)
3. On submit → call `trpc.llm.generateVibe` mutation
4. On success → redirect to `/dashboard`

### tRPC Procedure

```
appRouter.llm.generateVibe  (mutation)
```

**Input schema:**

```ts
{
  imageUrls: string[]      // 3-5 Supabase Storage URLs
  quizAnswers: Record<string, unknown>
  photoUrls?: string[]     // Optional display URLs
  useMock?: boolean        // Use mock LLM in dev
}
```

**Returns:**

```ts
{
  profile: VibeProfile; // Saved to DB (upserted)
  meta: {
    (cached, durationMs, model, mock);
  }
}
```

### Implementation Guide

```tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AsyncBoundary } from "@/components/async-boundary";

export default function OnBoardPage() {
  return (
    <AsyncBoundary>
      <OnBoardForm />
    </AsyncBoundary>
  );
}

function OnBoardForm() {
  const trpc = useTRPC();
  const router = useRouter();

  // ── Mutation: Generate Vibe via LLM ──────────────────────────────
  const generateVibe = useMutation(
    trpc.llm.generateVibe.mutationOptions({
      onSuccess: (data) => {
        // data.profile = saved VibeProfile
        // data.meta = { cached, durationMs, model }
        router.push("/dashboard");
      },
      onError: (error) => {
        // error.message contains the server error
        // Handle in the UI (toast, inline error, etc.)
      },
    }),
  );

  // ── Submit handler ───────────────────────────────────────────────
  async function handleSubmit(formData: {
    imageUrls: string[];
    quizAnswers: Record<string, unknown>;
  }) {
    generateVibe.mutate({
      imageUrls: formData.imageUrls,
      quizAnswers: formData.quizAnswers,
      useMock: process.env.NODE_ENV === "development",
    });
  }

  return (
    <form onSubmit={/* ... */}>
      {/* Photo upload section */}
      {/* Quiz section */}

      {/* Submit button with loading state */}
      <button type="submit" disabled={generateVibe.isPending}>
        {generateVibe.isPending
          ? "Generating your vibe..."
          : "Generate Vibe Card"}
      </button>

      {/* Inline error display */}
      {generateVibe.isError && (
        <InlineError message={generateVibe.error.message} />
      )}
    </form>
  );
}
```

### Pre-check: Already has profile?

Before showing the on-board form, you may want to check if the user already
has a vibe profile:

```tsx
function OnBoardForm() {
  const trpc = useTRPC();

  // Suspense query — will suspend and let AsyncBoundary show loader
  const { data: existingProfile } = useSuspenseQuery(
    trpc.vibeProfiles.getMe.queryOptions(),
  );

  // Redirect if already on-boarded
  if (existingProfile) {
    redirect("/dashboard"); // from next/navigation
  }

  // ... render form
}
```

---

## Analyze-Profile — Flow 2: Profile Analyzer

### What this page does

1. User uploads a screenshot (dating app profile, social media, etc.)
2. App hashes the image client-side (privacy — no image stored)
3. On submit → call `trpc.llm.analyzeProfile` mutation
4. Display results: predicted style, conversation openers, date suggestions

### tRPC Procedure

```
appRouter.llm.analyzeProfile  (mutation)
```

**Input schema:**

```ts
{
  imageUrl: string        // Supabase Storage URL (temporary)
  imageHash: string       // SHA-256 hash of the image
  hintTags?: string[]     // Optional hints like ["coffee_lover", "traveler"]
  useMock?: boolean
}
```

**Returns:**

```ts
{
  session: AnalyzerSession; // Saved to DB
  meta: {
    (cached, durationMs, model);
  }
}
```

### Implementation Guide

```tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { AsyncBoundary } from "@/components/async-boundary";
import { PageError, CardError } from "@/components/error-display";

export default function AnalyzeProfilePage() {
  return (
    <AsyncBoundary
      errorFallback={({ error, resetErrorBoundary }) => (
        <PageError
          variant="general"
          title="Analysis failed"
          message={error.message}
          onRetry={resetErrorBoundary}
        />
      )}
    >
      <ProfileAnalyzer />
    </AsyncBoundary>
  );
}

function ProfileAnalyzer() {
  const trpc = useTRPC();

  // ── Mutation: Analyze via LLM ────────────────────────────────────
  const analyzeProfile = useMutation(trpc.llm.analyzeProfile.mutationOptions());

  // ── Past sessions (optional — show history) ──────────────────────
  const { data: sessions } = useSuspenseQuery(
    trpc.verification.listAnalyzerSessions.queryOptions({ limit: 5 }),
  );

  // ── Submit handler ───────────────────────────────────────────────
  async function handleAnalyze(
    imageUrl: string,
    imageHash: string,
    tags: string[],
  ) {
    analyzeProfile.mutate({
      imageUrl,
      imageHash,
      hintTags: tags,
      useMock: process.env.NODE_ENV === "development",
    });
  }

  return (
    <div>
      {/* Upload section */}
      {/* Tag selection */}
      {/* Submit button */}

      {/* Mutation states */}
      {analyzeProfile.isPending && <AnalysisSkeleton />}

      {analyzeProfile.isError && (
        <CardError
          title="Analysis failed"
          message={analyzeProfile.error.message}
          onRetry={() => analyzeProfile.reset()}
        />
      )}

      {analyzeProfile.isSuccess && (
        <AnalysisResults session={analyzeProfile.data.session} />
      )}

      {/* Past sessions list */}
      {sessions && sessions.length > 0 && <PastSessions sessions={sessions} />}
    </div>
  );
}
```

---

## Error Boundary Patterns

### 1. `AsyncBoundary` — The Default Pattern

Wraps `QueryErrorResetBoundary` + `ErrorBoundary` + `Suspense`.

```tsx
import { AsyncBoundary } from "@/components/async-boundary";

// Basic — uses default loading spinner + error card
<AsyncBoundary>
  <MyComponent />
</AsyncBoundary>

// Custom loading fallback
<AsyncBoundary loadingFallback={<MySkeleton />}>
  <MyComponent />
</AsyncBoundary>

// Custom error fallback
<AsyncBoundary
  errorFallback={({ error, resetErrorBoundary }) => (
    <PageError
      variant="network"
      message={error.message}
      onRetry={resetErrorBoundary}
    />
  )}
>
  <MyComponent />
</AsyncBoundary>
```

**How it works:**

1. `QueryErrorResetBoundary` — Tells React Query to retry failed queries when
   the error boundary resets
2. `ErrorBoundary` (react-error-boundary) — Catches thrown errors from
   `useSuspenseQuery` or any rendering error
3. `Suspense` — Catches the loading state from `useSuspenseQuery`

### 2. `ErrorDisplay` Components

Three tiers of error UI:

| Component     | Use case            | Size           |
| ------------- | ------------------- | -------------- |
| `PageError`   | Full page errors    | `min-h-[60vh]` |
| `CardError`   | Section/card errors | Compact card   |
| `InlineError` | Inline text errors  | Single line    |

**Variants for `PageError`:**

| Variant    | Icon        | Error Code       |
| ---------- | ----------- | ---------------- |
| `general`  | HeartCrack  | ERR_UNKNOWN      |
| `network`  | WifiOff     | ERR_NETWORK      |
| `auth`     | ShieldAlert | ERR_UNAUTHORIZED |
| `notFound` | FileX2      | ERR_NOT_FOUND    |
| `bug`      | Bug         | ERR_UNKNOWN      |

### 3. Error Mapping Strategy

Map tRPC error codes to `ErrorDisplay` variants:

```tsx
import { TRPCClientError } from "@trpc/client";

function mapErrorVariant(error: Error): ErrorVariant {
  if (error instanceof TRPCClientError) {
    switch (error.data?.code) {
      case "UNAUTHORIZED":
        return "auth";
      case "NOT_FOUND":
        return "notFound";
      case "PRECONDITION_FAILED":
        return "general";
      case "INTERNAL_SERVER_ERROR":
        return "bug";
      default:
        return "general";
    }
  }

  // Network errors
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return "network";
  }

  return "general";
}

// Usage in custom error fallback:
<AsyncBoundary
  errorFallback={({ error, resetErrorBoundary }) => (
    <PageError
      variant={mapErrorVariant(error)}
      message={error.message}
      onRetry={resetErrorBoundary}
    />
  )}
>
  {children}
</AsyncBoundary>;
```

### 4. Mutation Error Handling (Non-Boundary)

Mutations do NOT throw into ErrorBoundary by default. Handle them inline:

```tsx
const mutation = useMutation(trpc.llm.generateVibe.mutationOptions());

// Option A: Inline error display
{
  mutation.isError && <InlineError message={mutation.error.message} />;
}

// Option B: Toast notification
const mutation = useMutation(
  trpc.llm.generateVibe.mutationOptions({
    onError: (error) => {
      toast.error(error.message);
    },
  }),
);

// Option C: Throw into ErrorBoundary (advanced)
// Set throwOnError on the mutation to propagate to boundary
const mutation = useMutation({
  ...trpc.llm.generateVibe.mutationOptions(),
  throwOnError: true, // ⚠️ This will throw into the nearest ErrorBoundary
});
```

### 5. Nested Boundaries

Use nested `AsyncBoundary` for independent error isolation:

```tsx
<AsyncBoundary>
  {" "}
  {/* Page-level */}
  <div className="grid grid-cols-2 gap-4">
    <AsyncBoundary loadingFallback={<CardSkeleton />}>
      {" "}
      {/* Card-level */}
      <ProfileCard />
    </AsyncBoundary>

    <AsyncBoundary loadingFallback={<CardSkeleton />}>
      <MatchesCard />
    </AsyncBoundary>
  </div>
</AsyncBoundary>
```

If `MatchesCard` fails, `ProfileCard` still renders. The card-level boundary
catches the error independently.

---

## SSR Prefetching (Optional)

For optimal UX, prefetch data in a server component and pass through
`HydrateClient`:

```tsx
// on-board/page.tsx (server component — NO "use client")
import { trpc, HydrateClient } from "@/trpc/server";

export default async function OnBoardPage() {
  // Prefetch on server — will be dehydrated into the client
  void trpc.vibeProfiles.getMe.prefetch();

  return (
    <HydrateClient>
      <OnBoardClient />
    </HydrateClient>
  );
}
```

```tsx
// on-board/client.tsx ("use client")
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AsyncBoundary } from "@/components/async-boundary";

function OnBoardClient() {
  return (
    <AsyncBoundary>
      <OnBoardContent />
    </AsyncBoundary>
  );
}

function OnBoardContent() {
  const trpc = useTRPC();
  // This will use the prefetched data — instant render, no loading flash
  const { data: profile } = useSuspenseQuery(
    trpc.vibeProfiles.getMe.queryOptions(),
  );
  // ...
}
```

---

## Quick Reference: tRPC Paths

| Page          | Flow | tRPC Call                                | Type     |
| ------------- | ---- | ---------------------------------------- | -------- |
| **On-Board**  | 1    | `trpc.llm.generateVibe`                  | mutation |
| **On-Board**  | —    | `trpc.vibeProfiles.getMe`                | query    |
| **Analyze**   | 2    | `trpc.llm.analyzeProfile`                | mutation |
| **Analyze**   | —    | `trpc.verification.listAnalyzerSessions` | query    |
| **Analyze**   | —    | `trpc.verification.getAnalyzerSession`   | query    |
| **Dashboard** | —    | `trpc.vibeProfiles.getMe`                | query    |
| **Dashboard** | 3    | `trpc.llm.evaluateMatch`                 | mutation |
| **Dashboard** | 3b   | `trpc.llm.findAndEvaluateMatches`        | mutation |
