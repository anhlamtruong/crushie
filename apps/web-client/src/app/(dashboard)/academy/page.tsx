"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { useTRPC } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FALLBACK_MISSIONS = [
  {
    id: "intro-icebreaker",
    title: "Introductory Icebreaker Lab",
    missionType: "solo_practice",
    status: "available",
    description:
      "Practice 6 opening lines and keep the chat natural for 4 turns.",
    targetSkill: "initiation",
  },
  {
    id: "visual-cue-training",
    title: "Visual Cue Training",
    missionType: "solo_practice",
    status: "available",
    description:
      "Respond to subtle emotional cues with warm, specific follow-ups.",
    targetSkill: "empathy",
  },
  {
    id: "date-planning-sprint",
    title: "Date Planning Sprint",
    missionType: "live_quest",
    status: "available",
    description:
      "Suggest one clear, low-pressure plan with timing and location confidence.",
    targetSkill: "planning",
  },
] as const;

type PracticeTurn = {
  role: "me" | "partner";
  text: string;
};

export default function AcademyPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const statsQuery = useQuery(trpc.academy.getStats.queryOptions());
  const submitPractice = useMutation(
    trpc.academy.submitPractice.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.academy.getStats.queryKey(),
        });
      },
    }),
  );

  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    null,
  );
  const [turnRole, setTurnRole] = useState<"me" | "partner">("me");
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<PracticeTurn[]>([]);

  const stats = statsQuery.data?.stats;
  const summary = statsQuery.data?.summary;

  const chartData = useMemo(() => {
    const siqNormalized = Math.round(((stats?.siqScore ?? 0) / 1000) * 100);
    return [
      { skill: "SIQ", score: siqNormalized },
      { skill: "Initiation", score: stats?.initiation ?? 0 },
      { skill: "Empathy", score: stats?.empathy ?? 0 },
      { skill: "Planning", score: stats?.planning ?? 0 },
      { skill: "Consistency", score: stats?.consistency ?? 0 },
    ];
  }, [stats]);

  const missions =
    statsQuery.data?.missions.length && statsQuery.data.missions.length > 0
      ? statsQuery.data.missions
      : FALLBACK_MISSIONS;

  const selectedMission =
    missions.find((mission) => mission.id === selectedMissionId) ?? null;

  function addTurn() {
    const text = draft.trim();
    if (!text) return;
    setTurns((current) => [...current, { role: turnRole, text }]);
    setDraft("");
  }

  async function submitSession() {
    if (!selectedMission || turns.length < 2) return;

    await submitPractice.mutateAsync({
      transcript: turns,
      targetVibe: {
        label: summary?.vibeLabel ?? "The Emerging Romantic",
        interests: summary?.interests ?? [],
      },
      missionId:
        selectedMission.id.length === 36 ? selectedMission.id : undefined,
      missionType:
        selectedMission.missionType === "live_quest"
          ? "live_quest"
          : "solo_practice",
      missionTitle: selectedMission.title,
    });

    setSelectedMissionId(null);
    setTurns([]);
    setDraft("");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Dating Academy
        </h1>
        <p className="text-sm text-muted-foreground">
          Train your SIQ through guided practice chats before entering live
          matching lanes.
        </p>
      </div>

      <Card className="border-border bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-primary">SIQ Radar</CardTitle>
          <CardDescription>
            Five-category social intelligence snapshot for your current level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Radar
                  dataKey="score"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-primary">Learning Quests</CardTitle>
          <CardDescription>
            Select a mission to open Practice Chat with your Ghost Crush.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="border-border bg-accent/30 flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-foreground font-medium">{mission.title}</p>
                <p className="text-sm text-muted-foreground">
                  {mission.description ?? "Practice mission"}
                </p>
              </div>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setSelectedMissionId(mission.id)}
              >
                Practice Chat
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedMissionId && (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedMissionId(null);
            setTurns([]);
            setDraft("");
          }}
        >
          <Card
            className="w-full max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Practice Chat · Ghost Crush</CardTitle>
              <CardDescription>{selectedMission?.title}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="border-border bg-muted/30 max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                {turns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add at least 2 turns to submit this practice session.
                  </p>
                ) : (
                  turns.map((turn, index) => (
                    <div
                      key={`${turn.role}-${index}`}
                      className="bg-card rounded-md px-3 py-2 text-sm"
                    >
                      <span className="text-primary mr-2 font-semibold">
                        {turn.role.toUpperCase()}:
                      </span>
                      <span>{turn.text}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={turnRole === "me" ? "default" : "outline"}
                  className={
                    turnRole === "me"
                      ? "bg-primary hover:bg-primary/90"
                      : "border-border"
                  }
                  onClick={() => setTurnRole("me")}
                >
                  ME
                </Button>
                <Button
                  type="button"
                  variant={turnRole === "partner" ? "default" : "outline"}
                  className={
                    turnRole === "partner"
                      ? "bg-primary hover:bg-primary/90"
                      : "border-border"
                  }
                  onClick={() => setTurnRole("partner")}
                >
                  PARTNER
                </Button>
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type one chat turn..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTurn}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Turn
                </Button>
              </div>

              {submitPractice.data?.grade?.feedbackSummary && (
                <div className="border-border bg-secondary text-secondary-foreground rounded-md border px-3 py-2 text-sm">
                  {submitPractice.data.grade.feedbackSummary}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMissionId(null);
                    setTurns([]);
                    setDraft("");
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={submitSession}
                  disabled={submitPractice.isPending || turns.length < 2}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitPractice.isPending
                    ? "Submitting..."
                    : "Submit Practice"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
