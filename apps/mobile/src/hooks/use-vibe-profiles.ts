/**
 * TanStack Query hooks — Vibe Profiles
 *
 * Endpoints:
 *   GET   /vibe-profiles/me
 *   POST  /vibe-profiles
 *   PATCH /vibe-profiles
 *   POST  /vibe-profiles/similar
 *   GET   /vibe-profiles/user/:userId
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  ApiListResponse,
  ApiResponse,
  SimilarProfile,
  VibeProfile,
} from "@/types/api";

export const vibeProfileKeys = {
  all: ["vibe-profiles"] as const,
  me: () => [...vibeProfileKeys.all, "me"] as const,
  byUser: (userId: string) => [...vibeProfileKeys.all, "user", userId] as const,
  similar: () => [...vibeProfileKeys.all, "similar"] as const,
};

// ─── Queries ──────────────────────────────────────────────────

export function useMyVibeProfile() {
  return useQuery({
    queryKey: vibeProfileKeys.me(),
    queryFn: () => api.get<ApiResponse<VibeProfile>>("/vibe-profiles/me"),
    select: (res) => res.data,
  });
}

export function useVibeProfileByUserId(userId: string) {
  return useQuery({
    queryKey: vibeProfileKeys.byUser(userId),
    queryFn: () =>
      api.get<ApiResponse<VibeProfile>>(`/vibe-profiles/user/${userId}`),
    select: (res) => res.data,
    enabled: !!userId,
  });
}

// ─── Mutations ────────────────────────────────────────────────

export function useCreateVibeProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<ApiResponse<VibeProfile>>("/vibe-profiles", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: vibeProfileKeys.me() }),
  });
}

export function useUpdateVibeProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.patch<ApiResponse<VibeProfile>>("/vibe-profiles", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: vibeProfileKeys.me() }),
  });
}

export function useFindSimilarProfiles() {
  return useMutation({
    mutationFn: (body: { limit?: number; threshold?: number }) =>
      api.post<ApiListResponse<SimilarProfile>>("/vibe-profiles/similar", body),
  });
}
