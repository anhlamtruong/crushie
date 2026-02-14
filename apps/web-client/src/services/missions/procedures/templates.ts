import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { missionTemplates } from "../schema";
import { eq, and, desc } from "drizzle-orm";

const listMissionsInput = z.object({
  type: z
    .enum(["icebreaker", "mini_date", "adventure", "challenge"])
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const listTemplates = authedProcedure
  .input(listMissionsInput.default({ limit: 20 }))
  .query(async ({ ctx, input }) => {
    return ctx.secureDb!.rls(async (tx) => {
      let conditions = eq(missionTemplates.isActive, true);

      if (input.type) {
        conditions = and(
          conditions,
          eq(missionTemplates.missionType, input.type),
        )!;
      }
      if (input.difficulty) {
        conditions = and(
          conditions,
          eq(missionTemplates.difficulty, input.difficulty),
        )!;
      }

      return tx
        .select()
        .from(missionTemplates)
        .where(conditions)
        .orderBy(desc(missionTemplates.createdAt))
        .limit(input.limit);
    });
  });

export const getTemplate = authedProcedure
  .input(z.object({ id: z.uuid() }))
  .query(async ({ ctx, input }) => {
    const [template] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .select()
        .from(missionTemplates)
        .where(eq(missionTemplates.id, input.id))
        .limit(1);
    });
    return template ?? null;
  });
