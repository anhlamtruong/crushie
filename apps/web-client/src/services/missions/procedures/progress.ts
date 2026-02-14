import { authedProcedure } from "@/server/init";
import { z } from "zod";
import {
  missionTemplates,
  missionInstances,
  userMissionProgress,
} from "../schema";
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

      const allCheckedIn = progress.every((p) => p.checkedIn);

      if (allCheckedIn) {
        const [instance] = await tx
          .select()
          .from(missionInstances)
          .where(eq(missionInstances.id, input.instanceId))
          .limit(1);

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
            .insert(userMissionProgress)
            .values({
              instanceId: input.instanceId,
              userId: p.userId,
              pointsEarned: points,
            })
            .onConflictDoUpdate({
              target: [
                userMissionProgress.instanceId,
                userMissionProgress.userId,
              ],
              set: { pointsEarned: points, updatedAt: new Date() },
            });
        }

        return { completed: true, pointsAwarded: points };
      }

      return { completed: false, waitingForPartner: true };
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
