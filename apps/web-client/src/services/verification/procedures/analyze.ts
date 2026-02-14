/**
 * @deprecated Use `llm.analyzeProfile` instead.
 *
 * This procedure used text-only prompt analysis (no image data sent to Gemini).
 * The new `llm.analyzeProfile` procedure sends actual images via the multimodal
 * Gemini 2.5 Flash pipeline for accurate analysis.
 *
 * Kept temporarily for backward compatibility with any existing callers.
 */
import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { analyzerSessions } from "../schema";
import { users } from "@/services/users/schema";

const analyzerInput = z.object({
  imageHash: z.string().min(1),
  hintTags: z.array(z.string().max(50)).max(10).default([]),
});

export const analyze = authedProcedure
  .input(analyzerInput)
  .mutation(async ({ ctx, input }) => {
    const startTime = Date.now();

    // Ensure user exists
    await ctx.db
      .insert(users)
      .values({
        id: ctx.user.id,
        email:
          ctx.user.emailAddresses[0]?.emailAddress || "unknown@example.com",
        firstName: ctx.user.firstName || null,
        lastName: ctx.user.lastName || null,
        imageUrl: ctx.user.imageUrl || null,
        isActive: true,
      })
      .onConflictDoNothing();

    // Call LLM service using prompt template
    const llmResponse = await fetch("http://localhost:3001/api/prompt/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "analyze-crush-profile",
        input: {
          imageHash: input.imageHash,
          hintTags: input.hintTags,
        },
        parseJson: true,
        cache: false,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error(`LLM error: ${llmResponse.statusText}`);
    }

    const response = await llmResponse.json();
    const data = response.data; // The actual analysis data
    const latencyMs = Date.now() - startTime;

    // Save to database
    const [session] = await ctx.db
      .insert(analyzerSessions)
      .values({
        userId: ctx.user.id,
        imageHash: input.imageHash,
        hintTags: input.hintTags,
        predictedStyle: data.predictedStyle || null,
        vibePrediction: data.vibePrediction || {},
        conversationOpeners: data.conversationOpeners || [],
        dateSuggestions: data.dateSuggestions || [],
        modelVersion: data.modelVersion || "gemini-2.0-flash",
        latencyMs,
      })
      .returning();

    return session;
  });
