/**
 * Text input with label
 */

import React from "react";
import {
  TextInput as RNTextInput,
  View,
  Text,
  type TextInputProps as RNTextInputProps,
} from "react-native";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export function TextInput({
  label,
  error,
  className = "",
  ...rest
}: TextInputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-foreground text-sm font-medium mb-1.5">
          {label}
        </Text>
      )}
      <RNTextInput
        className={`bg-surface border ${error ? "border-red-500" : "border-border"} rounded-2xl px-4 py-3 text-foreground text-base ${className}`}
        placeholderTextColor="#6b5f7d"
        {...rest}
      />
      {error && <Text className="text-red-400 text-xs mt-1">{error}</Text>}
    </View>
  );
}
