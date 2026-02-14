"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// Floating Hearts — Animated hearts rising and fading
// ============================================================================

const heartVariants: Variants = {
  initial: (i: number) => ({
    opacity: 0,
    y: 0,
    x: 0,
    scale: 0.5,
    rotate: -15 + Math.random() * 30,
  }),
  animate: (i: number) => ({
    opacity: [0, 1, 1, 0],
    y: [0, -60, -120, -180],
    x: [0, (i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 20), 0],
    scale: [0.5, 1, 0.8, 0.3],
    rotate: [-15 + i * 10, 15 - i * 5, -10 + i * 3],
    transition: {
      duration: 3 + i * 0.5,
      repeat: Infinity,
      delay: i * 0.6,
      ease: "easeOut",
    },
  }),
};

// Heart SVG path for consistent use
function HeartIcon({
  className,
  fill = "currentColor",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// ============================================================================
// Floating Hearts Background
// ============================================================================

export function FloatingHearts({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={heartVariants}
          initial="initial"
          animate="animate"
          className="absolute text-primary/30"
          style={{
            left: `${15 + (i * 70) / count}%`,
            bottom: "10%",
          }}
        >
          <HeartIcon className="h-5 w-5" />
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// Heartbeat Pulse — A heart that beats
// ============================================================================

export function HeartbeatPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("text-primary", className)}
      animate={{
        scale: [1, 1.2, 1, 1.15, 1],
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
// Love Sparkle — Heart with sparkle particles around it
// ============================================================================

export function LoveSparkle({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const sparkles = Array.from({ length: 6 });
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      {sparkles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-primary/60"
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, Math.cos((i * Math.PI * 2) / 6) * 24],
            y: [0, Math.sin((i * Math.PI * 2) / 6) * 24],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
      {children ?? <HeartbeatPulse />}
    </div>
  );
}

// ============================================================================
// Heart Trail — Hearts following cursor or floating across screen
// ============================================================================

export function HeartTrail({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -window?.innerHeight || -800],
            opacity: [0, 0.3, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "linear",
          }}
        >
          <HeartIcon className={`h-${3 + (i % 4)} w-${3 + (i % 4)}`} />
        </motion.div>
      ))}
    </div>
  );
}

export { HeartIcon };
