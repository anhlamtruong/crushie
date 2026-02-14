"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnergyBadge } from "./energy-badge";
import type { VibeProfileResult } from "@/types/vibe-onboard";

interface VibeResultCardProps {
  profile: VibeProfileResult;
  onReset?: () => void;
  onContinue?: () => void;
}

export function VibeResultCard({
  profile,
  onReset,
  onContinue,
}: VibeResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-3xl mx-auto"
    >
      <Card className="backdrop-blur-xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {/* Hero section */}
          <div className="relative px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              {profile.vibeName}
            </motion.h2>

            {profile.vibeSummary && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-3 text-muted-foreground text-base max-w-lg mx-auto leading-relaxed"
              >
                {profile.vibeSummary}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex justify-center"
            >
              <EnergyBadge energy={profile.energy} size="lg" />
            </motion.div>
          </div>

          {/* Tags section */}
          <div className="px-6 pb-6 md:px-8 md:pb-8 space-y-5">
            {/* Mood Tags */}
            {profile.moodTags && profile.moodTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <span>🎭</span> Mood
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.moodTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/50 text-secondary-foreground border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Style Tags */}
            {profile.styleTags && profile.styleTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <span>👗</span> Style
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.styleTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent/50 text-accent-foreground border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Interest Tags */}
            {profile.interestTags && profile.interestTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <span>💡</span> Interests
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interestTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-foreground border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border"
            >
              {onContinue && (
                <Button
                  onClick={onContinue}
                  size="lg"
                  className="flex-1 py-5 text-base group"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
              {onReset && (
                <Button
                  onClick={onReset}
                  variant="outline"
                  size="lg"
                  className="py-5 text-base gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate
                </Button>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
