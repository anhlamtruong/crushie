import { Router } from "express";
import { z } from "zod";
import { generateJSONWithRetry } from "../lib/gemini.js";
import {
  USER_SUMMARY_NARRATIVE_FALLBACK,
  type UserSummaryNarrativeResult,
} from "../lib/fallbacks.js";
import { requireServiceToken } from "../lib/auth.js";

const router = Router();

const querySchema = z.object({
  userId: z.string().min(1),
  vibeLabel: z.string().min(2).max(100),
  interests: z.string().optional().default(""),
  siqScore: z.coerce.number().int().min(0).max(1000),
  initiation: z.coerce.number().int().min(0).max(100),
  empathy: z.coerce.number().int().min(0).max(100),
  planning: z.coerce.number().int().min(0).max(100),
  consistency: z.coerce.number().int().min(0).max(100),
});

const outputSchema = z
  .object({
    narrative: z.string().min(20).max(320),
  })
  .strict();

function buildPrompt(input: z.infer<typeof querySchema>): string {
  const interests = input.interests
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 8);

  return `You are Crushie Dating Academy's persona narrator.
Write exactly 2 sentences that feel like a personalized "Love Report" summary.
Tone must be supportive, witty, and academically playful.

User profile signals:
- Vibe label: ${input.vibeLabel}
- Interests: ${interests.join(", ") || "not provided"}
- SIQ score: ${input.siqScore}/1000
- Skill levels: initiation ${input.initiation}, empathy ${input.empathy}, planning ${input.planning}, consistency ${input.consistency}

Constraints:
- Exactly 2 sentences.
- Mention one current strength and one growth edge.
- Keep it uplifting and action-oriented.
- No markdown, no bullet points.

Return ONLY JSON:
{ "narrative": "..." }`;
}

router.get("/", requireServiceToken(), async (req, res) => {
  try {
    const input = querySchema.parse(req.query);
    const startTime = Date.now();

    let result: UserSummaryNarrativeResult;
    let usedFallback = false;

    try {
      const generated = await generateJSONWithRetry<UserSummaryNarrativeResult>(
        buildPrompt(input),
        2,
      );
      result = outputSchema.parse(generated);
    } catch (llmError) {
      console.error(
        "❌ user-summary-narrative generation failed, using fallback:",
        llmError,
      );
      result = USER_SUMMARY_NARRATIVE_FALLBACK;
      usedFallback = true;
    }

    res.json({
      data: result,
      meta: {
        durationMs: Date.now() - startTime,
        usedFallback,
        model: "gemini-2.5-flash",
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
