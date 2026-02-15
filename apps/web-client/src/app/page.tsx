"use client";

import Link from "next/link";
import { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import {
  Heart,
  HeartHandshake,
  Sparkles,
  MessageCircleHeart,
  Palette,
  Users,
  Camera,
  Brain,
  Mic,
  Trophy,
  ArrowRight,
  ChevronDown,
  Zap,
  Shield,
  Star,
  Eye,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  type Variants,
} from "framer-motion";
import {
  FloatingHearts,
  HeartIcon,
  LoveSparkle,
} from "@/components/love-animations";

/* ============================================================================
   Animation Variants
   ============================================================================ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ============================================================================
   Typewriter Hook
   ============================================================================ */

function useTypewriter(words: string[], speed = 100, pause = 2000) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(current.slice(0, text.length + 1));
          if (text.length + 1 === current.length) {
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          setText(current.slice(0, text.length - 1));
          if (text.length === 0) {
            setIsDeleting(false);
            setWordIdx((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed,
    );
    return () => clearTimeout(timeout);
  }, [text, wordIdx, isDeleting, words, speed, pause]);

  return text;
}

/* ============================================================================
   Animated Counter
   ============================================================================ */

function AnimatedCounter({
  target,
  suffix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = target;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ============================================================================
   Magnetic Button Wrapper
   ============================================================================ */

function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * 0.15);
        y.set((e.clientY - cy) * 0.15);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================================
   Scroll‑triggered Section
   ============================================================================ */

function ScrollSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {children}
    </motion.section>
  );
}

/* ============================================================================
   Floating Orbs Background
   ============================================================================ */

function FloatingOrbs() {
  const orbs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        size: 200 + Math.random() * 400,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 15 + Math.random() * 20,
        delay: i * 2,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background:
              orb.id % 3 === 0
                ? "radial-gradient(circle, rgba(230,57,114,0.12) 0%, transparent 70%)"
                : orb.id % 3 === 1
                  ? "radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(251,113,133,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 80, -40, 60, 0],
            y: [0, -60, 40, -30, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================================
   Particle Field
   ============================================================================ */

function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 5,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================================
   Gradient Mesh BG (hero parallax)
   ============================================================================ */

function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Mesh blob 1 */}
      <div className="absolute -top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-primary/[0.07] blur-[120px] animate-float" />
      {/* Mesh blob 2 */}
      <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-pink-400/[0.06] blur-[100px] animate-float [animation-delay:2s]" />
      {/* Mesh blob 3 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-rose-400/[0.05] blur-[80px] animate-float [animation-delay:4s]" />
    </div>
  );
}

/* ============================================================================
   HOME PAGE
   ============================================================================ */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });
  const scaleX = useTransform(smoothProgress, [0, 1], [0, 1]);

  const typewriterText = useTypewriter(
    [
      "your dating coach",
      "your wingman AI",
      "your vibe curator",
      "your confidence builder",
    ],
    80,
    1800,
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-background overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-pink-400 to-rose-400 z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Background layers */}
      <FloatingOrbs />
      <ParticleField />
      <FloatingHearts count={18} />

      <Navbar />

      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <motion.section
        ref={heroRef}
        className="relative flex min-h-[100dvh] flex-col items-center justify-center z-10 overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
      >
        <GradientMesh />

        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 relative z-10">
          {/* Animated logo */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 12,
              duration: 1.2,
            }}
          >
            <div className="absolute -inset-8 rounded-full bg-primary/15 blur-3xl animate-glow-pulse" />
            <div className="absolute -inset-16 rounded-full bg-pink-400/10 blur-[80px] animate-pulse" />
            <LoveSparkle>
              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-pink-500 to-rose-500 shadow-2xl shadow-primary/40"
                whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <HeartIcon className="h-12 w-12 text-white" />
                </motion.div>
              </motion.div>
            </LoveSparkle>
          </motion.div>

          {/* Title */}
          <motion.div
            className="flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Dating Academy
              <Sparkles className="h-3.5 w-3.5" />
            </motion.div>

            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
              <motion.span
                className="bg-gradient-to-r from-primary via-pink-400 to-rose-400 bg-clip-text text-transparent inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Crushie
              </motion.span>
            </h1>

            <motion.p
              className="max-w-3xl text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
            >
              Not just another dating app &mdash; we&apos;re{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent font-semibold">
                  {typewriterText}
                </span>
                <motion.span
                  className="inline-block w-[3px] h-6 bg-primary ml-0.5 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              </span>
            </motion.p>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <SignedOut>
              <MagneticButton>
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="gap-2 px-8 py-6 text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 rounded-full"
                  >
                    <Heart className="h-5 w-5" />
                    Start Your Journey
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignInButton>
              </MagneticButton>
              <MagneticButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 py-6 text-base rounded-full border-primary/30 hover:bg-primary/5"
                  asChild
                >
                  <a href="#features">
                    <Eye className="h-5 w-5" />
                    See How It Works
                  </a>
                </Button>
              </MagneticButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-4">
                <MagneticButton>
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="gap-2 px-8 py-6 text-base shadow-xl shadow-primary/25 rounded-full bg-gradient-to-r from-primary to-pink-500"
                    >
                      <Heart className="h-5 w-5" />
                      My Love Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </MagneticButton>
                <UserButton />
              </div>
            </SignedIn>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex -space-x-3">
              {[
                "from-pink-400 to-rose-500",
                "from-purple-400 to-fuchsia-500",
                "from-orange-400 to-red-500",
                "from-blue-400 to-indigo-500",
                "from-emerald-400 to-teal-500",
              ].map((gradient, i) => (
                <motion.div
                  key={i}
                  className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} border-2 border-background flex items-center justify-center text-white text-xs font-bold`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                >
                  {String.fromCharCode(65 + i)}
                </motion.div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2,000+</span>{" "}
              hearts already connected
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 text-yellow-400 fill-yellow-400"
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">4.9</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-xs text-muted-foreground/60 tracking-widest uppercase">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ================================================================
          STATS SECTION
          ================================================================ */}
      <ScrollSection className="relative z-10 py-20 border-y border-border/50 bg-gradient-to-b from-background via-primary/[0.02] to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              {
                value: 50000,
                suffix: "+",
                label: "Vibes Analyzed",
                icon: Brain,
              },
              {
                value: 12000,
                suffix: "+",
                label: "Matches Made",
                icon: HeartHandshake,
              },
              { value: 98, suffix: "%", label: "Success Rate", icon: Trophy },
              {
                value: 1536,
                suffix: "D",
                label: "Vibe Dimensions",
                icon: Sparkles,
              },
            ].map(({ value, suffix, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                className="flex flex-col items-center gap-2 text-center"
                variants={scaleIn}
                custom={i}
              >
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-2"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Icon className="h-7 w-7 text-primary" />
                </motion.div>
                <span className="text-3xl md:text-4xl font-black text-foreground tabular-nums">
                  <AnimatedCounter target={value} suffix={suffix} />
                </span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* ================================================================
          FEATURES – "How It Works" Section
          ================================================================ */}
      <ScrollSection
        className="relative z-10 py-24 md:py-32"
      >
        <div className="container mx-auto px-4" id="features">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            custom={0}
          >
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4"
              variants={scaleIn}
            >
              <Zap className="h-3.5 w-3.5" />
              Three Revolutionary Flows
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mt-4">
              More Than Matching &mdash;{" "}
              <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
                Real Growth
              </span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
              Crushie doesn&apos;t just find you a match. It teaches you how to
              date with AI-powered coaching, real-time social cues, and
              gamified missions.
            </p>
          </motion.div>

          <div className="grid gap-8 md:gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
            {[
              {
                icon: Camera,
                title: "The Analyzer",
                desc: "Upload a screenshot of a crush from any platform. Our AI predicts their communication style and suggests context-aware icebreakers using Gemini Vision.",
                gradient: "from-pink-500 to-rose-600",
                tag: "Vision AI",
                tagIcon: Eye,
              },
              {
                icon: Mic,
                title: "Real-time Coach",
                desc: 'A "Meta Glasses" simulator using your webcam and Gemini Vision to detect social cues, with ElevenLabs TTS whispering suggestions in your ear.',
                gradient: "from-purple-500 to-fuchsia-600",
                tag: "Live Coaching",
                tagIcon: Zap,
              },
              {
                icon: Trophy,
                title: "Dating Academy",
                desc: "Earn a Social Intelligence Quotient (SIQ) by completing AI-graded missions — from practice drills to real-world dates at local aesthetic spots.",
                gradient: "from-orange-500 to-amber-600",
                tag: "Gamified",
                tagIcon: Star,
              },
            ].map(
              ({ icon: Icon, title, desc, gradient, tag, tagIcon: TagIcon }, i) => (
                <motion.div
                  key={title}
                  className="group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden"
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  {/* Top gradient strip */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${gradient}`}
                  />

                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <motion.div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: -5 }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <TagIcon className="h-3 w-3" />
                        {tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-card-foreground mb-3">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      {desc}
                    </p>

                    <motion.div
                      className="flex items-center gap-2 text-sm font-medium text-primary cursor-pointer"
                      whileHover={{ x: 4 }}
                    >
                      Learn more <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-primary/[0.03] to-transparent" />
                </motion.div>
              ),
            )}
          </div>
        </div>
      </ScrollSection>

      {/* ================================================================
          VIBE PROFILE – Visual Showcase
          ================================================================ */}
      <ScrollSection className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            {/* Left: Visual */}
            <motion.div className="relative" variants={slideInLeft}>
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Animated rings */}
                {[0, 1, 2].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute inset-0 rounded-full border border-primary/10"
                    style={{
                      inset: `${ring * 12}%`,
                    }}
                    animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
                    transition={{
                      duration: 20 + ring * 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary/40" />
                  </motion.div>
                ))}

                {/* Center card */}
                <motion.div
                  className="absolute inset-[20%] rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/50 shadow-2xl flex flex-col items-center justify-center gap-3 p-6 backdrop-blur-sm"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                    <HeartIcon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-lg font-bold text-card-foreground">
                    Vibe Profile
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    1536-dimensional personality
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    {["Romantic", "Creative", "Adventurous"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Floating trait badges */}
                {[
                  { label: "Empathy", angle: 30, dist: 42 },
                  { label: "Humor", angle: 150, dist: 45 },
                  { label: "Passion", angle: 270, dist: 43 },
                ].map((trait, i) => (
                  <motion.div
                    key={trait.label}
                    className="absolute rounded-full bg-card border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg"
                    style={{
                      left: `${50 + trait.dist * Math.cos((trait.angle * Math.PI) / 180)}%`,
                      top: `${50 + trait.dist * Math.sin((trait.angle * Math.PI) / 180)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeInOut",
                    }}
                  >
                    {trait.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div className="flex flex-col gap-6" variants={slideInRight}>
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary w-fit"
                variants={scaleIn}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Personality DNA
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                Your Love Language,{" "}
                <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
                  Decoded by AI
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We analyze your photos and situational quizzes to generate a
                1536-dimensional Vibe Profile using pgvector embeddings — the
                most nuanced personality card ever built for dating.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-2">
                {[
                  {
                    icon: Brain,
                    label: "Gemini Vision",
                    desc: "Multimodal analysis",
                  },
                  {
                    icon: Zap,
                    label: "Vector Match",
                    desc: "HNSW similarity",
                  },
                  {
                    icon: Shield,
                    label: "Privacy First",
                    desc: "Your data, your rules",
                  },
                  {
                    icon: Sparkles,
                    label: "Always Learning",
                    desc: "Evolves with you",
                  },
                ].map(({ icon: Icon, label, desc }, i) => (
                  <motion.div
                    key={label}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/30"
                    variants={fadeUp}
                    custom={i}
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollSection>

      {/* ================================================================
          TECH STACK – "Architecture" Bento
          ================================================================ */}
      <ScrollSection className="relative z-10 py-24 md:py-32 border-y border-border/50 bg-gradient-to-b from-background via-primary/[0.015] to-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
              <Zap className="h-3.5 w-3.5" />
              Built for Scale
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mt-4">
              Powered by{" "}
              <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
                Modern Tech
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              {
                emoji: "🧠",
                title: "The Brain",
                desc: "Express + Gemini 2.5 Flash for multimodal vision analysis, with Redis response caching.",
                color: "from-violet-500/10 to-purple-500/10",
                border: "border-violet-500/20",
              },
              {
                emoji: "💖",
                title: "The Heart",
                desc: "Supabase (PostgreSQL) with pgvector & HNSW indexing for high-speed similarity matching.",
                color: "from-pink-500/10 to-rose-500/10",
                border: "border-pink-500/20",
              },
              {
                emoji: "🎙️",
                title: "The Voice",
                desc: "ElevenLabs TTS provides a supportive Wingman voice during real-time coaching.",
                color: "from-amber-500/10 to-orange-500/10",
                border: "border-amber-500/20",
              },
              {
                emoji: "✨",
                title: "The Interface",
                desc: "Next.js 16 + Expo/React Native sharing a unified tRPC and Hono REST layer.",
                color: "from-emerald-500/10 to-teal-500/10",
                border: "border-emerald-500/20",
              },
            ].map(({ emoji, title, desc, color, border }, i) => (
              <motion.div
                key={title}
                className={`group relative rounded-2xl border ${border} bg-gradient-to-br ${color} backdrop-blur-sm p-6 flex flex-col gap-4 overflow-hidden`}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <motion.span
                  className="text-4xl"
                  whileHover={{ scale: 1.3, rotate: 10 }}
                >
                  {emoji}
                </motion.span>
                <h3 className="text-lg font-bold text-card-foreground">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
                <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* ================================================================
          FEATURE GRID  
          ================================================================ */}
      <ScrollSection className="relative z-10 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-5xl font-black text-foreground">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
                Level Up
              </span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
              From first impression to first date — Crushie has your back.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: HeartHandshake,
                title: "Vibe Matching",
                desc: "Connect with kindred hearts through vector similarity.",
              },
              {
                icon: MessageCircleHeart,
                title: "Smart Icebreakers",
                desc: "AI-generated conversation starters tailored to each person.",
              },
              {
                icon: Palette,
                title: "Theme Studio",
                desc: "20+ gorgeous presets to express your romantic aesthetic.",
              },
              {
                icon: Users,
                title: "Community",
                desc: "Join a vibe-first community built on kindness and creativity.",
              },
              {
                icon: Shield,
                title: "Verified Profiles",
                desc: "AI-powered identity verification for trust and safety.",
              },
              {
                icon: Star,
                title: "SIQ Score",
                desc: "Track your Social Intelligence Quotient as you grow.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300"
                variants={fadeUp}
                custom={i}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ rotate: -10 }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* ================================================================
          TESTIMONIALS
          ================================================================ */}
      <ScrollSection className="relative z-10 py-24 md:py-32 border-y border-border/50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-5xl font-black text-foreground">
              Real Stories,{" "}
              <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
                Real Connections
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Alex & Jordan",
                quote:
                  "Crushie's Vibe Profile matched us on a level no other app could. We've been inseparable since our first AI-suggested date spot!",
                role: "Matched 3 months ago",
                gradient: "from-pink-500 to-rose-600",
              },
              {
                name: "Sam",
                quote:
                  "The Real-time Coach is a game-changer. Having an AI wingman in my ear during dates gave me the confidence I never knew I had.",
                role: "SIQ Score: 92",
                gradient: "from-purple-500 to-fuchsia-600",
              },
              {
                name: "Maya",
                quote:
                  "The Analyzer helped me understand my crush's communication style before I even said hi. Best icebreakers I've ever used!",
                role: "Dating Academy Graduate",
                gradient: "from-orange-500 to-amber-600",
              },
            ].map(({ name, quote, role, gradient }, i) => (
              <motion.div
                key={name}
                className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 flex flex-col gap-4"
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border/30">
                  <div
                    className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* ================================================================
          FINAL CTA
          ================================================================ */}
      <ScrollSection className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-primary/10 via-pink-500/5 to-rose-400/10 border border-primary/20 p-12 md:p-16 overflow-hidden"
            variants={scaleIn}
          >
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-pink-400/10 blur-3xl" />

            <motion.div
              className="relative z-10 flex flex-col items-center gap-6"
              variants={staggerContainer}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Heart className="h-12 w-12 text-primary fill-primary/20" />
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl font-black text-foreground"
                variants={fadeUp}
                custom={0}
              >
                Ready to Find{" "}
                <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
                  Your Person
                </span>
                ?
              </motion.h2>

              <motion.p
                className="text-muted-foreground text-lg max-w-lg"
                variants={fadeUp}
                custom={1}
              >
                Stop swiping. Start growing. Join the dating revolution that
                actually teaches you how to connect.
              </motion.p>

              <motion.div variants={fadeUp} custom={2}>
                <SignedOut>
                  <MagneticButton>
                    <SignInButton mode="modal">
                      <Button
                        size="lg"
                        className="gap-2 px-10 py-6 text-base shadow-xl shadow-primary/25 rounded-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                      >
                        <Heart className="h-5 w-5" />
                        Start Free — Fall in Love
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </SignInButton>
                  </MagneticButton>
                </SignedOut>
                <SignedIn>
                  <MagneticButton>
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        className="gap-2 px-10 py-6 text-base shadow-xl shadow-primary/25 rounded-full bg-gradient-to-r from-primary to-pink-500"
                      >
                        <Heart className="h-5 w-5" />
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </MagneticButton>
                </SignedIn>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </ScrollSection>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="relative z-10 border-t border-border/50 py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-pink-500">
                <HeartIcon className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-foreground">Crushie</span>
            </div>

            <motion.p
              className="text-sm italic text-muted-foreground/60 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              &ldquo;The best thing to hold onto in life is each
              other.&rdquo; &mdash; Audrey Hepburn{" "}
              <Heart className="inline h-3 w-3 text-primary/50 fill-primary/50" />
            </motion.p>

            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Crushie. Made with{" "}
              <Heart className="inline h-3 w-3 text-primary fill-primary" />.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
