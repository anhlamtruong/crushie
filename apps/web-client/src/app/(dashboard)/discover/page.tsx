"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Sparkles, X } from "lucide-react";
import { VibeCard } from "@/components/discover/vibe-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_MATCHES, type MockMatchProfile } from "@/lib/mock-matches";

function buildCompatibilityNarrative(profile: MockMatchProfile) {
  return `${profile.whyMatchPreview} You both connect through ${profile.interests
    .slice(0, 2)
    .join(
      " and ",
    )}, and your social circles already overlap with ${profile.mutualConnectionsCount} trusted connection${profile.mutualConnectionsCount > 1 ? "s" : ""}.`;
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<MockMatchProfile[]>(MOCK_MATCHES);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [modalProfile, setModalProfile] = useState<MockMatchProfile | null>(
    null,
  );
  const [isThinking, setIsThinking] = useState(false);
  const [showAutoMatch, setShowAutoMatch] = useState(false);

  const visibleProfiles = useMemo(() => profiles.slice(0, 2), [profiles]);
  const compatibilityText = useMemo(
    () => (modalProfile ? buildCompatibilityNarrative(modalProfile) : ""),
    [modalProfile],
  );

  function handleLike(profile: MockMatchProfile) {
    setLikedIds((current) =>
      current.includes(profile.id) ? current : [...current, profile.id],
    );
    setProfiles((current) => current.filter((item) => item.id !== profile.id));
    if (profile.isAutoMatch) {
      setShowAutoMatch(true);
    }
  }

  function handlePass(profile: MockMatchProfile) {
    setProfiles((current) => current.filter((item) => item.id !== profile.id));
  }

  function handleOpenCompatibility(profile: MockMatchProfile) {
    setModalProfile(profile);
    setIsThinking(true);
  }

  useEffect(() => {
    if (!modalProfile) return;
    const timer = setTimeout(() => {
      setIsThinking(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [modalProfile]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-rose-600">
          Valentine Discover
        </h1>
        <p className="text-sm text-muted-foreground">
          Focused matches based on vibe labels, interests, and social proof.
        </p>
      </div>

      <Card className="border-rose-100 bg-pink-50/70">
        <CardHeader>
          <CardTitle className="text-base text-rose-600">
            Session Stats
          </CardTitle>
          <CardDescription>
            Liked this session:{" "}
            <span className="font-semibold">{likedIds.length}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {visibleProfiles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleProfiles.map((profile) => (
            <VibeCard
              key={profile.id}
              profile={profile}
              onLike={handleLike}
              onPass={handlePass}
              onOpenCompatibility={handleOpenCompatibility}
            />
          ))}
        </div>
      ) : (
        <Card className="border-rose-200 bg-pink-50">
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 py-10 text-center">
            <Sparkles className="h-7 w-7 text-rose-500" />
            <p className="font-medium text-rose-600">No more vibes right now</p>
            <p className="max-w-md text-sm text-muted-foreground">
              You reviewed all mock profiles. Refresh to restart this focused
              session.
            </p>
            <Button
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={() => {
                setProfiles(MOCK_MATCHES);
                setLikedIds([]);
              }}
            >
              Restart Discover
            </Button>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {modalProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setModalProfile(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Card className="border-rose-200 bg-white">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-rose-600">
                      Why you match with {modalProfile.displayName}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setModalProfile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    AI compatibility narrative • {modalProfile.vibeLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isThinking ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full bg-rose-100" />
                      <Skeleton className="h-4 w-[95%] bg-rose-100" />
                      <Skeleton className="h-4 w-[90%] bg-rose-100" />
                    </div>
                  ) : (
                    <p className="leading-relaxed text-card-foreground">
                      {compatibilityText}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAutoMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-rose-900/40 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="w-full max-w-md"
            >
              <Card className="border-rose-300 bg-pink-50 text-center">
                <CardContent className="space-y-3 py-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white">
                    <Heart className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-semibold text-rose-600">
                    It&apos;s a Vibe!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This like triggered an instant match. Start the conversation
                    while the spark is hot.
                  </p>
                  <Button
                    className="bg-rose-500 text-white hover:bg-rose-600"
                    onClick={() => setShowAutoMatch(false)}
                  >
                    Keep Exploring
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
