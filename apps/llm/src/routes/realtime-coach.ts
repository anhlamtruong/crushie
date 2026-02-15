import { Router } from "express";
import { z } from "zod";
import { generateMultimodalJSON, type ImageInput } from "../lib/gemini.js";
import { requireServiceToken } from "../lib/auth.js";
import { streamWingmanSpeech } from "../lib/elevenlabs.js";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const router = Router();

const realtimeSuggestionSchema = z.object({
  frame: z.string().min(32, "frame is required").max(4_000_000),
  targetVibe: z.string().min(1, "targetVibe is required").max(120),
  currentTopic: z.string().max(200).optional().default(""),
  voiceContext: z
    .object({
      currentUtterance: z.string().max(500).optional().default(""),
      recentUtterances: z
        .array(z.string().max(500))
        .max(5)
        .optional()
        .default([]),
      isListening: z.boolean().optional().default(false),
      conversationTurns: z
        .array(
          z.object({
            role: z.enum(["me", "partner"]),
            text: z.string().max(500),
          }),
        )
        .max(8)
        .optional()
        .default([]),
    })
    .optional(),
  language: z.string().max(100).optional().default("Respond in English."),
});

const ttsSchema = z.object({
  text: z.string().min(1, "text is required").max(300),
});

type RealtimeCoachResult = {
  suggestion: string;
  visual_cue_detected: string;
  confidence: number;
};

const realtimeModelCandidates = ["gemini-2.5-flash"].filter(
  (value): value is string => typeof value === "string" && value.length > 0,
);

async function generateRealtimeCoachSuggestion(
  prompt: string,
  image: ImageInput,
): Promise<{
  result: RealtimeCoachResult;
  model: string;
  usedFallback: boolean;
}> {
  let lastError: unknown;

  for (const model of realtimeModelCandidates) {
    try {
      const result = await generateMultimodalJSON<RealtimeCoachResult>(
        prompt,
        [image],
        1,
        model,
      );
      return {
        result,
        model,
        usedFallback: model !== realtimeModelCandidates[0],
      };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const modelMissing =
        message.includes("model") &&
        (message.includes("not found") || message.includes("not supported"));

      if (!modelMissing) {
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("No valid realtime Gemini model available");
}

router.post("/", requireServiceToken(), async (req, res) => {
  try {
    const parsed = realtimeSuggestionSchema.parse(req.body);

    const image: ImageInput = {
      base64: parsed.frame,
      mimeType: "image/jpeg",
    };

    const currentUtterance =
      parsed.voiceContext?.currentUtterance?.trim() ?? "";
    const recentUtterances = (parsed.voiceContext?.recentUtterances ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(-3);

    const roleTaggedTurns = (parsed.voiceContext?.conversationTurns ?? [])
      .map((turn) => ({
        role: turn.role,
        text: turn.text.trim(),
      }))
      .filter((turn) => turn.text.length > 0)
      .slice(-6);

    const roleTaggedDialogue =
      roleTaggedTurns.length > 0
        ? roleTaggedTurns
            .map(
              (turn, index) =>
                `${index + 1}) ${turn.role.toUpperCase()}: "${turn.text}"`,
            )
            .join(" ")
        : "none";

    const voiceContextBlock = [
      currentUtterance
        ? `Latest heard speech: "${currentUtterance}".`
        : "Latest heard speech: not captured.",
      recentUtterances.length > 0
        ? `Recent speech snippets: ${recentUtterances.map((item, index) => `${index + 1}) "${item}"`).join(" ")}`
        : "Recent speech snippets: none.",
      `Role-tagged dialogue turns: ${roleTaggedDialogue}.`,
      parsed.voiceContext?.isListening
        ? "Mic status: actively listening."
        : "Mic status: idle.",
    ].join(" ");

    const prompt = [
      "You are a live dating coach with a warm, supportive wingman tone.",
      "Analyze the camera frame and infer immediate social cues from person/environment.",
      `Target vibe profile: ${parsed.targetVibe}.`,
      parsed.currentTopic
        ? `Current topic in conversation: ${parsed.currentTopic}.`
        : "Current topic in conversation: not provided.",
      voiceContextBlock,
      "Use role tags carefully: PARTNER lines are what the other person said; ME lines are what user likely said recently. Keep your next suggestion aligned as the user's next line.",
      "If role-tagged context is empty, rely more on visual cues and current topic.",
      parsed.language,
      "Output STRICT JSON only with keys: suggestion, visual_cue_detected, confidence.",
      "suggestion: one sentence user can say right now, natural and specific. Must be in the specified language.",
      "visual_cue_detected: short cue such as smiling, coffee on table, eye contact, posture.",
      "confidence: number from 0 to 1.",
    ].join("\n");

    const generatedPayload = await generateRealtimeCoachSuggestion(
      prompt,
      image,
    );
    const generated = generatedPayload.result;

    const normalizedSuggestion =
      typeof generated.suggestion === "string" && generated.suggestion.trim()
        ? generated.suggestion.trim()
        : "Ask a warm follow-up question about what they just mentioned.";

    const normalizedCue =
      typeof generated.visual_cue_detected === "string" &&
      generated.visual_cue_detected.trim()
        ? generated.visual_cue_detected.trim()
        : "Limited visual cues detected";

    const normalizedConfidence =
      typeof generated.confidence === "number" &&
      Number.isFinite(generated.confidence)
        ? Math.max(0, Math.min(1, generated.confidence))
        : 0.6;

    res.json({
      data: {
        suggestion: normalizedSuggestion,
        visual_cue_detected: normalizedCue,
        confidence: normalizedConfidence,
      },
      meta: {
        model: generatedPayload.model,
        usedFallback: generatedPayload.usedFallback,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.issues,
      });
      return;
    }

    console.error("❌ realtime-coach failed:", error);
    res.json({
      data: {
        suggestion:
          "Try this: 'I like your energy—what's been the highlight of your day so far?'",
        visual_cue_detected: "LLM temporarily unavailable; using safe fallback",
        confidence: 0.45,
      },
      meta: {
        usedFallback: true,
        model: "fallback",
      },
    });
  }
});

router.post("/tts", requireServiceToken(), async (req, res) => {
  try {
    const parsed = ttsSchema.parse(req.body);

    if (!process.env.ELEVENLABS_API_KEY) {
      res.status(204).end();
      return;
    }

    const audioStream = await streamWingmanSpeech(parsed.text);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    const reader = audioStream.getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        res.write(Buffer.from(value));
      }
    }

    res.end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.issues,
      });
      return;
    }

    console.error("❌ realtime-coach tts failed:", error);
    res.status(500).json({
      error: "Failed to synthesize speech",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/stt-token", requireServiceToken(), async (_req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    if (!apiKey) {
      res.status(503).json({
        error: "Speech-to-text is not configured",
      });
      return;
    }

    const client = new ElevenLabsClient({ apiKey });
    const token = await client.tokens.singleUse.create("realtime_scribe");

    res.json({ data: token });
  } catch (error) {
    console.error("❌ realtime-coach stt-token failed:", error);
    res.status(500).json({
      error: "Failed to create realtime STT token",
    });
  }
});

export default router;
