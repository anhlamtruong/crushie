/**
 * TanStack Query hooks — Verification
 *
 * Endpoints:
 *   GET  /verification/status
 *   GET  /verification/check
 *   POST /verification/request
 *   GET  /verification/badges
 *   POST /verification/analyze
 *   GET  /verification/analyzer-sessions
 *   GET  /verification/analyzer-sessions/:id
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  AnalyzerSession,
  ApiListResponse,
  ApiResponse,
  VerificationBadge,
  VerificationStatus,
} from "@/types/api";

export const verificationKeys = {
  all: ["verification"] as const,
  status: () => [...verificationKeys.all, "status"] as const,
  check: () => [...verificationKeys.all, "check"] as const,
  badges: () => [...verificationKeys.all, "badges"] as const,
  analyzerSessions: () =>
    [...verificationKeys.all, "analyzer-sessions"] as const,
  analyzerSession: (id: string) =>
    [...verificationKeys.all, "analyzer-sessions", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────

export function useVerificationStatus() {
  return useQuery({
    queryKey: verificationKeys.status(),
    queryFn: () =>
      api.get<ApiResponse<VerificationStatus>>("/verification/status"),
    select: (res) => res.data,
  });
}

export function useIsVerified() {
  return useQuery({
    queryKey: verificationKeys.check(),
    queryFn: () =>
      api.get<ApiResponse<{ verified: boolean }>>("/verification/check"),
    select: (res) => res.data.verified,
  });
}

export function useVerificationBadges() {
  return useQuery({
    queryKey: verificationKeys.badges(),
    queryFn: () =>
      api.get<ApiListResponse<VerificationBadge>>("/verification/badges"),
    select: (res) => res.data,
  });
}

export function useAnalyzerSessions() {
  return useQuery({
    queryKey: verificationKeys.analyzerSessions(),
    queryFn: () =>
      api.get<ApiListResponse<AnalyzerSession>>(
        "/verification/analyzer-sessions",
      ),
    select: (res) => res.data,
  });
}

export function useAnalyzerSession(id: string) {
  return useQuery({
    queryKey: verificationKeys.analyzerSession(id),
    queryFn: () =>
      api.get<ApiResponse<AnalyzerSession>>(
        `/verification/analyzer-sessions/${id}`,
      ),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────

export function useRequestVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { method: string; data?: Record<string, unknown> }) =>
      api.post<ApiResponse<{ requestId: string }>>(
        "/verification/request",
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: verificationKeys.status() });
      qc.invalidateQueries({ queryKey: verificationKeys.check() });
    },
  });
}

export function useAnalyzeVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { sessionData: Record<string, unknown> }) =>
      api.post<ApiResponse<AnalyzerSession>>("/verification/analyze", body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: verificationKeys.analyzerSessions() }),
  });
}
