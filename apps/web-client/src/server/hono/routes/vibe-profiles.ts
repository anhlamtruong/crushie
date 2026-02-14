/**
 * Vibe Profiles — Mobile REST routes
 */

import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { vibeProfiles } from "@/services/vibe-profiles/schema";
import type { AuthEnv } from "../middleware";

const app = new Hono<AuthEnv>();

// GET /vibe-profiles/me
app.get("/me", async (c) => {
  const userId = c.var.userId;
  const [profile] = await db
    .select()
    .from(vibeProfiles)
    .where(eq(vibeProfiles.userId, userId))
    .limit(1);
  return c.json({ data: profile ?? null });
});

// POST /vibe-profiles — create (upsert)
app.post("/", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    vibeName: string;
    vibeSummary?: string;
    energy?: "chill" | "moderate" | "high" | "chaotic";
    moodTags?: string[];
    styleTags?: string[];
    interestTags?: string[];
    quizAnswers?: Record<string, unknown>;
    photoUrls?: string[];
  }>();

  // Deactivate previous profile
  await db
    .update(vibeProfiles)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(vibeProfiles.userId, userId));

  const [created] = await db
    .insert(vibeProfiles)
    .values({
      userId,
      vibeName: body.vibeName,
      vibeSummary: body.vibeSummary,
      energy: body.energy ?? "moderate",
      moodTags: body.moodTags ?? [],
      styleTags: body.styleTags ?? [],
      interestTags: body.interestTags ?? [],
      quizAnswers: body.quizAnswers ?? {},
      photoUrls: body.photoUrls ?? [],
    })
    .onConflictDoUpdate({
      target: vibeProfiles.userId,
      set: {
        vibeName: body.vibeName,
        vibeSummary: body.vibeSummary,
        energy: body.energy ?? "moderate",
        moodTags: body.moodTags ?? [],
        styleTags: body.styleTags ?? [],
        interestTags: body.interestTags ?? [],
        quizAnswers: body.quizAnswers ?? {},
        photoUrls: body.photoUrls ?? [],
        isActive: true,
        updatedAt: new Date(),
      },
    })
    .returning();

  return c.json({ data: created }, 201);
});

// PATCH /vibe-profiles — update current profile
app.patch("/", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    vibeName?: string;
    vibeSummary?: string;
    energy?: "chill" | "moderate" | "high" | "chaotic";
    moodTags?: string[];
    styleTags?: string[];
    interestTags?: string[];
    quizAnswers?: Record<string, unknown>;
    photoUrls?: string[];
  }>();

  const [updated] = await db
    .update(vibeProfiles)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(vibeProfiles.userId, userId))
    .returning();

  return c.json({ data: updated });
});

// POST /vibe-profiles/similar — pgvector similarity search
app.post("/similar", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    limit?: number;
    threshold?: number;
  }>();

  const limit = Math.min(body.limit ?? 10, 50);
  const threshold = body.threshold ?? 0.7;

  const result = await db.execute(sql`
    SELECT * FROM find_similar_vibes(
      (SELECT embedding FROM vibe_profiles WHERE user_id = ${userId} AND is_active = TRUE),
      ${limit},
      ${threshold}
    )
    WHERE user_id <> ${userId}
  `);

  return c.json({ data: result });
});

// GET /vibe-profiles/user/:userId — get another user's public profile
app.get("/user/:userId", async (c) => {
  const targetUserId = c.req.param("userId");
  const [profile] = await db
    .select({
      id: vibeProfiles.id,
      vibeName: vibeProfiles.vibeName,
      vibeSummary: vibeProfiles.vibeSummary,
      energy: vibeProfiles.energy,
      moodTags: vibeProfiles.moodTags,
      interestTags: vibeProfiles.interestTags,
    })
    .from(vibeProfiles)
    .where(eq(vibeProfiles.userId, targetUserId))
    .limit(1);

  return c.json({ data: profile ?? null });
});

export default app;
