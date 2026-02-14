/**
 * Vibe Coach Prompt Templates
 *
 * Domain-specific prompt templates for Tinhyeuchuchube's three core pipelines:
 *   1. Vibe Generation (self-onboarding)
 *   2. Profile Analyzer (tactical advice)
 *   3. Compatibility Engine (vibe match)
 *
 * Uses the existing createPromptTemplate utility from prompt-formatter.ts
 */

import { createPromptTemplate } from "./prompt-formatter.js";

// ============================================================================
// Pipeline 1: Vibe Generation
// ============================================================================

/**
 * Text prompt for vibe generation. Used alongside multimodal image analysis.
 * The images are passed separately via Gemini's multimodal API.
 */
export const vibeGenerationPrompt = createPromptTemplate({
  role: "Expert personality analyst and creative branding strategist for a dating platform called Tinhyeuchuchube. You specialize in reading visual cues from photos (clothing, scenery, lighting, body language) and synthesizing them with user-provided hint tags and free-text context to create authentic, appealing dating profiles.",
  task: "Analyze the provided images along with optional hint tags and extra context to generate a high-fidelity 'Vibe Card' — a creative personality profile that goes far beyond a typical bio. The vibe card should feel like a magazine profile blurb that makes someone instantly intriguing.",
  rules: [
    "Return ONLY valid JSON — no markdown, no explanation, no preamble",
    "vibeName must be a creative 2-4 word title (e.g., 'The Urban Minimalist', 'The High-Energy Foodie')",
    "vibeSummary must be exactly 2 sentences — punchy, specific, and personality-driven",
    "energy must be exactly one of: 'chill', 'moderate', 'high', 'chaotic'",
    "moodTags: 3-5 single-word or hyphenated mood descriptors",
    "styleTags: 3-5 aesthetic/style descriptors derived from the photos",
    "interestTags: 4-6 specific interest keywords inferred from photos + hint tags + extra context",
    "If hint tags are provided, use them as strong signals for interests and lifestyle",
    "If extra context is provided, weave it naturally into the vibe summary and tags",
    "Even with no hint tags or context, photos alone should produce a compelling vibe",
    "Avoid generic descriptors — be specific and vivid",
    "The vibe should feel aspirational but authentic to the input data",
  ],
  output: {
    vibeName: "string — creative 2-4 word vibe title",
    vibeSummary: "string — exactly 2 punchy sentences",
    energy: "chill | moderate | high | chaotic",
    moodTags: ["string — 3-5 mood descriptors"],
    styleTags: ["string — 3-5 aesthetic descriptors from photos"],
    interestTags: ["string — 4-6 specific interests"],
  },
  examples: [
    {
      input: {
        hintTags: [
          "coffee-lover",
          "indie-music",
          "minimalist",
          "film-photography",
        ],
        extraContext:
          "I spend most weekends exploring new cafés and shooting on my Contax T2.",
        photoDescriptions:
          "3 photos: urban café setting, minimalist outfit, film camera visible",
      },
      output: {
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
    },
  ],
});

// ============================================================================
// Pipeline 2: Profile Analyzer
// ============================================================================

/**
 * Text prompt for profile analysis. Used alongside the screenshot image.
 */
export const profileAnalyzerPrompt = createPromptTemplate({
  role: "Expert dating coach and behavioral psychologist specializing in digital communication patterns. You can read personality cues from dating app screenshots — photo choices, bio writing style, emoji usage, and aesthetic preferences. You provide tactical, specific advice that turns shy matches into real conversations. When location and weather context are available, you craft date ideas that leverage the user's real environment — nearby venues, current weather, and local vibe.",
  task: "Analyze the provided 1-10 screenshots of a person's dating profile and generate tactical advice including: a communication style prediction, exactly 8 context-aware conversation openers, and personalized gamified date ideas ('missions') enriched with conversation scaffolding that keeps the chat flowing. The advice must be specific to THIS person, not generic. If multiple images are provided, synthesize insights across all images for a more complete and accurate analysis. When environmental context is provided, incorporate real weather conditions and nearby places into your date suggestions.",
  rules: [
    "Return ONLY valid JSON — no markdown, no explanation, no preamble",
    "predictedStyle must be exactly one of: 'direct', 'playful', 'intellectual', 'shy', 'adventurous'",
    "vibePrediction must include confidence (0.0 - 1.0), dominantTrait, secondaryTrait, and communicationTips",
    "conversationOpeners must be an array of exactly 8 strings — specific, non-boring, contextual to the profile",
    "suggestedMission must be a gamified date idea with title, description, vibeMatch score, estimatedCost, and duration",
    "Generate an array of exactly 3 suggestedMissions — each a unique gamified date idea",
    "Each suggestedMission must include: icebreakerQuestion, followUpQuestions (2-3), topicCues (2-4), doTips (2-3), avoidTips (1-2), and bestTimingCue",
    "estimatedCost must be a price range string like 'Free', '$10-$20', '$30-$50', '$50-$100', or '$100+'",
    "Each mission should include lat and lng coordinates if a real venue is referenced",
    "Keep all text concise: each opener/question/tip should be one sentence and preferably under 120 characters",
    "Avoid long paragraphs to reduce response size and maintain JSON reliability",
    "Do NOT use generic openers like 'Hey' or 'What's up'",
    "Openers should reference something specific from the profile or inferred interests",
    "The mission should feel like a fun quest, not a boring dinner date",
    "Use the hint tags (if provided) to refine predictions",
    "If multiple images are provided, cross-reference visual cues across all photos for higher confidence predictions",
    "ENVIRONMENTAL CONTEXT RULES (apply only when environmentContext is present in the context):",
    "- If weather data is available, factor it into date suggestions (e.g., indoor plans for rain, rooftop for clear skies)",
    "- If nearbyPlaces are available, reference REAL venue names in the suggestedMission",
    "- Add placeName (real venue name), placeId (Google Places ID), and whyThisSpot (1-sentence reason) to suggestedMission when places are available",
    "- If the weather is extreme (very hot, cold, or rainy), acknowledge it and suggest weather-appropriate activities",
    "- Use the city name naturally in conversation openers when it adds personality",
    "- Without environmental context, generate location-agnostic suggestions as before",
  ],
  output: {
    predictedStyle: "direct | playful | intellectual | shy | adventurous",
    vibePrediction: {
      confidence: "number 0.0-1.0",
      dominantTrait: "string — primary personality trait",
      secondaryTrait: "string — secondary trait",
      summary: "string — 2-sentence personality read",
      communicationTips: ["string — 3 actionable communication tips"],
    },
    conversationOpeners: [
      "string — 8 specific, context-aware conversation starters",
    ],
    suggestedMissions: [
      {
        title: "string — fun, gamified date idea title",
        description: "string — 2-sentence date plan",
        vibeMatch: "number 0.0-1.0 — how well this mission matches their vibe",
        estimatedCost: "string — price range like 'Free', '$10-$20', '$30-$50'",
        duration: "string — estimated duration",
        placeName:
          "string | null — real venue name from nearbyPlaces (if available)",
        placeId: "string | null — Google Places ID (if available)",
        whyThisSpot:
          "string | null — 1-sentence reason this venue fits (if available)",
        lat: "number | null — latitude of the venue (if available)",
        lng: "number | null — longitude of the venue (if available)",
        icebreakerQuestion:
          "string — first message tied to this mission/location",
        followUpQuestions: [
          "string — 2-3 follow-up questions to keep momentum",
        ],
        topicCues: ["string — 2-4 short talking-point cues"],
        doTips: ["string — 2-3 practical do tips for this mission"],
        avoidTips: ["string — 1-2 practical avoid tips for this mission"],
        bestTimingCue: "string — when/how to suggest this mission naturally",
      },
    ],
  },
  examples: [
    {
      input: {
        hintTags: ["University student", "Loves hiking"],
        profileDescription:
          "Screenshot shows outdoor adventure photos, casual style, dog in multiple photos",
      },
      output: {
        predictedStyle: "adventurous",
        vibePrediction: {
          confidence: 0.87,
          dominantTrait: "adventurous",
          secondaryTrait: "playful",
          summary:
            "Thrill-seeker who values experiences over things. They want a partner-in-crime, not a couch companion.",
          communicationTips: [
            "Suggest activities, not just 'lets hang out'",
            "Share your own adventure stories",
            "Be spontaneous — surprises work well",
          ],
        },
        conversationOpeners: [
          "Your dog has better hiking photos than most humans I know. Where was that trail?",
          "I need a travel buddy who can keep up. What's the hardest trail you've conquered?",
          "Mountains or ocean? There's a right answer, and it determines our entire future.",
          "What's your perfect day outdoors from sunrise to sunset?",
          "Would you rather do a chill nature walk or a full challenge hike first date?",
          "What's one adventure story that always gets retold in your friend group?",
          "If we had 4 hours and no plan, where are we heading first?",
          "What's your go-to post-hike reward meal?",
        ],
        suggestedMissions: [
          {
            title: "Sunrise Summit Challenge",
            description:
              "Wake up way too early, hike to a viewpoint, watch the sunrise together. Bonus: bring the dog.",
            vibeMatch: 0.94,
            estimatedCost: "Free",
            duration: "3-4 hours",
            placeName: null,
            placeId: null,
            whyThisSpot: null,
            lat: null,
            lng: null,
            icebreakerQuestion:
              "If we did this challenge this weekend, what would your ideal route look like?",
            followUpQuestions: [
              "What's your current favorite outdoor spot?",
              "Are you team sunrise grind or sunset cruise?",
            ],
            topicCues: [
              "Outdoor routines",
              "Travel mindset",
              "Dog-friendly plans",
            ],
            doTips: ["Keep tone playful", "Offer a simple route option"],
            avoidTips: ["Avoid overcomplicating logistics"],
            bestTimingCue:
              "Use after they engage with travel or outdoors topics.",
          },
          {
            title: "Dog Park Social Hour",
            description:
              "Bring the pup, grab a coffee to-go, and see who's better at making friends — you or the dog.",
            vibeMatch: 0.88,
            estimatedCost: "$5-$10",
            duration: "1-2 hours",
            placeName: null,
            placeId: null,
            whyThisSpot: null,
            lat: null,
            lng: null,
            icebreakerQuestion:
              "What's your dog-approved first-date activity with the least awkward energy?",
            followUpQuestions: [
              "Would your dog judge my snack choices?",
              "Do you prefer playful chaos or calm park vibes?",
            ],
            topicCues: ["Pets", "Social energy", "Favorite local parks"],
            doTips: ["Use humor", "Suggest a flexible time window"],
            avoidTips: ["Avoid sounding too formal"],
            bestTimingCue: "Great when pet talk is already a positive thread.",
          },
          {
            title: "Trail & Tacos",
            description:
              "Pick a moderately hard trail, race to the top, loser buys street tacos after.",
            vibeMatch: 0.91,
            estimatedCost: "$10-$20",
            duration: "4-5 hours",
            placeName: null,
            placeId: null,
            whyThisSpot: null,
            lat: null,
            lng: null,
            icebreakerQuestion:
              "If tacos are on the line, how competitive are you on a trail challenge?",
            followUpQuestions: [
              "What's your ideal trail difficulty for a first date?",
              "Would you pick food first or views first?",
            ],
            topicCues: [
              "Food motivation",
              "Friendly competition",
              "Adventure pace",
            ],
            doTips: ["Keep stakes playful", "Set a clear meetup point"],
            avoidTips: ["Avoid making it feel like a fitness test"],
            bestTimingCue: "Best after shared banter about food or activity.",
          },
        ],
      },
    },
    {
      input: {
        hintTags: ["Coffee addict", "Bookworm"],
        profileDescription:
          "Cozy café photos, reading nook, minimalist aesthetic",
        environmentContext: {
          city: "Bangkok",
          weather: { temp: 34, description: "scattered clouds", humidity: 75 },
          nearbyPlaces: [
            {
              name: "Brave Roasters",
              types: ["cafe"],
              rating: 4.6,
              vicinity: "Sukhumvit 23",
            },
            {
              name: "Lumpini Park",
              types: ["park"],
              rating: 4.5,
              vicinity: "Silom",
            },
          ],
        },
      },
      output: {
        predictedStyle: "intellectual",
        vibePrediction: {
          confidence: 0.82,
          dominantTrait: "intellectual",
          secondaryTrait: "shy",
          summary:
            "Quiet observer who finds magic in details. They want meaningful conversation over loud nights.",
          communicationTips: [
            "Ask deep questions — they enjoy thinking out loud",
            "Share a book recommendation — it shows effort",
            "Keep the pace slow — don't rush the connection",
          ],
        },
        conversationOpeners: [
          "The way your bookshelf is organized tells me you have strong opinions on fonts. Am I right?",
          "Bangkok's too hot to go outside — want to judge each other's reading lists over iced lattes?",
          "I need a new book to obsess over. What's the last one that kept you up past midnight?",
          "What's a niche topic you can explain way too passionately?",
          "Are you more dog-ear-pages or pristine-book people?",
          "If we did a two-hour café date, what would we definitely end up debating?",
          "What's one quiet place in Bangkok that instantly resets your mood?",
          "What recommendation from a friend actually lived up to the hype recently?",
        ],
        suggestedMissions: [
          {
            title: "The Brave Roasters Book Swap",
            description:
              "Meet at Brave Roasters on Sukhumvit 23, each bring a favorite book to swap. Whoever finishes first buys the next round of lattes.",
            vibeMatch: 0.91,
            estimatedCost: "$5-$15",
            duration: "2-3 hours",
            placeName: "Brave Roasters",
            placeId: "ChIJ_placeholder",
            whyThisSpot:
              "Quiet specialty café with reading-friendly corners — perfectly on-brand for a bookworm date.",
            lat: 13.7381,
            lng: 100.5641,
            icebreakerQuestion:
              "What's one book you'd trust as your personality trailer if we swapped today?",
            followUpQuestions: [
              "Do you annotate books or keep them pristine?",
              "What makes a café feel conversation-friendly to you?",
            ],
            topicCues: ["Books", "Café rituals", "Bangkok hidden gems"],
            doTips: [
              "Bring one personal recommendation",
              "Ask one thoughtful follow-up",
            ],
            avoidTips: ["Avoid turning it into an interview"],
            bestTimingCue:
              "Use when chat already includes books, writing, or café culture.",
          },
          {
            title: "Lumpini Park Sunset Read",
            description:
              "Grab iced teas, claim a shady bench in Lumpini Park, and read side by side until the sun sets. First one to break the silence buys dinner.",
            vibeMatch: 0.85,
            estimatedCost: "Free",
            duration: "2-3 hours",
            placeName: "Lumpini Park",
            placeId: "ChIJ_placeholder2",
            whyThisSpot:
              "Bangkok's most iconic green escape — perfect for a low-key, introspective date.",
            lat: 13.7318,
            lng: 100.5415,
            icebreakerQuestion:
              "Would your ideal park date be quiet reading, people-watching, or deep conversation?",
            followUpQuestions: [
              "What type of books fit a sunset park mood for you?",
              "Would you rather walk-and-talk or sit and chat?",
            ],
            topicCues: ["Slow dating", "City escapes", "Reading habits"],
            doTips: [
              "Suggest a clear weather-friendly time",
              "Keep tone warm and low-pressure",
            ],
            avoidTips: ["Avoid over-scheduling the day"],
            bestTimingCue:
              "Great when weather and low-key plans come up naturally.",
          },
          {
            title: "Indie Bookstore Crawl",
            description:
              "Hit 3 bookstores in Ari/Ekkamai, each pick one book for the other. It's a vibe check disguised as shopping.",
            vibeMatch: 0.88,
            estimatedCost: "$15-$30",
            duration: "3-4 hours",
            placeName: null,
            placeId: null,
            whyThisSpot: null,
            lat: null,
            lng: null,
            icebreakerQuestion:
              "If we had one afternoon for a bookstore crawl, which neighborhood gets first pick?",
            followUpQuestions: [
              "Do you choose books by cover, reviews, or pure instinct?",
              "What topic would you love to discover a new book about right now?",
            ],
            topicCues: [
              "Book discovery",
              "Personal taste",
              "Creative routines",
            ],
            doTips: ["Offer a short route", "Keep invitation flexible"],
            avoidTips: ["Avoid making it sound expensive or intense"],
            bestTimingCue:
              "Use after they show curiosity about books or neighborhoods.",
          },
        ],
      },
    },
  ],
});

// ============================================================================
// Pipeline 3: Compatibility Engine
// ============================================================================

export const compatibilityPrompt = createPromptTemplate({
  role: "Expert relationship compatibility analyst for the Tinhyeuchuchube dating platform. You specialize in finding genuine connection points between two people based on their vibe profiles, interests, and communication styles. You write narratives that make people excited to meet.",
  task: "Compare two user profiles and generate a compatibility assessment. Find genuine synergy — not just surface similarities. If the score is above 0.7, generate a compelling 'Synergy Narrative' that explains WHY they'd work well together.",
  rules: [
    "Return ONLY valid JSON — no markdown, no explanation, no preamble",
    "score must be a float between 0.0 and 1.0 — be honest, not everyone is compatible",
    "narrative should be 2-3 sentences and feel personal, not formulaic",
    "commonGround must list 3-5 specific shared traits or complementary qualities found by analysis",
    "If score < 0.7, narrative should still be encouraging but realistic",
    "Consider complementary traits (e.g., 'chill' + 'chaotic' can work) — not just identical ones",
    "Factor in energy levels, interests, communication styles, and lifestyle compatibility",
    "The narrative should make both people want to connect",
  ],
  output: {
    score: "number 0.0-1.0 — overall compatibility score",
    narrative: "string — 2-3 sentence synergy narrative explaining the match",
    commonGround: ["string — 3-5 specific shared or complementary traits"],
    energyCompatibility: {
      description: "string — how their energy levels interact",
      score: "number 0.0-1.0",
    },
    interestOverlap: {
      shared: ["string — interests they have in common"],
      complementary: ["string — different interests that work well together"],
    },
    conversationStarter:
      "string — a conversation starter based on their shared ground",
  },
  examples: [
    {
      input: {
        profileA: {
          vibeName: "The Urban Minimalist",
          energy: "chill",
          interests: [
            "architecture",
            "specialty coffee",
            "vinyl records",
            "film photography",
          ],
          summary:
            "Clean aesthetic, café enthusiast, introspective but warm once comfortable.",
        },
        profileB: {
          vibeName: "The Night Owl Intellectual",
          energy: "moderate",
          interests: [
            "philosophy",
            "documentary films",
            "bookstores",
            "jazz bars",
            "writing",
          ],
          summary:
            "Deep thinker, loves late-night conversations, values authenticity over flash.",
        },
      },
      output: {
        score: 0.84,
        narrative:
          "You're both curators — one of spaces, the other of ideas. The best coffee shop in the city hasn't been found yet, but you two will find it at 11 PM on a Tuesday and stay until they kick you out.",
        commonGround: [
          "Appreciation for curated, intentional experiences",
          "Both value depth over surface-level interaction",
          "Complementary creative outlets (visual vs written)",
          "Shared love of analog culture (vinyl, bookstores)",
          "Both prefer intimate settings over crowds",
        ],
        energyCompatibility: {
          description:
            "Chill meets moderate — grounded enough to sync but different enough to inspire growth.",
          score: 0.82,
        },
        interestOverlap: {
          shared: ["analog culture", "café culture", "arts appreciation"],
          complementary: [
            "Architecture (visual) + Philosophy (conceptual)",
            "Film photography + Documentary films",
          ],
        },
        conversationStarter:
          "You both seem like the type who has a 'spot' — a café or bookstore that nobody else knows about. Swap locations?",
      },
    },
  ],
});
