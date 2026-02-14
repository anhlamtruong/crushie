/**
 * Profile tab — Full vibe profile with reusable components
 */

import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, RefreshControl, ScrollView, Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { Icon } from "@/components/ui/icon";
import { Loading } from "@/components/ui/loading";
import {
  ProfileHeader,
  VibeIdentityCard,
  TagCloud,
  PhotoStrip,
  InfoSection,
  SettingsRow,
} from "@/components/profile";
import { InfoRow } from "@/components/profile/info-section";
import {
  useMe,
  useMyVibeProfile,
  useVerificationBadges,
  useVerificationStatus,
} from "@/hooks";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();

  const user = useMe();
  const vibe = useMyVibeProfile();
  const verStatus = useVerificationStatus();
  const badges = useVerificationBadges();

  const isLoading = user.isLoading;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  function refresh() {
    user.refetch();
    vibe.refetch();
    verStatus.refetch();
    badges.refetch();
  }

  if (isLoading) return <Loading message="Loading profile..." />;
  if (user.isError)
    return <ErrorView message="Failed to load profile" onRetry={refresh} />;

  const profile = user.data;
  const v = vibe.data;

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
      {/* ── Avatar + name + bio ── */}
      <Animated.View style={{ opacity: fadeIn }}>
        <ProfileHeader
          imageUrl={profile?.avatarUrl ?? clerkUser?.imageUrl}
          displayName={profile?.displayName}
          bio={profile?.bio}
          gender={profile?.gender}
          location={profile?.location}
        />
      </Animated.View>

      {/* ── Verification ── */}
      <InfoSection title="Verification" icon="shield-checkmark-outline">
        {verStatus.data ? (
          <View className="flex-row items-center gap-2 flex-wrap">
            <Badge
              variant={verStatus.data.verified ? "success" : "warning"}
              size="md"
            >
              {verStatus.data.verified ? "✓ Verified" : "Not Verified"}
            </Badge>
            {verStatus.data.level && (
              <Badge variant="primary" size="md">
                {verStatus.data.level}
              </Badge>
            )}
          </View>
        ) : (
          <Text className="text-foreground-muted text-sm">Loading…</Text>
        )}
        {badges.data && badges.data.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {badges.data.map((b) => (
              <Badge key={b.id} variant="accent">
                {b.label}
              </Badge>
            ))}
          </View>
        )}
      </InfoSection>

      {/* ── Vibe Identity hero card ── */}
      {v && (
        <>
          <View className="mb-3">
            <VibeIdentityCard
              vibeName={v.vibeName}
              vibeSummary={v.vibeSummary}
              energy={v.energy}
            />
          </View>

          {/* ── Mood / Style / Interest tags ── */}
          <Card variant="glass" className="mb-3">
            <CardContent className="gap-3">
              <TagCloud
                title="Mood Tags"
                icon="happy-outline"
                tags={v.moodTags ?? []}
                variant="love"
              />
              <TagCloud
                title="Style Tags"
                icon="color-palette-outline"
                tags={v.styleTags ?? []}
                variant="accent"
              />
              <TagCloud
                title="Interests"
                icon="sparkles-outline"
                tags={v.interestTags ?? []}
                variant="primary"
              />
            </CardContent>
          </Card>

          {/* ── Photos ── */}
          {v.photoUrls && v.photoUrls.length > 0 && (
            <Card variant="glass" className="mb-3">
              <CardContent>
                <PhotoStrip urls={v.photoUrls} size={80} />
              </CardContent>
            </Card>
          )}

          {/* ── Quiz answers ── */}
          {v.quizAnswers && Object.keys(v.quizAnswers).length > 0 && (
            <InfoSection title="Quiz Answers" icon="extension-puzzle-outline">
              {Object.entries(v.quizAnswers).map(([key, val]) => (
                <InfoRow
                  key={key}
                  label={key.replace(/_/g, " ")}
                  value={String(val)}
                />
              ))}
            </InfoSection>
          )}
        </>
      )}

      {/* ── No vibe yet CTA ── */}
      {!v && !vibe.isLoading && (
        <Card variant="highlight" className="mb-4">
          <CardContent className="items-center py-6">
            <Icon name="sparkles" size={40} color="#f43f5e" />
            <Text className="text-foreground font-bold text-lg mb-1 mt-3">
              Discover Your Vibe
            </Text>
            <Text className="text-foreground-muted text-sm text-center mb-4 leading-5">
              Answer a few questions and let AI generate your unique vibe
              identity.
            </Text>
            <Button variant="primary" onPress={() => router.push("/on-board")}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Settings ── */}
      <Text className="text-foreground font-bold text-lg mb-3 mt-2">
        Settings
      </Text>
      <View className="gap-2.5">
        <SettingsRow
          icon="create-outline"
          label="Edit Profile"
          onPress={() => router.push("/edit-profile")}
        />
        <SettingsRow
          icon="color-wand-outline"
          label={v ? "Regenerate Vibe" : "Create Vibe Profile"}
          onPress={() => router.push("/on-board")}
        />
        <SettingsRow
          icon="analytics-outline"
          label="Analyze My Profile"
          onPress={() => router.push("/analyze")}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          label="Verification Center"
          onPress={() => router.push("/verification")}
        />
      </View>

      {/* ── Sign out ── */}
      <View className="mt-8">
        <Button variant="destructive" onPress={() => signOut()}>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}
