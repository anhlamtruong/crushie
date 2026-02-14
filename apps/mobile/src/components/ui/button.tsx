/**
 * Reusable Button component with variants
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends PressableProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary active:bg-primary-dark",
  secondary: "bg-surface active:bg-border",
  outline: "border border-primary/40 active:bg-primary/10",
  ghost: "active:bg-surface",
  destructive: "bg-red-600 active:bg-red-700",
};

const variantTextClasses: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-foreground",
  outline: "text-primary",
  ghost: "text-foreground-muted",
  destructive: "text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 rounded-2xl",
  md: "px-5 py-2.5 rounded-3xl",
  lg: "px-6 py-3.5 rounded-3xl",
};

const sizeTextClasses: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`flex-row items-center justify-center ${sizeClasses[size]} ${variantClasses[variant]} ${isDisabled ? "opacity-50" : ""}`}
      disabled={isDisabled}
      {...rest}
    >
      {loading && (
        <ActivityIndicator size="small" color="white" className="mr-2" />
      )}
      <Text
        className={`font-semibold ${sizeTextClasses[size]} ${variantTextClasses[variant]}`}
      >
        {children}
      </Text>
    </Pressable>
  );
}
