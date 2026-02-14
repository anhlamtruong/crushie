import { authedProcedure } from "@/server/init";
import { vibeProfiles } from "../schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { updateMyProfileInput } from "./validation";

export const updateMyProfile = authedProcedure
  .input(updateMyProfileInput)
  .mutation(async ({ ctx, input }) => {
    if (Object.keys(input).length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Please provide at least one field to update.",
      });
    }

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

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No vibe profile found. Please complete onboarding first.",
      });
    }

    return updated;
  });
