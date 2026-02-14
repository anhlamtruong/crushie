/**
 * Entry point — Valentine Landing page
 * Auth redirects are handled by the root layout's AuthGate.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui/icon";

function HeartPulse() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.25,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Ionicons name="heart" size={72} color="#f43f5e" />
    </Animated.View>
  );
}

function FloatingHeart({ delay, left }: { delay: number; left: `${number}%` }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -120,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(fadeOp, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(fadeOp, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, translateY, fadeOp]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 200,
        left,
        transform: [{ translateY }],
        opacity: fadeOp,
      }}
    >
      <Ionicons name="heart" size={20} color="#f9a8d4" />
    </Animated.View>
  );
}

export default function Index() {
  const router = useRouter();

  // Valentine Landing Page
  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      {/* Floating hearts background */}
      <FloatingHeart delay={0} left="15%" />
      <FloatingHeart delay={800} left="75%" />
      <FloatingHeart delay={1600} left="45%" />
      <FloatingHeart delay={2400} left="25%" />
      <FloatingHeart delay={3200} left="65%" />

      {/* Main content */}
      <View className="items-center">
        <HeartPulse />

        <Text className="text-foreground text-3xl font-bold mt-6 text-center">
          Find Your Vibe
        </Text>
        <Text className="text-foreground-muted text-base mt-2 text-center leading-6">
          AI-powered connections based on{"\n"}who you really are — not just
          looks
        </Text>

        <View className="flex-row gap-2 mt-6 flex-wrap justify-center">
          <View className="bg-primary/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
            <Icon name="sparkles" size={12} color="#fda4af" />
            <Text className="text-primary-light text-xs">
              Personality First
            </Text>
          </View>
          <View className="bg-accent/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
            <Icon name="pulse" size={12} color="#d4a0ff" />
            <Text className="text-accent-light text-xs">Vibe Matching</Text>
          </View>
          <View className="bg-secondary/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
            <Icon name="flag" size={12} color="#93c5fd" />
            <Text className="text-secondary-light text-xs">Date Missions</Text>
          </View>
        </View>
      </View>

      {/* CTA Buttons */}
      <View className="w-full mt-12 gap-3">
        <Pressable
          onPress={() => router.push("/(auth)/sign-up")}
          className="bg-primary py-4 rounded-3xl items-center active:bg-primary-dark flex-row justify-center gap-2"
        >
          <Icon name="heart" size={18} color="#fff" />
          <Text className="text-white text-lg font-bold">
            Start Your Love Story
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          className="border border-primary/40 py-4 rounded-3xl items-center active:bg-primary/10"
        >
          <Text className="text-primary text-lg font-semibold">
            Already have an account? Sign In
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center justify-center mt-8 gap-1">
        <Text className="text-foreground-dim text-xs text-center">
          Made with
        </Text>
        <Icon name="heart" size={10} color="#f43f5e" />
        <Text className="text-foreground-dim text-xs text-center">
          for Valentine Season 2026
        </Text>
      </View>
    </View>
  );
}
