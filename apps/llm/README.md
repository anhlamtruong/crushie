# LLM Prompt Service

A focused, stateless AI prompt service powered by **Google Gemini 2.0 Flash**. It provides optimized prompt templates and a raw prompt API for structured AI interactions, with optional **Redis** caching.

## Architecture

```
Client → Express API → Prompt Formatter → Gemini AI → Response
                              ↕
                        Redis Cache (optional)
```

- **Stateless** — no conversation history, no user data stored
- **Template-driven** — pre-built, optimized prompt templates
- **Cache layer** — optional Redis for response deduplication
- **Graceful degradation** — works without Redis if unavailable

## API Endpoints

### `GET /api/health`

Health check with service status and Redis connectivity.

### `GET /api/prompt/templates`

Returns all available prompt templates with descriptions and required variables.

### `POST /api/prompt/run`

Execute a registered prompt template by name.

```json
{
  "template": "generate-theme-palette",
  "variables": {
    "mood": "warm and cozy",
    "style": "modern minimalist"
  },
  "options": { "json": true }
}
```

### `POST /api/prompt/raw`

Execute a custom formatted prompt directly.

```json
{
  "role": "You are an expert code reviewer",
  "task": "Review the following code for bugs and improvements",
  "rules": ["Be concise", "Focus on critical issues"],
  "input": "function add(a, b) { return a - b; }",
  "output": "Return a JSON array of issues found",
  "options": { "json": true }
}
```

## LLM Pipelines (Production + Mock)

All production pipeline endpoints require an `X-Service-Token` header that
matches `LLM_SERVICE_TOKEN` in the service environment. Mock endpoints do not
require auth and do not call Gemini.

### Headers (Production)

```
X-Service-Token: your-shared-secret
Content-Type: application/json
```

### Pipeline 1: Vibe Generation

**POST `/api/vibe-profile`** — Generate a Vibe Card via Gemini (multimodal)

```json
{
  "userId": "user_123",
  "images": [
    { "base64": "<base64...>", "mimeType": "image/jpeg" },
    { "base64": "<base64...>", "mimeType": "image/jpeg" },
    { "base64": "<base64...>", "mimeType": "image/png" }
  ],
  "quizAnswers": {
    "rainyFriday": "vinyl_chill",
    "travelStyle": "spontaneous"
  },
  "photoUrls": [
    "https://cdn.example.com/u/123/photo-1.jpg",
    "https://cdn.example.com/u/123/photo-2.jpg"
  ]
}
```

Response shape (truncated):

```json
{
  "data": {
    "userId": "user_123",
    "vibeName": "The Urban Minimalist",
    "vibeSummary": "Clean lines, calm energy...",
    "energy": "moderate",
    "moodTags": ["grounded", "focused"],
    "styleTags": ["minimal", "modern"],
    "interestTags": ["design", "coffee"],
    "quizAnswers": { "rainyFriday": "vinyl_chill" },
    "photoUrls": ["https://cdn.example.com/u/123/photo-1.jpg"],
    "isActive": true
  },
  "meta": { "cached": false, "durationMs": 823, "model": "gemini-2.5-flash" }
}
```

**POST `/api/vibe-profile/mock`** — Mock Vibe Card (dev/testing)

```json
{
  "userId": "user_123",
  "quizAnswers": { "rainyFriday": "vinyl_chill" },
  "photoUrls": ["https://cdn.example.com/u/123/photo-1.jpg"]
}
```

**GET `/api/vibe-profile/presets`** — Presets and sample quiz payload

---

### Pipeline 2: Profile Analyzer

**POST `/api/analyzer`** — Analyze a single screenshot via Gemini (multimodal)

```json
{
  "userId": "user_123",
  "image": { "base64": "<base64...>", "mimeType": "image/jpeg" },
  "imageHash": "sha256:abc123...",
  "hintTags": ["playful", "outdoors"]
}
```

Response shape (truncated):

```json
{
  "data": {
    "userId": "user_123",
    "imageHash": "sha256:abc123...",
    "hintTags": ["playful", "outdoors"],
    "predictedStyle": "playful",
    "vibePrediction": { "tone": "warm" },
    "conversationOpeners": ["Ask about their weekend hike"],
    "dateSuggestions": [{ "idea": "Park coffee walk" }],
    "modelVersion": "gemini-2.5-flash",
    "latencyMs": 642
  },
  "meta": { "cached": false, "durationMs": 691, "model": "gemini-2.5-flash" }
}
```

**POST `/api/analyzer/mock`** — Mock analyzer response (dev/testing)

```json
{
  "userId": "user_123",
  "imageHash": "sha256:abc123...",
  "hintTags": ["playful", "outdoors"]
}
```

**GET `/api/analyzer/styles`** — List analyzer style presets

---

### Pipeline 3: Compatibility Engine

**POST `/api/evaluate-match`** — Evaluate match between two profiles

```json
{
  "profileA": {
    "userId": "user_a",
    "vibeName": "The Cozy Homebody",
    "vibeSummary": "Warm, grounded, slow mornings",
    "energy": "chill",
    "moodTags": ["soft", "steady"],
    "styleTags": ["cozy", "classic"],
    "interestTags": ["books", "cooking"]
  },
  "profileB": {
    "userId": "user_b",
    "vibeName": "The Chaotic Creative",
    "vibeSummary": "Bold ideas, spontaneous plans",
    "energy": "high",
    "moodTags": ["curious", "spark"],
    "styleTags": ["eclectic", "artsy"],
    "interestTags": ["art", "travel"]
  },
  "vectorSimilarity": 0.78
}
```

Response shape (truncated):

```json
{
  "data": {
    "score": 0.82,
    "narrative": "A steady anchor meets creative spark...",
    "commonGround": ["storytelling"],
    "energyCompatibility": { "description": "Balancing", "score": 0.74 },
    "interestOverlap": { "shared": ["art"], "complementary": ["books"] },
    "conversationStarter": "Swap favorite indie cafes"
  },
  "meta": { "cached": false, "durationMs": 455, "model": "gemini-2.5-flash" }
}
```

**POST `/api/evaluate-match/mock`** — Mock compatibility response (dev/testing)

## Available Templates

| Template                  | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `generate-theme-palette`  | Generate a UI color palette for a theme        |
| `summarize-text`          | Summarize long text into key points            |
| `review-code`             | Review code for bugs, style, and improvements  |
| `rewrite-content`         | Rewrite content with a specified tone/style    |
| `extract-structured-data` | Extract structured JSON from unstructured text |
| `translate-text`          | Translate text between languages               |

## Quick Start

### Local development

```bash
# Install dependencies (from monorepo root)
npm install -w apps/llm

# Copy env and add your Gemini API key
cp .env.example .env

# Start dev server
npm run dev -w apps/llm
```

### Docker

```bash
# Start with Docker Compose (includes Redis)
docker compose up

# Or build and run standalone
docker build -t llm-prompt-service .
docker run -p 3001:3001 -e GEMINI_API_KEY=your-key llm-prompt-service
```

## Environment Variables

| Variable            | Required | Default                  | Description                   |
| ------------------- | -------- | ------------------------ | ----------------------------- |
| `PORT`              | No       | `3001`                   | Server port                   |
| `GEMINI_API_KEY`    | **Yes**  | —                        | Google Gemini API key         |
| `LLM_SERVICE_TOKEN` | No       | —                        | Shared secret for pipelines   |
| `REDIS_URL`         | No       | `redis://localhost:6379` | Redis connection URL          |
| `REDIS_CACHE_TTL`   | No       | `3600`                   | Cache TTL in seconds (1 hour) |
| `CORS_ORIGINS`      | No       | `http://localhost:3000`  | Allowed CORS origins          |
| `NODE_ENV`          | No       | `development`            | Environment mode              |

## Project Structure

```
src/
├── index.ts                # Entry point, Redis init, graceful shutdown
├── app.ts                  # Express app setup
├── lib/
│   ├── gemini.ts           # Gemini AI client (text + JSON)
│   ├── prompt-formatter.ts # Deterministic prompt builder
│   ├── prompt-templates.ts # Template registry (6 built-in)
│   └── redis.ts            # Optional Redis cache layer
└── routes/
    ├── health.ts           # Health check endpoint
  ├── prompt.ts           # /run, /raw, /templates endpoints
  ├── vibe-profile.ts     # Vibe generation (Gemini + mock)
  ├── analyzer.ts         # Profile analyzer (Gemini + mock)
  └── evaluate-match.ts   # Compatibility engine (Gemini + mock)
```

## Tech Stack

- **Runtime**: Node.js 22 (Alpine)
- **Framework**: Express 4
- **AI Model**: Google Gemini 2.0 Flash
- **Cache**: Redis 7 (optional, via Docker Compose)
- **Validation**: Zod
- **Language**: TypeScript (NodeNext modules)
