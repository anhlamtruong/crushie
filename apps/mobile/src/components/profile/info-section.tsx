/**
 * Info section — Labeled key-value display section with icon
 */

import React from "react";
import { Text, View } from "react-native";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";

interface InfoSectionProps {
  title: string;
  icon?: IconName;
  children: React.ReactNode;
  variant?: "default" | "glass" | "highlight";
}

export function InfoSection({
  title,
  icon,
  children,
  variant = "glass",
}: InfoSectionProps) {
  return (
    <Card variant={variant} className="mb-3">
      <CardTitle>
        <View className="flex-row items-center gap-2">
          {icon && <Icon name={icon} size={18} color="#f9a8d4" />}
          <Text className="text-foreground font-bold text-base">{title}</Text>
        </View>
      </CardTitle>
      <CardContent className="mt-2">{children}</CardContent>
    </Card>
  );
}

/**
 * Single key-value row inside an InfoSection
 */
interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  icon?: IconName;
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  if (value === null || value === undefined) return null;
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <View className="flex-row items-center gap-1.5">
        {icon && <Icon name={icon} size={14} color="rgba(252,231,243,0.5)" />}
        <Text className="text-foreground-muted text-sm">{label}</Text>
      </View>
      <Text className="text-foreground text-sm font-medium">{value}</Text>
    </View>
  );
}
