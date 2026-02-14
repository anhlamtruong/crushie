import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { crushList } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export const getMyCrushList = authedProcedure.query(async ({ ctx }) => {
  return ctx.secureDb!.rls(async (tx) => {
    return tx
      .select()
      .from(crushList)
      .where(
        and(eq(crushList.userId, ctx.user.id), eq(crushList.isActive, true)),
      )
      .orderBy(desc(crushList.createdAt));
  });
});

export const addCrush = authedProcedure
  .input(z.object({ crushUserId: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    const [created] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .insert(crushList)
        .values({
          userId: ctx.user.id,
          crushUserId: input.crushUserId,
        })
        .onConflictDoUpdate({
          target: [crushList.userId, crushList.crushUserId],
          set: { isActive: true },
        })
        .returning();
    });
    return created;
  });

export const removeCrush = authedProcedure
  .input(z.object({ crushId: z.uuid() }))
  .mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .update(crushList)
        .set({ isActive: false })
        .where(
          and(
            eq(crushList.id, input.crushId),
            eq(crushList.userId, ctx.user.id),
          ),
        )
        .returning();
    });
    return updated;
  });
