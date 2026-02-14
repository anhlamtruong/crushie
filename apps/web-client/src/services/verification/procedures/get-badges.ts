import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const getBadges = authedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ ctx, input }) => {
    const result = await ctx.secureDb!.rls(async (tx) => {
      return tx.execute(sql`
        SELECT type, status, verified_at
        FROM verifications
        WHERE user_id = ${input.userId}
          AND status = 'verified'
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY verified_at DESC
      `);
    });
    return result;
  });
