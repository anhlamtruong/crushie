import { authedProcedure } from "@/server/init";
import { vibeProfiles } from "../schema";
import { eq } from "drizzle-orm";

export const getMe = authedProcedure.query(async ({ ctx }) => {
  const [profile] = await ctx.secureDb!.rls(async (tx) => {
    return tx
      .select()
      .from(vibeProfiles)
      .where(eq(vibeProfiles.userId, ctx.user.id))
      .limit(1);
  });
  return profile ?? null;
});
