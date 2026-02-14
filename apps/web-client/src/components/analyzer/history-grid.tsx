"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StyleBadge } from "./style-badge";
import type { AnalyzerSessionSummary, PredictedStyle } from "@/types/analyzer";

interface AnalyzerHistoryGridProps {
  sessions: AnalyzerSessionSummary[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function AnalyzerHistoryGrid({
  sessions,
  hasMore,
  onLoadMore,
  isLoading,
}: AnalyzerHistoryGridProps) {
  if (sessions.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">
          No analysis history yet. Run your first vibe check!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link href={`/analyze-profile/${session.id}`}>
              <Card className="group hover:shadow-lg transition-all cursor-pointer hover:border-primary/30">
                <CardContent className="p-4 space-y-3">
                  {/* Style + time */}
                  <div className="flex items-center justify-between">
                    <StyleBadge
                      style={session.predictedStyle as PredictedStyle}
                    />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(session.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Vibe summary preview */}
                  <p className="text-sm text-foreground/80 line-clamp-2">
                    {(
                      session.vibePrediction as {
                        summary?: string;
                      }
                    )?.summary ?? "Analysis complete"}
                  </p>

                  {/* City + arrow */}
                  <div className="flex items-center justify-between">
                    {session.city ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {session.city}
                      </span>
                    ) : (
                      <span />
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}

        {/* Loading skeleton cards */}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skel-${i}`}>
              <CardContent className="p-4 space-y-3">
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Load more */}
      {hasMore && !isLoading && (
        <div className="text-center pt-2">
          <button
            onClick={onLoadMore}
            className="text-sm text-primary hover:underline"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
