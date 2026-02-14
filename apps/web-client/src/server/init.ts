import { db } from "@/db";
import { getSecureDb } from "@/db/secure-client";
import { users } from "@/services/users/schema";
import { currentUser } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

/**
 * 1. Context Creation
 * This creates the context that is available to all procedures.
 */
export const createTRPCContext = cache(async () => {
  const user = await currentUser();

  let secureDb = null;
  if (user) {
    try {
      secureDb = await getSecureDb();
    } catch (error) {
      console.error("Failed to initialize secure DB in TRPC context:", error);
    }
  }

  return {
    user,
    db,
    secureDb,
  };
});

/**
 * 2. tRPC Initialization
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

/**
 * 3. Exports
 */
export const createTRPCRouter = t.router;

// Public procedure - no auth required
export const publicProcedure = t.procedure;

// Authed procedure - requires authenticated user
export const authedProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  try {
    const email =
      opts.ctx.user.emailAddresses[0]?.emailAddress ??
      `${opts.ctx.user.id}@placeholder.local`;

    await opts.ctx.db
      .insert(users)
      .values({
        id: opts.ctx.user.id,
        email,
        firstName: opts.ctx.user.firstName ?? undefined,
        lastName: opts.ctx.user.lastName ?? undefined,
        imageUrl: opts.ctx.user.imageUrl ?? undefined,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          firstName: opts.ctx.user.firstName ?? undefined,
          lastName: opts.ctx.user.lastName ?? undefined,
          imageUrl: opts.ctx.user.imageUrl ?? undefined,
          isActive: true,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("Failed to sync user in authedProcedure middleware:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sync user account",
    });
  }

  return opts.next({
    ctx: { ...opts.ctx, user: opts.ctx.user },
  });
});
