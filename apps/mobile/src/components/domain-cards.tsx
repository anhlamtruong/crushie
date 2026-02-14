/**
 * Domain-specific card components — Valentine themed
 */

import React from "react";
import { View, Text, Pressable } from "react-native";

import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Icon, type IconName } from "./ui/icon";

import type {
  Match,
  MissionInstance,
  SimilarProfile,
  VibeProfile,
} from "@/types/api";

// ─── Vibe Profile Card ───────────────────────────────────────

interface VibeCardProps {
  profile: VibeProfile;
  onPress?: () => void;
}

export function VibeCard({ profile, onPress }: VibeCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card variant="highlight">
        <CardHeader>
          <View className="flex-row items-center justify-between">
            <CardTitle>{profile.vibeName ?? "Unknown Vibe"}</CardTitle>
            {profile.energy && (
              <View className="bg-primary/20 px-3 py-1 rounded-full">
                <Text className="text-primary font-bold text-sm capitalize">
                  {profile.energy}
                </Text>
              </View>
            )}
          </View>
        </CardHeader>
        <CardContent>
          {profile.vibeSummary && (
            <Text className="text-foreground-muted text-sm mb-2 leading-5">
              {profile.vibeSummary}
            </Text>
          )}
        </CardContent>
      </Card>
    </Pressable>
  );
}

// ─── Match Card ──────────────────────────────────────────────

interface MatchCardProps {
  match: Match | SimilarProfile;
  onPress?: () => void;
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  const displayName = match.displayName ?? "Anonymous";
  const score =
    "compatibilityScore" in match
      ? (match as unknown as { compatibilityScore: number }).compatibilityScore
      : "similarityScore" in match
        ? (match as SimilarProfile).similarityScore
        : null;

  return (
    <Pressable onPress={onPress}>
      <Card className="flex-row items-center">
        <Avatar
          name={displayName}
          uri={"avatarUrl" in match ? match.avatarUrl : null}
          size={48}
          showRing
        />
        <View className="ml-3 flex-1">
          <Text className="text-foreground font-semibold">{displayName}</Text>
          {"vibeSummary" in match && match.vibeSummary && (
            <Text className="text-foreground-muted text-xs" numberOfLines={1}>
              {match.vibeSummary}
            </Text>
          )}
        </View>
        {score !== null && (
          <Badge variant="love" size="md">
            <View className="flex-row items-center gap-1">
              <Icon name="heart" size={12} color="#fce7f3" />
              <Text className="text-xs font-semibold text-white">
                {Math.round(score * 100)}%
              </Text>
            </View>
          </Badge>
        )}
      </Card>
    </Pressable>
  );
}

// ─── Mission Card ────────────────────────────────────────────

interface MissionCardProps {
  mission: MissionInstance & { title?: string };
  onPress?: () => void;
}

const statusColors: Record<
  string,
  "default" | "primary" | "success" | "warning" | "love"
> = {
  proposed: "warning",
  accepted: "love",
  active: "primary",
  completed: "success",
};

const statusIcons: Record<string, IconName> = {
  proposed: "create-outline",
  accepted: "mail-outline",
  active: "flag",
  completed: "checkmark-circle",
};

export function MissionCard({ mission, onPress }: MissionCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Icon
              name={statusIcons[mission.status] ?? "clipboard-outline"}
              size={16}
              color="#f9a8d4"
            />
            <CardTitle>{mission.title ?? `Mission`}</CardTitle>
          </View>
          <Badge variant={statusColors[mission.status] ?? "default"}>
            {mission.status}
          </Badge>
        </CardHeader>
        <CardFooter>
          <Text className="text-foreground-muted text-xs">
            {mission.startedAt
              ? `Started ${new Date(mission.startedAt).toLocaleDateString()}`
              : `Created ${new Date(mission.createdAt).toLocaleDateString()}`}
          </Text>
        </CardFooter>
      </Card>
    </Pressable>
  );
}
