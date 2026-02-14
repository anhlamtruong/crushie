"use client";

import { useState, useCallback } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sparkles, Zap, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MultiImageUploader,
  HintTagSelector,
  AnalyzerResults,
  LocationPicker,
  WeatherBanner,
  PlacePostcard,
  AnalyzerHistoryGrid,
  type ImagePreview,
} from "@/components/analyzer";
import type {
  AnalyzerResult,
  LocationInput,
  AnalyzerSessionSummary,
} from "@/types/analyzer";

// ============================================================================
// Page
// ============================================================================

export default function AnalyzeProfilePage() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [hintTags, setHintTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<LocationInput | null>(null);
  const [historyCursor, setHistoryCursor] = useState<string | undefined>();

  const trpc = useTRPC();

  // Upload images → get URLs, then analyze
  const uploadMutation = useMutation(
    trpc.uploads.uploadAnalyzerImage.mutationOptions(),
  );
  const analyzeMutation = useMutation(
    trpc.llm.analyzeProfile.mutationOptions(),
  );

  // History query
  const historyQuery = useQuery(
    trpc.llm.getAnalyzerHistory.queryOptions({
      cursor: historyCursor,
      limit: 12,
    }),
  );

  const isPending = isUploading || analyzeMutation.isPending;

  // ── Hash images ─────────────────────────────────────────────────────

  const hashImages = async (files: File[]): Promise<string> => {
    const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
    const totalLength = buffers.reduce((acc, b) => acc + b.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }
    const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // ── Analyze flow ────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (images.length === 0) return;

    try {
      setIsUploading(true);

      // 1. Hash all images
      const imageHash = await hashImages(images.map((img) => img.file));

      // 2. Upload all images to Supabase Storage (parallel)
      const uploadResults = await Promise.all(
        images.map(async (img) => {
          const buffer = await img.file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
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

      const imageUrls = uploadResults.map((r) => r.url);

      // 3. Analyze via LLM (with optional location)
      analyzeMutation.mutate(
        {
          imageUrls,
          imageHash,
          hintTags: hintTags.length > 0 ? hintTags : [],
          location: location ?? undefined,
        },
        {
          onSuccess: () => {
            // Refetch history after a new analysis
            historyQuery.refetch();
          },
        },
      );
    } catch {
      setIsUploading(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────

  const handleReset = () => {
    analyzeMutation.reset();
    setImages([]);
    setHintTags([]);
    setIsUploading(false);
    // Keep location — user might want to run another analysis
  };

  // ── Load more history ───────────────────────────────────────────────

  const handleLoadMore = useCallback(() => {
    if (historyQuery.data?.nextCursor) {
      setHistoryCursor(historyQuery.data.nextCursor);
    }
  }, [historyQuery.data?.nextCursor]);

  const result = analyzeMutation.data?.session as AnalyzerResult | undefined;

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle animated background blurs */}
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
              Profile Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Upload screenshots of someone&apos;s profile to get AI-powered
            tactical conversation advice
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="analyze" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="analyze">New Vibe Check</TabsTrigger>
              <TabsTrigger value="history">Analysis History</TabsTrigger>
            </TabsList>
          </div>

          {/* ── Tab 1: New Vibe Check ──────────────────────────────── */}
          <TabsContent value="analyze">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-3xl mx-auto"
                >
                  <Card className="backdrop-blur-xl shadow-xl">
                    <CardContent className="p-6 md:p-8 space-y-8">
                      {/* Multi-image upload */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <MultiImageUploader
                          images={images}
                          onImagesChange={setImages}
                          maxImages={10}
                          minImages={1}
                          disabled={isPending}
                        />
                      </motion.div>

                      {/* Hint tag selector */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <HintTagSelector
                          selectedTags={hintTags}
                          onTagsChange={setHintTags}
                          maxTags={20}
                          disabled={isPending}
                        />
                      </motion.div>

                      {/* Location button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <LocationPicker
                          location={location}
                          onLocationChange={setLocation}
                          disabled={isPending}
                        />
                      </motion.div>

                      {/* Analyze button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          onClick={handleAnalyze}
                          disabled={images.length === 0 || isPending}
                          size="lg"
                          className="w-full py-6 text-base group"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {isUploading
                                ? `Uploading ${images.length} image${images.length > 1 ? "s" : ""}...`
                                : "Analyzing with Gemini..."}
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              Analyze Profile
                              {images.length > 0 && (
                                <span className="text-primary-foreground/70">
                                  ({images.length} image
                                  {images.length > 1 ? "s" : ""})
                                </span>
                              )}
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </motion.div>

                      {/* Error state */}
                      {(analyzeMutation.error || uploadMutation.error) && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-destructive text-sm text-center"
                        >
                          {analyzeMutation.error?.message ||
                            uploadMutation.error?.message ||
                            "Analysis failed. Please try again."}
                        </motion.p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                /* ── Results Section ─────────────────────────────── */
                <div className="space-y-6">
                  {/* Environment context display (if available) */}
                  {result.weatherContext && result.city && (
                    <div className="max-w-3xl mx-auto space-y-4">
                      <WeatherBanner
                        weather={result.weatherContext}
                        city={result.city}
                      />
                      {result.nearbyPlaces &&
                        result.nearbyPlaces.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                              Nearby date spots
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                              {result.nearbyPlaces.map((place, i) => (
                                <PlacePostcard
                                  key={place.placeId}
                                  place={place}
                                  index={i}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <AnalyzerResults
                    result={result}
                    onReset={handleReset}
                    userLocation={location}
                  />
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ── Tab 2: Analysis History ─────────────────────────────── */}
          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyzerHistoryGrid
                sessions={
                  (historyQuery.data?.items as AnalyzerSessionSummary[]) ?? []
                }
                hasMore={!!historyQuery.data?.nextCursor}
                onLoadMore={handleLoadMore}
                isLoading={historyQuery.isLoading}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
