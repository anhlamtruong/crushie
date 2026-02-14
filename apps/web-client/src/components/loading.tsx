"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HeartIcon } from "@/components/love-animations";

// ============================================================================
// Spinner — Animated ring with theme primary color
// ============================================================================

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-6 w-6 animate-spin text-primary", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ============================================================================
// HeartBeat — Pulsing heart loader
// ============================================================================

function HeartBeatLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("text-primary", className)}
      animate={{
        scale: [1, 1.25, 1, 1.2, 1],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <HeartIcon className="h-8 w-8" />
    </motion.div>
  );
}

// ============================================================================
// Dot Pulse — Three dots pulsing in sequence
// ============================================================================

function DotPulse({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-primary"
          style={{
            animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite both`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%,
          80%,
          100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Shimmer Bars — Skeleton-style loading bars
// ============================================================================

function ShimmerBars({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 w-full max-w-sm", className)}>
      <div className="h-3 w-3/4 rounded-full bg-muted animate-pulse" />
      <div className="h-3 w-full rounded-full bg-muted animate-pulse delay-75" />
      <div className="h-3 w-5/6 rounded-full bg-muted animate-pulse delay-150" />
      <div className="h-3 w-2/3 rounded-full bg-muted animate-pulse delay-200" />
    </div>
  );
}

// ============================================================================
// Full Page Loading — Centered loader with optional message
// ============================================================================

interface PageLoadingProps {
  message?: string;
  variant?: "spinner" | "dots" | "shimmer";
  className?: string;
}

export function PageLoading({
  message = "Sending love...",
  variant = "spinner",
  className,
}: PageLoadingProps) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-6",
        className,
      )}
    >
      {/* Floating mini hearts behind the loader */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-150 animate-pulse" />
        {/* Tiny floating hearts */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20"
            style={{
              left: `${20 + i * 20}%`,
              bottom: "50%",
            }}
            animate={{
              y: [0, -40, -80],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          >
            <HeartIcon className="h-3 w-3" />
          </motion.div>
        ))}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-border/50 bg-card shadow-lg">
          {variant === "spinner" && <HeartBeatLoader />}
          {variant === "dots" && <DotPulse />}
          {variant === "shimmer" && (
            <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground/80 animate-pulse">
          {message}
        </p>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              animation: "loadingBar 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 60%;
            margin-left: 20%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Card Loading — Loading state for card-sized content
// ============================================================================

interface CardLoadingProps {
  lines?: number;
  className?: string;
}

export function CardLoading({ lines = 3, className }: CardLoadingProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-muted animate-pulse"
            style={{
              width: `${85 - i * 12}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Inline Loading — Small inline loading indicator
// ============================================================================

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({
  text = "Loading",
  className,
}: InlineLoadingProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <Spinner className="h-4 w-4" />
      {text}
    </span>
  );
}

export { Spinner, DotPulse, ShimmerBars, HeartBeatLoader };
