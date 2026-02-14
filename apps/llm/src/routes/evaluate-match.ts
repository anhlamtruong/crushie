/**
 * Evaluate Match Routes — Pipeline 3: Compatibility Engine
 *
 * POST /api/evaluate-match          — Compare two profiles & generate synergy narrative
 * POST /api/evaluate-match/mock     — Return mock compatibility result (dev/testing)
 *
 * Input: profile_a + profile_b (textual summaries)
 * Output: compatibility score, narrative, common ground
 *
 * Note: The tRPC service handles pgvector similarity search and sends
 *       the top 5 most similar profiles. This service only generates
 *       the narrative/score, not the vector search.
 */

import { Router } from "express";
import { z } from "zod";
import { generateJSONWithRetry } from "../lib/gemini.js";
import { compatibilityPrompt } from "../lib/vibe-prompts.js";
import {
  COMPATIBILITY_FALLBACK,
  type CompatibilityResult,
} from "../lib/fallbacks.js";
import { requireServiceToken } from "../lib/auth.js";
import { getCachedResponse, setCachedResponse } from "../lib/redis.js";

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

const evaluateMatchSchema = z.object({
  profileA: profileSummarySchema,
  profileB: profileSummarySchema,
  /** Pre-computed cosine similarity from pgvector (optional) */
  vectorSimilarity: z.number().min(0).max(1).optional(),
});

// ──────────────────────────────────────────────────────────────────────────
// POST / — Evaluate compatibility via Gemini (production)
// ──────────────────────────────────────────────────────────────────────────

router.post("/", requireServiceToken(), async (req, res) => {
  try {
    const { profileA, profileB, vectorSimilarity } = evaluateMatchSchema.parse(
      req.body,
    );

    const startTime = Date.now();

    // Build the prompt
    const prompt = compatibilityPrompt(
      {
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
      },
      vectorSimilarity != null
        ? { preComputedVectorSimilarity: vectorSimilarity }
        : undefined,
    );

    // Check cache
    const cacheKey = `match:${profileA.userId}:${profileB.userId}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      const result = JSON.parse(cached) as CompatibilityResult;
      res.json({
        data: result,
        meta: {
          cached: true,
          durationMs: Date.now() - startTime,
          profileAId: profileA.userId,
          profileBId: profileB.userId,
        },
      });
      return;
    }

    // Call Gemini with retry logic
    let result: CompatibilityResult;
    let usedFallback = false;

    try {
      result = await generateJSONWithRetry<CompatibilityResult>(prompt, 2);
    } catch (llmError) {
      console.error(
        "❌ Gemini compatibility evaluation failed, using fallback:",
        llmError,
      );
      result = COMPATIBILITY_FALLBACK;
      usedFallback = true;
    }

    const durationMs = Date.now() - startTime;

    // Cache successful non-fallback results
    if (!usedFallback) {
      await setCachedResponse(cacheKey, JSON.stringify(result), 3600);
    }

    res.json({
      data: result,
      meta: {
        cached: false,
        durationMs,
        usedFallback,
        model: "gemini-2.5-flash",
        profileAId: profileA.userId,
        profileBId: profileB.userId,
        vectorSimilarity: vectorSimilarity ?? null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", details: error.errors });
      return;
    }
    throw error;
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /mock — Mock compatibility evaluation (dev/testing)
// ──────────────────────────────────────────────────────────────────────────

router.post("/mock", async (req, res) => {
  try {
    const { profileA, profileB } = evaluateMatchSchema.parse(req.body);

    const startTime = Date.now();

    // Generate a pseudo-random score based on shared interests
    const sharedInterests = profileA.interestTags.filter((tag) =>
      profileB.interestTags.includes(tag),
    );
    const baseScore = Math.min(
      0.4 + sharedInterests.length * 0.12 + Math.random() * 0.1,
      1.0,
    );
    const score = Math.round(baseScore * 100) / 100;

    const result: CompatibilityResult = {
      score,
      narrative:
        score > 0.7
          ? `${profileA.vibeName} meets ${profileB.vibeName} — there's a genuine spark here. You share ${sharedInterests.length > 0 ? sharedInterests.join(", ") : "a certain energy"} that could lead somewhere interesting.`
          : `${profileA.vibeName} and ${profileB.vibeName} are different flavors — but sometimes that's where the best stories start. One of you will have to make the first move.`,
      commonGround:
        sharedInterests.length > 0
          ? sharedInterests
          : ["Both on Tinhyeuchuchube", "Open to new connections"],
      energyCompatibility: {
        description: `${profileA.energy} meets ${profileB.energy}`,
        score: profileA.energy === profileB.energy ? 0.9 : 0.65,
      },
      interestOverlap: {
        shared: sharedInterests,
        complementary: profileA.interestTags
          .filter((t) => !profileB.interestTags.includes(t))
          .slice(0, 2),
      },
      conversationStarter: `You both seem like ${sharedInterests[0] ?? "interesting"} people — start there.`,
    };

    const durationMs = Date.now() - startTime;

    res.json({
      data: result,
      meta: {
        mock: true,
        durationMs,
        message:
          "This is mock data. Use POST /api/evaluate-match for real Gemini analysis.",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request", details: error.errors });
      return;
    }
    throw error;
  }
});

export default router;
