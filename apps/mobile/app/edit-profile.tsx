/**
 * Edit Profile screen
 */

import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { FullScreenLoading } from "@/components/ui/loading";
import { TextInput } from "@/components/ui/text-input";
import { useMe, useUpdateProfile } from "@/hooks";

export default function EditProfileScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <FullScreenLoading message="Loading..." />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <EditProfileContent />;
}

function EditProfileContent() {
  const router = useRouter();
  const user = useMe();
  const update = useUpdateProfile();

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    gender: "",
    location: "",
  });

  useEffect(() => {
    if (user.data) {
      setForm({
        displayName: user.data.displayName ?? "",
        bio: user.data.bio ?? "",
        gender: user.data.gender ?? "",
        location: user.data.location ?? "",
      });
    }
  }, [user.data]);

  function handleSave() {
    update.mutate(form, {
      onSuccess: () => router.back(),
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-foreground text-2xl font-bold mb-6">
          Edit Profile
        </Text>

        <TextInput
          label="Display Name"
          placeholder="Your name"
          value={form.displayName}
          onChangeText={(v) => setForm((p) => ({ ...p, displayName: v }))}
        />

        <TextInput
          label="Bio"
          placeholder="Tell people about yourself..."
          multiline
          numberOfLines={3}
          value={form.bio}
          onChangeText={(v) => setForm((p) => ({ ...p, bio: v }))}
        />

        <TextInput
          label="Gender"
          placeholder="e.g. male, female, non-binary"
          value={form.gender}
          onChangeText={(v) => setForm((p) => ({ ...p, gender: v }))}
        />

        <TextInput
          label="Location"
          placeholder="City, Country"
          value={form.location}
          onChangeText={(v) => setForm((p) => ({ ...p, location: v }))}
        />

        {update.isError && (
          <View className="bg-red-900/30 border border-red-800 rounded-xl p-3 mb-4">
            <Text className="text-red-400 text-sm text-center">
              Failed to update profile. Please try again.
            </Text>
          </View>
        )}

        <Button onPress={handleSave} loading={update.isPending} size="lg">
          Save Changes
        </Button>

        <Button variant="ghost" onPress={() => router.back()} className="mt-3">
          Cancel
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
