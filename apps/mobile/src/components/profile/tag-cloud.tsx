/**
 * Tag cloud — Reusable pill-cloud for mood, style, interest tags
 */

import React from "react";
import { Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icon";

interface TagCloudProps {
  title: string;
  icon?: IconName;
  tags: string[];
  variant?: "default" | "primary" | "accent" | "love" | "success" | "warning";
  /** Max tags to show before "+N more" */
  limit?: number;
}

export function TagCloud({
  title,
  icon,
  tags,
  variant = "default",
  limit,
}: TagCloudProps) {
  if (!tags || tags.length === 0) return null;

  const visible = limit ? tags.slice(0, limit) : tags;
  const overflow = limit && tags.length > limit ? tags.length - limit : 0;

  return (
    <View className="mb-1">
      <View className="flex-row items-center gap-1.5 mb-2">
        {icon && <Icon name={icon} size={16} color="#f9a8d4" />}
        <Text className="text-foreground font-semibold text-sm">{title}</Text>
      </View>
      <View className="flex-row flex-wrap gap-1.5">
        {visible.map((tag) => (
          <Badge key={tag} variant={variant}>
            {tag}
          </Badge>
        ))}
        {overflow > 0 && <Badge variant="default">+{overflow} more</Badge>}
      </View>
    </View>
  );
}
