import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { verifications } from "../schema";
import { eq, and } from "drizzle-orm";

export const isVerified = authedProcedure
  .input(
    z.object({
      type: z.enum(["selfie_liveness", "photo_match", "phone", "social_vouch"]),
    }),
  )
  .query(async ({ ctx, input }) => {
    const [result] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .select()
        .from(verifications)
        .where(
          and(
            eq(verifications.userId, ctx.user.id),
            eq(verifications.type, input.type),
            eq(verifications.status, "verified"),
          ),
        )
        .limit(1);
    });
    return { verified: !!result };
  });
