/**
 * TanStack Query hooks — Social
 *
 * Endpoints:
 *   GET    /social/connections
 *   POST   /social/connections
 *   PATCH  /social/connections/:id
 *   DELETE /social/connections/:id
 *   GET    /social/matches
 *   GET    /social/matches/mutuals
 *   GET    /social/vouches
 *   POST   /social/vouches
 *   DELETE /social/vouches/:id
 *   GET    /social/vouches/summary/:userId
 *   GET    /social/crush-list
 *   POST   /social/crush-list
 *   DELETE /social/crush-list/:id
 *   GET    /social/points/total
 *   GET    /social/points/history
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  ApiListResponse,
  ApiResponse,
  Connection,
  CrushListEntry,
  Match,
  PointHistory,
  Points,
  Vouch,
  VouchSummary,
} from "@/types/api";

export const socialKeys = {
  all: ["social"] as const,
  connections: () => [...socialKeys.all, "connections"] as const,
  matches: () => [...socialKeys.all, "matches"] as const,
  mutuals: () => [...socialKeys.all, "mutuals"] as const,
  vouches: () => [...socialKeys.all, "vouches"] as const,
  vouchSummary: (userId: string) =>
    [...socialKeys.all, "vouches", "summary", userId] as const,
  crushList: () => [...socialKeys.all, "crush-list"] as const,
  pointsTotal: () => [...socialKeys.all, "points", "total"] as const,
  pointsHistory: () => [...socialKeys.all, "points", "history"] as const,
};

// ═══════════════════════════════════════════════════════════════
// Connections
// ═══════════════════════════════════════════════════════════════

export function useConnections() {
  return useQuery({
    queryKey: socialKeys.connections(),
    queryFn: () => api.get<ApiListResponse<Connection>>("/social/connections"),
    select: (res) => res.data,
  });
}

export function useSendConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { toUserId: string; message?: string }) =>
      api.post<ApiResponse<Connection>>("/social/connections", body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: socialKeys.connections() }),
  });
}

export function useUpdateConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status: string }) =>
      api.patch<ApiResponse<Connection>>(`/social/connections/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: socialKeys.connections() });
      qc.invalidateQueries({ queryKey: socialKeys.matches() });
    },
  });
}

export function useDeleteConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<{ success: boolean }>>(
        `/social/connections/${id}`,
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: socialKeys.connections() }),
  });
}

// ═══════════════════════════════════════════════════════════════
// Matches
// ═══════════════════════════════════════════════════════════════

export function useMatches() {
  return useQuery({
    queryKey: socialKeys.matches(),
    queryFn: () => api.get<ApiListResponse<Match>>("/social/matches"),
    select: (res) => res.data,
  });
}

export function useMutualMatches() {
  return useQuery({
    queryKey: socialKeys.mutuals(),
    queryFn: () => api.get<ApiListResponse<Match>>("/social/matches/mutuals"),
    select: (res) => res.data,
  });
}

// ═══════════════════════════════════════════════════════════════
// Vouches
// ═══════════════════════════════════════════════════════════════

export function useVouches() {
  return useQuery({
    queryKey: socialKeys.vouches(),
    queryFn: () => api.get<ApiListResponse<Vouch>>("/social/vouches"),
    select: (res) => res.data,
  });
}

export function useCreateVouch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { toUserId: string; text: string; category?: string }) =>
      api.post<ApiResponse<Vouch>>("/social/vouches", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: socialKeys.vouches() }),
  });
}

export function useDeleteVouch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<{ success: boolean }>>(`/social/vouches/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: socialKeys.vouches() }),
  });
}

export function useVouchSummary(userId: string) {
  return useQuery({
    queryKey: socialKeys.vouchSummary(userId),
    queryFn: () =>
      api.get<ApiResponse<VouchSummary>>(`/social/vouches/summary/${userId}`),
    select: (res) => res.data,
    enabled: !!userId,
  });
}

// ═══════════════════════════════════════════════════════════════
// Crush List
// ═══════════════════════════════════════════════════════════════

export function useCrushList() {
  return useQuery({
    queryKey: socialKeys.crushList(),
    queryFn: () =>
      api.get<ApiListResponse<CrushListEntry>>("/social/crush-list"),
    select: (res) => res.data,
  });
}

export function useAddCrush() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { crushUserId: string; note?: string }) =>
      api.post<ApiResponse<CrushListEntry>>("/social/crush-list", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: socialKeys.crushList() }),
  });
}

export function useRemoveCrush() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<{ success: boolean }>>(`/social/crush-list/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: socialKeys.crushList() }),
  });
}

// ═══════════════════════════════════════════════════════════════
// Points
// ═══════════════════════════════════════════════════════════════

export function usePointsTotal() {
  return useQuery({
    queryKey: socialKeys.pointsTotal(),
    queryFn: () => api.get<ApiResponse<Points>>("/social/points/total"),
    select: (res) => res.data,
  });
}

export function usePointsHistory() {
  return useQuery({
    queryKey: socialKeys.pointsHistory(),
    queryFn: () =>
      api.get<ApiListResponse<PointHistory>>("/social/points/history"),
    select: (res) => res.data,
  });
}
