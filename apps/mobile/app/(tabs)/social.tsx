/**
 * Social tab — Valentine connections, matches, vouches, crush list
 */

import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { EmptyState } from "@/components/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { Icon, type IconName } from "@/components/ui/icon";
import { Loading } from "@/components/ui/loading";
import {
  useConnections,
  useCrushList,
  useMatches,
  usePointsTotal,
  useVouches,
} from "@/hooks";

type Tab = "connections" | "matches" | "vouches" | "crushes";

const tabs: { key: Tab; label: string; icon: IconName }[] = [
  { key: "connections", label: "Connections", icon: "people-outline" },
  { key: "matches", label: "Matches", icon: "heart-outline" },
  { key: "vouches", label: "Vouches", icon: "star-outline" },
  { key: "crushes", label: "Crushes", icon: "heart-half-outline" },
];

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("connections");

  const connections = useConnections();
  const matches = useMatches();
  const vouches = useVouches();
  const crushes = useCrushList();
  const points = usePointsTotal();

  function refresh() {
    connections.refetch();
    matches.refetch();
    vouches.refetch();
    crushes.refetch();
    points.refetch();
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header + points */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-2">
          <Icon name="chatbubbles" size={22} color="#f43f5e" />
          <Text className="text-2xl font-bold text-foreground">Social</Text>
        </View>
        <View className="flex-row items-center mt-1 gap-2">
          <Text className="text-foreground-muted text-sm">Total Points:</Text>
          <Badge variant="love" size="md">
            <View className="flex-row items-center gap-1">
              <Icon name="diamond" size={12} color="#fce7f3" />
              <Text className="text-xs font-semibold text-white">
                {points.data?.total ?? 0}
              </Text>
            </View>
          </Badge>
        </View>
      </View>

      {/* Tab pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
          paddingBottom: 12,
        }}
      >
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 rounded-2xl border flex-row items-center gap-1.5 ${
              activeTab === t.key
                ? "bg-primary/15 border-primary/40"
                : "bg-surface border-border"
            }`}
          >
            <Icon
              name={t.icon}
              size={14}
              color={activeTab === t.key ? "#f43f5e" : "#a1a1aa"}
            />
            <Text
              className={`text-sm font-semibold ${
                activeTab === t.key ? "text-primary" : "text-foreground-muted"
              }`}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      {activeTab === "connections" && (
        <ConnectionsList query={connections} onRefresh={refresh} />
      )}
      {activeTab === "matches" && (
        <MatchesList query={matches} onRefresh={refresh} />
      )}
      {activeTab === "vouches" && (
        <VouchesList query={vouches} onRefresh={refresh} />
      )}
      {activeTab === "crushes" && (
        <CrushesList query={crushes} onRefresh={refresh} />
      )}
    </View>
  );
}

// ─── Sub-lists ────────────────────────────────────────────────

function ConnectionsList({
  query,
  onRefresh,
}: {
  query: ReturnType<typeof useConnections>;
  onRefresh: () => void;
}) {
  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorView onRetry={onRefresh} />;
  if (!query.data?.length)
    return (
      <EmptyState
        icon="people"
        title="No Connections"
        description="Connect with people you vibe with!"
      />
    );

  return (
    <FlatList
      data={query.data}
      keyExtractor={(c) => c.id}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 120,
      }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={onRefresh}
          tintColor="#f43f5e"
        />
      }
      renderItem={({ item }) => (
        <Card className="flex-row items-center">
          <Avatar name={item.toUserId} size={40} />
          <View className="ml-3 flex-1">
            <Text className="text-foreground font-medium">{item.toUserId}</Text>
            {item.message && (
              <Text className="text-foreground-muted text-xs">
                {item.message}
              </Text>
            )}
          </View>
          <Badge variant={item.status === "accepted" ? "success" : "warning"}>
            {item.status}
          </Badge>
        </Card>
      )}
    />
  );
}

function MatchesList({
  query,
  onRefresh,
}: {
  query: ReturnType<typeof useMatches>;
  onRefresh: () => void;
}) {
  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorView onRetry={onRefresh} />;
  if (!query.data?.length)
    return (
      <EmptyState
        icon="heart"
        title="No Matches Yet"
        description="Keep vibing — heart connections are coming!"
      />
    );

  return (
    <FlatList
      data={query.data}
      keyExtractor={(m) => m.userId}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 120,
      }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={onRefresh}
          tintColor="#f43f5e"
        />
      }
      renderItem={({ item }) => (
        <Card className="flex-row items-center">
          <Avatar
            name={item.displayName}
            uri={item.avatarUrl}
            size={48}
            showRing
          />
          <View className="ml-3 flex-1">
            <Text className="text-foreground font-semibold">
              {item.displayName ?? "Anonymous"}
            </Text>
            <Text className="text-foreground-muted text-xs">
              <Icon name="heart" size={10} color="#f43f5e" /> Matched{" "}
              {new Date(item.matchedAt).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      )}
    />
  );
}

function VouchesList({
  query,
  onRefresh,
}: {
  query: ReturnType<typeof useVouches>;
  onRefresh: () => void;
}) {
  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorView onRetry={onRefresh} />;
  if (!query.data?.length)
    return (
      <EmptyState
        icon="star"
        title="No Vouches"
        description="Ask friends to vouch for your character!"
      />
    );

  return (
    <FlatList
      data={query.data}
      keyExtractor={(v) => v.id}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 120,
      }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={onRefresh}
          tintColor="#f43f5e"
        />
      }
      renderItem={({ item }) => (
        <Card>
          <Text className="text-foreground leading-5">{item.text}</Text>
          <View className="flex-row items-center mt-2 gap-2">
            {item.category && <Badge variant="accent">{item.category}</Badge>}
            <Text className="text-foreground-muted text-xs">
              from {item.fromUserId}
            </Text>
          </View>
        </Card>
      )}
    />
  );
}

function CrushesList({
  query,
  onRefresh,
}: {
  query: ReturnType<typeof useCrushList>;
  onRefresh: () => void;
}) {
  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorView onRetry={onRefresh} />;
  if (!query.data?.length)
    return (
      <EmptyState
        icon="heart-half"
        title="Crush List Empty"
        description="Add someone to your secret crush list!"
      />
    );

  return (
    <FlatList
      data={query.data}
      keyExtractor={(c) => c.id}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 120,
      }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={onRefresh}
          tintColor="#f43f5e"
        />
      }
      renderItem={({ item }) => (
        <Card className="flex-row items-center">
          <Avatar name={item.crushUserId} size={40} />
          <View className="ml-3 flex-1">
            <Text className="text-foreground font-medium">
              {item.crushUserId}
            </Text>
            {item.note && (
              <Text className="text-foreground-muted text-xs">{item.note}</Text>
            )}
          </View>
          <Text className="text-foreground-muted text-xs">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </Card>
      )}
    />
  );
}
