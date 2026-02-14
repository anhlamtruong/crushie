/**
 * Social — Mobile REST routes
 * Sub-domains: connections, matches, vouches, crush-list, points
 */

import { Hono } from "hono";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  connections,
  vibeMatches,
  vibeVouches,
  crushList,
  vibePointsLedger,
} from "@/services/social/schema";
import type { AuthEnv } from "../middleware";

const app = new Hono<AuthEnv>();

// ════════════════════════════════════════════════════════════════════════
// Connections
// ════════════════════════════════════════════════════════════════════════

// GET /social/connections?status=pending
app.get("/connections", async (c) => {
  const userId = c.var.userId;
  const status = c.req.query("status") as
    | "pending"
    | "accepted"
    | "blocked"
    | undefined;

  const baseCondition = or(
    eq(connections.requesterId, userId),
    eq(connections.addresseeId, userId),
  );

  const whereClause = status
    ? and(baseCondition, eq(connections.status, status))
    : baseCondition;

  const rows = await db
    .select()
    .from(connections)
    .where(whereClause!)
    .orderBy(desc(connections.createdAt));

  return c.json({ data: rows });
});

// POST /social/connections — send request
app.post("/connections", async (c) => {
  const userId = c.var.userId;
  const { targetUserId } = await c.req.json<{ targetUserId: string }>();

  const [created] = await db
    .insert(connections)
    .values({ requesterId: userId, addresseeId: targetUserId })
    .returning();

  return c.json({ data: created }, 201);
});

// PATCH /social/connections/:id — accept/block
app.patch("/connections/:id", async (c) => {
  const userId = c.var.userId;
  const connectionId = c.req.param("id");
  const { status } = await c.req.json<{
    status: "accepted" | "blocked";
  }>();

  const [updated] = await db
    .update(connections)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(connections.id, connectionId),
        or(
          eq(connections.requesterId, userId),
          eq(connections.addresseeId, userId),
        ),
      ),
    )
    .returning();

  return c.json({ data: updated });
});

// DELETE /social/connections/:id
app.delete("/connections/:id", async (c) => {
  const userId = c.var.userId;
  const connectionId = c.req.param("id");

  await db
    .delete(connections)
    .where(
      and(
        eq(connections.id, connectionId),
        eq(connections.requesterId, userId),
      ),
    );

  return c.json({ success: true });
});

// ════════════════════════════════════════════════════════════════════════
// Matches
// ════════════════════════════════════════════════════════════════════════

// GET /social/matches?limit=20
app.get("/matches", async (c) => {
  const userId = c.var.userId;
  const limit = Math.min(Number(c.req.query("limit") ?? 20), 50);

  const rows = await db
    .select()
    .from(vibeMatches)
    .where(or(eq(vibeMatches.userAId, userId), eq(vibeMatches.userBId, userId)))
    .orderBy(desc(vibeMatches.matchedAt))
    .limit(limit);

  return c.json({ data: rows });
});

// GET /social/matches/mutuals?targetUserId=xxx
app.get("/matches/mutuals", async (c) => {
  const userId = c.var.userId;
  const targetUserId = c.req.query("targetUserId");

  if (!targetUserId) {
    return c.json({ error: "targetUserId query param required" }, 400);
  }

  const result = await db.execute(
    sql`SELECT * FROM check_mutual_connections(${userId}, ${targetUserId})`,
  );

  return c.json({ data: result });
});

// ════════════════════════════════════════════════════════════════════════
// Vouches
// ════════════════════════════════════════════════════════════════════════

// GET /social/vouches
app.get("/vouches", async (c) => {
  const userId = c.var.userId;
  const rows = await db
    .select()
    .from(vibeVouches)
    .where(eq(vibeVouches.subjectId, userId))
    .orderBy(desc(vibeVouches.createdAt));
  return c.json({ data: rows });
});

// POST /social/vouches
app.post("/vouches", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    subjectId: string;
    tag: string;
    isAnonymous?: boolean;
  }>();

  const [created] = await db
    .insert(vibeVouches)
    .values({
      voucherId: userId,
      subjectId: body.subjectId,
      tag: body.tag as any,
      isAnonymous: body.isAnonymous ?? true,
    })
    .returning();

  return c.json({ data: created }, 201);
});

// DELETE /social/vouches/:id
app.delete("/vouches/:id", async (c) => {
  const userId = c.var.userId;
  const vouchId = c.req.param("id");

  await db
    .delete(vibeVouches)
    .where(and(eq(vibeVouches.id, vouchId), eq(vibeVouches.voucherId, userId)));

  return c.json({ success: true });
});

// GET /social/vouches/summary?userId=xxx
app.get("/vouches/summary", async (c) => {
  const targetUserId = c.req.query("userId");
  if (!targetUserId) {
    return c.json({ error: "userId query param required" }, 400);
  }

  const result = await db.execute(sql`
    SELECT tag, COUNT(*)::int as count
    FROM vibe_vouches
    WHERE subject_id = ${targetUserId}
    GROUP BY tag
    ORDER BY count DESC
  `);

  return c.json({ data: result });
});

// ════════════════════════════════════════════════════════════════════════
// Crush List
// ════════════════════════════════════════════════════════════════════════

// GET /social/crush-list
app.get("/crush-list", async (c) => {
  const userId = c.var.userId;
  const rows = await db
    .select()
    .from(crushList)
    .where(and(eq(crushList.userId, userId), eq(crushList.isActive, true)))
    .orderBy(desc(crushList.createdAt));
  return c.json({ data: rows });
});

// POST /social/crush-list
app.post("/crush-list", async (c) => {
  const userId = c.var.userId;
  const { crushUserId } = await c.req.json<{ crushUserId: string }>();

  const [created] = await db
    .insert(crushList)
    .values({ userId, crushUserId })
    .onConflictDoUpdate({
      target: [crushList.userId, crushList.crushUserId],
      set: { isActive: true },
    })
    .returning();

  return c.json({ data: created }, 201);
});

// DELETE /social/crush-list/:id
app.delete("/crush-list/:id", async (c) => {
  const userId = c.var.userId;
  const crushId = c.req.param("id");

  const [updated] = await db
    .update(crushList)
    .set({ isActive: false })
    .where(and(eq(crushList.id, crushId), eq(crushList.userId, userId)))
    .returning();

  return c.json({ data: updated });
});

// ════════════════════════════════════════════════════════════════════════
// Points
// ════════════════════════════════════════════════════════════════════════

// GET /social/points
app.get("/points", async (c) => {
  const userId = c.var.userId;
  const result = await db.execute(sql`
    SELECT COALESCE(SUM(delta), 0)::int as total_points
    FROM vibe_points_ledger
    WHERE user_id = ${userId}
  `);
  return c.json({
    data: { totalPoints: (result as any)?.[0]?.total_points ?? 0 },
  });
});

// GET /social/points/history?limit=20
app.get("/points/history", async (c) => {
  const userId = c.var.userId;
  const limit = Math.min(Number(c.req.query("limit") ?? 20), 100);

  const rows = await db
    .select()
    .from(vibePointsLedger)
    .where(eq(vibePointsLedger.userId, userId))
    .orderBy(desc(vibePointsLedger.createdAt))
    .limit(limit);

  return c.json({ data: rows });
});

export default app;
