/**
 * TanStack Query hooks — LLM (AI pipelines)
 *
 * Endpoints:
 *   POST /llm/generate-vibe
 *   POST /llm/analyze-profile
 *   POST /llm/evaluate-match
 *   POST /llm/find-and-evaluate-matches
 */

import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  AnalyzeProfileResult,
  ApiResponse,
  EvaluateMatchResult,
  FindAndEvaluateResult,
  GenerateVibeResult,
} from "@/types/api";

// All LLM endpoints are mutations (POST, potentially long-running)

export function useGenerateVibe() {
  return useMutation({
    mutationFn: (body: {
      imageUrls: string[];
      quizAnswers: Record<string, string>;
      useMock?: boolean;
    }) => api.post<ApiResponse<GenerateVibeResult>>("/llm/generate-vibe", body),
  });
}

export function useAnalyzeProfile() {
  return useMutation({
    mutationFn: (body: { userId?: string }) =>
      api.post<ApiResponse<AnalyzeProfileResult>>("/llm/analyze-profile", body),
  });
}

export function useEvaluateMatch() {
  return useMutation({
    mutationFn: (body: { targetUserId: string }) =>
      api.post<ApiResponse<EvaluateMatchResult>>("/llm/evaluate-match", body),
  });
}

export function useFindAndEvaluateMatches() {
  return useMutation({
    mutationFn: (body: { limit?: number }) =>
      api.post<ApiResponse<FindAndEvaluateResult>>(
        "/llm/find-and-evaluate-matches",
        body,
      ),
  });
}
