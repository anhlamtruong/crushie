/**
 * TanStack Query hooks — Users
 *
 * Endpoints:
 *   GET   /users/me
 *   PATCH /users/me
 *   POST  /users/sync
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ApiResponse, User } from "@/types/api";

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
};

// ─── Queries ──────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => api.get<ApiResponse<User>>("/users/me"),
    select: (res) => res.data,
  });
}

// ─── Mutations ────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      body: Partial<Omit<User, "id" | "clerkId" | "createdAt" | "updatedAt">>,
    ) => api.patch<ApiResponse<User>>("/users/me", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me() }),
  });
}

export function useSyncFromClerk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ApiResponse<User>>("/users/sync"),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me() }),
  });
}
