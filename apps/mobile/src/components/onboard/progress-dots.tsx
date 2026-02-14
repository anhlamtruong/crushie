/**
 * ProgressDots — step indicator for onboarding flow
 */

import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface ProgressDotsProps {
  total: number;
  current: number;
}

function Dot({ active }: { active: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8, { damping: 15, stiffness: 200 }),
    opacity: withSpring(active ? 1 : 0.35, { damping: 15, stiffness: 200 }),
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`h-2 rounded-full mx-1 ${active ? "bg-primary" : "bg-foreground-muted"}`}
    />
  );
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View className="flex-row items-center justify-center py-4">
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}
