/**
 * Pipeline 2: Profile Analyzer — Analyze 1-10 screenshots via Gemini multimodal
 */

import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { analyzerSessions } from "@/services/verification/schema";
import { users } from "@/services/users/schema";
import { analyzeProfile as callAnalyzeProfile } from "../client";
import { fetchEnvironmentContext } from "@/services/environment";

// ── Input ───────────────────────────────────────────────────────────────

export const analyzeProfileInput = z.object({
  imageUrls: z
    .array(z.url("Each imageUrl must be a valid URL"))
    .min(1, "At least 1 image is required")
    .max(10, "Maximum 10 images"),
  imageHash: z.string().min(1, "imageHash is required"),
  hintTags: z.array(z.string()).max(20).optional().default([]),
  useMock: z.boolean().optional().default(false),
  /** Optional location — triggers environmental context enrichment */
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      cityName: z.string().optional(),
    })
    .optional(),
});

// ── Procedure ───────────────────────────────────────────────────────────

export const analyzeProfile = authedProcedure
  .input(analyzeProfileInput)
  .mutation(async ({ ctx, input }) => {
    try {
      // Ensure the user exists in the `users` table before inserting into
      // `analyzer_sessions` (FK constraint). Uses the admin db to bypass RLS.
      const [existing] = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!existing) {
        await ctx.db
          .insert(users)
          .values({
            id: ctx.user.id,
            email:
              ctx.user.emailAddresses[0]?.emailAddress ??
              `${ctx.user.id}@placeholder.local`,
            firstName: ctx.user.firstName,
            lastName: ctx.user.lastName,
            imageUrl: ctx.user.imageUrl,
          })
          .onConflictDoNothing({ target: users.id });
      }

      // Fetch environmental context if location is provided
      let environmentContext: Awaited<
        ReturnType<typeof fetchEnvironmentContext>
      > = null;
      if (input.location) {
        environmentContext = await fetchEnvironmentContext(
          input.location.lat,
          input.location.lng,
        );
      }

      const { data, meta } = await callAnalyzeProfile({
        userId: ctx.user.id,
        imageUrls: input.imageUrls,
        imageHash: input.imageHash,
        hintTags: input.hintTags,
        useMock: input.useMock,
        environmentContext: environmentContext ?? undefined,
      });

      const [session] = await ctx.secureDb!.rls(async (tx) => {
        return tx
          .insert(analyzerSessions)
          .values({
            userId: ctx.user.id,
            imageHash: data.imageHash,
            hintTags: data.hintTags,
            predictedStyle: data.predictedStyle,
            vibePrediction: data.vibePrediction,
            conversationOpeners: data.conversationOpeners,
            dateSuggestions: data.dateSuggestions,
            modelVersion: data.modelVersion,
            latencyMs: data.latencyMs,
            // Environmental context columns
            city: environmentContext?.city,
            weatherContext: environmentContext?.weather,
            locationContext: environmentContext
              ? { city: environmentContext.city }
              : undefined,
            nearbyPlaces: environmentContext?.nearbyPlaces,
          })
          .returning();
      });

      return { session, meta };
    } catch (error) {
      console.error("❌ analyzeProfile failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to analyze profile",
      });
    }
  });
