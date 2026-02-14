/**
 * Avatar component — Valentine styled with gradient ring
 */

import React from "react";
import { Image, View, Text } from "react-native";

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  showRing?: boolean;
}

export function Avatar({
  uri,
  name,
  size = 40,
  className = "",
  showRing = false,
}: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const ringSize = showRing ? size + 6 : size;

  const inner = uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`bg-surface ${className}`}
    />
  ) : (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`bg-primary/15 items-center justify-center ${className}`}
    >
      <Text
        className="text-primary-light font-bold"
        style={{ fontSize: size * 0.38 }}
      >
        {initials}
      </Text>
    </View>
  );

  if (showRing) {
    return (
      <View
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: 2,
          borderColor: "#f43f5e",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {inner}
      </View>
    );
  }

  return inner;
}
