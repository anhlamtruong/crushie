/**
 * Onboard Quiz Questions — Multiple-choice question data
 *
 * Each question maps to a key in vibeQuizAnswersSchema.
 * Mixing the original 5 questions with 3 new engaging ones.
 */

export type QuizOption = {
  value: string;
  label: string;
  emoji: string;
};

export type QuizQuestion = {
  key: string;
  label: string;
  emoji: string;
  subtitle?: string;
  options: QuizOption[];
};

export const onboardQuestions: QuizQuestion[] = [
  {
    key: "socialBattery",
    label: "What's your social energy?",
    emoji: "⚡",
    subtitle: "How do you recharge?",
    options: [
      { value: "introvert", label: "Introvert", emoji: "📚" },
      { value: "ambivert", label: "Ambivert", emoji: "🌗" },
      { value: "extrovert", label: "Extrovert", emoji: "🎉" },
    ],
  },
  {
    key: "dateVibe",
    label: "Your ideal first date?",
    emoji: "💫",
    subtitle: "Pick the vibe that matches you",
    options: [
      { value: "coffee_deep_talk", label: "Coffee & deep talk", emoji: "☕" },
      { value: "adventure_activity", label: "Adventure activity", emoji: "🏔️" },
      { value: "group_hangout", label: "Group hangout", emoji: "👯" },
    ],
  },
  {
    key: "rainyFriday",
    label: "Rainy Friday night — you're...",
    emoji: "🌧️",
    subtitle: "What's your go-to?",
    options: [
      { value: "vinyl_chill", label: "Vinyl & chill at home", emoji: "🎶" },
      {
        value: "street_food_chaos",
        label: "Street food adventure",
        emoji: "🍜",
      },
    ],
  },
  {
    key: "musicMood",
    label: "Your music mood?",
    emoji: "🎵",
    subtitle: "What's always on your playlist?",
    options: [
      { value: "lo_fi", label: "Lo-fi", emoji: "🌙" },
      { value: "indie", label: "Indie", emoji: "🎸" },
      { value: "edm", label: "EDM", emoji: "🔊" },
      { value: "hip_hop", label: "Hip hop", emoji: "🎤" },
      { value: "jazz", label: "Jazz", emoji: "🎷" },
    ],
  },
  {
    key: "travelStyle",
    label: "How do you travel?",
    emoji: "✈️",
    subtitle: "Planned or spontaneous?",
    options: [
      { value: "planned", label: "Itinerary planned", emoji: "📋" },
      { value: "spontaneous", label: "Go with the flow", emoji: "🌊" },
    ],
  },
  {
    key: "loveLanguage",
    label: "What's your love language?",
    emoji: "💕",
    subtitle: "How do you express affection?",
    options: [
      { value: "words_of_affirmation", label: "Words", emoji: "💌" },
      { value: "quality_time", label: "Quality time", emoji: "⏰" },
      { value: "physical_touch", label: "Physical touch", emoji: "🤗" },
      { value: "acts_of_service", label: "Acts of service", emoji: "🛠️" },
      { value: "gifts", label: "Gifts", emoji: "🎁" },
    ],
  },
  {
    key: "conflictStyle",
    label: "After a disagreement, you...",
    emoji: "🤔",
    subtitle: "How do you handle conflict?",
    options: [
      { value: "talk_it_out", label: "Talk it out", emoji: "💬" },
      { value: "need_space", label: "Need space first", emoji: "🧘" },
      { value: "humor", label: "Use humor", emoji: "😂" },
      { value: "apologize_first", label: "Apologize first", emoji: "🫶" },
    ],
  },
  {
    key: "weekendVibe",
    label: "Your ideal weekend?",
    emoji: "🌈",
    subtitle: "How would you spend it?",
    options: [
      {
        value: "explore_new_places",
        label: "Explore somewhere new",
        emoji: "🗺️",
      },
      { value: "cozy_at_home", label: "Cozy at home", emoji: "🏠" },
      { value: "social_gathering", label: "Social gathering", emoji: "🥂" },
      { value: "creative_project", label: "Creative project", emoji: "🎨" },
    ],
  },
];
