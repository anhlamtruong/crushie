/**
 * QuizCard — Full-screen multiple-choice question card
 *
 * Displays a question with emoji, subtitle, and pill-button options.
 * Selecting an option triggers `onAnswer` and auto-advances after a brief delay.
 */

import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import type { QuizQuestion } from "./questions";

interface QuizCardProps {
  question: QuizQuestion;
  selectedValue?: string;
  onAnswer: (key: string, value: string) => void;
}

export function QuizCard({ question, selectedValue, onAnswer }: QuizCardProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className="flex-1 justify-center px-6"
    >
      {/* Emoji + Question */}
      <View className="items-center mb-8">
        <Text className="text-6xl mb-4">{question.emoji}</Text>
        <Text className="text-foreground text-2xl font-bold text-center">
          {question.label}
        </Text>
        {question.subtitle && (
          <Text className="text-foreground-muted text-base text-center mt-2">
            {question.subtitle}
          </Text>
        )}
      </View>

      {/* Options */}
      <View className="gap-3">
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onAnswer(question.key, option.value)}
              className={`flex-row items-center px-5 py-4 rounded-2xl border ${
                isSelected
                  ? "bg-primary/15 border-primary"
                  : "bg-background-card border-border active:bg-surface"
              }`}
            >
              <Text className="text-2xl mr-3">{option.emoji}</Text>
              <Text
                className={`text-base font-medium flex-1 ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {option.label}
              </Text>
              {isSelected && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  className="w-6 h-6 rounded-full bg-primary items-center justify-center"
                >
                  <Text className="text-white text-xs font-bold">✓</Text>
                </Animated.View>
              )}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}
