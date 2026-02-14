import { authedProcedure } from "@/server/init";
import { vibeProfiles } from "../schema";
import { eq } from "drizzle-orm";
import { updateVibeProfileInput } from "./validation";

export const update = authedProcedure
  .input(updateVibeProfileInput)
  .mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .update(vibeProfiles)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(vibeProfiles.userId, ctx.user.id))
        .returning();
    });
    return updated;
  });
