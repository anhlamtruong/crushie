/**
 * Fallback Responses
 *
 * Safe default responses when the LLM fails to return valid JSON after retries.
 * These prevent 500 errors propagating to the tRPC service.
 */

// ============================================================================
// Pipeline 1: Vibe Generation Fallback
// ============================================================================

export type VibeGenerationResult = {
  vibeName: string;
  vibeSummary: string;
  energy: "chill" | "moderate" | "high" | "chaotic";
  moodTags: string[];
  styleTags: string[];
  interestTags: string[];
};

export const VIBE_GENERATION_FALLBACK: VibeGenerationResult = {
  vibeName: "The Undiscovered",
  vibeSummary:
    "A mystery wrapped in potential — your vibe is still loading. Try again and let the AI get a better read on your energy.",
  energy: "moderate",
  moodTags: ["curious", "open"],
  styleTags: ["eclectic"],
  interestTags: ["exploring", "self-discovery"],
};

// ============================================================================
// Pipeline 2: Analyzer Fallback
// ============================================================================

export type AnalyzerResult = {
  predictedStyle: "direct" | "playful" | "intellectual" | "shy" | "adventurous";
  vibePrediction: {
    confidence: number;
    dominantTrait: string;
    secondaryTrait: string;
    summary: string;
    communicationTips: string[];
  };
  conversationOpeners: string[];
  suggestedMissions: Array<{
    title: string;
    description: string;
    vibeMatch: number;
    estimatedCost: string;
    duration: string;
    placeName?: string | null;
    placeId?: string | null;
    whyThisSpot?: string | null;
    lat?: number | null;
    lng?: number | null;
    icebreakerQuestion?: string;
    followUpQuestions?: string[];
    topicCues?: string[];
    doTips?: string[];
    avoidTips?: string[];
    bestTimingCue?: string;
  }>;
};

export const ANALYZER_FALLBACK: AnalyzerResult = {
  predictedStyle: "playful",
  vibePrediction: {
    confidence: 0.0,
    dominantTrait: "unknown",
    secondaryTrait: "unknown",
    summary:
      "The AI couldn't get a clear read this time. Try with a clearer screenshot or add more hint tags for better results.",
    communicationTips: [
      "Start with something light and observational",
      "Ask about something visible in their profile",
      "Keep it casual and genuine",
    ],
  },
  conversationOpeners: [
    "What's the story behind your profile pic? I'm genuinely curious.",
    "Okay, I'm skipping 'hey' — what's the best thing that happened to you this week?",
    "If we had to pick a random activity right now, what are you hoping I say?",
    "What's one underrated place in your city you think more people should know?",
    "You get one spontaneous plan this weekend — what are we doing?",
    "What's your ideal first-date energy: cozy, playful, or a little chaotic?",
    "What's something people misunderstand about you from first impressions?",
    "What topic can you talk about for hours without getting bored?",
  ],
  suggestedMissions: [
    {
      title: "The Getting-to-Know-You Walk",
      description:
        "Pick a neighborhood neither of you knows. Walk, talk, and stop wherever looks interesting. No agenda, just vibes.",
      vibeMatch: 0.5,
      estimatedCost: "Free",
      duration: "1-2 hours",
      icebreakerQuestion:
        "If we did this walk today, what kind of neighborhood vibe would you pick first?",
      followUpQuestions: [
        "What kind of places make you instantly feel at home?",
        "Are you more spontaneous or do you secretly love a plan?",
      ],
      topicCues: [
        "Neighborhood vibes",
        "Favorite local spots",
        "Weekend rituals",
      ],
      doTips: ["Keep it light and curious", "Offer two easy route options"],
      avoidTips: ["Avoid over-planning every stop"],
      bestTimingCue:
        "Suggest this after a few playful messages when both of you mention free time.",
    },
    {
      title: "Coffee Roulette",
      description:
        "Each of you picks a random café, and you let a coin flip decide. Loser's pick, winner buys.",
      vibeMatch: 0.45,
      estimatedCost: "$5-$15",
      duration: "1-2 hours",
      icebreakerQuestion:
        "What's your non-negotiable coffee order, and should I trust it?",
      followUpQuestions: [
        "What café atmosphere helps you open up fastest?",
        "Are you team deep-talk coffee or quick espresso and chaos?",
      ],
      topicCues: ["Coffee preferences", "Mood-setting places", "Playful bets"],
      doTips: [
        "Frame it as fun, not high-stakes",
        "Keep the plan simple and specific",
      ],
      avoidTips: ["Avoid debating logistics too long"],
      bestTimingCue:
        "Use when banter is already flowing and you want a low-pressure meetup.",
    },
    {
      title: "Sunset & Snacks",
      description:
        "Grab street food or convenience store snacks, find a rooftop or park bench, and watch the sunset. Keep it simple.",
      vibeMatch: 0.5,
      estimatedCost: "$5-$10",
      duration: "1-2 hours",
      icebreakerQuestion:
        "What's your go-to sunset snack combo that would instantly win me over?",
      followUpQuestions: [
        "Are you more rooftop views or park-bench people watching?",
        "What kind of conversation do you love during golden hour?",
      ],
      topicCues: [
        "Comfort foods",
        "Golden-hour spots",
        "Low-pressure first dates",
      ],
      doTips: [
        "Mention a specific time window",
        "Keep backup indoor option in mind",
      ],
      avoidTips: ["Avoid making it sound too romantic too soon"],
      bestTimingCue:
        "Best after you both share evening routines or favorite city views.",
    },
  ],
};

// ============================================================================
// Pipeline 3: Compatibility Fallback
// ============================================================================

export type CompatibilityResult = {
  score: number;
  narrative: string;
  commonGround: string[];
  energyCompatibility: {
    description: string;
    score: number;
  };
  interestOverlap: {
    shared: string[];
    complementary: string[];
  };
  conversationStarter: string;
};

export const COMPATIBILITY_FALLBACK: CompatibilityResult = {
  score: 0.5,
  narrative:
    "The AI couldn't fully analyze the compatibility right now — but that doesn't mean there isn't something there. Sometimes the best connections defy algorithms.",
  commonGround: ["Both are on Tinhyeuchuchube — that's a start!"],
  energyCompatibility: {
    description:
      "Energy compatibility couldn't be determined. Give it a shot and find out!",
    score: 0.5,
  },
  interestOverlap: {
    shared: [],
    complementary: [],
  },
  conversationStarter:
    "You both swiped right on life — what's the most random thing you've said yes to recently?",
};
