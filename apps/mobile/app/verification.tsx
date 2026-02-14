/**
 * Verification Center screen
 */

import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { FullScreenLoading, Loading } from "@/components/ui/loading";
import {
  useAnalyzerSessions,
  useRequestVerification,
  useVerificationBadges,
  useVerificationStatus,
} from "@/hooks";

const verificationMethods: {
  key: string;
  label: string;
  icon: IconName;
  description: string;
}[] = [
  {
    key: "selfie",
    label: "Selfie Verification",
    icon: "camera-outline",
    description: "Take a selfie to verify your identity",
  },
  {
    key: "social",
    label: "Social Verification",
    icon: "link-outline",
    description: "Link your social accounts",
  },
  {
    key: "id",
    label: "ID Verification",
    icon: "card-outline",
    description: "Upload a government-issued ID",
  },
];

export default function VerificationScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <FullScreenLoading message="Loading..." />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <VerificationContent />;
}

function VerificationContent() {
  const status = useVerificationStatus();
  const badges = useVerificationBadges();
  const sessions = useAnalyzerSessions();
  const requestVer = useRequestVerification();

  const isLoading = status.isLoading;

  function refresh() {
    status.refetch();
    badges.refetch();
    sessions.refetch();
  }

  if (isLoading) return <Loading message="Loading verification..." />;
  if (status.isError) return <ErrorView onRetry={refresh} />;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-6 pb-12"
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={refresh}
          tintColor="#f43f5e"
        />
      }
    >
      <Text className="text-foreground text-2xl font-bold mb-1">
        Verification Center
      </Text>
      <Text className="text-foreground-muted mb-6">
        Get verified to build trust and unlock features
      </Text>

      {/* Current Status */}
      <Card className="mb-6">
        <CardTitle>Current Status</CardTitle>
        <CardContent className="mt-2 flex-row items-center gap-2">
          <Badge variant={status.data?.verified ? "success" : "warning"}>
            {status.data?.verified ? "Verified" : "Not Verified"}
          </Badge>
          {status.data?.level && (
            <Badge variant="primary">Level: {status.data.level}</Badge>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      {badges.data && badges.data.length > 0 && (
        <Card className="mb-6">
          <CardTitle>Your Badges</CardTitle>
          <CardContent className="mt-2 flex-row flex-wrap gap-2">
            {badges.data.map((b) => (
              <Badge key={b.id} variant="primary">
                {b.label}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Methods */}
      <Text className="text-foreground font-semibold text-lg mb-3">
        Verification Methods
      </Text>
      <View className="gap-3 mb-6">
        {verificationMethods.map((m) => (
          <Card key={m.key}>
            <View className="flex-row items-center mb-2">
              <View className="mr-3">
                <Icon name={m.icon} size={24} color="#f9a8d4" />
              </View>
              <View className="flex-1">
                <CardTitle>{m.label}</CardTitle>
                <CardDescription>{m.description}</CardDescription>
              </View>
            </View>
            <Button
              variant="secondary"
              size="sm"
              loading={requestVer.isPending}
              onPress={() => requestVer.mutate({ method: m.key })}
            >
              Start Verification
            </Button>
          </Card>
        ))}
      </View>

      {/* Recent sessions */}
      {sessions.data && sessions.data.length > 0 && (
        <>
          <Text className="text-foreground font-semibold text-lg mb-3">
            Recent Sessions
          </Text>
          <View className="gap-3">
            {sessions.data.map((s) => (
              <Card
                key={s.id}
                className="flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-foreground text-sm font-medium">
                    Session {s.id.slice(0, 8)}
                  </Text>
                  <Text className="text-foreground-muted text-xs">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Badge
                  variant={
                    s.status === "completed"
                      ? "success"
                      : s.status === "failed"
                        ? "destructive"
                        : "warning"
                  }
                >
                  {s.status}
                </Badge>
              </Card>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
