/**
 * Error display component with retry support
 */

import React from "react";
import { View, Text } from "react-native";

import { Button } from "./button";
import { Icon } from "./icon";

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorViewProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="mb-4">
        <Icon name="alert-circle" size={48} color="#f87171" />
      </View>
      <Text className="text-xl font-bold text-foreground text-center mb-2">
        {title}
      </Text>
      <Text className="text-foreground-muted text-center mb-6">{message}</Text>
      {onRetry && (
        <Button variant="secondary" onPress={onRetry}>
          Try Again
        </Button>
      )}
    </View>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorView
      title="No Connection"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

export function NotFoundError() {
  return (
    <ErrorView
      title="Not Found"
      message="The resource you're looking for doesn't exist."
    />
  );
}

export function AuthError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorView
      title="Session Expired"
      message="Please sign in again to continue."
      onRetry={onRetry}
    />
  );
}
