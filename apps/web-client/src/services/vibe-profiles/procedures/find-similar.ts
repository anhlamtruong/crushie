import { authedProcedure } from "@/server/init";
import { sql } from "drizzle-orm";
import { findSimilarInput } from "./validation";

export const findSimilar = authedProcedure
  .input(findSimilarInput)
  .query(async ({ ctx, input }) => {
    const result = await ctx.secureDb!.rls(async (tx) => {
      return tx.execute(sql`
        SELECT * FROM find_similar_vibes(
          (SELECT embedding FROM vibe_profiles WHERE user_id = ${ctx.user.id} AND is_active = TRUE),
          ${input.limit},
          ${input.threshold}
        )
        WHERE user_id <> ${ctx.user.id}
      `);
    });
    return result;
  });
