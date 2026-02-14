# Mobile Client — Developer Guide & Prompt

> Comprehensive guide for building a **React Native / Expo** mobile client
> that consumes the **Hono REST API** at `/api/mobile`.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Base Configuration](#base-configuration)
4. [API Reference](#api-reference)
   - [Users](#users)
   - [Vibe Profiles](#vibe-profiles)
   - [Social](#social)
   - [Missions](#missions)
   - [Verification](#verification)
   - [LLM Pipelines](#llm-pipelines)
   - [Examples](#examples)
5. [Error Handling](#error-handling)
6. [Recommended Libraries](#recommended-libraries)
7. [AI Prompt: Mobile App Scaffold](#ai-prompt-mobile-app-scaffold)

---

## Architecture Overview

```
┌─────────────────────┐        ┌──────────────────────────────────────┐
│  Mobile Client      │  HTTP  │  Next.js App Router                  │
│  (Expo / RN)        │───────▶│  /api/mobile/[...route]/route.ts     │
│                     │        │  ↕ Hono middleware (CORS + Clerk)     │
│  @clerk/expo        │        │  ↕ Hono route handlers               │
│  TanStack Query     │        │  ↕ Drizzle ORM → Supabase            │
│                     │        │  ↕ LLM client → apps/llm             │
└─────────────────────┘        └──────────────────────────────────────┘
```

**Key points:**

- Mobile sends `Authorization: Bearer <clerk_session_jwt>` on every request
- All endpoints return `{ data: T }` (or `{ error: string }` on failure)
- No superjson — all responses are plain JSON
- Base URL: `https://<your-domain>/api/mobile`

---

## Authentication Flow

### 1. Install Clerk for Expo

```bash
npx expo install @clerk/clerk-expo expo-secure-store
```

### 2. Configure ClerkProvider

```tsx
// app/_layout.tsx
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/token-cache";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
```

### 3. Token Cache (expo-secure-store)

```ts
// lib/token-cache.ts
import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/clerk-expo";

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};
```

### 4. Get Session Token for API Calls

```ts
import { useAuth } from "@clerk/clerk-expo";

const { getToken } = useAuth();
const token = await getToken(); // Clerk session JWT
```

---

## Base Configuration

### API Client

```ts
// lib/api.ts
import { useAuth } from "@clerk/clerk-expo";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://your-app.vercel.app";

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token: string;
  params?: Record<string, string | number>;
};

export async function api<T>(path: string, opts: ApiOptions): Promise<T> {
  const url = new URL(`/api/mobile${path}`, BASE_URL);

  if (opts.params) {
    Object.entries(opts.params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v)),
    );
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.token}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, err.error ?? "Unknown error");
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

### TanStack Query Integration

```ts
// hooks/use-api.ts
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useApiQuery<T>(
  key: string[],
  path: string,
  params?: Record<string, string | number>,
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api<{ data: T }>(path, { token, params });
    },
  });
}

export function useApiMutation<TInput, TOutput>(
  path: string,
  opts?: {
    method?: "POST" | "PATCH" | "PUT" | "DELETE";
    onSuccess?: () => void;
  },
) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: TInput) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api<{ data: TOutput }>(path, {
        method: opts?.method ?? "POST",
        body,
        token,
      });
    },
    onSuccess: () => {
      opts?.onSuccess?.();
    },
  });
}
```

---

## API Reference

### Users

| Method | Path          | Description          |
| ------ | ------------- | -------------------- |
| GET    | `/users/me`   | Get current user     |
| PATCH  | `/users/me`   | Update profile       |
| POST   | `/users/sync` | Sync from Clerk data |

**PATCH /users/me**

```json
{ "firstName": "Lam", "lastName": "Nguyen" }
→ { "data": { "id": "user_xxx", "firstName": "Lam", ... } }
```

**POST /users/sync**

```json
{
  "email": "lam@example.com",
  "firstName": "Lam",
  "lastName": "Nguyen",
  "imageUrl": "https://img.clerk.com/xxx"
}
→ { "data": { "id": "user_xxx", ... } }
```

---

### Vibe Profiles

| Method | Path                          | Description            |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/vibe-profiles/me`           | Get my vibe profile    |
| POST   | `/vibe-profiles`              | Create / upsert        |
| PATCH  | `/vibe-profiles`              | Partial update         |
| POST   | `/vibe-profiles/similar`      | pgvector search        |
| GET    | `/vibe-profiles/user/:userId` | Get user's public card |

**POST /vibe-profiles**

```json
{
  "vibeName": "Cosmic Dreamer",
  "vibeSummary": "Chases sunsets and vinyl records",
  "energy": "chill",
  "moodTags": ["dreamy", "romantic"],
  "styleTags": ["indie", "vintage"],
  "interestTags": ["photography", "travel"],
  "quizAnswers": { "rainyFriday": "vinyl_chill" },
  "photoUrls": ["https://storage.example.com/photo1.jpg"]
}
```

**POST /vibe-profiles/similar**

```json
{ "limit": 10, "threshold": 0.7 }
→ { "data": [ { "user_id": "xxx", "similarity": 0.85, ... } ] }
```

---

### Social

#### Connections

| Method | Path                      | Description            |
| ------ | ------------------------- | ---------------------- |
| GET    | `/social/connections`     | List (opt: `?status=`) |
| POST   | `/social/connections`     | Send request           |
| PATCH  | `/social/connections/:id` | Accept / block         |
| DELETE | `/social/connections/:id` | Remove                 |

#### Matches

| Method | Path                                       | Description          |
| ------ | ------------------------------------------ | -------------------- |
| GET    | `/social/matches?limit=20`                 | List my matches      |
| GET    | `/social/matches/mutuals?targetUserId=xxx` | Check mutual friends |

#### Vouches

| Method | Path                               | Description         |
| ------ | ---------------------------------- | ------------------- |
| GET    | `/social/vouches`                  | My vouches received |
| POST   | `/social/vouches`                  | Give vouch          |
| DELETE | `/social/vouches/:id`              | Remove vouch        |
| GET    | `/social/vouches/summary?userId=x` | Tag summary         |

**POST /social/vouches**

```json
{
  "subjectId": "user_xxx",
  "tag": "great_conversation",
  "isAnonymous": true
}
```

Valid tags: `looks_like_photos`, `safe_vibes`, `great_conversation`, `funny`, `respectful`, `adventurous`, `good_listener`, `creative`

#### Crush List

| Method | Path                     | Description   |
| ------ | ------------------------ | ------------- |
| GET    | `/social/crush-list`     | My crush list |
| POST   | `/social/crush-list`     | Add crush     |
| DELETE | `/social/crush-list/:id` | Remove crush  |

#### Points

| Method | Path                     | Description        |
| ------ | ------------------------ | ------------------ |
| GET    | `/social/points`         | Total points       |
| GET    | `/social/points/history` | Ledger (`?limit=`) |

---

### Missions

#### Templates

| Method | Path                                           | Description           |
| ------ | ---------------------------------------------- | --------------------- |
| GET    | `/missions/templates?type=&difficulty=&limit=` | List active templates |
| GET    | `/missions/templates/:id`                      | Get template by ID    |

#### Instances

| Method | Path                                 | Description     |
| ------ | ------------------------------------ | --------------- |
| POST   | `/missions/instances`                | Propose mission |
| GET    | `/missions/instances?status=&limit=` | My missions     |
| POST   | `/missions/instances/:id/accept`     | Accept          |
| POST   | `/missions/instances/:id/start`      | Start           |
| POST   | `/missions/instances/:id/decline`    | Decline         |

**POST /missions/instances**

```json
{
  "templateId": "uuid",
  "matchId": "uuid",
  "customTitle": "Coffee Roulette",
  "locationName": "Cafe Apartment",
  "locationLat": 10.7769,
  "locationLng": 106.7009
}
```

#### Progress

| Method | Path                                       | Description        |
| ------ | ------------------------------------------ | ------------------ |
| POST   | `/missions/progress/:instanceId/objective` | Complete objective |
| POST   | `/missions/progress/:instanceId/checkin`   | Check-in w/ proof  |
| GET    | `/missions/progress/:instanceId`           | My progress        |

**POST /missions/progress/:instanceId/checkin**

```json
{
  "proof": {
    "selfieUrl": "https://storage.example.com/selfie.jpg",
    "geo": { "lat": 10.7769, "lng": 106.7009 },
    "ts": "2025-01-15T10:30:00Z"
  }
}
→ { "data": { "completed": true, "pointsAwarded": 100 } }
   or
→ { "data": { "completed": false, "waitingForPartner": true } }
```

---

### Verification

| Method | Path                                  | Description          |
| ------ | ------------------------------------- | -------------------- |
| GET    | `/verification/status`                | My verifications     |
| GET    | `/verification/check?type=xxx`        | Check specific type  |
| POST   | `/verification/request`               | Request verification |
| GET    | `/verification/badges?userId=xxx`     | User's badges        |
| POST   | `/verification/analyze`               | Analyzer stub        |
| GET    | `/verification/analyzer-sessions`     | List sessions        |
| GET    | `/verification/analyzer-sessions/:id` | Get session by ID    |

**POST /verification/request**

```json
{
  "type": "selfie_liveness",
  "proofHash": "sha256:abc123",
  "metadata": { "deviceId": "xxx" }
}
```

Types: `selfie_liveness`, `photo_match`, `phone`, `social_vouch`

---

### LLM Pipelines

| Method | Path                             | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| POST   | `/llm/generate-vibe`             | Pipeline 1: Vibe Generation  |
| POST   | `/llm/analyze-profile`           | Pipeline 2: Profile Analyzer |
| POST   | `/llm/evaluate-match`            | Pipeline 3: Compatibility    |
| POST   | `/llm/find-and-evaluate-matches` | Pipeline 3b: Batch matches   |

**POST /llm/generate-vibe**

```json
{
  "imageUrls": [
    "https://storage.supabase.co/photo1.jpg",
    "https://storage.supabase.co/photo2.jpg",
    "https://storage.supabase.co/photo3.jpg"
  ],
  "quizAnswers": {
    "rainyFriday": "vinyl_chill",
    "travelStyle": "spontaneous",
    "socialBattery": "ambivert"
  },
  "useMock": false
}
→ {
  "data": {
    "profile": { "id": "uuid", "vibeName": "Cosmic Dreamer", ... },
    "meta": { "cached": false, "durationMs": 3200, "model": "gemini-2.5-flash" }
  }
}
```

**POST /llm/analyze-profile**

```json
{
  "imageUrl": "https://storage.supabase.co/screenshot.jpg",
  "imageHash": "sha256:abc123",
  "hintTags": ["coffee_lover", "traveler"],
  "useMock": false
}
→ {
  "data": {
    "session": { "predictedStyle": "playful", "conversationOpeners": [...], ... },
    "meta": { "durationMs": 2100 }
  }
}
```

**POST /llm/evaluate-match**

```json
{
  "targetUserId": "user_xxx",
  "useMock": false
}
→ {
  "data": {
    "compatibility": { "score": 0.87, "narrative": "...", "commonGround": [...] },
    "meta": { "durationMs": 1500 },
    "vectorSimilarity": 0.82
  }
}
```

**POST /llm/find-and-evaluate-matches**

```json
{
  "limit": 5,
  "threshold": 0.7,
  "useMock": false
}
→ {
  "data": {
    "matches": [
      { "userId": "user_a", "vibeName": "...", "score": 0.92, "narrative": "...", ... },
      { "userId": "user_b", "vibeName": "...", "score": 0.85, ... }
    ]
  }
}
```

---

### Examples

| Method | Path               | Description |
| ------ | ------------------ | ----------- |
| GET    | `/examples`        | My examples |
| GET    | `/examples/public` | All public  |
| GET    | `/examples/:id`    | Get by ID   |
| POST   | `/examples`        | Create      |
| PATCH  | `/examples/:id`    | Update      |
| DELETE | `/examples/:id`    | Delete      |

---

## Error Handling

All errors return:

```json
{ "error": "Human-readable message" }
```

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| 400    | Bad request / validation error              |
| 401    | Missing or invalid Clerk JWT                |
| 404    | Resource not found                          |
| 412    | Precondition failed (e.g., no vibe profile) |
| 500    | Internal server error                       |

### Mobile Error Handling Pattern

```tsx
import { ApiError } from "@/lib/api";

function ProfileScreen() {
  const { data, error, isLoading } = useApiQuery<VibeProfile>(
    ["vibe-profile", "me"],
    "/vibe-profiles/me",
  );

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          return <SignInPrompt />;
        case 412:
          return <CreateProfileCTA />;
        default:
          return <ErrorView message={error.message} />;
      }
    }
    return <ErrorView message="Something went wrong" />;
  }

  return <VibeCard profile={data!.data} />;
}
```

---

## Recommended Libraries

| Library                 | Purpose                 |
| ----------------------- | ----------------------- |
| `@clerk/clerk-expo`     | Authentication          |
| `expo-secure-store`     | Token persistence       |
| `@tanstack/react-query` | Data fetching & caching |
| `expo-image`            | High-performance images |
| `expo-image-picker`     | Photo upload            |
| `expo-location`         | GPS for check-in        |
| `expo-camera`           | Selfie liveness capture |
| `moti` / `reanimated`   | Animations              |
| `nativewind`            | Tailwind for RN         |
| `zustand`               | Client state            |
| `zod`                   | Input validation        |

---

## AI Prompt: Mobile App Scaffold

Use this prompt with an AI assistant to scaffold the mobile client:

---

**PROMPT:**

> Build a **React Native / Expo** mobile app for the "Tình Yêu Chu Chubé" dating platform.
>
> **Tech Stack:**
>
> - Expo SDK 53+ with Expo Router (file-based routing)
> - TypeScript strict mode
> - @clerk/clerk-expo for auth (publishable key in EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY)
> - @tanstack/react-query v5 for data fetching
> - NativeWind v4 for styling (Tailwind CSS classes)
> - Zustand for client state
> - expo-image-picker, expo-location, expo-camera
>
> **API Layer:**
>
> - Base URL: `EXPO_PUBLIC_API_URL/api/mobile`
> - Auth: `Authorization: Bearer <clerk_session_jwt>`
> - All responses: `{ data: T }` or `{ error: string }`
> - See API Reference in `MOBILE_CLIENT.md`
>
> **Core Screens:**
>
> 1. **On-Board** — Upload 3-5 photos + answer quiz → `POST /llm/generate-vibe`
> 2. **Dashboard** — Show my vibe card (`GET /vibe-profiles/me`), points, matches
> 3. **Discover** — Browse similar profiles (`POST /vibe-profiles/similar`), swipe to evaluate (`POST /llm/evaluate-match`)
> 4. **Analyze** — Upload screenshot → `POST /llm/analyze-profile` → show predicted style & openers
> 5. **Missions** — List missions (`GET /missions/instances`), accept, start, check-in with selfie + GPS
> 6. **Social** — Connections, vouches, crush list
> 7. **Verification** — Selfie liveness, photo match badges
> 8. **Profile** — Edit profile, settings, points history
>
> **Error Handling:**
>
> - Show toast for 4xx errors
> - Full-screen error for 500s with retry
> - Auth redirect on 401
>
> **Folder Structure:**
>
> ```
> app/
>   _layout.tsx          # ClerkProvider + QueryClientProvider
>   (auth)/
>     sign-in.tsx
>     sign-up.tsx
>   (tabs)/
>     _layout.tsx        # Bottom tab navigator
>     index.tsx          # Dashboard
>     discover.tsx       # Discover & match
>     missions.tsx       # Mission list
>     profile.tsx        # My profile
>   on-board.tsx
>   analyze.tsx
>   social/
>     connections.tsx
>     vouches.tsx
>     crush-list.tsx
> lib/
>   api.ts               # Fetch wrapper with auth
>   token-cache.ts       # Expo SecureStore token cache
> hooks/
>   use-api.ts           # useApiQuery, useApiMutation
> components/
>   vibe-card.tsx
>   match-card.tsx
>   mission-card.tsx
>   loading.tsx
>   error-view.tsx
> ```

---

## Environment Variables

```env
# Mobile (.env)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_API_URL=https://your-app.vercel.app

# Server (already set in web-client)
CLERK_SECRET_KEY=sk_test_xxx
DATABASE_URL=postgresql://...
LLM_URL=http://localhost:3001
LLM_SERVICE_TOKEN=xxx
```
