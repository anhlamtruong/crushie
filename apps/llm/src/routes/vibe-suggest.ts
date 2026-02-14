/**
 * Vibe Matching Service — Pipeline 4: Suggest Top Matches
 *
 * POST /api/vibe-match/top — Given a user profile, calculate compatibility
 *                           scores against all users and return top 5 matches.
 *
 * Input: userId, optional: limit (default 5)
 * Output: array of top match profiles with compatibility results
 */

import { Router } from "express";
import { z } from "zod";
import { generateJSONWithRetry } from "../lib/gemini.js";
import { compatibilityPrompt } from "../lib/vibe-prompts.js";
import { COMPATIBILITY_FALLBACK, type CompatibilityResult } from "../lib/fallbacks.js";
import { requireServiceToken } from "../lib/auth.js";
import { getCachedResponse, setCachedResponse } from "../lib/redis.js";
import { db } from "../lib/db.js"; // your database connection

const router = Router();

// ──────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ──────────────────────────────────────────────────────────────────────────

const profileSummarySchema = z.object({
  userId: z.string().min(1),
  vibeName: z.string().min(1),
  vibeSummary: z.string().optional(),
  energy: z.enum(["chill", "moderate", "high", "chaotic"]),
  moodTags: z.array(z.string()).optional().default([]),
  styleTags: z.array(z.string()).optional().default([]),
  interestTags: z.array(z.string()).optional().default([]),
});

const topMatchSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().min(1).max(20).optional().default(5),
});

// ──────────────────────────────────────────────────────────────────────────
// Helper: Evaluate compatibility between two profiles
// ──────────────────────────────────────────────────────────────────────────

async function evaluateCompatibility(
  profileA: z.infer<typeof profileSummarySchema>,
  profileB: z.infer<typeof profileSummarySchema>
): Promise<CompatibilityResult> {
  try {
    const prompt = compatibilityPrompt({
      profileA: {
        vibeName: profileA.vibeName,
        energy: profileA.energy,
        interests: profileA.interestTags,
        summary: profileA.vibeSummary || profileA.vibeName,
        moodTags: profileA.moodTags,
        styleTags: profileA.styleTags,
      },
      profileB: {
        vibeName: profileB.vibeName,
        energy: profileB.energy,
        interests: profileB.interestTags,
        summary: profileB.vibeSummary || profileB.vibeName,
        moodTags: profileB.moodTags,
        styleTags: profileB.styleTags,
      },
    });

    // Check cache first
    const cacheKey = `compat:${profileA.userId}:${profileB.userId}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CompatibilityResult;
    }

    let result: CompatibilityResult;
    try {
      result = await generateJSONWithRetry<CompatibilityResult>(prompt, 2);
    } catch {
      result = COMPATIBILITY_FALLBACK;
    }

    // Cache result
    await setCachedResponse(cacheKey, JSON.stringify(result), 3600);

    return result;
  } catch (err) {
    console.error("Error evaluating compatibility", err);
    return COMPATIBILITY_FALLBACK;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// POST /top — Suggest Top Matches
// ──────────────────────────────────────────────────────────────────────────

router.post("/top", requireServiceToken(), async (req, res) => {
  try {
    const { userId, limit } = topMatchSchema.parse(req.body);

    // Fetch current user's profile
    const currentUser = await db.userProfiles.findUnique({ where: { userId } });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch all other users
    const allProfiles = await db.userProfiles.findMany({
      where: { userId: { not: userId } },
    });

    // Compute compatibility scores for each
    const results = await Promise.all(
      allProfiles.map(async(profile: any) => {
        const scoreResult = await evaluateCompatibility(currentUser, profile);
        return { profile, score: scoreResult.score, narrative: scoreResult.narrative };
      })
    );

    // Sort descending by score
    results.sort((a: any, b: any) => b.score - a.score);

    // Return top N matches
    res.json({
      userId,
      topMatches: results.slice(0, limit),
      meta: { totalProfiles: allProfiles.length },
    });
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
