/**
 * Loading spinner + skeleton + heart-beat loader — Valentine theme
 */

import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LoadingProps {
  message?: string;
  size?: "small" | "large";
}

function HeartBeatLoader() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const beat = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ]),
    );
    beat.start();
    return () => beat.stop();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name="heart" size={36} color="#f43f5e" />
    </Animated.View>
  );
}

export function Loading({ message, size = "large" }: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <HeartBeatLoader />
      {message && (
        <Text className="mt-3 text-foreground-muted text-sm">{message}</Text>
      )}
    </View>
  );
}

export function FullScreenLoading({ message }: { message?: string }) {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <HeartBeatLoader />
      {message && (
        <Text className="mt-4 text-foreground-muted text-base">{message}</Text>
      )}
    </View>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <View className={`rounded-2xl bg-surface animate-pulse ${className}`} />
  );
}
