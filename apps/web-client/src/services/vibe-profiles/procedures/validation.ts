/**
 * Shared Zod schemas for vibe-profile procedures
 */

import { z } from "zod";

export const vibeQuizAnswersSchema = z.object({
  rainyFriday: z.enum(["vinyl_chill", "street_food_chaos"]).optional(),
  travelStyle: z.enum(["planned", "spontaneous"]).optional(),
  socialBattery: z.enum(["introvert", "ambivert", "extrovert"]).optional(),
  dateVibe: z
    .enum(["coffee_deep_talk", "adventure_activity", "group_hangout"])
    .optional(),
  musicMood: z.enum(["lo_fi", "indie", "edm", "hip_hop", "jazz"]).optional(),
  loveLanguage: z
    .enum([
      "words_of_affirmation",
      "quality_time",
      "physical_touch",
      "acts_of_service",
      "gifts",
    ])
    .optional(),
  conflictStyle: z
    .enum(["talk_it_out", "need_space", "humor", "apologize_first"])
    .optional(),
  weekendVibe: z
    .enum([
      "explore_new_places",
      "cozy_at_home",
      "social_gathering",
      "creative_project",
    ])
    .optional(),
});

export const createVibeProfileInput = z.object({
  vibeName: z.string().min(1).max(100),
  vibeSummary: z.string().max(500).optional(),
  energy: z.enum(["chill", "moderate", "high", "chaotic"]).default("moderate"),
  moodTags: z.array(z.string().max(50)).max(20).default([]),
  styleTags: z.array(z.string().max(50)).max(20).default([]),
  interestTags: z.array(z.string().max(50)).max(20).default([]),
  quizAnswers: vibeQuizAnswersSchema.default({}),
  photoUrls: z.array(z.string().url()).max(10).default([]),
});

export const updateVibeProfileInput = z.object({
  vibeName: z.string().min(1).max(100).optional(),
  vibeSummary: z.string().max(500).optional(),
  energy: z.enum(["chill", "moderate", "high", "chaotic"]).optional(),
  moodTags: z.array(z.string().max(50)).max(20).optional(),
  styleTags: z.array(z.string().max(50)).max(20).optional(),
  interestTags: z.array(z.string().max(50)).max(20).optional(),
  quizAnswers: vibeQuizAnswersSchema.optional(),
  photoUrls: z.array(z.string().url()).max(5).optional(),
});

export const findSimilarInput = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
});
