"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Users,
  TrendingUp,
  MapPin,
  Cloud,
  Clock,
  DollarSign,
  Sparkles,
  BarChart3,
  Activity,
  Zap,
  Target,
  MessageCircle,
} from "lucide-react";

// Types
interface User {
  name: string;
  age: number;
  traits: string[];
}

interface VibeVector {
  compatibility: number;
  dominantTraits: string[];
  sharedInterests: string[];
}

interface ContextVariables {
  location: string;
  weather: string;
  timeOfDay: string;
  budget: string;
}

interface Match {
  id: number;
  user1: User;
  user2: User;
  similarityScore: number;
  successProbability: number;
  vibeVector: VibeVector;
  contextVariables: ContextVariables;
  matchedAt: string;
  status: string;
}

interface Mission {
  title: string;
  description: string;
  location: string;
  duration: string;
  reasoning: string;
  activityType?: string;
  estimatedCost?: string;
}

export default function DatingAppFlow3() {
  const [view, setView] = useState<"user" | "admin">("user");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);

  // Sample Match Data - Stage 3: Post-Match
  const sampleMatches: Match[] = [
    {
      id: 1,
      user1: {
        name: "Alex",
        age: 28,
        traits: ["Creative", "Adventurous", "Foodie"],
      },
      user2: {
        name: "Jordan",
        age: 26,
        traits: ["Artistic", "Spontaneous", "Coffee Lover"],
      },
      similarityScore: 0.87,
      successProbability: 0.82,
      vibeVector: {
        compatibility: 87,
        dominantTraits: [
          "Creative Energy",
          "Social Butterfly",
          "Urban Explorer",
        ],
        sharedInterests: ["Art", "Food", "Travel", "Photography"],
      },
      contextVariables: {
        location: "Brooklyn, NYC",
        weather: "Sunny, 72°F",
        timeOfDay: "Evening",
        budget: "Moderate ($50-100)",
      },
      matchedAt: "2024-02-14T10:30:00Z",
      status: "active",
    },
    {
      id: 2,
      user1: {
        name: "Sam",
        age: 30,
        traits: ["Intellectual", "Calm", "Book Lover"],
      },
      user2: {
        name: "Taylor",
        age: 27,
        traits: ["Thoughtful", "Nature Lover", "Tea Enthusiast"],
      },
      similarityScore: 0.79,
      successProbability: 0.75,
      vibeVector: {
        compatibility: 79,
        dominantTraits: [
          "Mindful Living",
          "Nature Connected",
          "Deep Conversations",
        ],
        sharedInterests: ["Books", "Hiking", "Philosophy", "Sustainability"],
      },
      contextVariables: {
        location: "Portland, OR",
        weather: "Partly Cloudy, 68°F",
        timeOfDay: "Afternoon",
        budget: "Low-Moderate ($30-50)",
      },
      matchedAt: "2024-02-14T14:15:00Z",
      status: "active",
    },
    {
      id: 3,
      user1: {
        name: "Morgan",
        age: 25,
        traits: ["Energetic", "Fitness Enthusiast", "Outgoing"],
      },
      user2: {
        name: "Casey",
        age: 24,
        traits: ["Active", "Health-Conscious", "Fun-Loving"],
      },
      similarityScore: 0.91,
      successProbability: 0.88,
      vibeVector: {
        compatibility: 91,
        dominantTraits: [
          "High Energy",
          "Wellness Focused",
          "Adventure Seekers",
        ],
        sharedInterests: [
          "Fitness",
          "Outdoor Activities",
          "Healthy Eating",
          "Sports",
        ],
      },
      contextVariables: {
        location: "Austin, TX",
        weather: "Clear, 78°F",
        timeOfDay: "Morning",
        budget: "Moderate ($40-80)",
      },
      matchedAt: "2024-02-14T08:45:00Z",
      status: "active",
    },
  ];

  // AI Mission Generator using Claude API
  const generateMissions = async (matchData: Match) => {
    setIsGenerating(true);

    const prompt = `You are an expert AI dating coach. Generate 3 highly personalized, creative first date mission ideas for this matched couple:

**Match Profile:**
- Compatibility Score: ${matchData.similarityScore * 100}%
- Success Probability: ${matchData.successProbability * 100}%
- Shared Personality Traits: ${matchData.vibeVector.dominantTraits.join(", ")}
- Common Interests: ${matchData.vibeVector.sharedInterests.join(", ")}
- User 1: ${matchData.user1.name} (${matchData.user1.age}) - ${matchData.user1.traits.join(", ")}
- User 2: ${matchData.user2.name} (${matchData.user2.age}) - ${matchData.user2.traits.join(", ")}

**Context Variables:**
- Location: ${matchData.contextVariables.location}
- Current Weather: ${matchData.contextVariables.weather}
- Preferred Time: ${matchData.contextVariables.timeOfDay}
- Budget Range: ${matchData.contextVariables.budget}

**Requirements:**
1. Each mission should be specific, actionable, and unique
2. Leverage their shared interests and complementary traits
3. Consider the weather and time of day
4. Stay within budget constraints
5. Create opportunities for natural conversation and connection
6. Include a mix of activity levels (relaxed, moderate, active)

Return ONLY a valid JSON array with exactly this structure (no markdown, no extra text):
[
  {
    "title": "Creative 3-5 word mission name",
    "description": "Detailed 2-3 sentence description of the date activity and flow",
    "location": "Specific venue or area name in their city",
    "duration": "Realistic time estimate (e.g., '2 hours', '3-4 hours')",
    "reasoning": "Why this mission works perfectly for this specific couple based on their vibe vectors and context",
    "activityType": "relaxed/moderate/active",
    "estimatedCost": "Specific dollar range per person"
  }
]`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content
        .map((item: any) => (item.type === "text" ? item.text : ""))
        .join("\n");

      const cleanText = text.replace(/```json|```/g, "").trim();
      const generatedMissions = JSON.parse(cleanText);

      setMissions(generatedMissions);
    } catch (error) {
      console.error("Error generating missions:", error);

      // Fallback missions based on match profile
      const fallbackMissions: Mission[] = getFallbackMissions(matchData);
      setMissions(fallbackMissions);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback missions generator
  const getFallbackMissions = (match: Match): Mission[] => {
    const location = match.contextVariables.location.split(",")[0];

    if (match.vibeVector.sharedInterests.includes("Art")) {
      return [
        {
          title: "Sunset Gallery Stroll & Coffee",
          description:
            "Start at a contemporary art gallery showcasing local artists, then walk to a nearby artisan coffee shop. Discuss your favorite pieces over specialty drinks and maybe sketch each other on napkins.",
          location: `Local Art District, ${location}`,
          duration: "2-3 hours",
          reasoning:
            "Combines your shared love for art and coffee in a low-pressure environment. The art provides natural conversation starters, while the coffee shop offers a cozy space for deeper connection.",
          activityType: "relaxed",
          estimatedCost: "$25-40 per person",
        },
        {
          title: "DIY Art Class & Wine",
          description:
            "Take a couples pottery or painting class together. Get hands-on creating something while chatting, then grab drinks nearby to continue the conversation.",
          location: `Creative Studio, ${location}`,
          duration: "2.5 hours",
          reasoning:
            "Active participation breaks ice naturally. Working with your hands reveals personality while creating a shared experience and potential inside jokes.",
          activityType: "moderate",
          estimatedCost: "$45-65 per person",
        },
        {
          title: "Street Art Food Tour",
          description:
            "Explore vibrant murals and street art while stopping at 4-5 highly-rated food spots. Combine visual art appreciation with culinary adventure.",
          location: `Wynwood/Arts District, ${location}`,
          duration: "3-4 hours",
          reasoning:
            "Perfect blend of your adventurous foodie sides and artistic interests. Walking and eating together feels natural, with constant new topics from art and flavors.",
          activityType: "active",
          estimatedCost: "$35-55 per person",
        },
      ];
    } else if (match.vibeVector.sharedInterests.includes("Fitness")) {
      return [
        {
          title: "Sunrise Yoga & Smoothie Bowl",
          description:
            "Start with an outdoor yoga class in the park, followed by healthy smoothie bowls and fresh juice at a wellness cafe. Perfect morning energy.",
          location: `Central Park, ${location}`,
          duration: "2 hours",
          reasoning:
            "Aligns perfectly with your wellness-focused lifestyles. Morning activity energizes the date, and post-workout endorphins create positive association.",
          activityType: "active",
          estimatedCost: "$20-35 per person",
        },
        {
          title: "Rock Climbing & Protein Shake",
          description:
            "Try indoor rock climbing together - great for encouraging each other and light physical contact while belaying. Cool down with protein shakes after.",
          location: `Climbing Gym, ${location}`,
          duration: "2.5 hours",
          reasoning:
            "Adventure + fitness combo. Climbing requires trust and teamwork, naturally building connection. Shared challenge creates bonding opportunity.",
          activityType: "active",
          estimatedCost: "$30-45 per person",
        },
        {
          title: "Bike Trail & Picnic",
          description:
            "Rent bikes and cruise a scenic trail, stopping halfway for a healthy picnic you prepared together. Active but allows for conversation.",
          location: `Riverside Trail, ${location}`,
          duration: "3 hours",
          reasoning:
            "Moderate activity level perfect for talking while moving. Preparing picnic together shows teamwork. Nature setting reduces first-date pressure.",
          activityType: "moderate",
          estimatedCost: "$25-40 per person",
        },
      ];
    } else {
      return [
        {
          title: "Bookstore Treasure Hunt",
          description:
            "Each pick 3 books for the other person based on their vibe. Discuss choices over tea/coffee at the in-store cafe. See how well you read each other.",
          location: `Independent Bookstore, ${location}`,
          duration: "1.5-2 hours",
          reasoning:
            "Intellectual and thoughtful activity matching your mindful personalities. Reveals how you perceive each other and creates natural deep conversations.",
          activityType: "relaxed",
          estimatedCost: "$15-30 per person",
        },
        {
          title: "Forest Bathing & Meditation",
          description:
            "Take a guided nature walk focused on mindfulness and presence. End with meditation by a scenic viewpoint and philosophical discussion.",
          location: `Nature Reserve, ${location}`,
          duration: "2.5 hours",
          reasoning:
            "Perfect for your nature-loving, contemplative sides. Slow pace allows genuine connection. Shared silence can be as powerful as conversation.",
          activityType: "moderate",
          estimatedCost: "$20-35 per person",
        },
        {
          title: "Philosophy Cafe & Board Games",
          description:
            "Visit a unique philosophy-themed cafe with discussion topics on tables. Play thought-provoking board games while enjoying tea and pastries.",
          location: `Philosophy Cafe, ${location}`,
          duration: "2-3 hours",
          reasoning:
            "Engages your intellectual curiosity and love of deep conversations. Games provide structure while philosophy prompts ensure meaningful dialogue.",
          activityType: "relaxed",
          estimatedCost: "$25-40 per person",
        },
      ];
    }
  };

  // Auto-generate missions when match is selected
  useEffect(() => {
    if (selectedMatch && missions.length === 0) {
      generateMissions(selectedMatch);
    }
  }, [selectedMatch]);

  // Initialize with first match
  useEffect(() => {
    if (!selectedMatch) {
      setSelectedMatch(sampleMatches[0]);
    }
  }, []);

  // User View Component
  const UserView = () => {
    if (!selectedMatch) return null;

    return (
      <div className="space-y-6">
        {/* Match Success Header */}
        <div className="bg-linear-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Heart
                  className="text-pink-200"
                  size={32}
                  fill="currentColor"
                />
                <h2 className="text-4xl font-bold">It's a Match!</h2>
              </div>
              <p className="text-pink-100 text-lg">
                {selectedMatch.user1.name} & {selectedMatch.user2.name}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-1">
                {Math.round(selectedMatch.similarityScore * 100)}%
              </div>
              <div className="text-sm text-pink-100 font-medium">
                Similarity Score
              </div>
            </div>
          </div>

          {/* Success Probability Meter */}
          <div className="bg-white/20 rounded-xl p-5 backdrop-blur-lg border border-white/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="text-white" size={20} />
                <span className="text-sm font-semibold">
                  Expected Success Probability
                </span>
              </div>
              <span className="text-2xl font-bold">
                {Math.round(selectedMatch.successProbability * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
              <div
                className="bg-linear-to-r from-green-400 to-emerald-300 rounded-full h-4 transition-all duration-1000 shadow-lg"
                style={{ width: `${selectedMatch.successProbability * 100}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-white/80">
              Based on vibe vector analysis, shared interests, and contextual
              factors
            </div>
          </div>
        </div>

        {/* Vibe Vector Compatibility Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-500" size={28} />
            Vibe Vector Compatibility
          </h3>

          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-3 font-medium">
              Dominant Shared Traits:
            </div>
            <div className="grid grid-cols-3 gap-3">
              {selectedMatch.vibeVector.dominantTraits.map((trait, idx) => (
                <div
                  key={idx}
                  className="bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl p-4 text-center border border-purple-200"
                >
                  <div className="text-sm font-bold text-purple-700">
                    {trait}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-sm text-gray-600 mb-3 font-medium">
              Shared Interests:
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedMatch.vibeVector.sharedInterests.map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold border border-pink-200"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <Zap className="text-purple-600 mt-1 shrink-0" size={20} />
              <div className="text-sm text-gray-700">
                <span className="font-semibold text-purple-700">
                  AI Insight:
                </span>{" "}
                Your vibe vectors show exceptional alignment in creative
                expression and social energy. This combination typically leads
                to engaging, dynamic first dates with natural conversation flow.
              </div>
            </div>
          </div>
        </div>

        {/* Context Variables */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <Activity className="text-blue-500" size={28} />
            Context Variables Used
          </h3>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex items-start gap-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="bg-blue-500 rounded-lg p-2">
                <MapPin className="text-white" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
                  Location
                </div>
                <div className="font-bold text-gray-900">
                  {selectedMatch.contextVariables.location}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-sky-50 rounded-xl p-4 border border-sky-200">
              <div className="bg-sky-500 rounded-lg p-2">
                <Cloud className="text-white" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
                  Weather
                </div>
                <div className="font-bold text-gray-900">
                  {selectedMatch.contextVariables.weather}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="bg-orange-500 rounded-lg p-2">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
                  Preferred Time
                </div>
                <div className="font-bold text-gray-900">
                  {selectedMatch.contextVariables.timeOfDay}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="bg-green-500 rounded-lg p-2">
                <DollarSign className="text-white" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
                  Budget Range
                </div>
                <div className="font-bold text-gray-900">
                  {selectedMatch.contextVariables.budget}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 italic text-center">
            AI Mission Generator uses real-time data to optimize date
            suggestions
          </div>
        </div>

        {/* AI-Orchestrated Real-World Interaction Plan */}
        <div className="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <Sparkles className="text-indigo-600" size={32} />
                AI-Orchestrated Interaction Plan
              </h3>
              <p className="text-gray-600">
                Personalized missions generated from your vibe vectors
              </p>
            </div>
            <button
              onClick={() => generateMissions(selectedMatch)}
              disabled={isGenerating}
              className="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Refresh Missions
                </>
              )}
            </button>
          </div>

          {isGenerating ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-700 font-medium">
                AI is analyzing your compatibility...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Crafting the perfect first date experiences
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {missions.map((mission, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-6 transition-all border-2 ${
                    selectedMission === idx
                      ? "border-indigo-500 shadow-xl scale-[1.02]"
                      : "border-gray-200 hover:border-indigo-300 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-2xl font-bold text-indigo-900">
                          {mission.title}
                        </h4>
                        {mission.activityType && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              mission.activityType === "relaxed"
                                ? "bg-green-100 text-green-700"
                                : mission.activityType === "moderate"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {mission.activityType}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold flex-shrink-0">
                      Mission {idx + 1}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-5 leading-relaxed text-base">
                    {mission.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-3">
                      <MapPin
                        size={16}
                        className="text-indigo-500 flex-shrink-0"
                      />
                      <span className="text-gray-700 font-medium">
                        {mission.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-3">
                      <Clock
                        size={16}
                        className="text-purple-500 flex-shrink-0"
                      />
                      <span className="text-gray-700 font-medium">
                        {mission.duration}
                      </span>
                    </div>
                    {mission.estimatedCost && (
                      <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-3">
                        <DollarSign
                          size={16}
                          className="text-green-500 flex-shrink-0"
                        />
                        <span className="text-gray-700 font-medium">
                          {mission.estimatedCost}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-l-4 border-indigo-500 mb-4">
                    <div className="flex items-start gap-2">
                      <Sparkles
                        size={16}
                        className="text-indigo-600 mt-1 flex-shrink-0"
                      />
                      <div>
                        <div className="text-xs text-indigo-600 font-bold mb-1 uppercase tracking-wide">
                          Why This Works:
                        </div>
                        <div className="text-sm text-indigo-900 leading-relaxed">
                          {mission.reasoning}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setSelectedMission(selectedMission === idx ? null : idx)
                      }
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        selectedMission === idx
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                    >
                      {selectedMission === idx
                        ? "✓ Selected"
                        : "Select Mission"}
                    </button>
                    <button className="px-6 py-3 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition-colors flex items-center gap-2">
                      <MessageCircle size={18} />
                      Propose
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {missions.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="text-indigo-500" size={16} />
                <span>
                  <span className="font-semibold">AI Generated:</span> These
                  missions are uniquely crafted using Claude's advanced language
                  model, analyzing{" "}
                  {selectedMatch.vibeVector.sharedInterests.length} shared
                  interests, {selectedMatch.vibeVector.dominantTraits.length}{" "}
                  compatibility traits, and 4 real-time context variables.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Admin View Component
  const AdminView = () => {
    const totalMatches = sampleMatches.length;
    const avgSimilarity = (
      (sampleMatches.reduce((acc, m) => acc + m.similarityScore, 0) /
        totalMatches) *
      100
    ).toFixed(1);
    const avgSuccess = (
      (sampleMatches.reduce((acc, m) => acc + m.successProbability, 0) /
        totalMatches) *
      100
    ).toFixed(1);

    return (
      <div className="space-y-6">
        {/* Admin Analytics Cards */}
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                Active Matches
              </div>
              <div className="bg-blue-100 rounded-lg p-2">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {totalMatches}
            </div>
            <div className="text-sm text-green-600 font-semibold flex items-center gap-1">
              <TrendingUp size={14} />↑ 12% from last week
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                Avg Similarity
              </div>
              <div className="bg-purple-100 rounded-lg p-2">
                <Heart className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {avgSimilarity}%
            </div>
            <div className="text-sm text-purple-600 font-semibold">
              High quality matches
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                Avg Success Rate
              </div>
              <div className="bg-green-100 rounded-lg p-2">
                <Activity className="text-green-600" size={24} />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {avgSuccess}%
            </div>
            <div className="text-sm text-green-600 font-semibold flex items-center gap-1">
              <TrendingUp size={14} />↑ 5% improvement
            </div>
          </div>
        </div>

        {/* All Matches Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <BarChart3 className="text-blue-500" />
            All Active Matches - Stage 3
          </h3>

          <div className="space-y-4">
            {sampleMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => {
                  setSelectedMatch(match);
                  setView("user");
                  setMissions([]);
                }}
                className="border-2 border-gray-200 rounded-xl p-5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all hover:border-purple-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-full p-3">
                      <Heart
                        className="text-white"
                        size={24}
                        fill="currentColor"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">
                        {match.user1.name} & {match.user2.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Matched:{" "}
                        {new Date(match.matchedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {Math.round(match.similarityScore * 100)}%
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">
                      Match Score
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-gray-600 text-xs font-semibold mb-1">
                      Success Prob.
                    </div>
                    <div className="font-bold text-green-700 text-lg">
                      {Math.round(match.successProbability * 100)}%
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-gray-600 text-xs font-semibold mb-1">
                      Location
                    </div>
                    <div className="font-bold text-blue-700 truncate text-sm">
                      {match.contextVariables.location.split(",")[0]}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="text-gray-600 text-xs font-semibold mb-1">
                      Shared Traits
                    </div>
                    <div className="font-bold text-purple-700 text-lg">
                      {match.vibeVector.dominantTraits.length}
                    </div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                    <div className="text-gray-600 text-xs font-semibold mb-1">
                      Status
                    </div>
                    <div className="font-bold text-pink-700 capitalize">
                      {match.status}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {match.vibeVector.sharedInterests
                    .slice(0, 4)
                    .map((interest, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {interest}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-6 border-2 border-indigo-200">
          <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={28} />
            AI Mission Generator Performance
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-indigo-200 rounded-xl p-5">
              <div className="text-sm text-gray-600 mb-2 font-semibold">
                Missions Generated Today
              </div>
              <div className="text-3xl font-bold text-indigo-600">24</div>
              <div className="text-xs text-gray-500 mt-2">
                Avg 3 missions per match
              </div>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-xl p-5">
              <div className="text-sm text-gray-600 mb-2 font-semibold">
                Mission Acceptance Rate
              </div>
              <div className="text-3xl font-bold text-green-600">78%</div>
              <div className="text-xs text-gray-500 mt-2">
                Users accepted AI suggestions
              </div>
            </div>

            <div className="bg-white border-2 border-purple-200 rounded-xl p-5">
              <div className="text-sm text-gray-600 mb-2 font-semibold">
                Context Variables Used
              </div>
              <div className="text-3xl font-bold text-purple-600">4</div>
              <div className="text-xs text-gray-500 mt-2">
                Weather, Location, Time, Budget
              </div>
            </div>

            <div className="bg-white border-2 border-blue-200 rounded-xl p-5">
              <div className="text-sm text-gray-600 mb-2 font-semibold">
                Avg Response Time
              </div>
              <div className="text-3xl font-bold text-blue-600">2.3s</div>
              <div className="text-xs text-gray-500 mt-2">
                Fast AI generation
              </div>
            </div>
          </div>

          <div className="mt-5 bg-white rounded-xl p-4 border border-indigo-200">
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-indigo-700">AI Model:</span>{" "}
              Claude Sonnet 4 (claude-sonnet-4-20250514) - Advanced vibe vector
              analysis with real-time context integration
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Dating App - Flow 3
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            AI-Orchestrated Real-World Interaction Plan
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Post-Match Stage: Personalized mission generation using vibe vectors
            & context variables
          </p>
        </div>

        {/* View Switcher */}
        <div className="bg-white rounded-2xl shadow-xl p-3 mb-8 flex gap-3 border border-gray-200">
          <button
            onClick={() => setView("user")}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
              view === "user"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-[1.02]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            👤 User View
          </button>
          <button
            onClick={() => setView("admin")}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
              view === "admin"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-[1.02]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ⚙️ Admin View
          </button>
        </div>

        {/* Main Content */}
        {view === "user" ? <UserView /> : <AdminView />}
      </div>
    </div>
  );
}
