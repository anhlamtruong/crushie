import { authedProcedure } from "@/server/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  academyMissions,
  interactionGrades,
  userStats,
  type UserStat,
} from "../schema";
import { eq } from "drizzle-orm";
import {
  gradeInteraction,
  getUserSummaryNarrative,
  type LLMInteractionTurn,
} from "@/services/llm/client";
import { vibeProfiles } from "@/services/vibe-profiles/schema";

const submitPracticeInput = z.object({
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
    interests: z.array(z.string().min(1).max(40)).max(10).default([]),
  }),
  missionId: z.uuid().optional(),
  missionType: z.enum(["solo_practice", "live_quest"]).optional(),
  missionTitle: z.string().min(2).max(120).optional(),
  useMock: z.boolean().optional().default(false),
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function applyDelta(
  stats: UserStat | null,
  grade: {
    siqDelta: number;
    initiationDelta: number;
    empathyDelta: number;
    planningDelta: number;
    consistencyDelta: number;
  },
) {
  const base = {
    siqScore: stats?.siqScore ?? 0,
    initiation: stats?.initiation ?? 0,
    empathy: stats?.empathy ?? 0,
    planning: stats?.planning ?? 0,
    consistency: stats?.consistency ?? 0,
  };

  return {
    siqScore: clamp(base.siqScore + grade.siqDelta, 0, 1000),
    initiation: clamp(base.initiation + grade.initiationDelta, 0, 100),
    empathy: clamp(base.empathy + grade.empathyDelta, 0, 100),
    planning: clamp(base.planning + grade.planningDelta, 0, 100),
    consistency: clamp(base.consistency + grade.consistencyDelta, 0, 100),
  };
}

export const submitPractice = authedProcedure
  .input(submitPracticeInput)
  .mutation(async ({ ctx, input }) => {
    try {
      const llmGrade = await gradeInteraction({
        userId: ctx.user.id,
        transcript: input.transcript as LLMInteractionTurn[],
        targetVibe: {
          label: input.targetVibe.label,
          interests: input.targetVibe.interests,
        },
        missionContext: {
          missionType: input.missionType,
          missionTitle: input.missionTitle,
        },
        useMock: input.useMock,
      });

      const grade = {
        siqDelta: llmGrade.data.siq_delta,
        initiationDelta: llmGrade.data.skill_metrics.initiation_delta,
        empathyDelta: llmGrade.data.skill_metrics.empathy_delta,
        planningDelta: llmGrade.data.skill_metrics.planning_delta,
        consistencyDelta: llmGrade.data.skill_metrics.consistency_delta,
      };

      const persisted = await ctx.secureDb!.rls(async (tx) => {
        const [existingStats] = await tx
          .select()
          .from(userStats)
          .where(eq(userStats.userId, ctx.user.id))
          .limit(1);

        const nextStats = applyDelta(existingStats ?? null, grade);

        let updatedStats: UserStat;

        if (existingStats) {
          [updatedStats] = await tx
            .update(userStats)
            .set({
              ...nextStats,
              lastGradedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(userStats.userId, ctx.user.id))
            .returning();
        } else {
          [updatedStats] = await tx
            .insert(userStats)
            .values({
              userId: ctx.user.id,
              ...nextStats,
              lastGradedAt: new Date(),
            })
            .returning();
        }

        const [gradeRow] = await tx
          .insert(interactionGrades)
          .values({
            userId: ctx.user.id,
            missionId: input.missionId,
            targetVibeLabel: input.targetVibe.label,
            transcript: input.transcript,
            siqDelta: grade.siqDelta,
            initiationDelta: grade.initiationDelta,
            empathyDelta: grade.empathyDelta,
            planningDelta: grade.planningDelta,
            consistencyDelta: grade.consistencyDelta,
            feedbackSummary: llmGrade.data.feedback_summary,
            skillMetrics: llmGrade.data.skill_metrics,
            llmMeta: llmGrade.meta,
          })
          .returning();

        if (input.missionId) {
          await tx
            .update(academyMissions)
            .set({
              status: "completed",
              completedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(academyMissions.id, input.missionId));
        }

        const [profile] = await tx
          .select({
            vibeName: vibeProfiles.vibeName,
            interestTags: vibeProfiles.interestTags,
          })
          .from(vibeProfiles)
          .where(eq(vibeProfiles.userId, ctx.user.id))
          .limit(1);

        return { updatedStats, gradeRow, profile };
      });

      let narrative = persisted.updatedStats.personaNarrative ?? null;

      try {
        const summaryResponse = await getUserSummaryNarrative({
          userId: ctx.user.id,
          vibeLabel: persisted.profile?.vibeName ?? input.targetVibe.label,
          interests:
            persisted.profile?.interestTags ?? input.targetVibe.interests,
          siqScore: persisted.updatedStats.siqScore,
          initiation: persisted.updatedStats.initiation,
          empathy: persisted.updatedStats.empathy,
          planning: persisted.updatedStats.planning,
          consistency: persisted.updatedStats.consistency,
        });

        narrative = summaryResponse.data.narrative;

        await ctx.secureDb!.rls(async (tx) => {
          await tx
            .update(userStats)
            .set({
              personaNarrative: narrative,
              personaUpdatedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(userStats.userId, ctx.user.id));
        });
      } catch (summaryError) {
        console.warn(
          "Academy summary narrative generation failed:",
          summaryError,
        );
      }

      return {
        grade: persisted.gradeRow,
        stats: {
          ...persisted.updatedStats,
          personaNarrative: narrative,
        },
      };
    } catch (error) {
      console.error("submitPractice failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit practice session",
      });
    }
  });
