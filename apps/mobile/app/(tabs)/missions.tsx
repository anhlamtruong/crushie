/**
 * Missions tab — Valentine "Map + Task" view
 */

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

import { MissionCard } from "@/components/domain-cards";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { Loading } from "@/components/ui/loading";
import {
  useMissionInstances,
  useMissionTemplates,
  useProposeMission,
} from "@/hooks";

// ── Postcard-style template card ────────────────────────────
function MissionTemplateCard({
  title,
  description,
  category,
  difficulty,
  xp,
  onPropose,
  loading,
}: {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp: number;
  onPropose: () => void;
  loading: boolean;
}) {
  return (
    <Card variant="glass">
      {/* Header row */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-foreground font-bold text-base">{title}</Text>
          <Text className="text-foreground-muted text-sm mt-1 leading-5">
            {description}
          </Text>
        </View>
        <Badge variant="love" size="md">
          <View className="flex-row items-center gap-1">
            <Icon name="diamond" size={12} color="#fce7f3" />
            <Text className="text-xs font-semibold text-white">{xp} XP</Text>
          </View>
        </Badge>
      </View>

      {/* Tags */}
      <View className="flex-row items-center gap-2 mb-4">
        <Badge variant="accent">{category}</Badge>
        <Badge variant="warning">{difficulty}</Badge>
      </View>

      {/* CTA */}
      <Button variant="primary" size="sm" loading={loading} onPress={onPropose}>
        <View className="flex-row items-center gap-1.5">
          <Icon name="flag" size={14} color="#fff" />
          <Text className="text-white font-semibold">Accept Mission</Text>
        </View>
      </Button>
    </Card>
  );
}

export default function MissionsScreen() {
  const templates = useMissionTemplates();
  const instances = useMissionInstances();
  const propose = useProposeMission();

  const isLoading = templates.isLoading || instances.isLoading;

  function refresh() {
    templates.refetch();
    instances.refetch();
  }

  if (isLoading) return <Loading message="Loading missions..." />;
  if (templates.isError || instances.isError)
    return <ErrorView message="Failed to load missions" onRetry={refresh} />;

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
      {/* Header */}
      <View className="pt-4 mb-5">
        <View className="flex-row items-center gap-2">
          <Icon name="flag" size={22} color="#f43f5e" />
          <Text className="text-2xl font-bold text-foreground">Missions</Text>
        </View>
        <Text className="text-foreground-muted text-sm mt-1">
          Date ideas that actually mean something
        </Text>
      </View>

      {/* Active missions */}
      <View className="flex-row items-center gap-1.5 mb-3">
        <Icon name="flash" size={16} color="#f43f5e" />
        <Text className="text-foreground font-bold text-lg">Active</Text>
      </View>
      {instances.data && instances.data.length > 0 ? (
        <View className="gap-3 mb-6">
          {instances.data.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </View>
      ) : (
        <Card variant="glass" className="mb-6">
          <CardContent className="items-center py-6">
            <View className="mb-2">
              <Icon name="map-outline" size={32} color="#f9a8d4" />
            </View>
            <Text className="text-foreground font-semibold">
              No Active Missions
            </Text>
            <Text className="text-foreground-muted text-sm text-center mt-1">
              Pick one below to start your adventure
            </Text>
          </CardContent>
        </Card>
      )}

      {/* Templates */}
      <View className="flex-row items-center gap-1.5 mb-3">
        <Icon name="mail-outline" size={16} color="#f43f5e" />
        <Text className="text-foreground font-bold text-lg">
          Available Missions
        </Text>
      </View>
      {templates.data && templates.data.length > 0 ? (
        <View className="gap-4">
          {templates.data.map((t) => (
            <MissionTemplateCard
              key={t.id}
              title={t.title}
              description={t.description}
              category={t.category}
              difficulty={t.difficulty}
              xp={t.xpReward}
              loading={propose.isPending}
              onPropose={() => propose.mutate({ templateId: t.id })}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="clipboard-outline"
          title="No Templates Yet"
          description="Check back soon for new missions!"
        />
      )}
    </ScrollView>
  );
}
