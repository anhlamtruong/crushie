/**
 * Empty state placeholder — Valentine themed
 */

import React from "react";
import { View, Text } from "react-native";

import { Icon, type IconName } from "@/components/ui/icon";

interface EmptyStateProps {
  emoji?: string;
  icon?: IconName;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  emoji,
  icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      {icon ? (
        <View className="mb-4">
          <Icon name={icon} size={48} color="#f9a8d4" />
        </View>
      ) : (
        <Text className="text-5xl mb-4">{emoji ?? "💫"}</Text>
      )}
      <Text className="text-foreground font-bold text-lg text-center mb-1">
        {title}
      </Text>
      {description && (
        <Text className="text-foreground-muted text-sm text-center mb-4 leading-5">
          {description}
        </Text>
      )}
      {children}
    </View>
  );
}
