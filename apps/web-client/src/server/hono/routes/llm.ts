/**
 * LLM Pipelines — Mobile REST routes
 *
 * Pipeline 1: POST /llm/generate-vibe
 * Pipeline 2: POST /llm/analyze-profile
 * Pipeline 3: POST /llm/evaluate-match
 * Pipeline 3b: POST /llm/find-and-evaluate-matches
 */

import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/services/users/schema";
import { vibeProfiles } from "@/services/vibe-profiles/schema";
import { vibeMatches } from "@/services/social/schema";
import { analyzerSessions } from "@/services/verification/schema";
import {
  generateVibeProfile,
  analyzeProfile as callAnalyzeProfile,
  evaluateMatch as callEvaluateMatch,
  type ProfileSummary,
} from "@/services/llm/client";
import type { AuthEnv } from "../middleware";
import { clerkClient } from "@clerk/nextjs/server";

const app = new Hono<AuthEnv>();

// ── Helpers ─────────────────────────────────────────────────────────────

function toProfileSummary(profile: {
  userId: string;
  vibeName: string;
  vibeSummary: string | null;
  energy: "chill" | "moderate" | "high" | "chaotic";
  moodTags: string[] | null;
  styleTags: string[] | null;
  interestTags: string[] | null;
}): ProfileSummary {
  return {
    userId: profile.userId,
    vibeName: profile.vibeName,
    vibeSummary: profile.vibeSummary ?? undefined,
    energy: profile.energy,
    moodTags: profile.moodTags ?? [],
    styleTags: profile.styleTags ?? [],
    interestTags: profile.interestTags ?? [],
  };
}

async function ensureUserExists(userId: string) {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (existing) return;

  // Best-effort: hydrate user from Clerk; fall back to a unique placeholder
  // email to satisfy NOT NULL + UNIQUE constraints in dev environments.
  let email = `${userId}@placeholder.local`;
  let firstName: string | null | undefined;
  let lastName: string | null | undefined;
  let imageUrl: string | null | undefined;

  try {
    const client = await clerkClient();
    const u = await client.users.getUser(userId);
    email =
      u.primaryEmailAddress?.emailAddress ??
      u.emailAddresses?.[0]?.emailAddress ??
      email;
    firstName = u.firstName;
    lastName = u.lastName;
    imageUrl = u.imageUrl;
  } catch {
    // ignore
  }

  await db
    .insert(users)
    .values({
      id: userId,
      email,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      imageUrl: imageUrl ?? undefined,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        imageUrl: imageUrl ?? undefined,
        updatedAt: new Date(),
      },
    });
}

// ════════════════════════════════════════════════════════════════════════
// Pipeline 1: Vibe Generation
// ════════════════════════════════════════════════════════════════════════

// POST /llm/generate-vibe
app.post("/generate-vibe", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    imageUrls: string[];
    quizAnswers: Record<string, unknown>;
    photoUrls?: string[];
    useMock?: boolean;
  }>();

  const { data, meta } = await generateVibeProfile({
    userId,
    imageUrls: body.imageUrls,
    extraContext: JSON.stringify(body.quizAnswers),
    photoUrls: body.photoUrls,
    useMock: body.useMock,
  });

  // Ensure FK to users table exists before inserting vibe profile
  await ensureUserExists(userId);

  const [saved] = await db
    .insert(vibeProfiles)
    .values({
      userId,
      vibeName: data.vibeName,
      vibeSummary: data.vibeSummary,
      energy: data.energy,
      moodTags: data.moodTags,
      styleTags: data.styleTags,
      interestTags: data.interestTags,
      quizAnswers: body.quizAnswers,
      photoUrls: data.photoUrls,
    })
    .onConflictDoUpdate({
      target: vibeProfiles.userId,
      set: {
        vibeName: data.vibeName,
        vibeSummary: data.vibeSummary,
        energy: data.energy,
        moodTags: data.moodTags,
        styleTags: data.styleTags,
        interestTags: data.interestTags,
        quizAnswers: body.quizAnswers,
        photoUrls: data.photoUrls,
        isActive: true,
        updatedAt: new Date(),
      },
    })
    .returning();

  return c.json({ data: { profile: saved, meta } }, 201);
});

// ════════════════════════════════════════════════════════════════════════
// Pipeline 2: Profile Analyzer
// ════════════════════════════════════════════════════════════════════════

// POST /llm/analyze-profile
app.post("/analyze-profile", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    imageUrls?: string[];
    imageUrl?: string;
    imageHash: string;
    hintTags?: string[];
    useMock?: boolean;
  }>();

  const imageUrls =
    body.imageUrls && body.imageUrls.length > 0
      ? body.imageUrls
      : body.imageUrl
        ? [body.imageUrl]
        : [];

  if (imageUrls.length === 0) {
    return c.json({ error: "At least one image URL is required." }, 400);
  }

  const { data, meta } = await callAnalyzeProfile({
    userId,
    imageUrls,
    imageHash: body.imageHash,
    hintTags: body.hintTags,
    useMock: body.useMock,
  });

  const [session] = await db
    .insert(analyzerSessions)
    .values({
      userId,
      imageHash: data.imageHash,
      hintTags: data.hintTags,
      predictedStyle: data.predictedStyle,
      vibePrediction: data.vibePrediction,
      conversationOpeners: data.conversationOpeners,
      dateSuggestions: data.dateSuggestions,
      modelVersion: data.modelVersion,
      latencyMs: data.latencyMs,
    })
    .returning();

  return c.json({ data: { session, meta } }, 201);
});

// ════════════════════════════════════════════════════════════════════════
// Pipeline 3: Compatibility Engine
// ════════════════════════════════════════════════════════════════════════

// POST /llm/evaluate-match
app.post("/evaluate-match", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    targetUserId: string;
    useMock?: boolean;
  }>();

  // 1. Fetch both profiles
  const [myProfile] = await db
    .select()
    .from(vibeProfiles)
    .where(
      and(eq(vibeProfiles.userId, userId), eq(vibeProfiles.isActive, true)),
    )
    .limit(1);

  if (!myProfile) {
    return c.json(
      { error: "You must create a Vibe Profile before evaluating matches." },
      412,
    );
  }

  const [targetProfile] = await db
    .select()
    .from(vibeProfiles)
    .where(
      and(
        eq(vibeProfiles.userId, body.targetUserId),
        eq(vibeProfiles.isActive, true),
      ),
    )
    .limit(1);

  if (!targetProfile) {
    return c.json(
      { error: "Target user does not have an active Vibe Profile." },
      404,
    );
  }

  // 2. Compute vector similarity
  let vectorSimilarity: number | undefined;
  try {
    const simResult = await db.execute(sql`
      SELECT 1 - (a.embedding <=> b.embedding) AS similarity
      FROM vibe_profiles a, vibe_profiles b
      WHERE a.user_id = ${userId}
        AND b.user_id = ${body.targetUserId}
        AND a.embedding IS NOT NULL
        AND b.embedding IS NOT NULL
    `);
    if (
      Array.isArray(simResult) &&
      simResult.length > 0 &&
      typeof (simResult[0] as any)?.similarity === "number"
    ) {
      vectorSimilarity = (simResult[0] as any).similarity;
    }
  } catch {
    // Embeddings may not exist yet
  }

  // 3. Call LLM
  const profileA = toProfileSummary(myProfile);
  const profileB = toProfileSummary(targetProfile);

  const { data: compatibility, meta } = await callEvaluateMatch({
    profileA,
    profileB,
    vectorSimilarity,
    useMock: body.useMock,
  });

  // 4. Save match if score > 0.7
  if (compatibility.score > 0.7) {
    await db
      .insert(vibeMatches)
      .values({
        userAId: userId,
        userBId: body.targetUserId,
        similarity: compatibility.score,
        compatibility: {
          narrative: compatibility.narrative,
          commonGround: compatibility.commonGround,
          energyCompatibility: compatibility.energyCompatibility,
          interestOverlap: compatibility.interestOverlap,
          conversationStarter: compatibility.conversationStarter,
        },
      })
      .onConflictDoNothing();
  }

  return c.json({ data: { compatibility, meta, vectorSimilarity } });
});

// ════════════════════════════════════════════════════════════════════════
// Pipeline 3b: Batch — Find & evaluate top similar profiles
// ════════════════════════════════════════════════════════════════════════

// POST /llm/find-and-evaluate-matches
app.post("/find-and-evaluate-matches", async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json<{
    limit?: number;
    threshold?: number;
    useMock?: boolean;
  }>();

  const limit = Math.min(body.limit ?? 5, 10);
  const threshold = body.threshold ?? 0.7;

  // 1. Fetch my profile
  const [myProfile] = await db
    .select()
    .from(vibeProfiles)
    .where(
      and(eq(vibeProfiles.userId, userId), eq(vibeProfiles.isActive, true)),
    )
    .limit(1);

  if (!myProfile) {
    return c.json({ error: "You must create a Vibe Profile first." }, 412);
  }

  // 2. pgvector top N
  const candidates = (await db.execute(sql`
    SELECT
      vp.*,
      1 - (vp.embedding <=> (
        SELECT embedding FROM vibe_profiles
        WHERE user_id = ${userId} AND is_active = TRUE
      )) AS similarity
    FROM vibe_profiles vp
    WHERE vp.user_id <> ${userId}
      AND vp.is_active = TRUE
      AND vp.embedding IS NOT NULL
      AND (
        SELECT embedding FROM vibe_profiles
        WHERE user_id = ${userId} AND is_active = TRUE
      ) IS NOT NULL
      AND 1 - (vp.embedding <=> (
        SELECT embedding FROM vibe_profiles
        WHERE user_id = ${userId} AND is_active = TRUE
      )) > ${threshold}
    ORDER BY vp.embedding <=> (
      SELECT embedding FROM vibe_profiles
      WHERE user_id = ${userId} AND is_active = TRUE
    )
    LIMIT ${limit}
  `)) as Array<Record<string, unknown>>;

  if (!candidates || candidates.length === 0) {
    return c.json({
      data: { matches: [], message: "No compatible profiles found yet." },
    });
  }

  // 3. Evaluate each
  const profileA: ProfileSummary = toProfileSummary(myProfile);

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const profileB: ProfileSummary = {
        userId: candidate.user_id as string,
        vibeName: candidate.vibe_name as string,
        vibeSummary: (candidate.vibe_summary as string) ?? undefined,
        energy: candidate.energy as ProfileSummary["energy"],
        moodTags: (candidate.mood_tags as string[]) ?? [],
        styleTags: (candidate.style_tags as string[]) ?? [],
        interestTags: (candidate.interest_tags as string[]) ?? [],
      };

      const vectorSimilarity = candidate.similarity as number;

      const { data: compatibility } = await callEvaluateMatch({
        profileA,
        profileB,
        vectorSimilarity,
        useMock: body.useMock,
      });

      if (compatibility.score > 0.7) {
        await db
          .insert(vibeMatches)
          .values({
            userAId: userId,
            userBId: profileB.userId,
            similarity: compatibility.score,
            compatibility: {
              narrative: compatibility.narrative,
              commonGround: compatibility.commonGround,
              energyCompatibility: compatibility.energyCompatibility,
              interestOverlap: compatibility.interestOverlap,
              conversationStarter: compatibility.conversationStarter,
            },
          })
          .onConflictDoNothing();
      }

      return {
        userId: profileB.userId,
        vibeName: profileB.vibeName,
        vectorSimilarity,
        ...compatibility,
      };
    }),
  );

  return c.json({
    data: { matches: results.sort((a, b) => b.score - a.score) },
  });
});

export default app;
