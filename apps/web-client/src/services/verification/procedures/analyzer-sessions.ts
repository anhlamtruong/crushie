import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { analyzerSessions } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export const listAnalyzerSessions = authedProcedure
  .input(
    z
      .object({
        limit: z.number().int().min(1).max(50).default(10),
      })
      .default({ limit: 10 }),
  )
  .query(async ({ ctx, input }) => {
    return ctx.secureDb!.rls(async (tx) => {
      return tx
        .select()
        .from(analyzerSessions)
        .where(eq(analyzerSessions.userId, ctx.user.id))
        .orderBy(desc(analyzerSessions.createdAt))
        .limit(input.limit);
    });
  });

export const getAnalyzerSession = authedProcedure
  .input(z.object({ id: z.uuid() }))
  .query(async ({ ctx, input }) => {
    const [session] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .select()
        .from(analyzerSessions)
        .where(
          and(
            eq(analyzerSessions.id, input.id),
            eq(analyzerSessions.userId, ctx.user.id),
          ),
        )
        .limit(1);
    });
    return session ?? null;
  });
