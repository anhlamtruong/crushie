/**
 * LLM Proxy Service — tRPC-to-LLM bridge
 *
 * Handles calling the LLM service from tRPC procedures.
 * Manages auth token injection, base64 image conversion, and error handling.
 */

const LLM_BASE_URL = process.env.LLM_URL || "http://localhost:3001";
const LLM_SERVICE_TOKEN = process.env.LLM_SERVICE_TOKEN || "";

const SUPPORTED_LLM_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

function normalizeImageMimeType(contentType: string): string {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase();

  if (!normalized) return "image/jpeg";
  if (normalized === "image/jpg") return "image/jpeg";
  if (normalized === "image/heif") return "image/heic";

  if (SUPPORTED_LLM_IMAGE_MIME_TYPES.has(normalized)) {
    return normalized;
  }

  return normalized.startsWith("image/") ? "image/jpeg" : "image/jpeg";
}

// ============================================================================
// Types — LLM API response envelope
// ============================================================================

export type LLMResponse<T> = {
  data: T;
  meta: {
    cached?: boolean;
    durationMs?: number;
    usedFallback?: boolean;
    mock?: boolean;
    model?: string;
    message?: string;
  };
};

// ── Vibe Profile types ────────────────────────────────────────────────────

export type LLMVibeProfileData = {
  userId: string;
  vibeName: string;
  vibeSummary: string;
  energy: "chill" | "moderate" | "high" | "chaotic";
  moodTags: string[];
  styleTags: string[];
  interestTags: string[];
  quizAnswers: Record<string, unknown>;
  photoUrls: string[];
  isActive: boolean;
};

// ── Analyzer types ────────────────────────────────────────────────────────

export type LLMAnalyzerData = {
  userId: string;
  imageHash: string;
  hintTags: string[];
  predictedStyle: "direct" | "playful" | "intellectual" | "shy" | "adventurous";
  vibePrediction: Record<string, unknown>;
  conversationOpeners: string[];
  dateSuggestions: Array<{
    title: string;
    description: string;
    vibeMatch: number;
    estimatedCost: string;
    duration: string;
    placeName?: string;
    placeId?: string;
    whyThisSpot?: string;
    lat?: number;
    lng?: number;
    icebreakerQuestion?: string;
    followUpQuestions?: string[];
    topicCues?: string[];
    doTips?: string[];
    avoidTips?: string[];
    bestTimingCue?: string;
  }>;
  modelVersion: string;
  latencyMs: number;
};

// ── Compatibility types ───────────────────────────────────────────────────

export type LLMCompatibilityData = {
  score: number;
  similarityScore: number;
  successProbability: number;
  narrative: string;
  mission: {
    title: string;
    task: string;
    locationId: string;
  };
  commonGround?: string[];
  energyCompatibility?: {
    description: string;
    score: number;
  };
  interestOverlap?: {
    shared: string[];
    complementary: string[];
  };
  conversationStarter?: string;
};

export type MatchPlanPlaceCandidate = {
  name: string;
  placeId: string;
  district: string;
  placeType: string;
  types: string[];
  isIndoor: boolean;
};

export type LLMMissionPlanData = LLMCompatibilityData;

export type MatchPlanEnvironmentContext = {
  city: string;
  weather?: {
    condition: "Rain" | "Clear";
    description: string;
    temp: number;
  };
};

// ── Identity verification types ───────────────────────────────────────────

export type LLMImageInput = {
  base64: string;
  mimeType: string;
};

export type VerifyIdentityInput = {
  profilePhoto: LLMImageInput;
  freshSelfie: LLMImageInput;
};

export type VerifyIdentityResult = {
  is_match: boolean;
  confidence: number;
  reasoning: string;
};

export type LiveSuggestionData = {
  suggestion: string;
  visual_cue_detected: string;
  confidence: number;
};

// ── Identity verification types ───────────────────────────────────────────

export type LLMImageInput = {
  base64: string;
  mimeType: string;
};

export type VerifyIdentityInput = {
  profilePhoto: LLMImageInput;
  freshSelfie: LLMImageInput;
};

export type VerifyIdentityResult = {
  is_match: boolean;
  confidence: number;
  reasoning: string;
};

// ============================================================================
// HTTP Client
// ============================================================================

class LLMServiceError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "LLMServiceError";
  }
}

async function llmFetch<T>(
  path: string,
  body: unknown,
): Promise<LLMResponse<T>> {
  const url = `${LLM_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (LLM_SERVICE_TOKEN) {
    headers["X-Service-Token"] = LLM_SERVICE_TOKEN;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new LLMServiceError(
      res.status,
      (errorBody as { error?: string }).error ||
        `LLM service returned ${res.status}`,
      (errorBody as { details?: unknown }).details,
    );
  }

  return (await res.json()) as LLMResponse<T>;
}

// ============================================================================
// Image helpers
// ============================================================================

/**
 * Fetch an image from a URL (e.g. Supabase Storage) and convert to base64.
 */
export async function imageUrlToBase64(
  imageUrl: string,
): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${imageUrl} (${res.status})`);
  }

  const contentType = normalizeImageMimeType(
    res.headers.get("content-type") || "image/jpeg",
  );
  const buffer = Buffer.from(await res.arrayBuffer());
  const base64 = buffer.toString("base64");

  return { base64, mimeType: contentType };
}

/**
 * Convert multiple image URLs to base64 in parallel.
 */
export async function imagesToBase64(
  urls: string[],
): Promise<Array<{ base64: string; mimeType: string }>> {
  return Promise.all(urls.map(imageUrlToBase64));
}

// ============================================================================
// Pipeline 1: Vibe Generation
// ============================================================================

export async function generateVibeProfile(input: {
  userId: string;
  imageUrls: string[];
  hintTags?: string[];
  extraContext?: string;
  photoUrls?: string[];
  useMock?: boolean;
}): Promise<LLMResponse<LLMVibeProfileData>> {
  // Mock mode — no images needed
  if (input.useMock) {
    return llmFetch<LLMVibeProfileData>("/api/vibe-profile/mock", {
      userId: input.userId,
      hintTags: input.hintTags ?? [],
      extraContext: input.extraContext ?? "",
      photoUrls: input.photoUrls ?? input.imageUrls,
    });
  }

  // Production — fetch images from Supabase Storage and convert to base64
  const images = await imagesToBase64(input.imageUrls);

  return llmFetch<LLMVibeProfileData>("/api/vibe-profile", {
    userId: input.userId,
    images,
    hintTags: input.hintTags ?? [],
    extraContext: input.extraContext ?? "",
    photoUrls: input.photoUrls ?? input.imageUrls,
  });
}

// ============================================================================
// Pipeline 2: Profile Analyzer
// ============================================================================

export async function analyzeProfile(input: {
  userId: string;
  imageUrls: string[];
  imageHash: string;
  hintTags?: string[];
  useMock?: boolean;
  environmentContext?: {
    city: string;
    weather?: {
      temp: number;
      feelsLike: number;
      description: string;
      icon: string;
      humidity: number;
      windSpeed: number;
    };
    nearbyPlaces: Array<{
      name: string;
      placeId: string;
      vicinity: string;
      rating?: number;
      types: string[];
      staticMapUrl?: string;
    }>;
  };
}): Promise<LLMResponse<LLMAnalyzerData>> {
  // Mock mode
  if (input.useMock) {
    return llmFetch<LLMAnalyzerData>("/api/analyzer/mock", {
      userId: input.userId,
      imageHash: input.imageHash,
      hintTags: input.hintTags ?? [],
    });
  }

  // Production — fetch all images and convert to base64
  const images = await imagesToBase64(input.imageUrls);

  return llmFetch<LLMAnalyzerData>("/api/analyzer", {
    userId: input.userId,
    images,
    imageHash: input.imageHash,
    hintTags: input.hintTags ?? [],
    environmentContext: input.environmentContext,
  });
}

// ============================================================================
// Pipeline 3: Compatibility Engine
// ============================================================================

export type ProfileSummary = {
  userId: string;
  vibeName: string;
  vibeSummary?: string;
  energy: "chill" | "moderate" | "high" | "chaotic";
  moodTags?: string[];
  styleTags?: string[];
  interestTags?: string[];
};

export async function evaluateMatch(input: {
  profileA: ProfileSummary;
  profileB: ProfileSummary;
  vectorSimilarity?: number;
  useMock?: boolean;
  environmentContext?: MatchPlanEnvironmentContext;
  placeCandidates?: MatchPlanPlaceCandidate[];
}): Promise<LLMResponse<LLMCompatibilityData>> {
  const endpoint = input.useMock
    ? "/api/evaluate-match/mock"
    : "/api/evaluate-match";

  return llmFetch<LLMCompatibilityData>(endpoint, {
    profileA: input.profileA,
    profileB: input.profileB,
    vectorSimilarity: input.vectorSimilarity,
    environmentContext: input.environmentContext,
    placeCandidates: input.placeCandidates,
  });
}

// ============================================================================
// Pipeline 4: Identity Verification
// ============================================================================

export async function verifyIdentity(
  input: VerifyIdentityInput,
): Promise<LLMResponse<VerifyIdentityResult>> {
  return llmFetch<VerifyIdentityResult>("/api/verify-identity", input);
}

// ============================================================================
// Realtime Coach
// ============================================================================

export async function getLiveSuggestion(input: {
  frame: string;
  targetVibe: string;
  currentTopic?: string;
  language?: string;
}): Promise<LLMResponse<LiveSuggestionData>> {
  return llmFetch<LiveSuggestionData>("/api/realtime-coach", {
    frame: input.frame,
    targetVibe: input.targetVibe,
    currentTopic: input.currentTopic ?? "",
    language: input.language ?? "Respond in English.",
  });
}

// ============================================================================
// Pipeline 4: Identity Verification
// ============================================================================

export async function verifyIdentity(
  input: VerifyIdentityInput,
): Promise<LLMResponse<VerifyIdentityResult>> {
  return llmFetch<VerifyIdentityResult>("/api/verify-identity", input);
}

export async function vibeMatch(input: {
  profile: ProfileSummary;
  otherUsers: ProfileSummary[];
  limit: number;
  vectorSimilarity?: number;
  useMock?: boolean;
}): Promise<LLMResponse<LLMCompatibilityData>> {
  const endpoint = input.useMock
    ? "/api/evaluate-match/mock"
    : `/api/vibe-match?limit=${input.limit}`;

  return llmFetch<LLMCompatibilityData>(endpoint, {
    profile: input.profile,
    otherUsers: input.otherUsers,
    vectorSimilarity: input.vectorSimilarity,
  });
}
