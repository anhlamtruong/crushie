import { Router } from "express";
import { z } from "zod";
import { generateJSONWithRetry } from "../lib/gemini.js";
import {
  INTERACTION_GRADE_FALLBACK,
  type InteractionGradeResult,
} from "../lib/fallbacks.js";
import { requireServiceToken } from "../lib/auth.js";

const router = Router();

const gradeInteractionSchema = z.object({
  userId: z.string().min(1),
  transcript: z
    .array(
      z.object({
        role: z.enum(["me", "partner"]),
        text: z.string().min(1).max(500),
      }),
    )
    .min(2)
    .max(80),
  targetVibe: z.object({
    label: z.string().min(2).max(80),
    interests: z.array(z.string()).max(10).optional().default([]),
  }),
  missionContext: z
    .object({
      missionType: z.enum(["solo_practice", "live_quest"]).optional(),
      missionTitle: z.string().max(120).optional(),
    })
    .optional(),
  useMock: z.boolean().optional().default(false),
});

const gradeInteractionOutputSchema = z
  .object({
    siq_delta: z.number().int().min(-80).max(80),
    feedback_summary: z.string().min(24).max(700),
    skill_metrics: z
      .object({
        initiation_delta: z.number().int().min(-20).max(20),
        empathy_delta: z.number().int().min(-20).max(20),
        planning_delta: z.number().int().min(-20).max(20),
        consistency_delta: z.number().int().min(-20).max(20),
      })
      .strict(),
  })
  .strict();

function buildPrompt(input: z.infer<typeof gradeInteractionSchema>): string {
  const transcript = input.transcript
    .map(
      (turn, index) => `${index + 1}. ${turn.role.toUpperCase()}: ${turn.text}`,
    )
    .join("\n");

  return `You are Crushie Dating Academy's SIQ evaluator: supportive, academic, playful, and Valentine-themed.

Evaluate this practice conversation for social intelligence.

Target vibe profile:
- Label: ${input.targetVibe.label}
- Interests: ${(input.targetVibe.interests ?? []).join(", ") || "not provided"}
- Mission type: ${input.missionContext?.missionType ?? "solo_practice"}
- Mission title: ${input.missionContext?.missionTitle ?? "Practice Chat"}

Transcript:
${transcript}

Scoring rubric:
- initiation: opening confidence, momentum, clear next step
- empathy: emotional mirroring, curiosity, response quality
- planning: concrete suggestion quality, feasibility, timing
- consistency: tone stability, coherence, respectful pacing

Rules:
- Return ONLY valid JSON
- Stay constructive and coach-like (never shaming)
- Keep feedback specific and actionable in 2-4 sentences
- skill_metrics deltas should reflect transcript quality and stay realistic
- siq_delta should roughly align with sum of skill deltas, but can be adjusted for overall performance

Output JSON shape:
{
  "siq_delta": number,
  "feedback_summary": string,
  "skill_metrics": {
    "initiation_delta": number,
    "empathy_delta": number,
    "planning_delta": number,
    "consistency_delta": number
  }
}`;
}

router.post("/", requireServiceToken(), async (req, res) => {
  try {
    const input = gradeInteractionSchema.parse(req.body);
    const startTime = Date.now();

    if (input.useMock) {
      res.json({
        data: INTERACTION_GRADE_FALLBACK,
        meta: {
          mock: true,
          durationMs: Date.now() - startTime,
        },
      });
      return;
    }

    let result: InteractionGradeResult;
    let usedFallback = false;

    try {
      const prompt = buildPrompt(input);
      const generated = await generateJSONWithRetry<InteractionGradeResult>(
        prompt,
        2,
      );
      result = gradeInteractionOutputSchema.parse(generated);
    } catch (llmError) {
      console.error(
        "❌ grade-interaction generation failed, using fallback:",
        llmError,
      );
      result = INTERACTION_GRADE_FALLBACK;
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
