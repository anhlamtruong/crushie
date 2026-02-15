"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Heart, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { VibeCard } from "@/components/discover/vibe-card";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
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
  const trpc = useTRPC();
  const router = useRouter();
  const academyStats = useQuery(trpc.academy.getStats.queryOptions());

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
    if (academyStats.data?.academyGate.shouldRedirectToAcademy) {
      router.replace("/academy");
    }
  }, [academyStats.data?.academyGate.shouldRedirectToAcademy, router]);

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
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Valentine Discover
        </h1>
        <p className="text-sm text-muted-foreground">
          Focused matches based on vibe labels, interests, and social proof.
        </p>
      </div>

      <Card className="border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-primary text-base">
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
        <Card className="border-border bg-card/80">
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 py-10 text-center">
            <Sparkles className="text-primary h-7 w-7" />
            <p className="text-primary font-medium">No more vibes right now</p>
            <p className="max-w-md text-sm text-muted-foreground">
              You reviewed all mock profiles. Refresh to restart this focused
              session.
            </p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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
            className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4"
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
              <Card className="border-border bg-card">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-primary text-lg">
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
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[95%]" />
                      <Skeleton className="h-4 w-[90%]" />
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
            className="bg-background/85 fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="w-full max-w-md"
            >
              <Card className="border-border bg-card text-center">
                <CardContent className="space-y-3 py-8">
                  <div className="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <Heart className="h-6 w-6" />
                  </div>
                  <p className="text-primary text-2xl font-semibold">
                    It&apos;s a Vibe!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This like triggered an instant match. Start the conversation
                    while the spark is hot.
                  </p>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
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
