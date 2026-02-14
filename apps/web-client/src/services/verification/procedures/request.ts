import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { verifications } from "../schema";

const requestVerificationInput = z.object({
  type: z.enum(["selfie_liveness", "photo_match", "phone", "social_vouch"]),
  proofHash: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const request = authedProcedure
  .input(requestVerificationInput)
  .mutation(async ({ ctx, input }) => {
    const [created] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .insert(verifications)
        .values({
          userId: ctx.user.id,
          type: input.type,
          proofHash: input.proofHash,
          metadata: input.metadata,
          expiresAt:
            input.type === "selfie_liveness"
              ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
              : undefined,
        })
        .returning();
    });
    return created;
  });
