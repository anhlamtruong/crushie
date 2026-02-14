/**
 * Root layout — wraps entire app with providers and handles auth routing
 */

import "../global.css";

import { useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { View } from "react-native";

import { FullScreenLoading } from "@/components/ui/loading";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

/**
 * Single auth gate — redirects based on sign-in state.
 * This is the ONLY place auth redirects happen.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      // Signed in but on auth screen → go to tabs
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthGroup) {
      // Not signed in and not on auth screen → go to landing
      router.replace("/");
    }
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded) {
    return <FullScreenLoading message="Loading..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryProvider>
        <View className="flex-1 bg-background">
          <StatusBar style="light" />
          <AuthGate>
            <Slot />
          </AuthGate>
        </View>
      </QueryProvider>
    </AuthProvider>
  );
}
