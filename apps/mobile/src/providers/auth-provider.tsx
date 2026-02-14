/**
 * Clerk auth provider for Expo
 */

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import type { ComponentProps } from "react";
import React, { useLayoutEffect } from "react";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { setTokenGetter } from "@/lib/api";
// import { tokenCache } from "@/lib/token-cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

/**
 * ClerkProvider from @clerk/clerk-expo targets React 19 types while
 * Expo SDK 52 pins React 18.  Cast to a compatible component type.
 */
const Provider = ClerkProvider as React.ComponentType<
  ComponentProps<typeof ClerkProvider> & { children: React.ReactNode }
>;

/** Wire Clerk token into the API client */
function TokenSync({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // useLayoutEffect runs BEFORE children's useEffect — this ensures
  // _getToken is set before React Query hooks fire their first fetch.
  useLayoutEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  // Also set synchronously so it's available even before effects run
  setTokenGetter(getToken);

  // Debug: log token availability (remove after fixing 401s)
  useLayoutEffect(() => {
    if (isLoaded && isSignedIn) {
      getToken().then((t) => {
        console.log(
          "[TokenSync]",
          "isLoaded:",
          isLoaded,
          "isSignedIn:",
          isSignedIn,
          "token:",
          t ? `${t.slice(0, 30)}...` : "NULL",
        );
      });
    }
  }, [isLoaded, isSignedIn, getToken]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider publishableKey={publishableKey} tokenCache={tokenCache}>
      <TokenSync>{children}</TokenSync>
    </Provider>
  );
}
