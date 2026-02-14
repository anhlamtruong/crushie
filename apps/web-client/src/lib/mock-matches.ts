export type DiscoverPronouns = "she/her" | "he/him" | "they/them";
export type DiscoverGender = "Woman" | "Man" | "Non-binary";
export type DiscoverPreference = "Women" | "Men" | "Non-binary" | "Everyone";

export interface MockMatchProfile {
  id: string;
  displayName: string;
  age: number;
  city: string;
  pronouns: DiscoverPronouns;
  gender: DiscoverGender;
  lookingFor: DiscoverPreference;
  vibeLabel: string;
  interests: string[];
  mutualConnectionsCount: number;
  isVerified: boolean;
  isAutoMatch: boolean;
  whyMatchPreview: string;
}

export const MOCK_MATCHES: MockMatchProfile[] = [
  {
    id: "m_01",
    displayName: "Nhi",
    age: 25,
    city: "Ho Chi Minh City",
    pronouns: "she/her",
    gender: "Woman",
    lookingFor: "Everyone",
    vibeLabel: "The Urban Minimalist",
    interests: ["Cà phê", "Museum dates", "Design books", "Pilates"],
    mutualConnectionsCount: 2,
    isVerified: true,
    isAutoMatch: false,
    whyMatchPreview:
      "You both recharge through calm city rituals and thoughtful routines, so your day-to-day rhythm feels naturally aligned.",
  },
  {
    id: "m_02",
    displayName: "An",
    age: 27,
    city: "Da Nang",
    pronouns: "they/them",
    gender: "Non-binary",
    lookingFor: "Everyone",
    vibeLabel: "The Sunset Storyteller",
    interests: ["Beach walks", "Poetry", "Film photography", "Vinyl"],
    mutualConnectionsCount: 4,
    isVerified: true,
    isAutoMatch: true,
    whyMatchPreview:
      "Your emotional tempo is compatible: both of you prefer intentional conversations and meaningful moments over small talk.",
  },
  {
    id: "m_03",
    displayName: "Minh",
    age: 29,
    city: "Hanoi",
    pronouns: "he/him",
    gender: "Man",
    lookingFor: "Everyone",
    vibeLabel: "The Weekend Explorer",
    interests: ["Hiking", "Street food", "Photo dumps", "Board games"],
    mutualConnectionsCount: 1,
    isVerified: false,
    isAutoMatch: false,
    whyMatchPreview:
      "You share a playful curiosity and low-pressure spontaneity that makes planning dates feel exciting, not stressful.",
  },
  {
    id: "m_04",
    displayName: "Linh",
    age: 24,
    city: "Can Tho",
    pronouns: "she/her",
    gender: "Woman",
    lookingFor: "Everyone",
    vibeLabel: "The Cozy Homebody",
    interests: ["Baking", "K-dramas", "Cat cafés", "Handmade candles"],
    mutualConnectionsCount: 3,
    isVerified: true,
    isAutoMatch: false,
    whyMatchPreview:
      "Both of you value emotional safety and tenderness, creating a connection that feels stable and warm from day one.",
  },
  {
    id: "m_05",
    displayName: "Bao",
    age: 31,
    city: "Ho Chi Minh City",
    pronouns: "he/him",
    gender: "Man",
    lookingFor: "Everyone",
    vibeLabel: "The Intentional Romantic",
    interests: ["Flower markets", "Jazz nights", "Journaling", "Cycling"],
    mutualConnectionsCount: 5,
    isVerified: true,
    isAutoMatch: false,
    whyMatchPreview:
      "You both appreciate thoughtfulness in small gestures, which often predicts long-term relationship satisfaction.",
  },
  {
    id: "m_06",
    displayName: "Quinn",
    age: 26,
    city: "Nha Trang",
    pronouns: "they/them",
    gender: "Non-binary",
    lookingFor: "Everyone",
    vibeLabel: "The Bright Social Butterfly",
    interests: ["Open mics", "Language exchange", "Beach volleyball", "Memes"],
    mutualConnectionsCount: 2,
    isVerified: false,
    isAutoMatch: true,
    whyMatchPreview:
      "Your social energy complements each other: one starts the spark, the other keeps the connection grounded.",
  },
  {
    id: "m_07",
    displayName: "Trang",
    age: 28,
    city: "Hanoi",
    pronouns: "she/her",
    gender: "Woman",
    lookingFor: "Everyone",
    vibeLabel: "The Creative Dreamer",
    interests: ["Watercolor", "Indie playlists", "Bookstores", "Brunch"],
    mutualConnectionsCount: 3,
    isVerified: true,
    isAutoMatch: false,
    whyMatchPreview:
      "Your shared creative streak opens space for emotional expression, which helps deepen trust early.",
  },
  {
    id: "m_08",
    displayName: "Khanh",
    age: 30,
    city: "Hai Phong",
    pronouns: "he/him",
    gender: "Man",
    lookingFor: "Everyone",
    vibeLabel: "The Slow-Life Optimizer",
    interests: ["Morning runs", "Meal prep", "Podcasts", "Minimal tech"],
    mutualConnectionsCount: 1,
    isVerified: false,
    isAutoMatch: false,
    whyMatchPreview:
      "Your values overlap around sustainable routines and long-game growth, making compatibility practical and emotional.",
  },
  {
    id: "m_09",
    displayName: "Vy",
    age: 23,
    city: "Da Lat",
    pronouns: "she/her",
    gender: "Woman",
    lookingFor: "Everyone",
    vibeLabel: "The Soft Adventurer",
    interests: ["Camping", "Tea houses", "Crochet", "Photo walks"],
    mutualConnectionsCount: 4,
    isVerified: true,
    isAutoMatch: false,
    whyMatchPreview:
      "You balance adventure and comfort in similar ways, so your dates can feel both exciting and emotionally safe.",
  },
  {
    id: "m_10",
    displayName: "Hieu",
    age: 27,
    city: "Hue",
    pronouns: "he/him",
    gender: "Man",
    lookingFor: "Everyone",
    vibeLabel: "The Quiet Intellectual",
    interests: ["History cafés", "Chess", "Long-form podcasts", "Night walks"],
    mutualConnectionsCount: 2,
    isVerified: true,
    isAutoMatch: false,
    whyMatchPreview:
      "Your communication styles are complementary: both curious, reflective, and willing to listen deeply.",
  },
  {
    id: "m_11",
    displayName: "Ari",
    age: 25,
    city: "Ho Chi Minh City",
    pronouns: "they/them",
    gender: "Non-binary",
    lookingFor: "Everyone",
    vibeLabel: "The Playful Realist",
    interests: ["Stand-up comedy", "Street markets", "Bouldering", "R&B"],
    mutualConnectionsCount: 3,
    isVerified: true,
    isAutoMatch: false,
    whyMatchPreview:
      "You both bring humor into hard conversations, a strong predictor for resilience in relationships.",
  },
  {
    id: "m_12",
    displayName: "Phuc",
    age: 32,
    city: "Da Nang",
    pronouns: "he/him",
    gender: "Man",
    lookingFor: "Everyone",
    vibeLabel: "The Golden Hour Romantic",
    interests: [
      "Cooking dates",
      "Live acoustic",
      "Travel reels",
      "Sunset drives",
    ],
    mutualConnectionsCount: 6,
    isVerified: true,
    isAutoMatch: true,
    whyMatchPreview:
      "You align on effort and affection style, so chemistry feels natural without games or mixed signals.",
  },
];
