# BACKEND_SCALING

## Vector Embeddings (The Vibe DNA)

In the next phase, each user profile will be transformed into a dense 1536-dimensional embedding using Gemini 1.5 Pro. The embedding input should combine onboarding answers, vibe labels, preferences, and lightweight social context into one normalized prompt. This creates a numerical “Vibe DNA” representation that allows fast semantic comparison even when users describe themselves in different words.

Implementation direction:

- Run embedding generation after onboarding completion and after major profile edits.
- Store vectors in PostgreSQL through `pgvector(1536)`.
- Keep an embedding version field so model upgrades can be rolled out safely.

## pgvector Integration

Similarity matching will use `pgvector` cosine distance with the `<=>` operator. For a query profile vector `q`, candidate ranking is computed by ascending `embedding <=> q` (lower value means more similar).

Implementation direction:

- Build an RPC or SQL function that takes a user id + vector and returns ranked candidates.
- Apply product filters (age range, location, visibility, block lists, preference compatibility) before final ranking.
- Return top results with score metadata so frontend can explain confidence and quality.

## HNSW Indexing

To scale discover search to 10k+ users with sub-50ms retrieval, use an HNSW index on the embedding column. HNSW provides approximate nearest-neighbor performance with strong recall and low latency compared with exact full-table scans.

Implementation direction:

- Create HNSW index over the embedding column using cosine distance ops.
- Tune index params (`m`, `ef_construction`) during staging benchmarks.
- Tune query-time `ef_search` to balance recall vs latency.
- Keep observability on p95 latency and recall quality to maintain SLA targets.

## Two-Stage Refinement

The matching pipeline should be split into two stages for quality and cost control:

1. **Supabase + pgvector stage (math filter):** retrieve top-50 semantically similar candidates from the database.
2. **Gemini stage (narrative filter):** run Gemini on the top set to produce the final compatibility narrative and nuanced synergy explanation.

This design ensures the expensive LLM step is only used on high-probability matches while Supabase performs the heavy retrieval work. It also keeps the architecture tRPC-friendly: stage one can live in a `vibeProfiles.findSimilar` procedure, and stage two can be exposed through `llm.evaluateMatch`/`llm.findAndEvaluateMatches` for progressive rollout.

## Frontend Requirements (Backend Contract)

This section describes exactly what the Discover frontend needs from backend so implementation can move from mock data to production without UI rewrites.

### 1) Candidate Feed Contract

Frontend expects a candidate list endpoint (or tRPC procedure) equivalent to:

- `vibeProfiles.findSimilar({ limit, cursor?, threshold? })`

Each candidate must include:

- `userId: string`
- `displayName: string`
- `age: number`
- `city: string`
- `pronouns: "she/her" | "he/him" | "they/them"`
- `gender: "male" | "female" | "non-binary" | "prefer-not-to-say"`
- `interestedIn: "male" | "female" | "non-binary" | "everyone"`
- `vibeName: string` (maps to UI “Vibe Label”)
- `interestTags: string[]`
- `mutualConnectionsCount: number` (for social proof row)
- `isVerified: boolean` (for VerificationBadge rendering)
- `similarity: number` (0-1; optional for UI, required for ranking/observability)
- `isAutoMatch?: boolean` (optional server-side flag for instant-match experiments)

Pagination requirements:

- Cursor-based pagination (`nextCursor`) to avoid offset drift.
- Stable ordering by vector similarity, then deterministic tie-break (e.g., userId).
- Exclude blocked users, hidden users, and already-seen candidates for that viewer.

### 2) Compatibility Narrative Contract

When user opens “Why you match”, frontend needs:

- `llm.evaluateMatch({ profileA, profileB, vectorSimilarity? })`

Response payload:

- `score: number` (0-1)
- `narrative: string` (short paragraph for modal)
- `commonGround: string[]`
- `energyCompatibility: { score: number; description: string }`
- `interestOverlap: { shared: string[]; complementary: string[] }`
- `conversationStarter: string`

Behavior requirements:

- P95 response under 1500ms for modal UX.
- Safe fallback narrative if LLM times out or returns invalid JSON.
- Optional cache key by pair `(viewerId, candidateId, embeddingVersion)`.

### 3) Interaction Tracking Contract

Frontend like/pass actions should be persisted via a lightweight action endpoint:

- `social.recordDiscoveryAction({ targetUserId, action: "like" | "pass" })`

Backend responsibilities:

- Idempotency support (same action retried should not duplicate rows).
- Return whether a mutual match was created (`isMutualMatch: boolean`).
- Return `matchId` when created, for future chat/deeplink integration.

### 4) Error + Response Shape Consistency

For all discover endpoints, frontend expects consistent envelopes:

- Success: `{ data, meta? }`
- Failure: typed error with `code`, `message`, and optional `details`.

Recommended error codes:

- `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMITED`, `INTERNAL_SERVER_ERROR`.

### 5) Performance + Observability Targets

To keep animations and feed transitions smooth on mobile-web:

- Candidate retrieval target: P95 < 300ms from API gateway.
- Vector search target: < 50ms for ANN retrieval stage.
- Log `durationMs`, `modelVersion`, `embeddingVersion`, and candidate count.
- Emit metrics for recall, fallback rate, and narrative generation failure rate.

### 6) Rollout Plan (Mock -> Real)

Frontend is already mock-ready and only needs contract-compatible responses to switch:

1. Replace mock list with `vibeProfiles.findSimilar` output.
2. Hydrate card details via `vibeProfiles.getByUserId` only if feed payload is intentionally minimal.
3. Replace local narrative generator with `llm.evaluateMatch`.
4. Replace local like/pass state persistence with `social.recordDiscoveryAction`.

If backend keeps these contracts stable, frontend migration can happen incrementally with no major UI refactor.
