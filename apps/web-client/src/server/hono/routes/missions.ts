/**
 * Missions — Mobile REST routes
 * Sub-domains: templates, instances, progress
 */

import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  missionTemplates,
  missionInstances,
  userMissionProgress,
} from "@/services/missions/schema";
import { vibeMatches } from "@/services/social/schema";
import type { AuthEnv } from "../middleware";

const app = new Hono<AuthEnv>();

// ════════════════════════════════════════════════════════════════════════
// Templates
// ════════════════════════════════════════════════════════════════════════

// GET /missions/templates?type=icebreaker&difficulty=easy&limit=20
app.get("/templates", async (c) => {
  const type = c.req.query("type") as
    | "icebreaker"
    | "mini_date"
    | "adventure"
    | "challenge"
    | undefined;
  const difficulty = c.req.query("difficulty") as
    | "easy"
    | "medium"
    | "hard"
    | undefined;
  const limit = Math.min(Number(c.req.query("limit") ?? 20), 50);

  let conditions = eq(missionTemplates.isActive, true);
  if (type)
    conditions = and(conditions, eq(missionTemplates.missionType, type))!;
  if (difficulty)
    conditions = and(conditions, eq(missionTemplates.difficulty, difficulty))!;

  const rows = await db
    .select()
    .from(missionTemplates)
    .where(conditions)
    .limit(limit);

  return c.json({ data: rows });
});

// GET /missions/templates/:id
app.get("/templates/:id", async (c) => {
  const id = c.req.param("id");
  const [template] = await db
    .select()
    .from(missionTemplates)
    .where(eq(missionTemplates.id, id))
    .limit(1);
  return c.json({ data: template ?? null });
});

// ════════════════════════════════════════════════════════════════════════
// Instances
// ════════════════════════════════════════════════════════════════════════

// POST /missions/instances — propose
app.post("/instances", async (c) => {
  const body = await c.req.json<{
    templateId: string;
    matchId: string;
    customTitle?: string;
    customObjectives?: Array<{ step: number; task: string }>;
    locationName?: string;
    locationLat?: number;
    locationLng?: number;
    locationPlaceId?: string;
  }>();

  const [created] = await db
    .insert(missionInstances)
    .values({
      templateId: body.templateId,
      matchId: body.matchId,
      customTitle: body.customTitle,
      customObjectives: body.customObjectives,
      locationName: body.locationName,
      locationLat: body.locationLat,
      locationLng: body.locationLng,
      locationPlaceId: body.locationPlaceId,
      status: "proposed",
    })
    .returning();

  // Create progress entries for both users in the match
  const [match] = await db
    .select()
    .from(vibeMatches)
    .where(eq(vibeMatches.id, body.matchId))
    .limit(1);

  if (match) {
    await db.insert(userMissionProgress).values([
      { instanceId: created.id, userId: match.userAId },
      { instanceId: created.id, userId: match.userBId },
    ]);
  }

  return c.json({ data: created }, 201);
});

// GET /missions/instances?status=active&limit=20
app.get("/instances", async (c) => {
  const userId = c.var.userId;
  const status = c.req.query("status");
  const limit = Math.min(Number(c.req.query("limit") ?? 20), 50);

  const result = await db.execute(sql`
    SELECT mi.*, mt.title as template_title, mt.mission_type, mt.difficulty, mt.base_points
    FROM mission_instances mi
    JOIN mission_templates mt ON mi.template_id = mt.id
    JOIN vibe_matches vm ON mi.match_id = vm.id
    WHERE (vm.user_a_id = ${userId} OR vm.user_b_id = ${userId})
    ${status ? sql`AND mi.status = ${status}` : sql``}
    ORDER BY mi.created_at DESC
    LIMIT ${limit}
  `);

  return c.json({ data: result });
});

// POST /missions/instances/:id/accept
app.post("/instances/:id/accept", async (c) => {
  const userId = c.var.userId;
  const instanceId = c.req.param("id");

  await db
    .update(userMissionProgress)
    .set({ hasAccepted: true, updatedAt: new Date() })
    .where(
      and(
        eq(userMissionProgress.instanceId, instanceId),
        eq(userMissionProgress.userId, userId),
      ),
    );

  const progress = await db
    .select()
    .from(userMissionProgress)
    .where(eq(userMissionProgress.instanceId, instanceId));

  const allAccepted = progress.every((p) => p.hasAccepted);

  if (allAccepted) {
    const [updated] = await db
      .update(missionInstances)
      .set({ status: "accepted", acceptedAt: new Date() })
      .where(eq(missionInstances.id, instanceId))
      .returning();
    return c.json({ data: updated });
  }

  const [current] = await db
    .select()
    .from(missionInstances)
    .where(eq(missionInstances.id, instanceId))
    .limit(1);

  return c.json({ data: current });
});

// POST /missions/instances/:id/start
app.post("/instances/:id/start", async (c) => {
  const instanceId = c.req.param("id");
  const [updated] = await db
    .update(missionInstances)
    .set({ status: "active", startedAt: new Date() })
    .where(
      and(
        eq(missionInstances.id, instanceId),
        eq(missionInstances.status, "accepted"),
      ),
    )
    .returning();
  return c.json({ data: updated });
});

// POST /missions/instances/:id/decline
app.post("/instances/:id/decline", async (c) => {
  const instanceId = c.req.param("id");
  const [updated] = await db
    .update(missionInstances)
    .set({ status: "declined" })
    .where(
      and(
        eq(missionInstances.id, instanceId),
        eq(missionInstances.status, "proposed"),
      ),
    )
    .returning();
  return c.json({ data: updated });
});

// ════════════════════════════════════════════════════════════════════════
// Progress
// ════════════════════════════════════════════════════════════════════════

// POST /missions/progress/:instanceId/objective
app.post("/progress/:instanceId/objective", async (c) => {
  const userId = c.var.userId;
  const instanceId = c.req.param("instanceId");
  const { step } = await c.req.json<{ step: number }>();

  const result = await db.execute(sql`
    UPDATE user_mission_progress
    SET objectives_done = objectives_done || ${JSON.stringify([{ step, done: true, ts: new Date().toISOString() }])}::jsonb,
        updated_at = NOW()
    WHERE instance_id = ${instanceId}
      AND user_id = ${userId}
    RETURNING *
  `);

  return c.json({ data: result });
});

// POST /missions/progress/:instanceId/checkin
app.post("/progress/:instanceId/checkin", async (c) => {
  const userId = c.var.userId;
  const instanceId = c.req.param("instanceId");
  const { proof } = await c.req.json<{
    proof: {
      selfieUrl?: string;
      geo?: { lat: number; lng: number };
      ts?: string;
    };
  }>();

  await db
    .update(userMissionProgress)
    .set({ checkedIn: true, updatedAt: new Date() })
    .where(
      and(
        eq(userMissionProgress.instanceId, instanceId),
        eq(userMissionProgress.userId, userId),
      ),
    );

  const progress = await db
    .select()
    .from(userMissionProgress)
    .where(eq(userMissionProgress.instanceId, instanceId));

  const allCheckedIn = progress.every((p) => p.checkedIn);

  if (allCheckedIn) {
    const [instance] = await db
      .select()
      .from(missionInstances)
      .where(eq(missionInstances.id, instanceId))
      .limit(1);

    const [template] = await db
      .select()
      .from(missionTemplates)
      .where(eq(missionTemplates.id, instance.templateId))
      .limit(1);

    const points = template?.basePoints ?? 100;

    await db
      .update(missionInstances)
      .set({
        status: "completed",
        completedAt: new Date(),
        pointsAwarded: points,
        checkinProof: proof,
      })
      .where(eq(missionInstances.id, instanceId));

    return c.json({ data: { completed: true, pointsAwarded: points } });
  }

  return c.json({ data: { completed: false, waitingForPartner: true } });
});

// GET /missions/progress/:instanceId
app.get("/progress/:instanceId", async (c) => {
  const userId = c.var.userId;
  const instanceId = c.req.param("instanceId");

  const [progress] = await db
    .select()
    .from(userMissionProgress)
    .where(
      and(
        eq(userMissionProgress.instanceId, instanceId),
        eq(userMissionProgress.userId, userId),
      ),
    )
    .limit(1);

  return c.json({ data: progress ?? null });
});

export default app;
