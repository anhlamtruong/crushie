"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  HeartHandshake,
  Loader2,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "0%";
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function formatSimilarity(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "0.00";
  return value.toFixed(2);
}

export default function MatchMissionBriefingPage() {
  const params = useParams<{ id: string }>();
  const matchId = params?.id;
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const academyStats = useQuery(trpc.academy.getStats.queryOptions());

  useEffect(() => {
    if (academyStats.data?.academyGate.shouldRedirectToAcademy) {
      router.replace("/academy");
    }
  }, [academyStats.data?.academyGate.shouldRedirectToAcademy, router]);

  const matchPlanQuery = useQuery(
    trpc.social.getMatchPlan.queryOptions(
      { matchId: matchId ?? "" },
      { enabled: Boolean(matchId) },
    ),
  );

  const generatePlanMutation = useMutation(
    trpc.social.generateMatchPlan.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.social.getMatchPlan.queryKey({
            matchId: matchId ?? "",
          }),
        });
      },
    }),
  );

  const acceptMissionMutation = useMutation(
    trpc.missions.accept.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.social.getMatchPlan.queryKey({
            matchId: matchId ?? "",
          }),
        });
      },
    }),
  );

  const plan = (generatePlanMutation.data ??
    matchPlanQuery.data ??
    null) as any;

  const isBusy =
    generatePlanMutation.isPending ||
    acceptMissionMutation.isPending ||
    (matchPlanQuery.isLoading && !plan);

  const canGenerate = !plan && !generatePlanMutation.isPending;
  const canAccept =
    plan?.missionInstanceId &&
    !plan?.acceptance?.acceptedByCurrentUser &&
    !acceptMissionMutation.isPending;

  const missionLocked = !plan?.acceptance?.revealUnlocked;

  const meterProgress = useMemo(() => {
    const probability =
      typeof plan?.successProbability === "number"
        ? plan.successProbability
        : 0;
    return Math.max(0, Math.min(100, probability));
  }, [plan?.successProbability]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Mission Briefing
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-orchestrated Valentine mission generated from your vibe match and
          live environment context.
        </p>
      </div>

      <Card className="border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-primary">
            Dual Acceptance Protocol
          </CardTitle>
          <CardDescription>
            Mission details remain blurred until both partners accept the
            mission.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {plan ? (
              <>
                Accepted:{" "}
                <span className="font-semibold text-foreground">
                  {plan.acceptance?.acceptedCount ?? 0}
                </span>
                /{plan.acceptance?.totalParticipants ?? 2}
              </>
            ) : (
              "No mission generated yet"
            )}
          </div>
          <div className="flex items-center gap-2">
            {canGenerate && (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  if (!matchId) return;
                  generatePlanMutation.mutate({ matchId });
                }}
              >
                {generatePlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Match Plan
                  </>
                )}
              </Button>
            )}
            {canAccept && (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  acceptMissionMutation.mutate({
                    instanceId: plan.missionInstanceId as string,
                  });
                }}
              >
                {acceptMissionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <HeartHandshake className="mr-2 h-4 w-4" />
                    Accept Mission
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isBusy ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-52" />
          <Skeleton className="h-52 md:col-span-2" />
        </div>
      ) : !plan ? (
        <Card className="border-border border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Generate the mission plan to unlock Vibe Link, Mission Card, and
              success probability.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="border-border">
              <CardHeader className="space-y-1">
                <CardTitle className="text-primary text-base">
                  The Vibe Link
                </CardTitle>
                <CardDescription>
                  Similarity bridge between both profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {plan.userA?.displayName ?? "User A"}
                  </span>
                  <Heart className="text-primary h-4 w-4" />
                  <span className="font-medium">
                    {plan.userB?.displayName ?? "User B"}
                  </span>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Similarity Score
                  </p>
                  <p className="text-primary text-2xl font-semibold">
                    {formatSimilarity(plan.similarityScore)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-primary text-base">
                  Probability Meter
                </CardTitle>
                <CardDescription>
                  Estimated mission success odds
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-3">
                <div className="relative h-28 w-28">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      className="stroke-muted"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      strokeWidth="10"
                      fill="none"
                      style={{ stroke: "hsl(var(--primary))" }}
                      className="transition-all duration-700"
                      strokeDasharray={`${(meterProgress / 100) * 301.59} 301.59`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Heart className="text-primary h-5 w-5 fill-current" />
                    <span className="text-sm font-semibold">
                      {formatPercent(plan.successProbability)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="md:col-span-2"
          >
            <Card className="border-border overflow-hidden">
              <div className="relative h-48 w-full bg-muted">
                {plan.mission?.photoUrl ? (
                  <img
                    src={plan.mission.photoUrl as string}
                    alt={plan.mission.locationName ?? "Mission location"}
                    className={`h-full w-full object-cover transition-all duration-500 ${
                      missionLocked ? "blur-md grayscale" : "blur-0"
                    }`}
                  />
                ) : (
                  <div
                    className={`bg-muted h-full w-full transition-all duration-500 ${
                      missionLocked ? "blur-md" : "blur-0"
                    }`}
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {plan.mission?.locationName ?? "Selected place"}
                    {plan.mission?.locationDistrict
                      ? ` • ${plan.mission.locationDistrict}`
                      : ""}
                  </span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-primary text-xl">
                  {plan.mission?.title ?? "Mission"}
                </CardTitle>
                <CardDescription>
                  Gamified objective for your next real-world interaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={missionLocked ? "locked" : "revealed"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-lg border p-4 ${missionLocked ? "border-border bg-muted/60" : "border-border bg-card"}`}
                  >
                    <div className="text-primary mb-2 flex items-center gap-2 text-sm font-medium">
                      <Target className="h-4 w-4" />
                      Mission Task
                    </div>
                    <p
                      className={`${missionLocked ? "blur-sm select-none" : ""}`}
                    >
                      {plan.mission?.task ?? "No task generated."}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div
                  className={`rounded-lg bg-muted p-4 text-sm leading-relaxed ${missionLocked ? "blur-sm select-none" : ""}`}
                >
                  {plan.narrative}
                </div>

                {missionLocked ? (
                  <p className="text-xs text-muted-foreground">
                    Details unlock automatically once both users accept this
                    mission.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Mission unlocked — coordinate in chat and execute while the
                    vibe is fresh.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
