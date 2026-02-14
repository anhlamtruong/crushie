/**
 * Auth group layout — simple stack for sign-in / sign-up screens.
 * Auth redirects are handled by the root layout's AuthGate.
 */

import { Stack } from "expo-router";
import React from "react";

export default function AuthRoutesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f0a1a" },
      }}
    />
  );
}
