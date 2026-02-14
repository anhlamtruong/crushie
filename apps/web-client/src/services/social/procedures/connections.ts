import { authedProcedure } from "@/server/init";
import { z } from "zod";
import { connections } from "../schema";
import { eq, and, or, desc } from "drizzle-orm";

export const listConnections = authedProcedure
  .input(
    z
      .object({
        status: z.enum(["pending", "accepted", "blocked"]).optional(),
      })
      .default({}),
  )
  .query(async ({ ctx, input }) => {
    return ctx.secureDb!.rls(async (tx) => {
      let query = tx
        .select()
        .from(connections)
        .where(
          or(
            eq(connections.requesterId, ctx.user.id),
            eq(connections.addresseeId, ctx.user.id),
          ),
        )
        .orderBy(desc(connections.createdAt));

      if (input.status) {
        query = tx
          .select()
          .from(connections)
          .where(
            and(
              or(
                eq(connections.requesterId, ctx.user.id),
                eq(connections.addresseeId, ctx.user.id),
              ),
              eq(connections.status, input.status),
            ),
          )
          .orderBy(desc(connections.createdAt));
      }

      return query;
    });
  });

export const sendRequest = authedProcedure
  .input(z.object({ userId: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    const [created] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .insert(connections)
        .values({
          requesterId: ctx.user.id,
          addresseeId: input.userId,
        })
        .returning();
    });
    return created;
  });

export const updateConnection = authedProcedure
  .input(
    z.object({
      connectionId: z.uuid(),
      status: z.enum(["accepted", "blocked"]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.secureDb!.rls(async (tx) => {
      return tx
        .update(connections)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(connections.id, input.connectionId),
            or(
              eq(connections.requesterId, ctx.user.id),
              eq(connections.addresseeId, ctx.user.id),
            ),
          ),
        )
        .returning();
    });
    return updated;
  });

export const removeConnection = authedProcedure
  .input(z.object({ connectionId: z.uuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.secureDb!.rls(async (tx) => {
      return tx
        .delete(connections)
        .where(
          and(
            eq(connections.id, input.connectionId),
            eq(connections.requesterId, ctx.user.id),
          ),
        );
    });
    return { success: true };
  });
