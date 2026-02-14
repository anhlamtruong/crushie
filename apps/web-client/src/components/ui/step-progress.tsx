"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepTap?: (step: number) => void;
  labels?: string[];
  className?: string;
}

// ============================================================================
// StepProgress Component
// ============================================================================

export function StepProgress({
  currentStep,
  totalSteps,
  onStepTap,
  labels,
  className,
}: StepProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <>
      {/* Desktop: Horizontal stepper with labels */}
      <div className={cn("hidden md:flex items-center gap-2", className)}>
        {steps.map((step) => {
          const isActive = step === currentStep;
          const isComplete = step < currentStep;
          const label = labels?.[step];

          return (
            <div key={step} className="flex items-center gap-2">
              <button
                onClick={() => onStepTap?.(step)}
                disabled={step > currentStep}
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-300",
                  "w-10 h-10 text-sm font-semibold",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isComplete
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isActive
                      ? "bg-primary/20 text-primary border-2 border-primary shadow-lg"
                      : "bg-muted text-muted-foreground border border-border",
                  step <= currentStep ? "cursor-pointer" : "cursor-not-allowed",
                )}
                aria-label={label ?? `Step ${step + 1}`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{step + 1}</span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="step-ring"
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              {label && (
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive || isComplete
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              )}

              {step < totalSteps - 1 && (
                <div className="flex-1 min-w-10 h-0.5 mx-1">
                  <div className="h-full bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: isComplete ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Bottom-anchored thumb-friendly dots + progress bar */}
      <div
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-50",
          className,
        )}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-4 py-3 px-4 bg-card/90 backdrop-blur-lg border-t border-border safe-area-pb">
          {steps.map((step) => {
            const isActive = step === currentStep;
            const isComplete = step < currentStep;

            return (
              <button
                key={step}
                onClick={() => onStepTap?.(step)}
                disabled={step > currentStep}
                className={cn(
                  "relative flex items-center justify-center transition-all duration-300",
                  "min-w-11 min-h-11", // 44px min touch target
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full",
                )}
                aria-label={labels?.[step] ?? `Step ${step + 1}`}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-300",
                    isActive
                      ? "w-10 h-10 bg-primary text-primary-foreground font-bold text-sm shadow-lg"
                      : isComplete
                        ? "w-8 h-8 bg-primary/80 text-primary-foreground text-xs"
                        : "w-8 h-8 bg-muted text-muted-foreground text-xs border border-border",
                  )}
                >
                  {isComplete ? <Check className="w-3.5 h-3.5" /> : step + 1}
                </span>
              </button>
            );
          })}

          {/* Step label */}
          {labels?.[currentStep] && (
            <span className="text-xs font-medium text-muted-foreground ml-2">
              {labels[currentStep]}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

// Safe area bottom padding utility
// Applied via the `safe-area-pb` class using env(safe-area-inset-bottom)
