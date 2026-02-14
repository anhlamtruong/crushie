"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { AnalyzerResult } from "@/types/analyzer";
import { StyleBadge } from "./style-badge";
import { VibeAnalysisCard } from "./vibe-analysis-card";
import { ConversationOpenersCard } from "./conversation-openers-card";
import { DateSuggestionsCard } from "./date-suggestions-card";
import { MissionMap } from "./mission-map";

interface AnalyzerResultsProps {
  result: AnalyzerResult;
  onReset?: () => void;
  userLocation?: { lat: number; lng: number } | null;
  /** When true, renders full detail cards (for standalone/detail pages). When false, omits sections handled by SidePrism. */
  fullDetail?: boolean;
}

export function AnalyzerResults({
  result,
  onReset,
  userLocation,
  fullDetail = true,
}: AnalyzerResultsProps) {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Only show these sections in full detail mode (standalone pages) — SidePrism handles them in the new layout */}
      {fullDetail && (
        <>
          <StyleBadge style={result.predictedStyle} />

          <VibeAnalysisCard
            vibePrediction={result.vibePrediction}
            predictedStyle={result.predictedStyle}
          />

          <ConversationOpenersCard openers={result.conversationOpeners} />

          {result.dateSuggestions.length > 0 && (
            <DateSuggestionsCard
              suggestions={result.dateSuggestions}
              predictedStyle={result.predictedStyle}
            />
          )}
        </>
      )}

      {/* Mission Map — always shown in main content area */}
      {result.dateSuggestions.length > 0 && (
        <MissionMap
          missions={result.dateSuggestions}
          userLocation={userLocation}
        />
      )}

      {/* Reset Button — hidden on read-only detail pages */}
      {onReset && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="w-full py-6 text-base"
          >
            <RotateCcw className="w-4 h-4" />
            Analyze Another Profile
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
