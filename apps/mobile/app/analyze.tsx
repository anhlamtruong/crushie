/**
 * Analyze Profile screen — "Reading the Vibes…" Valentine edition
 */

import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, ScrollView, Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { FullScreenLoading } from "@/components/ui/loading";
import { useAnalyzeProfile } from "@/hooks";

// ── Sparkle ring animation shown while analyzing ────────────
function SparkleRing() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [spin, pulse]);

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="items-center justify-center mb-4" style={{ height: 120 }}>
      <Animated.View
        style={{
          transform: [{ rotate: rotation }, { scale: pulse }],
        }}
      >
        <Icon name="sparkles" size={64} color="#f43f5e" />
      </Animated.View>
      <Text className="text-primary font-bold text-lg mt-3">
        Reading the Vibes…
      </Text>
      <View className="flex-row items-center gap-1 mt-1">
        <Text className="text-foreground-muted text-xs">
          Our AI is analyzing your soul
        </Text>
        <Icon name="sparkles" size={10} color="#f9a8d4" />
      </View>
    </View>
  );
}

// ── Score ring ──────────────────────────────────────────────
function ScoreDisplay({ score }: { score: number }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [scale]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View
        className="items-center justify-center self-center mb-5"
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 4,
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244,63,94,0.1)",
        }}
      >
        <Text className="text-primary text-4xl font-bold">{score}</Text>
        <Text className="text-foreground-muted text-xs">Overall Score</Text>
      </View>
    </Animated.View>
  );
}

export default function AnalyzeScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const analyze = useAnalyzeProfile();

  if (!isLoaded) return <FullScreenLoading message="Loading..." />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  function handleAnalyze() {
    analyze.mutate({});
  }

  const result = analyze.data?.data;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
    >
      <View className="flex-row items-center gap-2 mb-1">
        <Icon name="sparkles" size={22} color="#f43f5e" />
        <Text className="text-foreground text-2xl font-bold">
          Profile Analysis
        </Text>
      </View>
      <Text className="text-foreground-muted mb-6">
        AI-powered insights into your vibe
      </Text>

      {!result && (
        <>
          {analyze.isPending ? (
            <Card variant="glass" className="mb-6">
              <CardContent className="items-center py-10">
                <SparkleRing />
              </CardContent>
            </Card>
          ) : (
            <Card variant="highlight" className="mb-6">
              <CardContent className="items-center py-10">
                <View className="mb-4">
                  <Icon name="sparkles" size={56} color="#f43f5e" />
                </View>
                <CardTitle>Ready to Analyze?</CardTitle>
                <Text className="text-foreground-muted text-sm text-center mt-2 mb-5 leading-5">
                  Our AI will read your vibe profile and craft a personalized
                  mission briefing to level up your connections
                </Text>
                <Button onPress={handleAnalyze} size="lg">
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="sparkles" size={16} color="#fff" />
                    <Text className="text-white font-semibold">
                      Read My Vibes
                    </Text>
                  </View>
                </Button>
              </CardContent>
            </Card>
          )}

          {analyze.isError && (
            <View className="bg-red-900/20 border border-red-800/40 rounded-2xl p-4 mb-4">
              <Text className="text-red-400 text-sm text-center">
                Analysis failed. Please try again.
              </Text>
            </View>
          )}
        </>
      )}

      {result && (
        <>
          {/* Score */}
          <ScoreDisplay score={result.overallScore} />

          {/* Mission Briefing: Summary */}
          <Card className="mb-4">
            <CardTitle>
              <View className="flex-row items-center gap-1.5">
                <Icon name="clipboard-outline" size={16} color="#fce7f3" />
                <Text className="text-foreground font-bold">
                  Mission Briefing
                </Text>
              </View>
            </CardTitle>
            <CardContent className="mt-2">
              <Text className="text-foreground leading-5">
                {result.summary}
              </Text>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card className="mb-4">
            <CardTitle>
              <View className="flex-row items-center gap-1.5">
                <Icon name="heart" size={16} color="#f43f5e" />
                <Text className="text-foreground font-bold">
                  Your Superpowers
                </Text>
              </View>
            </CardTitle>
            <CardContent className="mt-2 gap-2">
              {result.strengths.map((s, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Badge variant="success" size="sm">
                    ✓
                  </Badge>
                  <Text className="text-foreground flex-1 leading-5">{s}</Text>
                </View>
              ))}
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card className="mb-6">
            <CardTitle>
              <View className="flex-row items-center gap-1.5">
                <Icon name="rocket" size={16} color="#f9a8d4" />
                <Text className="text-foreground font-bold">Level-Up Tips</Text>
              </View>
            </CardTitle>
            <CardContent className="mt-2 gap-2">
              {result.suggestions.map((s, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Badge variant="accent" size="sm">
                    →
                  </Badge>
                  <Text className="text-foreground flex-1 leading-5">{s}</Text>
                </View>
              ))}
            </CardContent>
          </Card>

          <View className="gap-3">
            <Button onPress={handleAnalyze} loading={analyze.isPending}>
              <View className="flex-row items-center gap-1.5">
                <Icon name="sparkles" size={14} color="#fff" />
                <Text className="text-white font-semibold">Analyze Again</Text>
              </View>
            </Button>
            <Button variant="ghost" onPress={() => router.back()}>
              Back
            </Button>
          </View>
        </>
      )}

      {!result && !analyze.isPending && (
        <Button variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
      )}
    </ScrollView>
  );
}
