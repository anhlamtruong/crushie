/**
 * ImagePickerCard — Onboarding photo upload card
 *
 * Shows a grid of image slots (1-5). Tap to pick from gallery.
 * Uploaded images show thumbnails with remove buttons.
 */

import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Icon } from "@/components/ui/icon";

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

export type OnboardImage = {
  /** Local asset URI (for display) */
  localUri: string;
  /** Remote URL after upload (null while uploading) */
  remoteUrl: string | null;
  /** Upload in progress */
  uploading: boolean;
};

interface ImagePickerCardProps {
  images: OnboardImage[];
  onPickImage: (asset: ImagePicker.ImagePickerAsset) => void;
  onRemoveImage: (index: number) => void;
}

export function ImagePickerCard({
  images,
  onPickImage,
  onRemoveImage,
}: ImagePickerCardProps) {
  const canAddMore = images.length < MAX_IMAGES;
  const hasMinimum = images.length >= MIN_IMAGES;

  const handlePick = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      onPickImage(result.assets[0]);
    }
  }, [onPickImage]);

  const emptySlots = Math.max(0, MAX_IMAGES - images.length);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className="flex-1 justify-center px-6"
    >
      {/* Header */}
      <View className="items-center mb-8">
        <View className="mb-4">
          <Icon name="camera" size={56} color="#f43f5e" />
        </View>
        <Text className="text-foreground text-2xl font-bold text-center">
          Add Your Photos
        </Text>
        <Text className="text-foreground-muted text-base text-center mt-2">
          Upload {MIN_IMAGES}-{MAX_IMAGES} photos to help AI build your vibe
        </Text>
      </View>

      {/* Image Grid */}
      <View className="flex-row flex-wrap justify-center gap-3">
        {/* Existing images */}
        {images.map((img, index) => (
          <View key={index} className="relative">
            <View className="w-[100px] h-[100px] rounded-2xl overflow-hidden border-2 border-primary/30">
              <Image
                source={{ uri: img.localUri }}
                style={{ width: 100, height: 100 }}
                contentFit="cover"
                transition={200}
              />
              {img.uploading && (
                <View className="absolute inset-0 bg-black/40 items-center justify-center">
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
            </View>
            {/* Remove button */}
            {!img.uploading && (
              <Pressable
                onPress={() => onRemoveImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">✕</Text>
              </Pressable>
            )}
          </View>
        ))}

        {/* Empty add-slot */}
        {canAddMore && (
          <Pressable
            onPress={handlePick}
            className="w-[100px] h-[100px] rounded-2xl border-2 border-dashed border-border items-center justify-center active:bg-surface"
          >
            <Text className="text-3xl text-foreground-muted">+</Text>
            <Text className="text-xs text-foreground-muted mt-1">Add</Text>
          </Pressable>
        )}
      </View>

      {/* Status text */}
      <View className="items-center mt-6">
        <Text
          className={`text-sm ${hasMinimum ? "text-green-500" : "text-foreground-muted"}`}
        >
          {images.length} / {MAX_IMAGES} photos
          {!hasMinimum && ` (at least ${MIN_IMAGES} required)`}
        </Text>
      </View>
    </Animated.View>
  );
}
