/**
 * Sign Up screen — follows Clerk Expo quickstart pattern
 * https://clerk.com/docs/expo/getting-started/quickstart
 */

import { useSignUp, isClerkAPIResponseError } from "@clerk/clerk-expo";
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

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUpPress = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    if (!emailAddress.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
      });

      // If sign-up is immediately complete (email verification disabled)
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        return;
      }

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Display second form to capture the code
      setPendingVerification(true);
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        const first = err.errors[0];
        setError(first?.longMessage ?? first?.message ?? "Sign up failed.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, emailAddress, password]);

  const onVerifyPress = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (signUpAttempt.status === "complete") {
        // AuthGate handles the redirect after session is set
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        console.error(
          "Verification incomplete:",
          JSON.stringify(signUpAttempt),
        );
        setError("Verification could not be completed. Please try again.");
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
  }, [isLoaded, signUp, setActive, code]);

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
            Create Account
          </Text>
          <Text className="text-foreground-muted mt-1">
            {pendingVerification
              ? "Check your email for a verification code"
              : "Join the vibe"}
          </Text>
        </View>

        {error ? (
          <View className="bg-red-900/20 border border-red-800/40 rounded-2xl p-3 mb-4">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        {pendingVerification ? (
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
              Verify Email
            </Button>

            <Button
              onPress={() => {
                setPendingVerification(false);
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

            <Button onPress={onSignUpPress} loading={loading} size="lg">
              Sign Up
            </Button>
          </>
        )}

        <View className="flex-row justify-center mt-6">
          <Text className="text-foreground-muted">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-primary font-semibold">Sign In</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
