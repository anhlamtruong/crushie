/**
 * Energy level indicator — Visual bar + label for vibe energy
 */

import React from "react";
import { Text, View } from "react-native";

import { Icon, type IconName } from "@/components/ui/icon";

type Energy = "chill" | "moderate" | "high" | "chaotic";

const energyConfig: Record<
  Energy,
  {
    label: string;
    icon: IconName;
    iconColor: string;
    color: string;
    fill: string;
    width: string;
  }
> = {
  chill: {
    label: "Chill",
    icon: "water-outline",
    iconColor: "#60a5fa",
    color: "text-blue-400",
    fill: "bg-blue-500",
    width: "w-1/4",
  },
  moderate: {
    label: "Moderate",
    icon: "sunny-outline",
    iconColor: "#fbbf24",
    color: "text-amber-400",
    fill: "bg-amber-500",
    width: "w-2/4",
  },
  high: {
    label: "High Energy",
    icon: "flash-outline",
    iconColor: "#fb923c",
    color: "text-orange-400",
    fill: "bg-orange-500",
    width: "w-3/4",
  },
  chaotic: {
    label: "Chaotic",
    icon: "flame-outline",
    iconColor: "#f87171",
    color: "text-red-400",
    fill: "bg-red-500",
    width: "w-full",
  },
};

interface EnergyIndicatorProps {
  energy: Energy;
  size?: "sm" | "md";
}

export function EnergyIndicator({ energy, size = "md" }: EnergyIndicatorProps) {
  const cfg = energyConfig[energy];
  const barHeight = size === "sm" ? "h-1.5" : "h-2";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <View className="flex-row items-center gap-2">
      <Icon name={cfg.icon} size={iconSize} color={cfg.iconColor} />
      <View className="flex-1">
        <View
          className={`${barHeight} bg-surface rounded-full overflow-hidden`}
        >
          <View
            className={`${barHeight} ${cfg.fill} ${cfg.width} rounded-full`}
          />
        </View>
      </View>
      <Text
        className={`${cfg.color} font-semibold ${size === "sm" ? "text-xs" : "text-sm"}`}
      >
        {cfg.label}
      </Text>
    </View>
  );
}
