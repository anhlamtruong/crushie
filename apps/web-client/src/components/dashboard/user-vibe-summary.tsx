"use client";

import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserVibeSummaryProps = {
  vibeLabel: string;
  interests: string[];
  narrative: string;
  siqScore: number;
};

export function UserVibeSummary({
  vibeLabel,
  interests,
  narrative,
  siqScore,
}: UserVibeSummaryProps) {
  const normalized = Math.max(
    0,
    Math.min(100, Math.round((siqScore / 1000) * 100)),
  );
  const circumference = 2 * Math.PI * 48;
  const dash = (normalized / 100) * circumference;

  return (
    <Card className="border-border bg-card/80 shadow-sm backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-primary">
          Your Personalized Love Report
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-3">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Vibe Card
            </p>
            <p className="text-foreground text-2xl font-semibold">
              {vibeLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {interests.slice(0, 6).map((interest) => (
              <span
                key={interest}
                className="bg-secondary text-secondary-foreground border-border rounded-full border px-2.5 py-1 text-xs"
              >
                {interest}
              </span>
            ))}
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {narrative}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
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
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-primary absolute inset-0 flex flex-col items-center justify-center">
              <Heart className="h-5 w-5 fill-current" />
              <span className="text-sm font-semibold">SIQ {siqScore}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.15em]">
            Power Level
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
