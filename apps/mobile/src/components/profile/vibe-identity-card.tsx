/**
 * Vibe Identity Card — Hero card showing vibe name, summary & energy
 */

import React from "react";
import { Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyIndicator } from "./energy-indicator";

interface VibeIdentityCardProps {
  vibeName: string;
  vibeSummary?: string | null;
  energy?: "chill" | "moderate" | "high" | "chaotic";
  /** Optional trailing badge or element */
  trailing?: React.ReactNode;
}

export function VibeIdentityCard({
  vibeName,
  vibeSummary,
  energy,
  trailing,
}: VibeIdentityCardProps) {
  return (
    <Card variant="highlight">
      <CardHeader className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-xs uppercase tracking-widest text-primary-light/70 mb-1">
            Your Vibe
          </Text>
          <CardTitle className="text-xl">{vibeName}</CardTitle>
        </View>
        {trailing}
      </CardHeader>

      <CardContent>
        {vibeSummary && (
          <Text className="text-foreground-muted text-sm leading-5 mb-3">
            {vibeSummary}
          </Text>
        )}
        {energy && <EnergyIndicator energy={energy} />}
      </CardContent>
    </Card>
  );
}
