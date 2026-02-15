import { authedProcedure } from "@/server/init";
import { eq, desc } from "drizzle-orm";
import { academyMissions, interactionGrades, userStats } from "../schema";
import { vibeProfiles } from "@/services/vibe-profiles/schema";

const SIQ_MATCHING_THRESHOLD = 300;

export const getStats = authedProcedure.query(async ({ ctx }) => {
  return ctx.secureDb!.rls(async (tx) => {
    let [stats] = await tx
      .select()
      .from(userStats)
      .where(eq(userStats.userId, ctx.user.id))
      .limit(1);

    if (!stats) {
      [stats] = await tx
        .insert(userStats)
        .values({ userId: ctx.user.id })
        .returning();
    }

    const missions = await tx
      .select()
      .from(academyMissions)
      .where(eq(academyMissions.userId, ctx.user.id))
      .orderBy(desc(academyMissions.createdAt));

    const recentGrades = await tx
      .select()
      .from(interactionGrades)
      .where(eq(interactionGrades.userId, ctx.user.id))
      .orderBy(desc(interactionGrades.createdAt))
      .limit(12);

    const [profile] = await tx
      .select({
        vibeName: vibeProfiles.vibeName,
        interestTags: vibeProfiles.interestTags,
      })
      .from(vibeProfiles)
      .where(eq(vibeProfiles.userId, ctx.user.id))
      .limit(1);

    return {
      stats,
      missions,
      recentGrades,
      summary: {
        vibeLabel: profile?.vibeName ?? "The Emerging Romantic",
        interests: profile?.interestTags ?? [],
        narrative:
          stats.personaNarrative ??
          "Your Dating Academy report is warming up. Complete a practice mission to unlock a personalized love persona.",
        powerLevel: stats.siqScore,
      },
      academyGate: {
        shouldRedirectToAcademy: stats.siqScore < SIQ_MATCHING_THRESHOLD,
        threshold: SIQ_MATCHING_THRESHOLD,
      },
    };
  });
});
