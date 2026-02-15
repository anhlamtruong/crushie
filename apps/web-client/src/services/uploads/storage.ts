/**
 * Upload Service — Supabase Storage operations
 *
 * Handles file uploads to the `user-uploads` bucket,
 * scoped under `{userId}/on-board/` for onboarding images.
 */

import { supabaseAdmin, USER_UPLOADS_BUCKET } from "@/lib/supabase";

// ── Constants ───────────────────────────────────────────────────────────

const ONBOARD_PREFIX = "on-board";
const ANALYZER_PREFIX = "analyzer";
const PROOF_PREFIX = "proof";
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ── Types ───────────────────────────────────────────────────────────────

export type UploadResult = {
  url: string;
  path: string;
};

export class UploadError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

// ── Validation ──────────────────────────────────────────────────────────

export function validateImageFile(mimeType: string, size: number): void {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new UploadError(
      400,
      `Invalid file type: ${mimeType}. Allowed: ${[...ALLOWED_MIME_TYPES].join(", ")}`,
    );
  }
  if (size > MAX_FILE_SIZE) {
    throw new UploadError(
      400,
      `File too large: ${(size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`,
    );
  }
}

// ── Upload ──────────────────────────────────────────────────────────────

/**
 * Upload a single onboarding image for a user.
 *
 * Storage path: `{userId}/on-board/{timestamp}-{fileName}`
 */
export async function uploadOnboardImage(
  userId: string,
  file: Buffer | Uint8Array,
  fileName: string,
  mimeType: string,
): Promise<UploadResult> {
  // Sanitize filename — remove special chars, keep extension
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const storagePath = `${userId}/${ONBOARD_PREFIX}/${timestamp}-${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("[upload] Supabase storage error:", error);
    throw new UploadError(500, `Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(USER_UPLOADS_BUCKET).getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

// ── List ────────────────────────────────────────────────────────────────

/**
 * List all onboarding image URLs for a user.
 */
export async function getOnboardImageUrls(
  userId: string,
): Promise<UploadResult[]> {
  const prefix = `${userId}/${ONBOARD_PREFIX}`;

  const { data, error } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .list(prefix, {
      sortBy: { column: "created_at", order: "asc" },
    });

  if (error) {
    console.error("[upload] List error:", error);
    throw new UploadError(500, `Failed to list images: ${error.message}`);
  }

  return (data ?? []).map((file) => {
    const path = `${prefix}/${file.name}`;
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(USER_UPLOADS_BUCKET).getPublicUrl(path);

    return { url: publicUrl, path };
  });
}

// ── Delete ──────────────────────────────────────────────────────────────

/**
 * Delete all onboarding images for a user.
 */
export async function deleteOnboardImages(userId: string): Promise<void> {
  const prefix = `${userId}/${ONBOARD_PREFIX}`;

  // List files first
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .list(prefix);

  if (listError) {
    console.error("[upload] List error for deletion:", listError);
    throw new UploadError(
      500,
      `Failed to list images for deletion: ${listError.message}`,
    );
  }

  if (!files || files.length === 0) return;

  const paths = files.map((f) => `${prefix}/${f.name}`);

  const { error: deleteError } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .remove(paths);

  if (deleteError) {
    console.error("[upload] Delete error:", deleteError);
    throw new UploadError(
      500,
      `Failed to delete images: ${deleteError.message}`,
    );
  }
}

// ── Analyzer Image Uploads ──────────────────────────────────────────────

/**
 * Upload a single analyzer image for a user.
 *
 * Storage path: `{userId}/analyzer/{timestamp}-{fileName}`
 */
export async function uploadAnalyzerImage(
  userId: string,
  file: Buffer | Uint8Array,
  fileName: string,
  mimeType: string,
): Promise<UploadResult> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const storagePath = `${userId}/${ANALYZER_PREFIX}/${timestamp}-${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("[upload] Supabase storage error (analyzer):", error);
    throw new UploadError(500, `Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(USER_UPLOADS_BUCKET).getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * List all analyzer image URLs for a user.
 */
export async function getAnalyzerImageUrls(
  userId: string,
): Promise<UploadResult[]> {
  const prefix = `${userId}/${ANALYZER_PREFIX}`;

  const { data, error } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .list(prefix, {
      sortBy: { column: "created_at", order: "asc" },
    });

  if (error) {
    console.error("[upload] List error (analyzer):", error);
    throw new UploadError(500, `Failed to list images: ${error.message}`);
  }

  return (data ?? []).map((file) => {
    const path = `${prefix}/${file.name}`;
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(USER_UPLOADS_BUCKET).getPublicUrl(path);

    return { url: publicUrl, path };
  });
}

/**
 * Delete all analyzer images for a user.
 */
export async function deleteAnalyzerImages(userId: string): Promise<void> {
  const prefix = `${userId}/${ANALYZER_PREFIX}`;

  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .list(prefix);

  if (listError) {
    console.error("[upload] List error for deletion (analyzer):", listError);
    throw new UploadError(
      500,
      `Failed to list images for deletion: ${listError.message}`,
    );
  }

  if (!files || files.length === 0) return;

  const paths = files.map((f) => `${prefix}/${f.name}`);

  const { error: deleteError } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .remove(paths);

  if (deleteError) {
    console.error("[upload] Delete error (analyzer):", deleteError);
    throw new UploadError(
      500,
      `Failed to delete analyzer images: ${deleteError.message}`,
    );
  }
}

// ── Proof Upload ────────────────────────────────────────────────────────

/**
 * Upload a mission proof image for a user.
 *
 * Storage path: `{userId}/proof/{timestamp}-{fileName}`
 */
export async function uploadProofImage(
  userId: string,
  file: Buffer | Uint8Array,
  fileName: string,
  mimeType: string,
): Promise<UploadResult> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const storagePath = `${userId}/${PROOF_PREFIX}/${timestamp}-${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(USER_UPLOADS_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("[upload] Supabase storage error (proof):", error);
    throw new UploadError(500, `Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(USER_UPLOADS_BUCKET).getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}
