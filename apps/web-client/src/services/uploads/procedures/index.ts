/**
 * Uploads tRPC Router
 *
 * Handles file uploads to Supabase Storage via base64 encoding.
 * For mobile multipart uploads, use the Hono REST endpoint instead.
 */

import { createTRPCRouter } from "@/server/init";
import {
  uploadOnboardImageProcedure,
  getOnboardImagesProcedure,
  deleteOnboardImagesProcedure,
} from "./upload-onboard-image";
import {
  uploadAnalyzerImageProcedure,
  getAnalyzerImagesProcedure,
  deleteAnalyzerImagesProcedure,
} from "./upload-analyzer-image";
import { uploadProofImageProcedure } from "./upload-proof-image";

export const uploadsRouter = createTRPCRouter({
  uploadOnboardImage: uploadOnboardImageProcedure,
  getOnboardImages: getOnboardImagesProcedure,
  deleteOnboardImages: deleteOnboardImagesProcedure,
  uploadAnalyzerImage: uploadAnalyzerImageProcedure,
  getAnalyzerImages: getAnalyzerImagesProcedure,
  deleteAnalyzerImages: deleteAnalyzerImagesProcedure,
  uploadProofImage: uploadProofImageProcedure,
});
