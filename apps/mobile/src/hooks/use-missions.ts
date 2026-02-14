/**
 * TanStack Query hooks — Missions
 *
 * Endpoints:
 *   GET   /missions/templates
 *   GET   /missions/templates/:id
 *   POST  /missions/instances/propose
 *   GET   /missions/instances
 *   PATCH /missions/instances/:id/accept
 *   PATCH /missions/instances/:id/start
 *   PATCH /missions/instances/:id/decline
 *   POST  /missions/progress/:instanceId/objective
 *   POST  /missions/progress/:instanceId/checkin
 *   GET   /missions/progress/:instanceId
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  ApiListResponse,
  ApiResponse,
  MissionInstance,
  MissionProgress,
  MissionTemplate,
} from "@/types/api";

export const missionKeys = {
  all: ["missions"] as const,
  templates: () => [...missionKeys.all, "templates"] as const,
  template: (id: string) => [...missionKeys.all, "templates", id] as const,
  instances: () => [...missionKeys.all, "instances"] as const,
  progress: (instanceId: string) =>
    [...missionKeys.all, "progress", instanceId] as const,
};

// ═══════════════════════════════════════════════════════════════
// Templates
// ═══════════════════════════════════════════════════════════════

export function useMissionTemplates() {
  return useQuery({
    queryKey: missionKeys.templates(),
    queryFn: () =>
      api.get<ApiListResponse<MissionTemplate>>("/missions/templates"),
    select: (res) => res.data,
  });
}

export function useMissionTemplate(id: string) {
  return useQuery({
    queryKey: missionKeys.template(id),
    queryFn: () =>
      api.get<ApiResponse<MissionTemplate>>(`/missions/templates/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// ═══════════════════════════════════════════════════════════════
// Instances
// ═══════════════════════════════════════════════════════════════

export function useMissionInstances() {
  return useQuery({
    queryKey: missionKeys.instances(),
    queryFn: () =>
      api.get<ApiListResponse<MissionInstance>>("/missions/instances"),
    select: (res) => res.data,
  });
}

export function useProposeMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { templateId: string; partnerUserId?: string }) =>
      api.post<ApiResponse<MissionInstance>>(
        "/missions/instances/propose",
        body,
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: missionKeys.instances() }),
  });
}

export function useAcceptMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiResponse<MissionInstance>>(
        `/missions/instances/${id}/accept`,
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: missionKeys.instances() }),
  });
}

export function useStartMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiResponse<MissionInstance>>(
        `/missions/instances/${id}/start`,
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: missionKeys.instances() }),
  });
}

export function useDeclineMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiResponse<MissionInstance>>(
        `/missions/instances/${id}/decline`,
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: missionKeys.instances() }),
  });
}

// ═══════════════════════════════════════════════════════════════
// Progress
// ═══════════════════════════════════════════════════════════════

export function useMissionProgress(instanceId: string) {
  return useQuery({
    queryKey: missionKeys.progress(instanceId),
    queryFn: () =>
      api.get<ApiResponse<MissionProgress>>(`/missions/progress/${instanceId}`),
    select: (res) => res.data,
    enabled: !!instanceId,
  });
}

export function useCompleteObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      instanceId,
      ...body
    }: {
      instanceId: string;
      objectiveIndex: number;
    }) =>
      api.post<ApiResponse<MissionProgress>>(
        `/missions/progress/${instanceId}/objective`,
        body,
      ),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: missionKeys.progress(vars.instanceId) }),
  });
}

export function useMissionCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      instanceId,
      ...body
    }: {
      instanceId: string;
      note?: string;
      photoUrl?: string;
    }) =>
      api.post<ApiResponse<MissionProgress>>(
        `/missions/progress/${instanceId}/checkin`,
        body,
      ),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: missionKeys.progress(vars.instanceId) }),
  });
}
