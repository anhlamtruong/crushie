/**
 * TanStack Query hooks — Uploads (Onboarding images)
 *
 * Endpoints:
 *   POST   /uploads/onboard-image    — Upload a single image (multipart)
 *   GET    /uploads/onboard-images   — List all onboard images
 *   DELETE /uploads/onboard-images   — Delete all onboard images
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

import { api } from "@/lib/api";
import type {
  ApiResponse,
  ApiMessageResponse,
  UploadResult,
} from "@/types/api";

export const uploadKeys = {
  all: ["uploads"] as const,
  onboardImages: () => [...uploadKeys.all, "onboard-images"] as const,
};

// ─── Queries ──────────────────────────────────────────────────

export function useOnboardImages() {
  return useQuery({
    queryKey: uploadKeys.onboardImages(),
    queryFn: () =>
      api.get<ApiResponse<UploadResult[]>>("/uploads/onboard-images"),
    select: (res) => res.data,
  });
}

// ─── Mutations ────────────────────────────────────────────────

/**
 * Upload a single onboarding image from an ImagePicker asset.
 * Reads the local file as a Blob and appends it to FormData
 * with an explicit filename so the server receives a proper File part.
 */
export function useUploadOnboardImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (asset: ImagePicker.ImagePickerAsset) => {
      const fileName = asset.fileName ?? `photo-${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? "image/jpeg";

      // Read the local file URI into a real Blob so the multipart
      // Content-Disposition includes a `filename` parameter.
      // The old `{ uri, name, type }` hack doesn't work reliably
      // in newer RN/Expo runtimes.
      const fileResponse = await fetch(asset.uri);
      const blob = await fileResponse.blob();

      const formData = new FormData();
      formData.append("image", blob, fileName);

      return api.upload<ApiResponse<UploadResult>>(
        "/uploads/onboard-image",
        formData,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: uploadKeys.onboardImages() });
    },
  });
}

/**
 * Delete all onboarding images for the authenticated user.
 */
export function useDeleteOnboardImages() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete<ApiMessageResponse>("/uploads/onboard-images"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: uploadKeys.onboardImages() });
    },
  });
}
