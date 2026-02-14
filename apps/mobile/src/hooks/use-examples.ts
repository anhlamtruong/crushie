/**
 * TanStack Query hooks — Examples (CRUD)
 *
 * Endpoints:
 *   GET    /examples
 *   GET    /examples/public
 *   GET    /examples/:id
 *   POST   /examples
 *   PATCH  /examples/:id
 *   DELETE /examples/:id
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { ApiListResponse, ApiResponse, Example } from "@/types/api";

export const exampleKeys = {
  all: ["examples"] as const,
  list: () => [...exampleKeys.all, "list"] as const,
  public: () => [...exampleKeys.all, "public"] as const,
  detail: (id: string) => [...exampleKeys.all, "detail", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────

export function useExamples() {
  return useQuery({
    queryKey: exampleKeys.list(),
    queryFn: () => api.get<ApiListResponse<Example>>("/examples"),
    select: (res) => res.data,
  });
}

export function usePublicExamples() {
  return useQuery({
    queryKey: exampleKeys.public(),
    queryFn: () => api.get<ApiListResponse<Example>>("/examples/public"),
    select: (res) => res.data,
  });
}

export function useExample(id: string) {
  return useQuery({
    queryKey: exampleKeys.detail(id),
    queryFn: () => api.get<ApiResponse<Example>>(`/examples/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────

export function useCreateExample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      content: string;
      isPublic?: boolean;
    }) => api.post<ApiResponse<Example>>("/examples", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exampleKeys.list() });
      qc.invalidateQueries({ queryKey: exampleKeys.public() });
    },
  });
}

export function useUpdateExample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      title?: string;
      content?: string;
      isPublic?: boolean;
    }) => api.patch<ApiResponse<Example>>(`/examples/${id}`, body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: exampleKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: exampleKeys.list() });
      qc.invalidateQueries({ queryKey: exampleKeys.public() });
    },
  });
}

export function useDeleteExample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<{ success: boolean }>>(`/examples/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exampleKeys.list() });
      qc.invalidateQueries({ queryKey: exampleKeys.public() });
    },
  });
}
