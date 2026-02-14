/**
 * On-board screen — Swipeable card flow
 *
 * Step 0:   Upload photos (1-5)
 * Steps 1-N: Multiple-choice quiz cards (swipeable)
 * Generate:  AI generates vibe profile
 * Result:    Show vibe card → navigate to dashboard
 */

import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  FadeIn,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { FullScreenLoading } from "@/components/ui/loading";
import {
  ProgressDots,
  QuizCard,
  ImagePickerCard,
  onboardQuestions,
  type OnboardImage,
} from "@/components/onboard";
import {
  useCreateVibeProfile,
  useGenerateVibe,
  useUpdateProfile,
  useUploadOnboardImage,
} from "@/hooks";

// ── Flow phases ───────────────────────────────────────────────────────────

type Phase = "flow" | "generating" | "result";

// Total steps = 1 (image) + N (quiz questions)
const TOTAL_STEPS = 1 + onboardQuestions.length;

export default function OnBoardScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // ── Image state ────────────────────────────────────────────────
  const [images, setImages] = useState<OnboardImage[]>([]);

  // ── Quiz state ─────────────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // ── Flow state ─────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("flow");
  const [slideDirection, setSlideDirection] = useState<"forward" | "back">(
    "forward",
  );

  // ── Mutations ──────────────────────────────────────────────────
  const generateVibe = useGenerateVibe();
  const createProfile = useCreateVibeProfile();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadOnboardImage();

  // ── Derived state ──────────────────────────────────────────────
  const isImageStep = currentStep === 0;
  const quizIndex = currentStep - 1;
  const currentQuestion = isImageStep ? null : onboardQuestions[quizIndex];
  const hasMinImages = images.length >= 1;
  const uploadedUrls = images
    .filter((img) => img.remoteUrl)
    .map((img) => img.remoteUrl!);
  const isUploading = images.some((img) => img.uploading);

  // ── Navigation ─────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setSlideDirection("forward");
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setSlideDirection("back");
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  // ── Image handlers ─────────────────────────────────────────────

  const handlePickImage = useCallback(
    (asset: ImagePicker.ImagePickerAsset) => {
      const newImage: OnboardImage = {
        localUri: asset.uri,
        remoteUrl: null,
        uploading: true,
      };

      const imageIndex = images.length;
      setImages((prev) => [...prev, newImage]);

      uploadImage.mutate(asset, {
        onSuccess: (res) => {
          setImages((prev) =>
            prev.map((img, i) =>
              i === imageIndex
                ? { ...img, remoteUrl: res.data.url, uploading: false }
                : img,
            ),
          );
        },
        onError: () => {
          setImages((prev) => prev.filter((_, i) => i !== imageIndex));
        },
      });
    },
    [images.length, uploadImage],
  );

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Quiz handler ───────────────────────────────────────────────

  const handleAnswer = useCallback(
    (key: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      setTimeout(() => {
        if (currentStep < TOTAL_STEPS - 1) {
          goNext();
        }
      }, 400);
    },
    [currentStep, goNext],
  );

  // ── Generate vibe ──────────────────────────────────────────────

  const handleGenerate = useCallback(() => {
    setPhase("generating");

    generateVibe.mutate(
      {
        imageUrls: uploadedUrls,
        quizAnswers: answers,
      },
      {
        onSuccess: async (res) => {
          const result = res.data;
          // generate-vibe already saves the profile in DB; we just need
          // to create/update the vibe-profiles collection & mark onboarded
          await createProfile.mutateAsync({
            vibeName: result.profile.vibeName ?? "My Vibe",
            vibeSummary: result.profile.vibeSummary ?? undefined,
            energy: result.profile.energy,
            moodTags: result.profile.moodTags ?? [],
            styleTags: result.profile.styleTags ?? [],
            interestTags: result.profile.interestTags ?? [],
            quizAnswers: answers,
            photoUrls: uploadedUrls,
          });
          await updateProfile.mutateAsync({ onboarded: true } as any);
          setPhase("result");
        },
        onError: () => setPhase("flow"),
      },
    );
  }, [uploadedUrls, answers, generateVibe, createProfile, updateProfile]);

  // ── Can proceed checks ─────────────────────────────────────────
  const canProceedFromImage = hasMinImages && !isUploading;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const allQuizAnswered = onboardQuestions.every((q) => answers[q.key]);
  // ── Auth guard (must be AFTER all hooks) ───────────────────
  if (!isLoaded) return <FullScreenLoading message="Loading..." />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  // ═══════════════════════════════════════════════════════════════
  // Render: Generating phase
  // ═══════════════════════════════════════════════════════════════

  if (phase === "generating") {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8">
        <Animated.View entering={FadeIn.duration(400)} className="items-center">
          <View className="mb-4">
            <Icon name="sparkles" size={56} color="#f43f5e" />
          </View>
          <Text className="text-foreground text-xl font-bold text-center">
            Crafting Your Vibe...
          </Text>
          <Text className="text-foreground-muted text-sm text-center mt-2">
            Our AI is analyzing your photos and answers to create your unique
            vibe profile
          </Text>
        </Animated.View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Render: Result phase
  // ═══════════════════════════════════════════════════════════════

  if (phase === "result") {
    const result = generateVibe.data?.data;
    const vibe = result?.profile;
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-6"
      >
        <Animated.View
          entering={FadeIn.duration(500)}
          className="items-center mb-6"
        >
          <View className="mb-3">
            <Icon name="checkmark-circle" size={56} color="#34d399" />
          </View>
          <Text className="text-foreground text-2xl font-bold text-center">
            Your Vibe is Ready!
          </Text>
        </Animated.View>

        {vibe && (
          <Card className="mb-6">
            <CardTitle>{vibe.vibeName}</CardTitle>
            <CardContent className="mt-2">
              {vibe.vibeSummary && (
                <Text className="text-foreground-muted leading-5">
                  {vibe.vibeSummary}
                </Text>
              )}
              {vibe.energy && (
                <View className="mt-3 flex-row items-center gap-2">
                  <Text className="text-primary font-bold text-lg capitalize">
                    {vibe.energy}
                  </Text>
                  <Text className="text-foreground-muted text-xs">energy</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        <Button onPress={() => router.replace("/(tabs)")} size="lg">
          Go to Dashboard
        </Button>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Render: Main card flow
  // ═══════════════════════════════════════════════════════════════

  const enteringAnim =
    slideDirection === "forward"
      ? SlideInRight.duration(300)
      : SlideInLeft.duration(300);
  const exitingAnim =
    slideDirection === "forward"
      ? SlideOutLeft.duration(300)
      : SlideOutRight.duration(300);

  return (
    <View className="flex-1 bg-background">
      {/* Progress dots */}
      <View className="pt-14 px-6">
        <ProgressDots total={TOTAL_STEPS} current={currentStep} />
      </View>

      {/* Card content */}
      <View className="flex-1">
        <Animated.View
          key={currentStep}
          entering={enteringAnim}
          exiting={exitingAnim}
          className="flex-1"
        >
          {isImageStep ? (
            <ImagePickerCard
              images={images}
              onPickImage={handlePickImage}
              onRemoveImage={handleRemoveImage}
            />
          ) : (
            currentQuestion && (
              <QuizCard
                question={currentQuestion}
                selectedValue={answers[currentQuestion.key]}
                onAnswer={handleAnswer}
              />
            )
          )}
        </Animated.View>
      </View>

      {/* Bottom navigation */}
      <View className="px-6 pb-10 pt-4 gap-3">
        {/* Error banner */}
        {generateVibe.isError && (
          <View className="bg-red-900/30 border border-red-800 rounded-xl p-3">
            <Text className="text-red-400 text-sm text-center">
              Failed to generate vibe. Please try again.
            </Text>
          </View>
        )}

        {/* Forward button */}
        {isImageStep ? (
          <Button onPress={goNext} disabled={!canProceedFromImage} size="lg">
            Continue
          </Button>
        ) : isLastStep ? (
          <Button
            onPress={handleGenerate}
            disabled={!allQuizAnswered}
            loading={generateVibe.isPending}
            size="lg"
          >
            <View className="flex-row items-center gap-1.5">
              <Icon name="sparkles" size={16} color="#fff" />
              <Text className="text-white font-semibold">Generate My Vibe</Text>
            </View>
          </Button>
        ) : null}

        {/* Back / Next nav */}
        <View className="flex-row justify-between">
          {currentStep > 0 ? (
            <Pressable onPress={goBack} className="py-2">
              <Text className="text-foreground-muted text-base">← Back</Text>
            </Pressable>
          ) : (
            <View />
          )}

          {!isImageStep && !isLastStep && answers[currentQuestion!.key] && (
            <Pressable onPress={goNext} className="py-2">
              <Text className="text-primary text-base font-medium">Next →</Text>
            </Pressable>
          )}
        </View>

        {/* Cancel on first step */}
        {currentStep === 0 && (
          <Button variant="ghost" onPress={() => router.back()}>
            Cancel
          </Button>
        )}
      </View>
    </View>
  );
}
