import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { vibeProfiles } from "../schema";
import { eq } from "drizzle-orm";

export const getByUserId = authedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ ctx, input }) => {
    const [profile] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .select({
          id: vibeProfiles.id,
          vibeName: vibeProfiles.vibeName,
          vibeSummary: vibeProfiles.vibeSummary,
          energy: vibeProfiles.energy,
          moodTags: vibeProfiles.moodTags,
          interestTags: vibeProfiles.interestTags,
        })
        .from(vibeProfiles)
        .where(eq(vibeProfiles.userId, input.userId))
        .limit(1);
    });
    return profile ?? null;
  });
