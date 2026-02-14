import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { vibePointsLedger } from "../schema";
import { eq, desc, sql } from "drizzle-orm";

export const getMyPoints = authedProcedure.query(async ({ ctx }) => {
  const result = await ctx.secureDb!.rls(async (tx) => {
    return tx.execute(sql`
      SELECT COALESCE(SUM(delta), 0)::int as total_points
      FROM vibe_points_ledger
      WHERE user_id = ${ctx.user.id}
    `);
  });
  return { totalPoints: (result as any)?.[0]?.total_points ?? 0 };
});

export const getPointsHistory = authedProcedure
  .input(
    z
      .object({
        limit: z.number().int().min(1).max(100).default(20),
      })
      .default({ limit: 20 }),
  )
  .query(async ({ ctx, input }) => {
    return ctx.secureDb!.rls(async (tx) => {
      return tx
        .select()
        .from(vibePointsLedger)
        .where(eq(vibePointsLedger.userId, ctx.user.id))
        .orderBy(desc(vibePointsLedger.createdAt))
        .limit(input.limit);
    });
  });
