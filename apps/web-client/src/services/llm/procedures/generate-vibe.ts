/**
 * Pipeline 1: Vibe Generation — Generate a Vibe Card via Gemini multimodal
 */

import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { vibeProfiles } from "@/services/vibe-profiles/schema";
import { users } from "@/services/users/schema";
import { generateVibeProfile } from "../client";

// ── Input ───────────────────────────────────────────────────────────────

export const generateVibeInput = z.object({
  imageUrls: z
    .array(z.url())
    .min(1, "At least 1 image required")
    .max(10, "Maximum 10 images"),
  hintTags: z
    .array(z.string().max(50))
    .max(10, "Maximum 10 hint tags")
    .optional(),
  extraContext: z.string().max(500).optional(),
  photoUrls: z.array(z.string()).optional(),
  useMock: z.boolean().optional().default(false),
});

// ── Procedure ───────────────────────────────────────────────────────────

export const generateVibe = authedProcedure
  .input(generateVibeInput)
  .mutation(async ({ ctx, input }) => {
    try {
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

      const { data, meta } = await generateVibeProfile({
        userId: ctx.user.id,
        imageUrls: input.imageUrls,
        hintTags: input.hintTags,
        extraContext: input.extraContext,
        photoUrls: input.photoUrls,
        useMock: input.useMock,
      });

      const [saved] = await ctx.secureDb!.rls(async (tx) => {
        return tx
          .insert(vibeProfiles)
          .values({
            userId: ctx.user.id,
            vibeName: data.vibeName,
            vibeSummary: data.vibeSummary,
            energy: data.energy,
            moodTags: data.moodTags,
            styleTags: data.styleTags,
            interestTags: data.interestTags,
            quizAnswers: data.quizAnswers,
            photoUrls: data.photoUrls,
          })
          .onConflictDoUpdate({
            target: vibeProfiles.userId,
            set: {
              vibeName: data.vibeName,
              vibeSummary: data.vibeSummary,
              energy: data.energy,
              moodTags: data.moodTags,
              styleTags: data.styleTags,
              interestTags: data.interestTags,
              quizAnswers: data.quizAnswers,
              photoUrls: data.photoUrls,
              isActive: true,
              updatedAt: new Date(),
            },
          })
          .returning();
      });

      return { profile: saved, meta };
    } catch (error) {
      console.error("❌ generateVibe failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate vibe profile",
      });
    }
  });
