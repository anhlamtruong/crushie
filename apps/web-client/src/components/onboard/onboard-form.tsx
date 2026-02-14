"use client";

import { useState } from "react";
import { Zap, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MultiImageUploader, type ImagePreview } from "@/components/analyzer";
import { HintTagSelector } from "@/components/analyzer/hint-tag-selector";
import { ExtraContextInput } from "./extra-context-input";
import { VIBE_TAG_CATEGORIES } from "@/types/vibe-onboard";
import { InlineError } from "@/components/error-display";

// ============================================================================
// Types
// ============================================================================

export interface OnBoardFormData {
  images: ImagePreview[];
  hintTags: string[];
  extraContext: string;
}

interface OnBoardFormProps {
  onSubmit: (data: OnBoardFormData) => void;
  isPending?: boolean;
  isUploading?: boolean;
  imageCount?: number;
  error?: string | null;
}

// ============================================================================
// Component
// ============================================================================

export function OnBoardForm({
  onSubmit,
  isPending = false,
  isUploading = false,
  imageCount = 0,
  error = null,
}: OnBoardFormProps) {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [hintTags, setHintTags] = useState<string[]>([]);
  const [extraContext, setExtraContext] = useState("");

  const disabled = isPending;

  const handleSubmit = () => {
    if (images.length === 0) return;
    onSubmit({ images, hintTags, extraContext });
  };

  return (
    <Card className="backdrop-blur-xl shadow-xl max-w-3xl mx-auto">
      <CardContent className="p-6 md:p-8 space-y-8">
        {/* Image uploader */}
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
            disabled={disabled}
          />
        </motion.div>

        {/* Hint tag selector with vibe categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HintTagSelector
            selectedTags={hintTags}
            onTagsChange={setHintTags}
            maxTags={10}
            disabled={disabled}
            categories={VIBE_TAG_CATEGORIES}
            label="About You"
          />
        </motion.div>

        {/* Extra context textarea */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ExtraContextInput
            value={extraContext}
            onChange={setExtraContext}
            disabled={disabled}
          />
        </motion.div>

        {/* Submit button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={images.length === 0 || isPending}
            size="lg"
            className="w-full py-6 text-base group"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isUploading
                  ? `Uploading ${imageCount || images.length} image${(imageCount || images.length) > 1 ? "s" : ""}...`
                  : "Generating your vibe with Gemini..."}
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate My Vibe
                {images.length > 0 && (
                  <span className="text-primary-foreground/70">
                    ({images.length} image{images.length > 1 ? "s" : ""})
                  </span>
                )}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <InlineError message={error} />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
