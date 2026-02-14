/**
 * Centralized Icon component — wraps Ionicons from @expo/vector-icons.
 *
 * Usage:
 *   <Icon name="heart" size={20} color="#f43f5e" />
 *   <Icon name="home" size={22} />                    // inherits foreground color
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  style?: React.ComponentProps<typeof Ionicons>["style"];
}

export function Icon({
  name,
  size = 20,
  color = "#fce7f3",
  className,
  style,
}: IconProps) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      className={className}
      style={style}
    />
  );
}
