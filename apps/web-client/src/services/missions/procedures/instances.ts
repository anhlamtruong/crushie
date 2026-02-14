import { authedProcedure } from "@/server/init";
import { z } from "zod";
import {
  missionTemplates,
  missionInstances,
  userMissionProgress,
} from "../schema";
import { vibeMatches } from "@/services/social/schema";
import { eq, and, sql } from "drizzle-orm";

const proposeMissionInput = z.object({
  templateId: z.uuid(),
  matchId: z.uuid(),
  customTitle: z.string().max(200).optional(),
  customObjectives: z
    .array(z.object({ step: z.number(), task: z.string() }))
    .optional(),
  locationName: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  locationPlaceId: z.string().optional(),
});

export const propose = authedProcedure
  .input(proposeMissionInput)
  .mutation(async ({ ctx, input }) => {
    const [instance] = await ctx.secureDb!.rls(async (tx) => {
      const [created] = await tx
        .insert(missionInstances)
        .values({
          templateId: input.templateId,
          matchId: input.matchId,
          customTitle: input.customTitle,
          customObjectives: input.customObjectives,
          locationName: input.locationName,
          locationLat: input.locationLat,
          locationLng: input.locationLng,
          locationPlaceId: input.locationPlaceId,
          status: "proposed",
        })
        .returning();

      const [match] = await tx
        .select()
        .from(vibeMatches)
        .where(eq(vibeMatches.id, input.matchId))
        .limit(1);

      if (match) {
        await tx.insert(userMissionProgress).values([
          { instanceId: created.id, userId: match.userAId },
          { instanceId: created.id, userId: match.userBId },
        ]);
      }

      return [created];
    });

    return instance;
  });

export const listMyMissions = authedProcedure
  .input(
    z
      .object({
        status: z
          .enum([
            "proposed",
            "accepted",
            "active",
            "completed",
            "expired",
            "declined",
          ])
          .optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
      .default({ limit: 20 }),
  )
  .query(async ({ ctx, input }) => {
    return ctx.secureDb!.rls(async (tx) => {
      const result = await tx.execute(sql`
        SELECT mi.*, mt.title as template_title, mt.mission_type, mt.difficulty, mt.base_points
        FROM mission_instances mi
        JOIN mission_templates mt ON mi.template_id = mt.id
        JOIN vibe_matches vm ON mi.match_id = vm.id
        WHERE (vm.user_a_id = ${ctx.user.id} OR vm.user_b_id = ${ctx.user.id})
        ${input.status ? sql`AND mi.status = ${input.status}` : sql``}
        ORDER BY mi.created_at DESC
        LIMIT ${input.limit}
      `);
      return result;
    });
  });

export const accept = authedProcedure
  .input(z.object({ instanceId: z.uuid() }))
  .mutation(async ({ ctx, input }) => {
    return ctx.secureDb!.rls(async (tx) => {
      await tx
        .update(userMissionProgress)
        .set({ hasAccepted: true, updatedAt: new Date() })
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

      const allAccepted = progress.every((p) => p.hasAccepted);

      if (allAccepted) {
        const [updated] = await tx
          .update(missionInstances)
          .set({
            status: "accepted",
            acceptedAt: new Date(),
          })
          .where(eq(missionInstances.id, input.instanceId))
          .returning();
        return updated;
      }

      const [current] = await tx
        .select()
        .from(missionInstances)
        .where(eq(missionInstances.id, input.instanceId))
        .limit(1);

      return current;
    });
  });

export const start = authedProcedure
  .input(z.object({ instanceId: z.uuid() }))
  .mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .update(missionInstances)
        .set({
          status: "active",
          startedAt: new Date(),
        })
        .where(
          and(
            eq(missionInstances.id, input.instanceId),
            eq(missionInstances.status, "accepted"),
          ),
        )
        .returning();
    });
    return updated;
  });

export const decline = authedProcedure
  .input(z.object({ instanceId: z.uuid() }))
  .mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .update(missionInstances)
        .set({ status: "declined" })
        .where(
          and(
            eq(missionInstances.id, input.instanceId),
            eq(missionInstances.status, "proposed"),
          ),
        )
        .returning();
    });
    return updated;
  });
