# LLM Mock API — Front-End Integration Guide

> **Base URL:** `http://localhost:3001` (default dev port)

This document covers the two mock endpoints for the **Vibe Profile** (self-onboarding) and **Analyzer** (tactical advice) flows. These return realistic mock data matching the Drizzle schemas (`vibe_profiles` and `analyzer_sessions`) so front-end development can proceed without a live Gemini connection.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Flow 1 — Vibe Profile (Self-Onboarding)](#flow-1--vibe-profile-self-onboarding)
  - [POST /api/vibe-profile/generate](#post-apivibe-profilegenerate)
  - [GET /api/vibe-profile/presets](#get-apivibe-profilepresets)
- [Flow 2 — Analyzer (Tactical Advice)](#flow-2--analyzer-tactical-advice)
  - [POST /api/analyzer/analyze](#post-apianalyzeranalyze)
  - [GET /api/analyzer/styles](#get-apianalyzerstyles)
- [Response Envelope](#response-envelope)
- [Schema Reference](#schema-reference)
- [Error Handling](#error-handling)
- [Example Integration (React / Next.js)](#example-integration-react--nextjs)

---

## Quick Start

```bash
# From monorepo root
cd apps/llm
npm run dev
# → LLM prompt service running on http://localhost:3001
```

No environment variables required for mock endpoints (no Gemini key, no Redis needed).

---

## Flow 1 — Vibe Profile (Self-Onboarding)

### `POST /api/vibe-profile/generate`

Generate a mock **Vibe Card** from quiz answers and photos.

#### Request

```bash
curl -X POST http://localhost:3001/api/vibe-profile/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_abc123",
    "quizAnswers": {
      "q1_rainy_friday": "vinyl_and_chill",
      "q2_travel_style": "spontaneous_adventure",
      "q3_social_battery": "selective_social",
      "q4_ideal_weekend": "explore_new_neighborhood",
      "q5_music_mood": "indie_folk"
    },
    "photoUrls": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg",
      "https://example.com/photo3.jpg"
    ]
  }'
```

#### Request Body

| Field         | Type                      | Required | Description                              |
| ------------- | ------------------------- | -------- | ---------------------------------------- |
| `userId`      | `string`                  | ✅       | The authenticated user's ID              |
| `quizAnswers` | `Record<string, unknown>` | ✅       | Key-value pairs from the 5-question quiz |
| `photoUrls`   | `string[]`                | ❌       | 3–5 image URLs (validated as URLs)       |

#### Response (200)

```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "userId": "user_abc123",
    "vibeName": "The Urban Minimalist",
    "vibeSummary": "Clean lines, quiet cafés, and a perfectly curated playlist...",
    "energy": "chill",
    "moodTags": ["calm", "introspective", "content"],
    "styleTags": ["minimalist", "monochrome", "clean"],
    "interestTags": [
      "architecture",
      "specialty coffee",
      "vinyl records",
      "film photography"
    ],
    "quizAnswers": { "q1_rainy_friday": "vinyl_and_chill", "...": "..." },
    "photoUrls": ["https://example.com/photo1.jpg", "..."],
    "isActive": true,
    "createdAt": "2026-02-10T12:00:00.000Z",
    "updatedAt": "2026-02-10T12:00:00.000Z"
  },
  "meta": {
    "mock": true,
    "durationMs": 2,
    "message": "This is mock data. In production, Gemini Flash will analyze photos and quiz answers."
  }
}
```

The `data` object follows the **`vibe_profiles`** table schema exactly.

---

### `GET /api/vibe-profile/presets`

Lists all available vibe preset names and a sample quiz payload for testing.

#### Response (200)

```json
{
  "presets": [
    "The Urban Minimalist",
    "The High-Energy Foodie",
    "The Chaotic Creative",
    "The Cozy Homebody",
    "The Sunset Chaser",
    "The Night Owl Intellectual"
  ],
  "quizSample": {
    "q1_rainy_friday": "vinyl_and_chill",
    "q2_travel_style": "spontaneous_adventure",
    "q3_social_battery": "selective_social",
    "q4_ideal_weekend": "explore_new_neighborhood",
    "q5_music_mood": "indie_folk"
  }
}
```

---

## Flow 2 — Analyzer (Tactical Advice)

### `POST /api/analyzer/analyze`

Analyze a profile screenshot and return tactical dating advice.

#### Request

```bash
curl -X POST http://localhost:3001/api/analyzer/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_abc123",
    "imageHash": "a3f2b8c91d4e5f6789abcdef01234567",
    "hintTags": ["University student", "Loves hiking", "Dog person"]
  }'
```

#### Request Body

| Field       | Type       | Required | Description                                                    |
| ----------- | ---------- | -------- | -------------------------------------------------------------- |
| `userId`    | `string`   | ✅       | The authenticated user's ID                                    |
| `imageHash` | `string`   | ✅       | Hash of the uploaded screenshot (image is NOT sent to the LLM) |
| `hintTags`  | `string[]` | ❌       | Optional context tags (max 10)                                 |

> **Note:** The front-end should hash the screenshot client-side and only send the hash. The actual image analysis will happen in production via Gemini's multimodal API.

#### Response (200)

```json
{
  "data": {
    "id": "e5f6a7b8-...",
    "userId": "user_abc123",
    "imageHash": "a3f2b8c91d4e5f6789abcdef01234567",
    "hintTags": ["University student", "Loves hiking", "Dog person"],
    "predictedStyle": "adventurous",
    "vibePrediction": {
      "confidence": 0.87,
      "dominantTrait": "adventurous",
      "secondaryTrait": "playful",
      "summary": "Thrill-seeker who values experiences over things...",
      "communicationTips": [
        "Suggest activities, not just 'let's hang out'",
        "Share your own adventure stories",
        "Be spontaneous — surprises work well"
      ]
    },
    "conversationOpeners": [
      "What's on your bucket list that you haven't told anyone about yet?",
      "I need a travel buddy for my next trip. Sell me on your best quality as a co-adventurer.",
      "Mountains or ocean? (There's a right answer, and it determines our entire future.)"
    ],
    "dateSuggestions": [
      {
        "title": "Sunrise Hike",
        "description": "Wake up way too early, hike to a viewpoint, watch the sunrise...",
        "vibeMatch": 0.96,
        "estimatedCost": "Free",
        "duration": "3-4 hours"
      },
      {
        "title": "Kayaking + Picnic",
        "description": "Paddle to somewhere beautiful, eat sandwiches on a rock...",
        "vibeMatch": 0.91,
        "estimatedCost": "$$",
        "duration": "4-5 hours"
      },
      {
        "title": "Random Bus Challenge",
        "description": "Get on a random bus, get off at a random stop, explore...",
        "vibeMatch": 0.88,
        "estimatedCost": "$",
        "duration": "3+ hours"
      }
    ],
    "modelVersion": "mock-v1.0.0",
    "latencyMs": 423,
    "createdAt": "2026-02-10T12:00:00.000Z"
  },
  "meta": {
    "mock": true,
    "durationMs": 1,
    "message": "This is mock data. In production, Gemini Flash will analyze the screenshot for style cues."
  }
}
```

The `data` object follows the **`analyzer_sessions`** table schema exactly.

---

### `GET /api/analyzer/styles`

Lists all predicted communication styles and example hint tags for testing.

#### Response (200)

```json
{
  "styles": ["direct", "playful", "intellectual", "shy", "adventurous"],
  "hintTagExamples": [
    "University student",
    "Loves hiking",
    "Foodie",
    "Dog person",
    "Gym enthusiast",
    "Music lover",
    "Bookworm",
    "Traveler"
  ]
}
```

---

## Response Envelope

All endpoints return this consistent envelope:

```typescript
type ApiResponse<T> = {
  data: T;
  meta: {
    mock: boolean; // always true for these endpoints
    durationMs: number; // processing time in milliseconds
    message: string; // human-readable note
  };
};
```

---

## Schema Reference

### VibeProfile (`data` from `/api/vibe-profile/generate`)

| Field          | Type                                           | Description                          |
| -------------- | ---------------------------------------------- | ------------------------------------ |
| `id`           | `uuid`                                         | Auto-generated unique ID             |
| `userId`       | `string`                                       | User who owns this profile           |
| `vibeName`     | `string`                                       | Generated vibe title                 |
| `vibeSummary`  | `string`                                       | AI-generated personality summary     |
| `energy`       | `"chill" \| "moderate" \| "high" \| "chaotic"` | Energy level classification          |
| `moodTags`     | `string[]`                                     | Mood descriptors                     |
| `styleTags`    | `string[]`                                     | Style/aesthetic descriptors          |
| `interestTags` | `string[]`                                     | Interest keywords                    |
| `quizAnswers`  | `object`                                       | Original quiz answers (pass-through) |
| `photoUrls`    | `string[]`                                     | Original photo URLs (pass-through)   |
| `isActive`     | `boolean`                                      | Always `true` for new profiles       |
| `createdAt`    | `string (ISO 8601)`                            | Creation timestamp                   |
| `updatedAt`    | `string (ISO 8601)`                            | Last update timestamp                |

### AnalyzerSession (`data` from `/api/analyzer/analyze`)

| Field                 | Type                                                                | Description                           |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------- |
| `id`                  | `uuid`                                                              | Auto-generated session ID             |
| `userId`              | `string`                                                            | User who requested the analysis       |
| `imageHash`           | `string`                                                            | Hash of the analyzed screenshot       |
| `hintTags`            | `string[]`                                                          | Context tags provided by user         |
| `predictedStyle`      | `"direct" \| "playful" \| "intellectual" \| "shy" \| "adventurous"` | AI-predicted communication style      |
| `vibePrediction`      | `object`                                                            | Detailed prediction (see below)       |
| `conversationOpeners` | `string[]`                                                          | 3 context-aware conversation starters |
| `dateSuggestions`     | `object[]`                                                          | 3 personalized date ideas (see below) |
| `modelVersion`        | `string`                                                            | Model version (`"mock-v1.0.0"`)       |
| `latencyMs`           | `number`                                                            | Simulated processing latency          |
| `createdAt`           | `string (ISO 8601)`                                                 | Session creation timestamp            |

#### `vibePrediction` shape

```typescript
{
  confidence: number;         // 0-1
  dominantTrait: string;      // primary communication style
  secondaryTrait: string;     // secondary trait
  summary: string;            // human-readable analysis
  communicationTips: string[]; // actionable tips
}
```

#### `dateSuggestions[n]` shape

```typescript
{
  title: string; // date idea name
  description: string; // detailed description
  vibeMatch: number; // 0-1 compatibility score
  estimatedCost: string; // "$", "$$", or "Free"
  duration: string; // estimated duration
}
```

---

## Error Handling

All validation errors return **400** with this shape:

```json
{
  "error": "Invalid request",
  "details": [
    {
      "code": "too_small",
      "minimum": 3,
      "type": "array",
      "inclusive": true,
      "exact": false,
      "message": "At least 3 photos are required",
      "path": ["photoUrls"]
    }
  ]
}
```

Server errors return **500**:

```json
{
  "error": "Internal server error",
  "message": "..." // only in development
}
```

---

## Example Integration (React / Next.js)

### Vibe Profile Generation

```typescript
// services/llm-api.ts
const LLM_BASE_URL = process.env.NEXT_PUBLIC_LLM_URL || "http://localhost:3001";

export async function generateVibeProfile(
  userId: string,
  quizAnswers: Record<string, string>,
  photoUrls: string[],
) {
  const res = await fetch(`${LLM_BASE_URL}/api/vibe-profile/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, quizAnswers, photoUrls }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to generate vibe profile");
  }

  return res.json(); // { data: VibeProfile, meta: {...} }
}
```

### Analyzer Session

```typescript
export async function analyzeProfile(
  userId: string,
  imageHash: string,
  hintTags?: string[],
) {
  const res = await fetch(`${LLM_BASE_URL}/api/analyzer/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, imageHash, hintTags }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to analyze profile");
  }

  return res.json(); // { data: AnalyzerSession, meta: {...} }
}
```

### Usage in a Component

```tsx
"use client";

import { generateVibeProfile } from "@/services/llm-api";

function OnboardingPage() {
  const handleSubmit = async (
    quizAnswers: Record<string, string>,
    photos: string[],
  ) => {
    const { data: vibeProfile } = await generateVibeProfile(
      "current-user-id",
      quizAnswers,
      photos,
    );

    console.log(vibeProfile.vibeName); // "The Urban Minimalist"
    console.log(vibeProfile.energy); // "chill"
    console.log(vibeProfile.moodTags); // ["calm", "introspective", "content"]
    console.log(vibeProfile.interestTags); // ["architecture", "specialty coffee", ...]

    // Save to DB via your tRPC mutation, etc.
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Endpoints Summary

| Method | Path                         | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| POST   | `/api/vibe-profile/generate` | Generate a Vibe Card (mock)         |
| GET    | `/api/vibe-profile/presets`  | List vibe presets & sample quiz     |
| POST   | `/api/analyzer/analyze`      | Analyze a profile screenshot (mock) |
| GET    | `/api/analyzer/styles`       | List styles & hint tag examples     |
| GET    | `/api/health`                | Service health check                |
