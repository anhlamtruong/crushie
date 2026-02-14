/**
 * LLM tRPC Router — Proxy to the LLM service
 *
 * Each procedure is decoupled into its own file for readability.
 */

import { createTRPCRouter } from "@/server/init";
import { generateVibe } from "./generate-vibe";
import { analyzeProfile } from "./analyze-profile";
import { evaluateMatchProcedure } from "./evaluate-match";
import { findAndEvaluateMatches } from "./find-and-evaluate-matches";
import { getAnalyzerHistory } from "./get-analyzer-history";
import { getAnalyzerSession } from "./get-analyzer-session";

export const llmRouter = createTRPCRouter({
  generateVibe,
  analyzeProfile,
  evaluateMatch: evaluateMatchProcedure,
  findAndEvaluateMatches,
  getAnalyzerHistory,
  getAnalyzerSession,
});
