/**
 * Dashboard tab — Valentine vibe overview
 */

import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { VibeCard } from "@/components/domain-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { Icon, type IconName } from "@/components/ui/icon";
import { Loading } from "@/components/ui/loading";
import { useMe, useMyVibeProfile, usePointsTotal } from "@/hooks";

// ── Animated stat pill ──────────────────────────────────────
function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scale]);
  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <View className="bg-background-card border border-border rounded-3xl p-4 items-center">
        <Text className="text-xl mb-1">{icon}</Text>
        <Text style={{ color }} className="text-2xl font-bold">
          {value}
        </Text>
        <Text className="text-foreground-muted text-xs mt-0.5">{label}</Text>
      </View>
    </Animated.View>
  );
}

// ── Quick action row ────────────────────────────────────────
function QuickAction({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-surface border border-border rounded-2xl px-4 py-3.5 active:bg-background-card"
    >
      <Text className="text-xl mr-3">{emoji}</Text>
      <Text className="text-foreground font-medium flex-1">{label}</Text>
      <Text className="text-foreground-muted">›</Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const user = useMe();
  const vibe = useMyVibeProfile();
  const points = usePointsTotal();

  const isLoading = user.isLoading || vibe.isLoading;
  const hasError = user.isError || vibe.isError;

  function refresh() {
    user.refetch();
    vibe.refetch();
    points.refetch();
  }

  if (isLoading) return <Loading message="Loading your vibes..." />;
  if (hasError)
    return <ErrorView message="Failed to load dashboard" onRetry={refresh} />;

  const profile = user.data;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={refresh}
          tintColor="#f43f5e"
        />
      }
    >
      {/* Greeting */}
      <View className="mt-4 mb-6">
        <Text className="text-2xl font-bold text-foreground">
          Hey, {profile?.displayName ?? "there"}
        </Text>
        <Text className="text-foreground-muted mt-1">
          Ready to make some heart connections?
        </Text>
      </View>

      {/* Quick stats */}
      <View className="flex-row gap-3 mb-6">
        <StatPill
          icon="diamond-outline"
          value={points.data?.total ?? 0}
          label="Points"
          color="#f43f5e"
        />
        <StatPill
          icon="sparkles-outline"
          value={vibe.data?.vibeScore ?? "—"}
          label="Vibe Score"
          color="#a78bfa"
        />
        <StatPill
          icon={
            profile?.onboarded ? "checkmark-circle-outline" : "time-outline"
          }
          value={profile?.onboarded ? "Active" : "Setup"}
          label="Status"
          color="#34d399"
        />
      </View>

      {/* Vibe profile card */}
      {vibe.data ? (
        <View className="mb-6">
          <View className="flex-row items-center gap-1.5 mb-2">
            <Icon name="sparkles" size={18} color="#f43f5e" />
            <Text className="text-foreground font-bold text-lg">Your Vibe</Text>
          </View>
          <VibeCard profile={vibe.data} />
        </View>
      ) : (
        <Card variant="highlight" className="mb-6">
          <CardContent className="items-center py-8">
            <Icon name="heart" size={48} color="#f43f5e" />
            <CardTitle className="mt-3">Create Your Vibe</CardTitle>
            <Text className="text-foreground-muted text-sm text-center mt-2 mb-5 leading-5">
              Answer a few questions and let AI generate your unique vibe
              identity
            </Text>
            <Button onPress={() => router.push("/on-board")} size="lg">
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Text className="text-foreground font-bold text-lg mb-3">
        Quick Actions
      </Text>
      <View className="gap-2.5">
        <QuickAction
          icon="heart-outline"
          label="Discover Matches"
          onPress={() => router.push("/(tabs)/discover")}
        />
        <QuickAction
          icon="compass-outline"
          label="Browse Missions"
          onPress={() => router.push("/(tabs)/missions")}
        />
        <QuickAction
          icon="analytics-outline"
          label="Analyze My Profile"
          onPress={() => router.push("/analyze")}
        />
      </View>

      {/* Sign out */}
      <View className="mt-8">
        <Button variant="ghost" onPress={() => signOut()}>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}
