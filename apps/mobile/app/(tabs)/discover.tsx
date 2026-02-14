/**
 * Discover tab — Valentine card-stack with Vibe Labels up-front
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ErrorView } from "@/components/ui/error-view";
import { Icon } from "@/components/ui/icon";
import { Loading } from "@/components/ui/loading";
import { useFindAndEvaluateMatches, useFindSimilarProfiles } from "@/hooks";
import type { SimilarProfile } from "@/types/api";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 48;

// ─── Sparkle particle (subtle floating ✨) ──────────────────
function Sparkle({ delay }: { delay: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, {
            toValue: -30,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1400,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(y, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, y, opacity]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        opacity,
        transform: [{ translateY: y }],
      }}
    >
      <Icon name="sparkles" size={10} color="#f9a8d4" />
    </Animated.View>
  );
}

// ─── Vibe-first profile card ────────────────────────────────
interface VibeProfileCardProps {
  profile: SimilarProfile;
  index: number;
}

function VibeProfileCard({ profile, index }: VibeProfileCardProps) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, scale, fadeIn]);

  const displayName = profile.displayName ?? "Mysterious Soul";
  const scorePercent =
    profile.similarityScore != null
      ? Math.round(profile.similarityScore * 100)
      : null;

  const vibeLabel = profile.vibeName ?? "Kindred Spirit";
  const interests = profile.interestTags?.slice(0, 4) ?? [];

  return (
    <Animated.View
      style={{
        width: CARD_W,
        opacity: fadeIn,
        transform: [{ scale }],
      }}
    >
      <View
        className="rounded-3xl border border-border bg-background-card overflow-hidden"
        style={{
          shadowColor: "#f43f5e",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* ── Top: Vibe Label + Score ── */}
        <View className="p-5 pb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Sparkle delay={0} />
              <Text className="text-xl font-bold text-foreground">
                {vibeLabel}
              </Text>
            </View>
            {scorePercent !== null && (
              <View className="bg-primary/20 px-3 py-1 rounded-full flex-row items-center gap-1">
                <Icon name="heart" size={12} color="#f43f5e" />
                <Text className="text-primary font-bold text-sm">
                  {scorePercent}%
                </Text>
              </View>
            )}
          </View>

          {profile.energy && (
            <View className="flex-row items-center gap-1 mb-3">
              <Text className="text-xs text-foreground-muted">Energy</Text>
              <Icon name="flash" size={12} color="#d4a0ff" />
              <Text className="text-sm font-bold text-accent-light capitalize">
                {profile.energy}
              </Text>
            </View>
          )}

          {/* ── Interest chips ── */}
          {interests.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {interests.map((interest: string, i: number) => (
                <Badge key={i} variant="accent" size="sm">
                  {interest}
                </Badge>
              ))}
            </View>
          )}
        </View>

        {/* ── Divider ── */}
        <View className="h-px bg-border mx-5" />

        {/* ── Bottom: Identity row ── */}
        <View className="flex-row items-center p-4 gap-3">
          <Avatar
            name={displayName}
            uri={profile.avatarUrl}
            size={44}
            showRing
          />
          <View className="flex-1">
            <Text className="text-foreground font-semibold text-base">
              {displayName}
            </Text>
            <Text className="text-foreground-muted text-xs" numberOfLines={1}>
              {profile.vibeSummary ?? "Waiting to be discovered…"}
            </Text>
          </View>
          <Badge variant="love" size="md">
            <View className="flex-row items-center gap-1">
              <Icon name="chatbubble" size={12} color="#fce7f3" />
              <Text className="text-xs font-semibold text-white">Vibe</Text>
            </View>
          </Badge>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main Discover Screen ───────────────────────────────────
export default function DiscoverScreen() {
  const [results, setResults] = useState<SimilarProfile[]>([]);
  const [activeTab, setActiveTab] = useState<"similar" | "ai">("similar");
  const findSimilar = useFindSimilarProfiles();
  const findMatches = useFindAndEvaluateMatches();

  const isLoading = findSimilar.isPending || findMatches.isPending;

  const handleFindSimilar = useCallback(() => {
    setActiveTab("similar");
    findSimilar.mutate(
      { limit: 20 },
      { onSuccess: (res) => setResults(res.data) },
    );
  }, [findSimilar]);

  const handleFindMatches = useCallback(() => {
    setActiveTab("ai");
    findMatches.mutate(
      { limit: 10 },
      {
        onSuccess: (res) => {
          const mapped: SimilarProfile[] = res.data.matches.map((m) => ({
            userId: m.userId,
            displayName: m.displayName,
            avatarUrl: null,
            vibeName: m.recommendation?.split(".")[0] ?? "Match",
            vibeSummary: m.recommendation,
            energy: null,
            similarityScore: m.compatibilityScore,
          }));
          setResults(mapped);
        },
      },
    );
  }, [findMatches]);

  return (
    <View className="flex-1 bg-background">
      {/* ── Header ── */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-2">
          <Icon name="heart" size={22} color="#f43f5e" />
          <Text className="text-2xl font-bold text-foreground">Discover</Text>
        </View>
        <Text className="text-foreground-muted text-sm mt-1">
          Personality first. Always.
        </Text>
      </View>

      {/* ── Tab pills ── */}
      <View className="flex-row gap-2 px-6 pb-4">
        <Pressable
          onPress={handleFindSimilar}
          className={`flex-1 py-2.5 rounded-2xl items-center border flex-row justify-center gap-1.5 ${
            activeTab === "similar"
              ? "bg-primary/15 border-primary/40"
              : "bg-surface border-border"
          }`}
        >
          <Icon
            name="sparkles"
            size={14}
            color={activeTab === "similar" ? "#f43f5e" : "#a1a1aa"}
          />
          <Text
            className={`font-semibold text-sm ${
              activeTab === "similar" ? "text-primary" : "text-foreground-muted"
            }`}
          >
            Similar Vibes
          </Text>
        </Pressable>
        <Pressable
          onPress={handleFindMatches}
          className={`flex-1 py-2.5 rounded-2xl items-center border flex-row justify-center gap-1.5 ${
            activeTab === "ai"
              ? "bg-primary/15 border-primary/40"
              : "bg-surface border-border"
          }`}
        >
          <Icon
            name="hardware-chip"
            size={14}
            color={activeTab === "ai" ? "#f43f5e" : "#a1a1aa"}
          />
          <Text
            className={`font-semibold text-sm ${
              activeTab === "ai" ? "text-primary" : "text-foreground-muted"
            }`}
          >
            AI Match
          </Text>
        </Pressable>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <Loading message="Reading the vibes..." />
      ) : findSimilar.isError || findMatches.isError ? (
        <ErrorView
          message="Failed to discover profiles"
          onRetry={handleFindSimilar}
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Discover Your People"
          description="Tap a vibe above to find souls that match your wavelength"
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 24,
            paddingBottom: 120,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={
                activeTab === "similar" ? handleFindSimilar : handleFindMatches
              }
              tintColor="#f43f5e"
            />
          }
        >
          {results.map((profile, idx) => (
            <VibeProfileCard
              key={profile.userId}
              profile={profile}
              index={idx}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
