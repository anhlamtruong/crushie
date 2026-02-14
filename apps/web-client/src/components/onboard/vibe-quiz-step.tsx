"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { ExtraContextInput } from "./extra-context-input";
import type { HintTagCategory } from "@/types/analyzer";

// ============================================================================
// Types
// ============================================================================

interface VibeQuizStepProps {
  categories: HintTagCategory[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  extraContext: string;
  onExtraContextChange: (val: string) => void;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function VibeQuizStep({
  categories,
  selectedTags,
  onTagsChange,
  extraContext,
  onExtraContextChange,
  disabled = false,
}: VibeQuizStepProps) {
  const toggleTag = (tag: string) => {
    if (disabled) return;
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 15) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Tell Us Your Vibe
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Tap the cards that resonate with you — this helps our AI understand
          your energy
        </p>
        {selectedTags.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-xs text-muted-foreground"
          >
            {selectedTags.length} selected · max 15
          </motion.p>
        )}
      </motion.div>

      {/* Category sections */}
      <div className="space-y-6">
        {categories.map((category, catIndex) => (
          <motion.div
            key={category.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.08 }}
          >
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{category.emoji}</span>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {category.label}
              </h3>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              <AnimatePresence>
                {category.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);

                  return (
                    <motion.button
                      key={tag}
                      layout
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleTag(tag)}
                      disabled={
                        disabled || (!isSelected && selectedTags.length >= 15)
                      }
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-4 py-3.5 md:py-4 text-left transition-all duration-200",
                        "border will-change-transform",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "min-h-13 md:min-h-15",
                        isSelected
                          ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30 shadow-md"
                          : "bg-card/50 border-border/50 hover:bg-accent/30 hover:border-border",
                        disabled && "opacity-50 cursor-not-allowed",
                        !isSelected &&
                          selectedTags.length >= 15 &&
                          !disabled &&
                          "opacity-40",
                      )}
                    >
                      {/* Selection indicator */}
                      <motion.div
                        animate={{
                          scale: isSelected ? 1 : 0.8,
                          opacity: isSelected ? 1 : 0.3,
                        }}
                        className={cn(
                          "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-border bg-transparent",
                        )}
                      >
                        {isSelected && (
                          <motion.svg
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.2 }}
                            className="w-3 h-3 text-primary-foreground"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                          >
                            <motion.path d="M2 6l3 3 5-5" />
                          </motion.svg>
                        )}
                      </motion.div>

                      {/* Tag text */}
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {tag}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected tags preview */}
      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <GlassCard variant="subtle" className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Your selections
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <motion.button
                  key={tag}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => toggleTag(tag)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
                >
                  {tag} ×
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Extra context */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ExtraContextInput
          value={extraContext}
          onChange={onExtraContextChange}
          disabled={disabled}
        />
      </motion.div>
    </div>
  );
}
