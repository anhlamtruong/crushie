"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OnBoardForm, type OnBoardFormData } from "@/components/onboard";
import { VibeResultCard } from "@/components/onboard/vibe-result-card";
import type { VibeProfileResult } from "@/types/vibe-onboard";

// ============================================================================
// Client Component
// ============================================================================

export default function OnBoardClient() {
  const router = useRouter();
  const trpc = useTRPC();

  const [isUploading, setIsUploading] = useState(false);

  // ── Check if user already has a profile ────────────────────────────

  const profileQuery = useQuery(trpc.vibeProfiles.getMe.queryOptions());

  // ── Upload + Generate mutations ────────────────────────────────────

  const uploadMutation = useMutation(
    trpc.uploads.uploadOnboardImage.mutationOptions(),
  );
  const generateMutation = useMutation(trpc.llm.generateVibe.mutationOptions());

  const isPending = isUploading || generateMutation.isPending;

  // ── Submit handler ─────────────────────────────────────────────────

  const handleSubmit = async (data: OnBoardFormData) => {
    if (data.images.length === 0) return;

    try {
      setIsUploading(true);

      // 1. Upload all images to Supabase Storage (parallel)
      const uploadResults = await Promise.all(
        data.images.map(async (img: { file: File; preview: string }) => {
          const buffer = await img.file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (d, byte) => d + String.fromCharCode(byte),
              "",
            ),
          );

          return uploadMutation.mutateAsync({
            base64,
            fileName: img.file.name,
            mimeType: img.file.type as
              | "image/jpeg"
              | "image/png"
              | "image/webp"
              | "image/heic",
          });
        }),
      );

      setIsUploading(false);

      const imageUrls = uploadResults.map((r: { url: string }) => r.url);

      // 2. Generate vibe via LLM (Gemini 2.5 Flash multimodal)
      generateMutation.mutate({
        imageUrls,
        hintTags: data.hintTags.length > 0 ? data.hintTags : undefined,
        extraContext: data.extraContext.trim() || undefined,
      });
    } catch {
      setIsUploading(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────

  const handleReset = () => {
    generateMutation.reset();
  };

  const handleContinue = () => {
    router.push("/");
  };

  // ── Derive result ──────────────────────────────────────────────────

  const generatedProfile = generateMutation.data?.profile as
    | VibeProfileResult
    | undefined;
  const existingProfile = profileQuery.data as VibeProfileResult | undefined;
  const activeProfile = generatedProfile ?? undefined;

  const errorMsg =
    generateMutation.error?.message || uploadMutation.error?.message || null;

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-3/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary via-chart-3 to-chart-2 bg-clip-text text-transparent">
              Create Your Vibe
            </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Upload your photos, tell us about yourself, and let AI craft your
            unique vibe profile
          </p>

          {/* Existing profile notice */}
          {existingProfile && !activeProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary/50 border border-border px-4 py-2 text-sm text-muted-foreground"
            >
              <span className="h-2 w-2 rounded-full bg-chart-3 animate-pulse" />
              You already have a vibe:{" "}
              <strong className="text-foreground">
                {existingProfile.vibeName}
              </strong>{" "}
              — regenerating will replace it
            </motion.div>
          )}
        </motion.div>

        {/* Main content with transitions */}
        <AnimatePresence mode="wait">
          {!activeProfile ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <OnBoardForm
                onSubmit={handleSubmit}
                isPending={isPending}
                isUploading={isUploading}
                error={errorMsg}
              />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <VibeResultCard
                profile={activeProfile}
                onReset={handleReset}
                onContinue={handleContinue}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
