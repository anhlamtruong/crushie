import { authedProcedure } from "@/server/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  missionTemplates,
  missionInstances,
  userMissionProgress,
} from "../schema";
import { vibePointsLedger } from "@/services/social/schema";
import { eq, and, sql } from "drizzle-orm";

export const completeObjective = authedProcedure
  .input(
    z.object({
      instanceId: z.uuid(),
      step: z.number().int(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.secureDb!.rls(async (tx) => {
      return tx.execute(sql`
        UPDATE user_mission_progress
        SET objectives_done = objectives_done || ${JSON.stringify([{ step: input.step, done: true, ts: new Date().toISOString() }])}::jsonb,
            updated_at = NOW()
        WHERE instance_id = ${input.instanceId}
          AND user_id = ${ctx.user.id}
        RETURNING *
      `);
    });
    return updated;
  });

export const checkin = authedProcedure
  .input(
    z.object({
      instanceId: z.uuid(),
      proof: z.object({
        selfieUrl: z.url().optional(),
        geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
        ts: z.string().optional(),
      }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.secureDb!.rls(async (tx) => {
      const [myProgress] = await tx
        .select()
        .from(userMissionProgress)
        .where(
          and(
            eq(userMissionProgress.instanceId, input.instanceId),
            eq(userMissionProgress.userId, ctx.user.id),
          ),
        )
        .limit(1);

      if (!myProgress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mission progress not found for current user.",
        });
      }

      await tx
        .update(userMissionProgress)
        .set({ checkedIn: true, updatedAt: new Date() })
        .where(
          and(
            eq(userMissionProgress.instanceId, input.instanceId),
            eq(userMissionProgress.userId, ctx.user.id),
          ),
        );

      const progress = await tx
        .select()
        .from(userMissionProgress)
        .where(eq(userMissionProgress.instanceId, input.instanceId));

      if (!progress.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mission progress records are missing.",
        });
      }

      const allCheckedIn = progress.every((p) => p.checkedIn);

      if (allCheckedIn) {
        const [instance] = await tx
          .select()
          .from(missionInstances)
          .where(eq(missionInstances.id, input.instanceId))
          .limit(1);

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Mission instance not found.",
          });
        }

        const [template] = await tx
          .select()
          .from(missionTemplates)
          .where(eq(missionTemplates.id, instance.templateId))
          .limit(1);

        const points = template?.basePoints ?? 100;

        await tx
          .update(missionInstances)
          .set({
            status: "completed",
            completedAt: new Date(),
            pointsAwarded: points,
            checkinProof: input.proof,
          })
          .where(eq(missionInstances.id, input.instanceId));

        for (const p of progress) {
          await tx
            .update(userMissionProgress)
            .set({ pointsEarned: points, updatedAt: new Date() })
            .where(
              and(
                eq(userMissionProgress.instanceId, input.instanceId),
                eq(userMissionProgress.userId, p.userId),
              ),
            );

          const [existingLedger] = await tx
            .select({ id: vibePointsLedger.id })
            .from(vibePointsLedger)
            .where(
              and(
                eq(vibePointsLedger.userId, p.userId),
                eq(vibePointsLedger.referenceId, input.instanceId),
                eq(vibePointsLedger.reason, "mission-completed"),
              ),
            )
            .limit(1);

          if (!existingLedger) {
            await tx.insert(vibePointsLedger).values({
              userId: p.userId,
              delta: points,
              reason: "mission-completed",
              referenceId: input.instanceId,
            });
          }
        }

        return {
          completed: true,
          pointsAwarded: points,
          instanceId: input.instanceId,
          matchId: instance.matchId,
        };
      }

      return {
        completed: false,
        waitingForPartner: true,
        instanceId: input.instanceId,
      };
    });
  });

export const getMyProgress = authedProcedure
  .input(z.object({ instanceId: z.uuid() }))
  .query(async ({ ctx, input }) => {
    const [progress] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .select()
        .from(userMissionProgress)
        .where(
          and(
            eq(userMissionProgress.instanceId, input.instanceId),
            eq(userMissionProgress.userId, ctx.user.id),
          ),
        )
        .limit(1);
    });
    return progress ?? null;
  });
