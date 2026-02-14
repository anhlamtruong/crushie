import { authedProcedure } from "@/server/init";
import { verifications } from "../schema";
import { eq, desc } from "drizzle-orm";

export const getMyStatus = authedProcedure.query(async ({ ctx }) => {
  return ctx.secureDb!.rls(async (tx) => {
    return tx
      .select()
      .from(verifications)
      .where(eq(verifications.userId, ctx.user.id))
      .orderBy(desc(verifications.requestedAt));
  });
});
