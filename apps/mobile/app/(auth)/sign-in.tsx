/**
 * Sign In screen — follows Clerk Expo quickstart pattern
 * https://clerk.com/docs/expo/getting-started/quickstart
 *
 * After successful sign-in, the root layout's AuthGate detects the auth
 * state change and redirects to /(tabs) automatically.
 */

import { useSignIn, useAuth, isClerkAPIResponseError } from "@clerk/clerk-expo";
import type { EmailCodeFactor } from "@clerk/types";
import { Link } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TextInput } from "@/components/ui/text-input";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useAuth();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignInPress = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    if (!emailAddress.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (signInAttempt.status === "complete") {
        // Setting the active session triggers the AuthGate redirect
        await setActive({ session: signInAttempt.createdSessionId });
      } else if (signInAttempt.status === "needs_second_factor") {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor =>
            factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        } else {
          setError(
            "This account requires a second factor method not supported yet.",
          );
        }
      } else {
        console.error("Sign-in incomplete:", JSON.stringify(signInAttempt));
        setError("Sign in could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        const first = err.errors[0];
        const code = first?.code;

        // Handle "already signed in" — clear stale session and retry
        if (
          code === "session_exists" ||
          code === "identifier_already_signed_in"
        ) {
          try {
            await signOut();
            // Retry after clearing the stale session
            const retry = await signIn.create({
              identifier: emailAddress.trim(),
              password,
            });
            if (retry.status === "complete") {
              await setActive({ session: retry.createdSessionId });
              return;
            }
          } catch {
            // If retry also fails, show the original error
          }
        }

        setError(first?.longMessage ?? first?.message ?? "Sign in failed.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, signOut, setActive, emailAddress, password]);

  const onVerifyPress = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: code.trim(),
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
      } else {
        console.error(
          "Verification incomplete:",
          JSON.stringify(signInAttempt),
        );
        setError("Verification could not be completed.");
      }
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        const first = err.errors[0];
        setError(
          first?.longMessage ?? first?.message ?? "Verification failed.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, setActive, code]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <View className="mb-2">
            <Icon name="heart" size={40} color="#f43f5e" />
          </View>
          <Text className="text-3xl font-bold text-foreground">
            Tinh Yêu Chu Chube
          </Text>
          <Text className="text-foreground-muted mt-1">
            {showEmailCode
              ? "Check your email for a verification code"
              : "Sign in to continue"}
          </Text>
        </View>

        {error ? (
          <View className="bg-red-900/20 border border-red-800/40 rounded-2xl p-3 mb-4">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        {showEmailCode ? (
          <>
            <TextInput
              label="Verification Code"
              placeholder="123456"
              keyboardType="number-pad"
              autoCapitalize="none"
              value={code}
              onChangeText={setCode}
            />

            <Button onPress={onVerifyPress} loading={loading} size="lg">
              Verify
            </Button>

            <Button
              onPress={() => {
                setShowEmailCode(false);
                setCode("");
                setError("");
              }}
              variant="ghost"
              size="sm"
              className="mt-3"
            >
              Back
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />

            <TextInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Button onPress={onSignInPress} loading={loading} size="lg">
              Sign In
            </Button>
          </>
        )}

        <View className="flex-row justify-center mt-6">
          <Text className="text-foreground-muted">Don't have an account? </Text>
          <Link href="/(auth)/sign-up">
            <Text className="text-primary font-semibold">Sign Up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
