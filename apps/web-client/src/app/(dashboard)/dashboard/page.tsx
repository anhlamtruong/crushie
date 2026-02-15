"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AsyncBoundary } from "@/components/async-boundary";
import { UserVibeSummary } from "@/components/dashboard/user-vibe-summary";

export default function DashboardPage() {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(trpc.protectedHello.queryOptions());
  const academyStats = useQuery(trpc.academy.getStats.queryOptions());

  const summary = academyStats.data?.summary;

  return (
    <AsyncBoundary>
      <div className="space-y-6">
        <div>
          <h2 className="text-foreground text-3xl font-bold tracking-tight">
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            Your dating growth and academy progress start here.
          </p>
        </div>

        {summary ? (
          <UserVibeSummary
            vibeLabel={summary.vibeLabel}
            interests={summary.interests}
            narrative={summary.narrative}
            siqScore={summary.powerLevel}
          />
        ) : (
          <Card className="border-border bg-card/80 shadow-sm backdrop-blur-md">
            <CardContent className="py-8 text-sm text-muted-foreground">
              Loading your personalized love report...
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Hello Message</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
              ) : (
                <p className="text-lg">{data?.greeting}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link
                href="/academy"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
              >
                💘 Dating Academy
              </Link>
              <Link
                href="/theme-editor"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                🎨 Theme Editor
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                SIQ updates in real-time after each practice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AsyncBoundary>
  );
}
