# SYSTEM_DESIGN.md — Crushie "Date-Coach" Platform

> Complete data schema, system architecture, API specs, RLS policy map.

---

## Table of Contents

1. [Data Schema (ER Overview)](#1-data-schema)
2. [Table Specifications](#2-table-specifications)
3. [pgvector Strategy](#3-pgvector-strategy)
4. [RLS Policy Map](#4-rls-policy-map)
5. [API Specification (tRPC)](#5-api-specification)
6. [System Architecture](#6-system-architecture)
7. [LLM Prompt Templates (New)](#7-llm-prompt-templates)
8. [Mission State Machine](#8-mission-state-machine)
9. [Eraser.io Diagram Prompt](#9-eraserio-diagram-prompt)

---

## 1. Data Schema

### Entity-Relationship Overview

```
┌────────────┐       1:1        ┌──────────────────┐
│   users    │─────────────────▶│  vibe_profiles   │
│            │                  │  + vector(1536)  │
│  (Clerk ID)│       1:N        │                  │
│            │─────────┐        └──────────────────┘
└─────┬──────┘         │                │
      │                │                │ cosine similarity
      │ 1:N            │                ▼
      │          ┌─────▼──────┐  ┌──────────────────┐
      │          │ connections │  │   vibe_matches   │
      │          │(social graph)│  │ (AI pairings)    │
      │          └────────────┘  └────────┬─────────┘
      │                                   │ 1:N
      │ 1:N                               ▼
      ├──────────────────┐       ┌──────────────────┐
      │                  │       │mission_instances │
      │                  │       │ (per match)       │
      │                  │       └────────┬─────────┘
      │                  │                │ N:1
      │                  │                ▼
      │           ┌──────▼────┐  ┌──────────────────┐
      │           │ verifi-   │  │mission_templates │
      │           │ cations   │  │ (catalogue)       │
      │           └───────────┘  └──────────────────┘
      │
      ├── 1:N ──▶ vibe_vouches        (friend-filter)
      ├── 1:N ──▶ crush_list          (privacy cloak)
      ├── 1:N ──▶ analyzer_sessions   (tactical advice)
      ├── 1:N ──▶ user_mission_progress
      └── 1:N ──▶ vibe_points_ledger  (gamification)
```

---

## 2. Table Specifications

### 2.1 `users` (existing)

| Column     | Type        | Notes         |
| ---------- | ----------- | ------------- |
| id         | TEXT PK     | Clerk user ID |
| email      | TEXT UQ     |               |
| first_name | TEXT        |               |
| last_name  | TEXT        |               |
| image_url  | TEXT        |               |
| is_active  | BOOL        | default TRUE  |
| created_at | TIMESTAMPTZ |               |
| updated_at | TIMESTAMPTZ |               |

### 2.2 `vibe_profiles`

| Column        | Type             | Notes                             |
| ------------- | ---------------- | --------------------------------- |
| id            | UUID PK          |                                   |
| user_id       | TEXT FK→users    | UNIQUE (one active per user)      |
| vibe_name     | TEXT NOT NULL    | "The Urban Minimalist"            |
| vibe_summary  | TEXT             | 1-2 sentence AI summary           |
| energy        | ENUM             | chill / moderate / high / chaotic |
| mood_tags     | TEXT[]           | e.g. {"cozy","artsy","nocturnal"} |
| style_tags    | TEXT[]           | from Gemini photo analysis        |
| interest_tags | TEXT[]           | from quiz + photos                |
| quiz_answers  | JSONB            | raw quiz response blob            |
| photo_urls    | TEXT[]           | refs to analyzed images           |
| **embedding** | **vector(1536)** | **pgvector cosine similarity**    |
| is_active     | BOOL             | default TRUE                      |
| created_at    | TIMESTAMPTZ      |                                   |
| updated_at    | TIMESTAMPTZ      |                                   |

### 2.3 `connections`

| Column       | Type                   | Notes                          |
| ------------ | ---------------------- | ------------------------------ |
| id           | UUID PK                |                                |
| requester_id | TEXT FK→users          |                                |
| addressee_id | TEXT FK→users          |                                |
| status       | ENUM                   | pending / accepted / blocked   |
| created_at   | TIMESTAMPTZ            |                                |
| updated_at   | TIMESTAMPTZ            |                                |
| **UNIQUE**   | (requester, addressee) | **CHECK**: no self-connections |

### 2.4 `vibe_matches`

| Column        | Type           | Notes                      |
| ------------- | -------------- | -------------------------- |
| id            | UUID PK        |                            |
| user_a_id     | TEXT FK→users  |                            |
| user_b_id     | TEXT FK→users  |                            |
| similarity    | FLOAT NOT NULL | cosine similarity 0..1     |
| compatibility | JSONB          | AI breakdown per dimension |
| is_mutual     | BOOL           | both users "liked"         |
| matched_at    | TIMESTAMPTZ    |                            |
| expires_at    | TIMESTAMPTZ    | optional TTL               |

### 2.5 `mission_templates`

| Column         | Type          | Notes                                          |
| -------------- | ------------- | ---------------------------------------------- |
| id             | UUID PK       |                                                |
| title          | TEXT NOT NULL |                                                |
| description    | TEXT NOT NULL |                                                |
| mission_type   | ENUM          | icebreaker / mini_date / adventure / challenge |
| difficulty     | ENUM          | easy / medium / hard                           |
| location_query | TEXT          | Google Places search term                      |
| weather_filter | JSONB         | {max_temp, no_rain, etc.}                      |
| base_points    | INT           | default 100                                    |
| duration_min   | INT           | default 60                                     |
| objectives     | JSONB         | [{step, task}]                                 |
| generated_by   | TEXT          | "gemini-2.5-flash" or "manual"                 |
| prompt_hash    | TEXT          | SHA-256 of generation prompt                   |
| is_active      | BOOL          |                                                |
| created_at     | TIMESTAMPTZ   |                                                |

### 2.6 `mission_instances`

| Column            | Type              | Notes                                  |
| ----------------- | ----------------- | -------------------------------------- |
| id                | UUID PK           |                                        |
| template_id       | UUID FK→templates | ON DELETE RESTRICT                     |
| match_id          | UUID FK→matches   | ON DELETE CASCADE                      |
| custom_title      | TEXT              | AI-personalised override               |
| custom_objectives | JSONB             |                                        |
| location_name     | TEXT              | resolved place name                    |
| location_lat      | DOUBLE            |                                        |
| location_lng      | DOUBLE            |                                        |
| location_place_id | TEXT              | Google Places ID                       |
| **status**        | **ENUM**          | **proposed→accepted→active→completed** |
| proposed_at       | TIMESTAMPTZ       |                                        |
| accepted_at       | TIMESTAMPTZ       |                                        |
| started_at        | TIMESTAMPTZ       |                                        |
| completed_at      | TIMESTAMPTZ       |                                        |
| expires_at        | TIMESTAMPTZ       |                                        |
| points_awarded    | INT               | set on completion                      |
| partner_discount  | TEXT              | coupon code                            |
| checkin_proof     | JSONB             | {selfie_url, geo, ts}                  |
| created_at        | TIMESTAMPTZ       |                                        |

### 2.7 `user_mission_progress`

| Column          | Type                   | Notes              |
| --------------- | ---------------------- | ------------------ |
| id              | UUID PK                |                    |
| instance_id     | UUID FK→instances      |                    |
| user_id         | TEXT FK→users          |                    |
| has_accepted    | BOOL                   |                    |
| objectives_done | JSONB                  | [{step, done, ts}] |
| checked_in      | BOOL                   |                    |
| points_earned   | INT                    |                    |
| updated_at      | TIMESTAMPTZ            |                    |
| **UNIQUE**      | (instance_id, user_id) |                    |

### 2.8 `verifications`

| Column       | Type          | Notes                                                |
| ------------ | ------------- | ---------------------------------------------------- |
| id           | UUID PK       |                                                      |
| user_id      | TEXT FK→users |                                                      |
| type         | ENUM          | selfie_liveness / photo_match / phone / social_vouch |
| status       | ENUM          | pending / verified / rejected / expired              |
| proof_hash   | TEXT          | SHA-256 (never raw images)                           |
| metadata     | JSONB         | model confidence, etc.                               |
| requested_at | TIMESTAMPTZ   |                                                      |
| verified_at  | TIMESTAMPTZ   |                                                      |
| expires_at   | TIMESTAMPTZ   | liveness: 90 days                                    |

### 2.9 `vibe_vouches`

| Column       | Type                    | Notes                            |
| ------------ | ----------------------- | -------------------------------- |
| id           | UUID PK                 |                                  |
| voucher_id   | TEXT FK→users           | the friend giving the vouch      |
| subject_id   | TEXT FK→users           | the person being vouched for     |
| tag          | ENUM                    | 8 vouch types (safe_vibes, etc.) |
| is_anonymous | BOOL                    | default TRUE                     |
| created_at   | TIMESTAMPTZ             |                                  |
| **UNIQUE**   | (voucher, subject, tag) |                                  |

### 2.10 `crush_list`

| Column        | Type          | Notes                |
| ------------- | ------------- | -------------------- |
| id            | UUID PK       |                      |
| user_id       | TEXT FK→users |                      |
| crush_user_id | TEXT FK→users | profile to hide from |
| is_active     | BOOL          |                      |
| created_at    | TIMESTAMPTZ   |                      |

### 2.11 `analyzer_sessions`

| Column               | Type          | Notes                                       |
| -------------------- | ------------- | ------------------------------------------- |
| id                   | UUID PK       |                                             |
| user_id              | TEXT FK→users |                                             |
| image_hash           | TEXT NOT NULL | SHA-256 (image never stored)                |
| hint_tags            | TEXT[]        |                                             |
| predicted_style      | ENUM          | direct/playful/intellectual/shy/adventurous |
| vibe_prediction      | JSONB         | structured AI analysis                      |
| conversation_openers | TEXT[]        | 3 openers                                   |
| date_suggestions     | JSONB         | personalized date ideas                     |
| model_version        | TEXT          |                                             |
| latency_ms           | INT           | track < 3s SLA                              |
| created_at           | TIMESTAMPTZ   |                                             |

### 2.12 `vibe_points_ledger`

| Column       | Type          | Notes                                |
| ------------ | ------------- | ------------------------------------ |
| id           | UUID PK       |                                      |
| user_id      | TEXT FK→users |                                      |
| delta        | INT NOT NULL  | + earned, − spent                    |
| reason       | TEXT NOT NULL | "mission_complete", "vouch_received" |
| reference_id | UUID          | source entity                        |
| created_at   | TIMESTAMPTZ   |                                      |

---

## 3. pgvector Strategy

### Embedding Model

- **Source:** Gemini Embedding API or OpenAI `text-embedding-3-small` (1536 dims)
- **Input:** Concatenated string: `{vibe_name} | {mood_tags} | {interest_tags} | {quiz_summary}`
- **Storage:** `vector(1536)` column on `vibe_profiles`

### Similarity Function

```sql
-- Cosine similarity (1 = identical, 0 = orthogonal)
1 - (embedding <=> query_embedding) AS similarity
```

### Index

```sql
-- IVFFlat for approximate nearest neighbour
CREATE INDEX idx_vibe_profiles_embedding
  ON vibe_profiles
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Tune `lists` to sqrt(N) where N = expected total rows
-- Rebuild after bulk inserts: REINDEX INDEX idx_vibe_profiles_embedding;
```

### Query Function

```sql
find_similar_vibes(query_embedding, match_count=10, similarity_threshold=0.7)
  → TABLE(user_id, vibe_name, similarity)
```

### Privacy Filter (Crush Cloak)

Before returning matches, the application layer filters out:

1. Users on the requester's **friend's crush_list** (Privacy Cloak)
2. Users the requester has **blocked** via `connections`
3. Users whose `verifications` don't meet minimum trust (optional)

---

## 4. RLS Policy Map

Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
All policies use `auth.user_id()` which reads `request.jwt.claims.sub` (Clerk JWT).

| Table                     | SELECT                      | INSERT            | UPDATE               | DELETE            |
| ------------------------- | --------------------------- | ----------------- | -------------------- | ----------------- |
| **users**                 | Own row only                | — (Clerk webhook) | Own row              | —                 |
| **examples**              | Own + public                | Own only          | Own only             | Own only          |
| **vibe_profiles**         | Own + active (for matching) | Own only          | Own only             | Own only          |
| **connections**           | Where party (req/addr)      | As requester      | Where party          | Own sent requests |
| **vibe_matches**          | Where party (a/b)           | — (service role)  | — (service role)     | —                 |
| **mission_templates**     | Active only                 | — (service role)  | —                    | —                 |
| **mission_instances**     | Via match membership        | — (service role)  | Via match membership | —                 |
| **user_mission_progress** | Own only                    | Own only          | Own only             | —                 |
| **verifications**         | Own only                    | Own only          | — (service role)     | —                 |
| **vibe_vouches**          | About self + by self        | As voucher        | —                    | Own vouches       |
| **crush_list**            | Own only                    | Own only          | Own only             | Own only          |
| **analyzer_sessions**     | Own only                    | Own only          | — (append-only)      | —                 |
| **vibe_points_ledger**    | Own only                    | — (service role)  | —                    | —                 |

### Service Role Operations

These bypass RLS via `supabase.auth.admin` / service role key:

- Creating `vibe_matches` (from similarity search cron)
- Creating `mission_templates` (admin or AI pipeline)
- Proposing `mission_instances` (matchmaking engine)
- Updating `verifications.status` (AI verification pipeline)
- Awarding `vibe_points_ledger` entries (mission completion hook)

---

## 5. API Specification

### Router: `vibeProfiles.*`

| Procedure     | Type     | Auth | Input                                                                           | Description                              |
| ------------- | -------- | ---- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| `getMe`       | query    | ✅   | —                                                                               | Get current user's vibe profile          |
| `create`      | mutation | ✅   | `{vibeName, energy, moodTags, styleTags, interestTags, quizAnswers, photoUrls}` | Create/replace vibe profile (upsert)     |
| `update`      | mutation | ✅   | Partial of create                                                               | Update specific fields                   |
| `findSimilar` | query    | ✅   | `{limit?, threshold?}`                                                          | pgvector cosine search for similar vibes |
| `getByUserId` | query    | ✅   | `{userId}`                                                                      | Get public vibe card for match view      |

### Router: `social.*`

| Procedure          | Type     | Auth | Input                            | Description                         |
| ------------------ | -------- | ---- | -------------------------------- | ----------------------------------- |
| `listConnections`  | query    | ✅   | `{status?}`                      | List all connections                |
| `sendRequest`      | mutation | ✅   | `{userId}`                       | Send connection request             |
| `updateConnection` | mutation | ✅   | `{connectionId, status}`         | Accept or block                     |
| `removeConnection` | mutation | ✅   | `{connectionId}`                 | Remove a connection                 |
| `listMatches`      | query    | ✅   | `{limit?}`                       | List AI vibe matches                |
| `checkMutuals`     | query    | ✅   | `{targetUserId}`                 | Drama-Guard: mutual friends warning |
| `getMyVouches`     | query    | ✅   | —                                | Vouches received                    |
| `giveVouch`        | mutation | ✅   | `{subjectId, tag, isAnonymous?}` | Vouch for a friend                  |
| `removeVouch`      | mutation | ✅   | `{vouchId}`                      | Remove a vouch                      |
| `getVouchSummary`  | query    | ✅   | `{userId}`                       | Tag counts for a user               |
| `getMyCrushList`   | query    | ✅   | —                                | Privacy Cloak list                  |
| `addCrush`         | mutation | ✅   | `{crushUserId}`                  | Add to crush list                   |
| `removeCrush`      | mutation | ✅   | `{crushId}`                      | Deactivate crush entry              |
| `getMyPoints`      | query    | ✅   | —                                | Total vibe points                   |
| `getPointsHistory` | query    | ✅   | `{limit?}`                       | Points ledger                       |

### Router: `missions.*`

| Procedure           | Type     | Auth | Input                                             | Description                |
| ------------------- | -------- | ---- | ------------------------------------------------- | -------------------------- |
| `listTemplates`     | query    | ✅   | `{type?, difficulty?, limit?}`                    | Browse mission catalogue   |
| `getTemplate`       | query    | ✅   | `{id}`                                            | Single template            |
| `propose`           | mutation | ✅   | `{templateId, matchId, customTitle?, location*?}` | Propose mission to match   |
| `listMyMissions`    | query    | ✅   | `{status?, limit?}`                               | All missions for user      |
| `accept`            | mutation | ✅   | `{instanceId}`                                    | Accept proposed mission    |
| `start`             | mutation | ✅   | `{instanceId}`                                    | Start accepted mission     |
| `completeObjective` | mutation | ✅   | `{instanceId, step}`                              | Mark objective done        |
| `checkin`           | mutation | ✅   | `{instanceId, proof:{selfieUrl?, geo?, ts?}}`     | Location check-in          |
| `decline`           | mutation | ✅   | `{instanceId}`                                    | Decline proposed mission   |
| `getMyProgress`     | query    | ✅   | `{instanceId}`                                    | User's progress on mission |

### Router: `verification.*`

| Procedure              | Type     | Auth | Input                           | Description                       |
| ---------------------- | -------- | ---- | ------------------------------- | --------------------------------- |
| `getMyStatus`          | query    | ✅   | —                               | All verification records          |
| `isVerified`           | query    | ✅   | `{type}`                        | Check specific verification       |
| `request`              | mutation | ✅   | `{type, proofHash?, metadata?}` | Request verification              |
| `getBadges`            | query    | ✅   | `{userId}`                      | Public verification badges        |
| `analyze`              | mutation | ✅   | `{imageHash, hintTags?}`        | Submit for AI analysis (Analyzer) |
| `listAnalyzerSessions` | query    | ✅   | `{limit?}`                      | Analyzer history                  |
| `getAnalyzerSession`   | query    | ✅   | `{id}`                          | Single session                    |

---

## 6. System Architecture

### Service Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │  Web (Next)   │  │ Mobile (RN)  │  │  Admin Panel  │                      │
│  │  tRPC Client  │  │ REST (Hono)  │  │  Service Role │                      │
│  └──────┬────────┘  └──────┬───────┘  └──────┬────────┘                      │
└─────────┼──────────────────┼─────────────────┼──────────────────────────────┘
          │                  │                 │
          ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP (:3000) — Clerk Auth                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  tRPC Router (type-safe, web)     Hono Router (REST, mobile) │            │
│  │                                                              │            │
│  │  vibeProfiles.*   social.*   missions.*   verification.*     │            │
│  │  users.*          examples.*                                 │            │
│  └──────────────────────────┬───────────────────────────────────┘            │
│                             │                                               │
│                      ┌──────▼──────┐                                        │
│                      │ Drizzle ORM │                                        │
│                      │ + secureDb  │                                        │
│                      │ (RLS via    │                                        │
│                      │  Clerk JWT) │                                        │
│                      └──────┬──────┘                                        │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │
         ┌────────────────────┼──────────────────────┐
         │                    │                      │
         ▼                    ▼                      ▼
┌─────────────────┐  ┌──────────────────────┐  ┌──────────────┐
│  LLM Service    │  │  Supabase Postgres   │  │ External APIs│
│  (Express :3001)│  │  (:5432)             │  │              │
│                 │  │                      │  │ • Google     │
│  Gemini 2.0    │  │  12 tables + RLS     │  │   Places API │
│  Flash         │  │  pgvector            │  │ • OpenWeather│
│  Redis :6379   │  │  find_similar_vibes()│  │ • Clerk      │
│                 │  │  check_mutuals()     │  │   Webhooks   │
│  Templates:    │  │                      │  │              │
│  • vibe-profile│  └──────────────────────┘  └──────────────┘
│  • analyzer    │
│  • mission-gen │
│  • theme (6)   │
└─────────────────┘
```

### Data Flow: Vibe Matching Pipeline

```
1. User completes Vibe Quiz + uploads 3-5 photos
       │
       ▼
2. Web → tRPC vibeProfiles.create()
       │
       ├── Photos → LLM Service (Gemini multimodal analysis)
       │             → returns: style_tags, energy, mood_tags
       │
       ├── Quiz answers + AI tags → LLM Service (embedding generation)
       │             → returns: vector(1536)
       │
       └── INSERT INTO vibe_profiles (all data + embedding)
              │
              ▼
3. Matching Cron (service role, every N minutes):
       │
       ├── SELECT find_similar_vibes(user_embedding, 20, 0.7)
       │
       ├── Filter: blocked users, crush_list cloak, already matched
       │
       ├── AI compatibility analysis (Gemini) per candidate
       │
       └── INSERT INTO vibe_matches (top K results)
              │
              ▼
4. User sees matches → Proposes mission → Accept → Execute → Check-in → Points
```

### Data Flow: Analyzer (Tactical Advice)

```
1. User uploads screenshot of crush's profile
       │
       ▼
2. Client computes SHA-256 hash (image NEVER leaves client raw)
       │
       ├── Image → LLM Service (in-memory only, Gemini vision)
       │             → predicted_style, vibe_prediction
       │             → 3 conversation_openers
       │             → date_suggestions (uses location/weather)
       │
       └── Hash + AI results → INSERT INTO analyzer_sessions
              │
              ▼
3. Response returned < 3 seconds (SLA tracked via latency_ms)
```

---

## 7. LLM Prompt Templates (New)

These templates extend the existing 6 in `apps/llm/src/lib/prompt-templates.ts`:

| Template Name             | Input                                | Output                                           | Cache   |
| ------------------------- | ------------------------------------ | ------------------------------------------------ | ------- |
| `generate-vibe-profile`   | `{quizAnswers, photoAnalysis}`       | `{vibeName, vibeSummary, energy, moodTags}`      | ❌      |
| `generate-vibe-embedding` | `{vibeName, tags, summary}`          | `vector(1536)`                                   | ❌      |
| `analyze-crush-profile`   | `{imageHash, hintTags}`              | `{predictedStyle, openers[], dateSuggestions[]}` | ❌      |
| `generate-mission`        | `{vibeMatchData, location, weather}` | `{title, objectives[], difficulty}`              | ✅ (1h) |
| `assess-compatibility`    | `{profileA, profileB}`               | `{score, breakdown{}, narrative}`                | ✅ (1h) |
| `liveness-check`          | `{profilePhotoHash, selfieHash}`     | `{match: bool, confidence: float}`               | ❌      |

---

## 8. Mission State Machine

```
                    ┌──────────┐
                    │ PROPOSED │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │                     │
         Both accept           Either declines
              │                     │
              ▼                     ▼
        ┌──────────┐         ┌──────────┐
        │ ACCEPTED │         │ DECLINED │
        └────┬─────┘         └──────────┘
             │
        User starts
             │
             ▼
        ┌──────────┐
        │  ACTIVE  │
        └────┬─────┘
             │
    ┌────────┼────────┐
    │                 │
Both check-in    Time expires
    │                 │
    ▼                 ▼
┌──────────┐   ┌──────────┐
│COMPLETED │   │ EXPIRED  │
│ +points  │   └──────────┘
└──────────┘
```

### Acceptance Logic (Dual-Consent)

1. User A proposes → `mission_instances.status = 'proposed'`
2. User A auto-accepts → `user_mission_progress[A].has_accepted = true`
3. User B accepts → `user_mission_progress[B].has_accepted = true`
4. System checks: all `has_accepted = true` → transitions to `'accepted'`
5. Location details unlocked only after `'accepted'`

---

---

## File Manifest

| Path                                                             | Purpose                                                           |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `supabase/migrations/00002_vibe_platform_schema.sql`             | Full SQL migration — 12 tables, enums, indexes, functions, RLS    |
| `apps/web-client/src/services/vibe-profiles/schema/index.ts`     | Drizzle schema for vibe_profiles                                  |
| `apps/web-client/src/services/vibe-profiles/procedures/index.ts` | tRPC: getMe, create, update, findSimilar, getByUserId             |
| `apps/web-client/src/services/social/schema/index.ts`            | Drizzle schema for connections, matches, vouches, crushes, points |
| `apps/web-client/src/services/social/procedures/index.ts`        | tRPC: connections, matches, vouches, crush list, points           |
| `apps/web-client/src/services/missions/schema/index.ts`          | Drizzle schema for templates, instances, progress                 |
| `apps/web-client/src/services/missions/procedures/index.ts`      | tRPC: templates, propose, accept, start, checkin, decline         |
| `apps/web-client/src/services/verification/schema/index.ts`      | Drizzle schema for verifications, analyzer sessions               |
| `apps/web-client/src/services/verification/procedures/index.ts`  | tRPC: verification status, analyzer, badges                       |
| `apps/web-client/src/db/schema/index.ts`                         | Updated barrel export (all 6 schema modules)                      |
| `apps/web-client/src/server/routers/app.ts`                      | Updated app router (all 6 sub-routers)                            |
