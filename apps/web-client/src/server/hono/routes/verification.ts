/**
 * Verification — Mobile REST routes
 */

import { Hono } from "hono";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  verifications,
  analyzerSessions,
} from "@/services/verification/schema";
import type { AuthEnv } from "../middleware";

const app = new Hono<AuthEnv>();

// ════════════════════════════════════════════════════════════════════════
// Verification Status & Requests
// ════════════════════════════════════════════════════════════════════════

// GET /verification/status
app.get("/status", async (c) => {
  const userId = c.var.userId;
  const rows = await db
    .select()
    .from(verifications)
    .where(eq(verifications.userId, userId))
    .orderBy(desc(verifications.requestedAt));
  return c.json({ data: rows });
});

// GET /verification/check?type=selfie_liveness
app.get("/check", async (c) => {
  const userId = c.var.userId;
  const type = c.req.query("type") as
    | "selfie_liveness"
    | "photo_match"
    | "phone"
    | "social_vouch"
    | undefined;

  if (!type) return c.json({ error: "type query param required" }, 400);

  const [result] = await db
    .select()
    .from(verifications)
    .where(
      and(
        eq(verifications.userId, userId),
        eq(verifications.type, type),
        eq(verifications.status, "verified"),
      ),
    )
    .limit(1);

  return c.json({ data: { verified: !!result } });
});

// POST /verification/request
app.post("/request", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    type: "selfie_liveness" | "photo_match" | "phone" | "social_vouch";
    proofHash?: string;
    metadata?: Record<string, unknown>;
  }>();

  const [created] = await db
    .insert(verifications)
    .values({
      userId,
      type: body.type,
      proofHash: body.proofHash,
      metadata: body.metadata ?? {},
      expiresAt:
        body.type === "selfie_liveness"
          ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          : undefined,
    })
    .returning();

  return c.json({ data: created }, 201);
});

// GET /verification/badges?userId=xxx
app.get("/badges", async (c) => {
  const targetUserId = c.req.query("userId");
  if (!targetUserId)
    return c.json({ error: "userId query param required" }, 400);

  const result = await db.execute(sql`
    SELECT type, status, verified_at
    FROM verifications
    WHERE user_id = ${targetUserId}
      AND status = 'verified'
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY verified_at DESC
  `);

  return c.json({ data: result });
});

// ════════════════════════════════════════════════════════════════════════
// Analyzer
// ════════════════════════════════════════════════════════════════════════

// POST /verification/analyze
app.post("/analyze", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    imageHash: string;
    hintTags?: string[];
  }>();

  const startTime = Date.now();
  const latencyMs = Date.now() - startTime;

  const [session] = await db
    .insert(analyzerSessions)
    .values({
      userId,
      imageHash: body.imageHash,
      hintTags: body.hintTags ?? [],
      predictedStyle: null,
      vibePrediction: {},
      conversationOpeners: [],
      dateSuggestions: [],
      modelVersion: "gemini-2.5-flash",
      latencyMs,
    })
    .returning();

  return c.json({ data: session }, 201);
});

// GET /verification/analyzer-sessions?limit=10
app.get("/analyzer-sessions", async (c) => {
  const userId = c.var.userId;
  const limit = Math.min(Number(c.req.query("limit") ?? 10), 50);

  const rows = await db
    .select()
    .from(analyzerSessions)
    .where(eq(analyzerSessions.userId, userId))
    .orderBy(desc(analyzerSessions.createdAt))
    .limit(limit);

  return c.json({ data: rows });
});

// GET /verification/analyzer-sessions/:id
app.get("/analyzer-sessions/:id", async (c) => {
  const userId = c.var.userId;
  const id = c.req.param("id");

  const [session] = await db
    .select()
    .from(analyzerSessions)
    .where(
      and(eq(analyzerSessions.id, id), eq(analyzerSessions.userId, userId)),
    )
    .limit(1);

  return c.json({ data: session ?? null });
});

export default app;
