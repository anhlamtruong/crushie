/**
 * Mock Data Generators
 *
 * Returns realistic mock data matching the web-client's Drizzle schemas
 * for vibe_profiles and analyzer_sessions tables.
 * Used for front-end development before real LLM integration.
 */

import { randomUUID } from "crypto";

// ============================================================================
// Types (mirrors Drizzle schemas from web-client)
// ============================================================================

export type VibeEnergy = "chill" | "moderate" | "high" | "chaotic";

export type VibeProfileMock = {
  id: string;
  userId: string;
  vibeName: string;
  vibeSummary: string;
  energy: VibeEnergy;
  moodTags: string[];
  styleTags: string[];
  interestTags: string[];
  quizAnswers: Record<string, unknown>;
  photoUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AnalyzerStyle =
  | "direct"
  | "playful"
  | "intellectual"
  | "shy"
  | "adventurous";

export type AnalyzerSessionMock = {
  id: string;
  userId: string;
  imageHash: string;
  hintTags: string[];
  predictedStyle: AnalyzerStyle;
  vibePrediction: Record<string, unknown>;
  conversationOpeners: string[];
  dateSuggestions: Array<Record<string, unknown>>;
  modelVersion: string;
  latencyMs: number;
  createdAt: string;
};

const TARGET_OPENER_COUNT = 8;

const DEFAULT_MOCK_OPENERS = [
  "What's one small detail in your profile that people always miss?",
  "What's your ideal spontaneous plan when you have two free hours?",
  "What's your favorite way to make a first conversation less awkward?",
  "If we matched over a shared hobby, which one should we test first?",
  "What's your strongest opinion about a totally unimportant topic?",
  "What kind of place instantly puts you in a good mood?",
  "What's something you've been wanting to try lately?",
  "What's the most 'you' way to spend a Sunday afternoon?",
];

function normalizeNonEmptyStrings(values: unknown[]): string[] {
  const unique = new Set<string>();

  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    unique.add(trimmed);
  }

  return [...unique];
}

function normalizeConversationOpeners(openers: unknown): string[] {
  const normalized = Array.isArray(openers)
    ? normalizeNonEmptyStrings(openers)
    : [];

  for (const fallback of DEFAULT_MOCK_OPENERS) {
    if (normalized.length >= TARGET_OPENER_COUNT) break;
    if (!normalized.includes(fallback)) {
      normalized.push(fallback);
    }
  }

  return normalized.slice(0, TARGET_OPENER_COUNT);
}

function normalizeRange(
  values: unknown,
  min: number,
  max: number,
  fallback: string[],
): string[] {
  const normalized = Array.isArray(values)
    ? normalizeNonEmptyStrings(values)
    : [];

  for (const item of fallback) {
    if (normalized.length >= max) break;
    if (!normalized.includes(item)) {
      normalized.push(item);
    }
  }

  return normalized.slice(0, Math.max(min, Math.min(max, normalized.length)));
}

function enrichMockDateSuggestion(
  suggestion: Record<string, unknown>,
): Record<string, unknown> {
  const title =
    typeof suggestion.title === "string" && suggestion.title.trim().length > 0
      ? suggestion.title
      : "Date mission";

  const icebreakerQuestion =
    typeof suggestion.icebreakerQuestion === "string" &&
    suggestion.icebreakerQuestion.trim().length > 0
      ? suggestion.icebreakerQuestion
      : `What part of "${title}" sounds most fun to you right now?`;

  return {
    ...suggestion,
    icebreakerQuestion,
    followUpQuestions: normalizeRange(suggestion.followUpQuestions, 2, 3, [
      "What part of this plan would make you feel most comfortable?",
      "Would you rather keep this chill or make it a little adventurous?",
      "What would make this feel like a great first hang for you?",
    ]),
    topicCues: normalizeRange(suggestion.topicCues, 2, 4, [
      "Shared interests",
      "Favorite local spots",
      "Ideal date energy",
      "Funny first-date stories",
    ]),
    doTips: normalizeRange(suggestion.doTips, 2, 3, [
      "Keep your tone playful and specific",
      "Offer one easy fallback option",
      "Suggest a clear time window",
    ]),
    avoidTips: normalizeRange(suggestion.avoidTips, 1, 2, [
      "Avoid overloading with too many logistics",
      "Avoid one-word messages that kill momentum",
    ]),
    bestTimingCue:
      typeof suggestion.bestTimingCue === "string" &&
      suggestion.bestTimingCue.trim().length > 0
        ? suggestion.bestTimingCue
        : "Best used after a few strong replies when the conversation already feels easy.",
  };
}

// ============================================================================
// Vibe Profile Presets
// ============================================================================

const VIBE_PRESETS: Array<{
  vibeName: string;
  vibeSummary: string;
  energy: VibeEnergy;
  moodTags: string[];
  styleTags: string[];
  interestTags: string[];
}> = [
  {
    vibeName: "The Urban Minimalist",
    vibeSummary:
      "Clean lines, quiet cafés, and a perfectly curated playlist. You move through the city like a well-edited film — intentional, aesthetic, effortlessly cool.",
    energy: "chill",
    moodTags: ["calm", "introspective", "content"],
    styleTags: ["minimalist", "monochrome", "clean"],
    interestTags: [
      "architecture",
      "specialty coffee",
      "vinyl records",
      "film photography",
    ],
  },
  {
    vibeName: "The High-Energy Foodie",
    vibeSummary:
      "Life is a buffet and you're going back for thirds. Street markets at midnight, hole-in-the-wall gems, and you've never met a food truck you didn't love.",
    energy: "high",
    moodTags: ["excited", "adventurous", "social"],
    styleTags: ["casual-bold", "streetwear", "colorful"],
    interestTags: [
      "street food",
      "cooking",
      "night markets",
      "food photography",
      "travel",
    ],
  },
  {
    vibeName: "The Chaotic Creative",
    vibeSummary:
      "Your room is a beautiful disaster, your playlists have no genre, and your best ideas come at 3 AM. You're a walking mood board of contradictions — and people love it.",
    energy: "chaotic",
    moodTags: ["spontaneous", "passionate", "restless"],
    styleTags: ["eclectic", "layered", "thrift-mix"],
    interestTags: [
      "mixed media art",
      "indie music",
      "zine-making",
      "late-night karaoke",
      "vintage shopping",
    ],
  },
  {
    vibeName: "The Cozy Homebody",
    vibeSummary:
      "You've mastered the art of doing nothing beautifully. Candles, blankets, a good book, and zero plans on a Saturday — that's the dream, and you're living it.",
    energy: "chill",
    moodTags: ["relaxed", "warm", "peaceful"],
    styleTags: ["cozy", "soft-tones", "cottagecore"],
    interestTags: [
      "reading",
      "baking",
      "board games",
      "indoor plants",
      "podcasts",
    ],
  },
  {
    vibeName: "The Sunset Chaser",
    vibeSummary:
      "You run on golden-hour energy and spontaneous road trips. Nature is your therapy, and you've got the hiking boots (and tan lines) to prove it.",
    energy: "moderate",
    moodTags: ["free-spirited", "optimistic", "grounded"],
    styleTags: ["outdoor-casual", "earth-tones", "boho"],
    interestTags: [
      "hiking",
      "camping",
      "surfing",
      "landscape photography",
      "road trips",
    ],
  },
  {
    vibeName: "The Night Owl Intellectual",
    vibeSummary:
      "You can debate philosophy over cheap wine and still make it sound like a TED Talk. Museums, bookstores, and deep conversations at 2 AM are your love language.",
    energy: "moderate",
    moodTags: ["curious", "thoughtful", "witty"],
    styleTags: ["smart-casual", "dark-academia", "layered"],
    interestTags: [
      "philosophy",
      "documentary films",
      "bookstores",
      "jazz bars",
      "writing",
    ],
  },
];

// ============================================================================
// Analyzer Presets
// ============================================================================

const ANALYZER_STYLE_DATA: Record<
  AnalyzerStyle,
  {
    vibePrediction: Record<string, unknown>;
    conversationOpeners: string[];
    dateSuggestions: Array<Record<string, unknown>>;
  }
> = {
  direct: {
    vibePrediction: {
      confidence: 0.85,
      dominantTrait: "direct",
      secondaryTrait: "adventurous",
      summary:
        "Straightforward communicator who values honesty and efficiency. Likely responds well to bold, confident openers rather than small talk.",
      communicationTips: [
        "Be upfront about your intentions",
        "Skip the small talk — go for meaningful topics",
        "They appreciate people who say what they mean",
      ],
    },
    conversationOpeners: [
      "Okay, I'm skipping the 'hey' — what's the most spontaneous thing you've done this year?",
      "Your profile has serious main-character energy. What's the plot twist?",
      "I have a theory about you based on your photos. Want to hear it, or should I keep the mystery going?",
    ],
    dateSuggestions: [
      {
        title: "Rooftop Drinks & Real Talk",
        description:
          "Find the best rooftop bar in the city. No small talk allowed — only controversial food opinions and life stories.",
        vibeMatch: 0.92,
        estimatedCost: "$$",
        duration: "2-3 hours",
      },
      {
        title: "Competitive Something",
        description:
          "Bowling, go-karts, or arcade — pick something with a scoreboard. Direct types love a little friendly competition.",
        vibeMatch: 0.87,
        estimatedCost: "$$",
        duration: "2 hours",
      },
      {
        title: "Street Food Crawl",
        description:
          "Walk-and-talk through the best food stalls. No awkward sitting-across-the-table energy — just good food and real conversation.",
        vibeMatch: 0.84,
        estimatedCost: "$",
        duration: "2-3 hours",
      },
    ],
  },
  playful: {
    vibePrediction: {
      confidence: 0.88,
      dominantTrait: "playful",
      secondaryTrait: "direct",
      summary:
        "Lighthearted and witty — they value humor and spontaneity. Banter is their love language; boring just isn't an option.",
      communicationTips: [
        "Lead with humor, not compliments",
        "Match their energy — if they joke, joke back",
        "Don't be afraid to be a little absurd",
      ],
    },
    conversationOpeners: [
      "On a scale of 'meticulously planned' to 'winging it beautifully,' how do you usually do Saturdays?",
      "I'm conducting very serious research: pineapple on pizza — bold innovation or culinary crime?",
      "Your vibe says you'd win at karaoke but pick the most chaotic song possible. Am I close?",
    ],
    dateSuggestions: [
      {
        title: "Karaoke Night (No Judgment Zone)",
        description:
          "Private room, terrible singing, maximum fun. Bonus points for duets with a stranger.",
        vibeMatch: 0.95,
        estimatedCost: "$$",
        duration: "2-3 hours",
      },
      {
        title: "Thrift Store Challenge",
        description:
          "Each pick an outfit for the other under $20. Wear it to dinner. No returns, no regrets.",
        vibeMatch: 0.9,
        estimatedCost: "$",
        duration: "3 hours",
      },
      {
        title: "Night Market Adventure",
        description:
          "Wander, eat things you can't pronounce, and rate everything on a made-up scoring system.",
        vibeMatch: 0.88,
        estimatedCost: "$",
        duration: "2-3 hours",
      },
    ],
  },
  intellectual: {
    vibePrediction: {
      confidence: 0.82,
      dominantTrait: "intellectual",
      secondaryTrait: "shy",
      summary:
        "Deep thinker who craves meaningful conversation. Small talk is death — they want to discuss ideas, passions, and hot takes on niche topics.",
      communicationTips: [
        "Ask thought-provoking questions",
        "Share recommendations — books, podcasts, films",
        "Don't be afraid of silence; they're probably thinking",
      ],
    },
    conversationOpeners: [
      "What's something you've changed your mind about recently? I find that says more about a person than any bio.",
      "I just finished [book/show] and I need someone to argue about the ending with. You in?",
      "If you could have dinner with any historical figure, who — and more importantly, where are you eating?",
    ],
    dateSuggestions: [
      {
        title: "Museum + Hidden Café",
        description:
          "Start at an exhibition neither of you has seen. End at that café only locals know about. Discuss everything.",
        vibeMatch: 0.93,
        estimatedCost: "$$",
        duration: "3-4 hours",
      },
      {
        title: "Bookstore Crawl",
        description:
          "Each pick a book for the other. Read the first chapters over coffee. Swap notes.",
        vibeMatch: 0.91,
        estimatedCost: "$",
        duration: "2-3 hours",
      },
      {
        title: "Documentary + Discussion",
        description:
          "Watch something thought-provoking, then debate over wine. Agree to disagree (or don't).",
        vibeMatch: 0.85,
        estimatedCost: "$",
        duration: "3 hours",
      },
    ],
  },
  shy: {
    vibePrediction: {
      confidence: 0.79,
      dominantTrait: "shy",
      secondaryTrait: "intellectual",
      summary:
        "Gentle and observant — probably won't make the first move but is absolutely worth the patience. Warm up is slow but deep connections are their specialty.",
      communicationTips: [
        "Keep early messages low-pressure",
        "Ask about their interests, not generic questions",
        "Give them space to respond — don't double-text too fast",
      ],
    },
    conversationOpeners: [
      "I noticed [specific detail from their profile] — is there a story behind that?",
      "Okay, important question: what's your go-to comfort show when you need to recharge?",
      "You seem like someone who has really good playlist taste. What's on repeat right now?",
    ],
    dateSuggestions: [
      {
        title: "Cozy Café Afternoon",
        description:
          "A quiet corner, good coffee, and no time pressure. Let conversation flow naturally without the intensity of a dinner date.",
        vibeMatch: 0.94,
        estimatedCost: "$",
        duration: "1.5-2 hours",
      },
      {
        title: "Art Gallery Walk",
        description:
          "Walking side by side through art takes the pressure off face-to-face conversation. Plus, you always have something to talk about.",
        vibeMatch: 0.89,
        estimatedCost: "$ (free-$$)",
        duration: "2 hours",
      },
      {
        title: "Botanical Garden Stroll",
        description:
          "Peaceful, beautiful, and zero awkwardness. Nature does the heavy lifting while you two get comfortable.",
        vibeMatch: 0.86,
        estimatedCost: "$",
        duration: "2-3 hours",
      },
    ],
  },
  adventurous: {
    vibePrediction: {
      confidence: 0.87,
      dominantTrait: "adventurous",
      secondaryTrait: "playful",
      summary:
        "Thrill-seeker who values experiences over things. They want a partner-in-crime, not a couch companion. Match their energy or get left behind.",
      communicationTips: [
        "Suggest activities, not just 'let's hang out'",
        "Share your own adventure stories",
        "Be spontaneous — surprises work well",
      ],
    },
    conversationOpeners: [
      "What's on your bucket list that you haven't told anyone about yet?",
      "I need a travel buddy for my next trip. Sell me on your best quality as a co-adventurer.",
      "Mountains or ocean? (There's a right answer, and it determines our entire future.)",
    ],
    dateSuggestions: [
      {
        title: "Sunrise Hike",
        description:
          "Wake up way too early, hike to a viewpoint, watch the sunrise. If they show up, they're the one.",
        vibeMatch: 0.96,
        estimatedCost: "Free",
        duration: "3-4 hours",
      },
      {
        title: "Kayaking + Picnic",
        description:
          "Paddle to somewhere beautiful, eat sandwiches on a rock. Romance meets adventure, no reservation needed.",
        vibeMatch: 0.91,
        estimatedCost: "$$",
        duration: "4-5 hours",
      },
      {
        title: "Random Bus Challenge",
        description:
          "Get on a random bus, get off at a random stop, explore whatever you find. Zero plan, maximum story potential.",
        vibeMatch: 0.88,
        estimatedCost: "$",
        duration: "3+ hours",
      },
    ],
  },
};

// ============================================================================
// Generators
// ============================================================================

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sha256Stub(input: string): string {
  // Simple deterministic hash stub for mock purposes
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

/**
 * Generate a mock VibeProfile based on quiz answers and optional photo URLs.
 */
export function generateMockVibeProfile(input: {
  userId: string;
  quizAnswers: Record<string, unknown>;
  photoUrls?: string[];
}): VibeProfileMock {
  const preset = pick(VIBE_PRESETS);
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    userId: input.userId,
    vibeName: preset.vibeName,
    vibeSummary: preset.vibeSummary,
    energy: preset.energy,
    moodTags: preset.moodTags,
    styleTags: preset.styleTags,
    interestTags: preset.interestTags,
    quizAnswers: input.quizAnswers,
    photoUrls: input.photoUrls ?? [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generate a mock AnalyzerSession based on an image hash and hint tags.
 */
export function generateMockAnalyzerSession(input: {
  userId: string;
  imageHash: string;
  hintTags?: string[];
}): AnalyzerSessionMock {
  const styles: AnalyzerStyle[] = [
    "direct",
    "playful",
    "intellectual",
    "shy",
    "adventurous",
  ];
  const predicted = pick(styles);
  const data = ANALYZER_STYLE_DATA[predicted];

  return {
    id: randomUUID(),
    userId: input.userId,
    imageHash: input.imageHash || sha256Stub(randomUUID()),
    hintTags: input.hintTags ?? [],
    predictedStyle: predicted,
    vibePrediction: data.vibePrediction,
    conversationOpeners: normalizeConversationOpeners(data.conversationOpeners),
    dateSuggestions: data.dateSuggestions.map((suggestion) =>
      enrichMockDateSuggestion(suggestion),
    ),
    modelVersion: "mock-v1.0.0",
    latencyMs: Math.floor(Math.random() * 800) + 200,
    createdAt: new Date().toISOString(),
  };
}
