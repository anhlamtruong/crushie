/**
 * Shared API response types matching Hono endpoint shapes.
 * These can be refined as the backend evolves.
 */

// ─── Generic ──────────────────────────────────────────────────
export type ApiResponse<T> = { data: T };
export type ApiListResponse<T> = { data: T[] };
export type ApiMessageResponse = { message: string };

// ─── Uploads ──────────────────────────────────────────────────
export interface UploadResult {
  url: string;
  path: string;
}

// ─── Users ────────────────────────────────────────────────────
export interface User {
  id: string;
  clerkId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  location: string | null;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Vibe Profiles ────────────────────────────────────────────
export interface VibeProfile {
  id: string;
  userId: string;
  vibeName: string;
  vibeSummary: string | null;
  energy: "chill" | "moderate" | "high" | "chaotic";
  moodTags: string[] | null;
  styleTags: string[] | null;
  interestTags: string[] | null;
  quizAnswers: Record<string, unknown> | null;
  photoUrls: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SimilarProfile {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  vibeName: string | null;
  vibeSummary: string | null;
  energy: string | null;
  interestTags?: string[];
  similarityScore: number;
}

// ─── Social ───────────────────────────────────────────────────
export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  matchedAt: string;
}

export interface Vouch {
  id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  category: string | null;
  createdAt: string;
}

export interface VouchSummary {
  totalVouches: number;
  categories: Record<string, number>;
}

export interface CrushListEntry {
  id: string;
  userId: string;
  crushUserId: string;
  note: string | null;
  createdAt: string;
}

export interface Points {
  total: number;
}

export interface PointHistory {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

// ─── Missions ─────────────────────────────────────────────────
export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xpReward: number;
  objectives: unknown;
  createdAt: string;
}

export interface MissionInstance {
  id: string;
  templateId: string;
  proposedBy: string;
  partnerUserId: string | null;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface MissionProgress {
  instanceId: string;
  objectiveIndex: number;
  status: string;
  checkins: unknown[];
}

// ─── Verification ─────────────────────────────────────────────
export interface VerificationStatus {
  verified: boolean;
  level: string | null;
  methods: string[];
}

export interface VerificationBadge {
  id: string;
  type: string;
  label: string;
  earnedAt: string;
}

export interface AnalyzerSession {
  id: string;
  userId: string;
  status: string;
  result: unknown;
  createdAt: string;
  completedAt: string | null;
}

// ─── LLM ──────────────────────────────────────────────────────
export interface GenerateVibeResult {
  /** The saved vibe profile from the DB */
  profile: VibeProfile;
  meta: {
    cached?: boolean;
    durationMs?: number;
    usedFallback?: boolean;
    mock?: boolean;
    model?: string;
  };
}

export interface AnalyzeProfileResult {
  summary: string;
  strengths: string[];
  suggestions: string[];
  overallScore: number;
}

export interface EvaluateMatchResult {
  compatibilityScore: number;
  sharedValues: string[];
  potentialChallenges: string[];
  recommendation: string;
}

export interface FindAndEvaluateResult {
  matches: Array<{
    userId: string;
    displayName: string | null;
    compatibilityScore: number;
    recommendation: string;
  }>;
}

// ─── Examples ─────────────────────────────────────────────────
export interface Example {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
