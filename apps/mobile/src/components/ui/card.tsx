/**
 * Card container component — Valentine glassmorphism
 */

import React from "react";
import { View, Text, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "glass" | "highlight";
}

const cardVariants = {
  default: "bg-background-card border-border",
  glass: "bg-background-card/80 border-border-light",
  highlight: "bg-primary/10 border-primary/30",
};

export function Card({
  children,
  className = "",
  variant = "default",
  ...rest
}: CardProps) {
  return (
    <View
      className={`rounded-3xl border p-4 ${cardVariants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={`mb-3 ${className}`}>{children}</View>;
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-lg font-bold text-foreground ${className}`}>
      {children}
    </Text>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-sm text-foreground-muted ${className}`}>
      {children}
    </Text>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={className}>{children}</View>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`mt-3 flex-row items-center ${className}`}>
      {children}
    </View>
  );
}
