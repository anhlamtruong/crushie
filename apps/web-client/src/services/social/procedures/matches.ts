import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { vibeMatches } from "../schema";
import { eq, or, desc, sql } from "drizzle-orm";

export const listMatches = authedProcedure
  .input(
    z
      .object({
        limit: z.number().int().min(1).max(50).default(20),
      })
      .default({ limit: 20 }),
  )
  .query(async ({ ctx, input }) => {
    return ctx.secureDb!.rls(async (tx) => {
      return tx
        .select()
        .from(vibeMatches)
        .where(
          or(
            eq(vibeMatches.userAId, ctx.user.id),
            eq(vibeMatches.userBId, ctx.user.id),
          ),
        )
        .orderBy(desc(vibeMatches.matchedAt))
        .limit(input.limit);
    });
  });

export const checkMutuals = authedProcedure
  .input(z.object({ targetUserId: z.string() }))
  .query(async ({ ctx, input }) => {
    const result = await ctx.secureDb!.rls(async (tx) => {
      return tx.execute(
        sql`SELECT * FROM check_mutual_connections(${ctx.user.id}, ${input.targetUserId})`,
      );
    });
    return result;
  });
