/**
 * Badge / chip component — Valentine palette
 */

import React from "react";
import { View, Text } from "react-native";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "accent"
  | "love";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

const variants: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: "bg-surface", text: "text-foreground-muted" },
  primary: { bg: "bg-primary/20", text: "text-primary" },
  success: { bg: "bg-emerald-900/40", text: "text-emerald-400" },
  warning: { bg: "bg-amber-900/40", text: "text-amber-400" },
  destructive: { bg: "bg-red-900/40", text: "text-red-400" },
  accent: { bg: "bg-accent/20", text: "text-accent-light" },
  love: { bg: "bg-primary/30", text: "text-primary-light" },
};

export function Badge({
  children,
  variant = "default",
  className = "",
  size = "sm",
}: BadgeProps) {
  const v = variants[variant];
  const sizeClass = size === "md" ? "px-3 py-1.5" : "px-2.5 py-1";
  const textSize = size === "md" ? "text-sm" : "text-xs";
  return (
    <View
      className={`${sizeClass} rounded-full self-start ${v.bg} ${className}`}
    >
      <Text className={`${textSize} font-semibold ${v.text}`}>{children}</Text>
    </View>
  );
}
