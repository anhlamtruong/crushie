/**
 * Photo strip — Horizontal scrollable thumbnails of uploaded photos
 */

import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

import { Icon } from "@/components/ui/icon";

interface PhotoStripProps {
  urls: string[];
  /** Thumbnail size in px */
  size?: number;
}

export function PhotoStrip({ urls, size = 72 }: PhotoStripProps) {
  if (!urls || urls.length === 0) return null;

  return (
    <View className="mb-1">
      <View className="flex-row items-center gap-1.5 mb-2">
        <Icon name="images-outline" size={16} color="#f9a8d4" />
        <Text className="text-foreground font-semibold text-sm">Photos</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {urls.map((url, i) => (
          <Image
            key={url}
            source={{ uri: url }}
            style={{
              width: size,
              height: size,
              borderRadius: 16,
            }}
            className="bg-surface border border-border"
          />
        ))}
      </ScrollView>
    </View>
  );
}
