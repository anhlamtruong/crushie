# Mobile App (React Native / Expo)

The mobile client for **Tình Yêu Chu Chubé**, built with Expo SDK 52, React Native 0.76, and Expo Router v4.

## Tech Stack

- **Framework**: Expo SDK 52, React Native 0.76
- **Navigation**: Expo Router v4 (file-based)
- **Auth**: @clerk/clerk-expo
- **Data Fetching**: @tanstack/react-query v5
- **Styling**: NativeWind v4 (Tailwind CSS)
- **State**: Zustand

## Getting Started

```bash
# From monorepo root
cd apps/mobile
npm install

# Set up environment
cp .env.example .env
# Fill in EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY and EXPO_PUBLIC_API_URL

# Start dev server
npx expo start

# Or from root
npm run dev:mobile
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Root layout (providers)
│   ├── index.tsx           # Entry redirect
│   ├── (auth)/             # Auth group
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/             # Main tab navigation
│   │   ├── _layout.tsx     # Tab bar config
│   │   ├── index.tsx       # Dashboard
│   │   ├── discover.tsx    # Find matches
│   │   ├── missions.tsx    # Mission browser
│   │   ├── social.tsx      # Connections/matches/vouches
│   │   └── profile.tsx     # User profile
│   ├── on-board.tsx        # Vibe generation flow
│   ├── analyze.tsx         # AI profile analysis
│   ├── edit-profile.tsx    # Edit user profile
│   └── verification.tsx    # Verification center
├── src/
│   ├── components/         # Shared UI components
│   │   ├── ui/             # Primitives (Button, Card, etc.)
│   │   ├── domain-cards.tsx
│   │   └── empty-state.tsx
│   ├── hooks/              # TanStack Query hooks (40+ endpoints)
│   │   ├── use-users.ts
│   │   ├── use-vibe-profiles.ts
│   │   ├── use-social.ts
│   │   ├── use-missions.ts
│   │   ├── use-verification.ts
│   │   ├── use-llm.ts
│   │   ├── use-examples.ts
│   │   └── index.ts        # Barrel export
│   ├── lib/
│   │   ├── api.ts          # Fetch wrapper with auth
│   │   ├── query-client.ts # QueryClient factory
│   │   └── token-cache.ts  # SecureStore token cache
│   ├── providers/
│   │   ├── auth-provider.tsx
│   │   └── query-provider.tsx
│   └── types/
│       └── api.ts          # API response types
└── config files...
```

## API Connection

All API calls go through the authenticated fetch wrapper in `src/lib/api.ts`, which:
- Prepends `EXPO_PUBLIC_API_URL/api/mobile` to all paths
- Attaches `Authorization: Bearer <clerk_jwt>` from the Clerk session
- Returns typed responses via TanStack Query hooks

## Available Hooks

| Hook | Type | Endpoint |
|------|------|----------|
| `useMe` | Query | GET /users/me |
| `useUpdateProfile` | Mutation | PATCH /users/me |
| `useSyncFromClerk` | Mutation | POST /users/sync |
| `useMyVibeProfile` | Query | GET /vibe-profiles/me |
| `useCreateVibeProfile` | Mutation | POST /vibe-profiles |
| `useUpdateVibeProfile` | Mutation | PATCH /vibe-profiles |
| `useFindSimilarProfiles` | Mutation | POST /vibe-profiles/similar |
| `useVibeProfileByUserId` | Query | GET /vibe-profiles/user/:id |
| `useConnections` | Query | GET /social/connections |
| `useSendConnection` | Mutation | POST /social/connections |
| `useUpdateConnection` | Mutation | PATCH /social/connections/:id |
| `useDeleteConnection` | Mutation | DELETE /social/connections/:id |
| `useMatches` | Query | GET /social/matches |
| `useMutualMatches` | Query | GET /social/matches/mutuals |
| `useVouches` | Query | GET /social/vouches |
| `useCreateVouch` | Mutation | POST /social/vouches |
| `useDeleteVouch` | Mutation | DELETE /social/vouches/:id |
| `useVouchSummary` | Query | GET /social/vouches/summary/:id |
| `useCrushList` | Query | GET /social/crush-list |
| `useAddCrush` | Mutation | POST /social/crush-list |
| `useRemoveCrush` | Mutation | DELETE /social/crush-list/:id |
| `usePointsTotal` | Query | GET /social/points/total |
| `usePointsHistory` | Query | GET /social/points/history |
| `useMissionTemplates` | Query | GET /missions/templates |
| `useMissionTemplate` | Query | GET /missions/templates/:id |
| `useMissionInstances` | Query | GET /missions/instances |
| `useProposeMission` | Mutation | POST /missions/instances/propose |
| `useAcceptMission` | Mutation | PATCH /missions/instances/:id/accept |
| `useStartMission` | Mutation | PATCH /missions/instances/:id/start |
| `useDeclineMission` | Mutation | PATCH /missions/instances/:id/decline |
| `useMissionProgress` | Query | GET /missions/progress/:id |
| `useCompleteObjective` | Mutation | POST /missions/progress/:id/objective |
| `useMissionCheckin` | Mutation | POST /missions/progress/:id/checkin |
| `useVerificationStatus` | Query | GET /verification/status |
| `useIsVerified` | Query | GET /verification/check |
| `useVerificationBadges` | Query | GET /verification/badges |
| `useAnalyzerSessions` | Query | GET /verification/analyzer-sessions |
| `useAnalyzerSession` | Query | GET /verification/analyzer-sessions/:id |
| `useRequestVerification` | Mutation | POST /verification/request |
| `useAnalyzeVerification` | Mutation | POST /verification/analyze |
| `useGenerateVibe` | Mutation | POST /llm/generate-vibe |
| `useAnalyzeProfile` | Mutation | POST /llm/analyze-profile |
| `useEvaluateMatch` | Mutation | POST /llm/evaluate-match |
| `useFindAndEvaluateMatches` | Mutation | POST /llm/find-and-evaluate-matches |
| `useExamples` | Query | GET /examples |
| `usePublicExamples` | Query | GET /examples/public |
| `useExample` | Query | GET /examples/:id |
| `useCreateExample` | Mutation | POST /examples |
| `useUpdateExample` | Mutation | PATCH /examples/:id |
| `useDeleteExample` | Mutation | DELETE /examples/:id |
