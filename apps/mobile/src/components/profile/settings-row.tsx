/**
 * Settings row — Tappable row with icon, label, and chevron
 */

import React from "react";
import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/ui/icon";

interface SettingsRowProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** Optional trailing text or badge */
  trailing?: string;
}

export function SettingsRow({
  icon,
  label,
  onPress,
  trailing,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-surface border border-border rounded-2xl px-4 py-3.5 active:bg-background-card"
    >
      <View className="mr-3">
        <Icon name={icon} size={20} color="#f9a8d4" />
      </View>
      <Text className="text-foreground font-medium flex-1">{label}</Text>
      {trailing && (
        <Text className="text-foreground-muted text-sm mr-2">{trailing}</Text>
      )}
      <Icon name="chevron-forward" size={16} color="rgba(252,231,243,0.4)" />
    </Pressable>
  );
}
