/**
 * Profile header — Avatar, name, bio, gender/location badges
 */

import React from "react";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

interface ProfileHeaderProps {
  imageUrl?: string | null;
  displayName?: string | null;
  bio?: string | null;
  gender?: string | null;
  location?: string | null;
  /** Extra badges shown beside gender/location */
  badges?: Array<{ label: string; variant?: "primary" | "accent" | "love" }>;
}

export function ProfileHeader({
  imageUrl,
  displayName,
  bio,
  gender,
  location,
  badges: extraBadges,
}: ProfileHeaderProps) {
  return (
    <View className="items-center mt-4 mb-6">
      <Avatar uri={imageUrl} name={displayName} size={96} showRing />

      <Text className="text-foreground text-xl font-bold mt-4">
        {displayName ?? "Anonymous"}
      </Text>

      {bio && (
        <Text className="text-foreground-muted text-sm text-center mt-1.5 px-8 leading-5">
          {bio}
        </Text>
      )}

      <View className="flex-row flex-wrap justify-center gap-2 mt-3">
        {gender && <Badge variant="accent">{gender}</Badge>}
        {location && (
          <Badge variant="primary">
            <View className="flex-row items-center gap-1">
              <Icon name="location-outline" size={12} color="#f9a8d4" />
              <Text className="text-primary-light text-xs font-medium">
                {location}
              </Text>
            </View>
          </Badge>
        )}
        {extraBadges?.map((b) => (
          <Badge key={b.label} variant={b.variant ?? "primary"}>
            {b.label}
          </Badge>
        ))}
      </View>
    </View>
  );
}
