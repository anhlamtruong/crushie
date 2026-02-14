"use client";

import Link from "next/link";
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
} from "lucide-react";
import { motion } from "framer-motion";
import {
  FloatingHearts,
  HeartIcon,
  LoveSparkle,
} from "@/components/love-animations";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background overflow-hidden">
      {/* Background floating hearts */}
      <FloatingHearts count={12} />

      <Navbar />

      <main className="relative flex flex-1 flex-col items-center justify-center z-10">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {/* Hero */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="absolute -inset-6 rounded-full bg-primary/10 blur-3xl animate-pulse" />
            <LoveSparkle>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <HeartIcon className="h-10 w-10 text-primary-foreground" />
                </motion.div>
              </div>
            </LoveSparkle>
          </motion.div>

          <div className="flex flex-col items-center gap-4 text-center">
            <motion.h1
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Tinh Yeu{" "}
              <span className="bg-linear-to-r from-primary via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Chuchube
              </span>
            </motion.h1>
            <motion.p
              className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              Where love meets technology. Connect hearts, discover your vibe
              profile, and spread love through every pixel.{" "}
              <Heart className="inline h-4 w-4 text-primary fill-primary" />
            </motion.p>
          </div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  <Heart className="h-4 w-4" />
                  Fall in Love
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="gap-2 shadow-lg shadow-primary/20"
                  >
                    <Heart className="h-4 w-4" />
                    My Love Dashboard
                  </Button>
                </Link>
                <UserButton />
              </div>
            </SignedIn>
          </motion.div>

          {/* Feature cards */}
          <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
            {[
              {
                icon: HeartHandshake,
                title: "Love Connections",
                desc: "Discover your love language, compatibility vibes, and connect with kindred hearts.",
              },
              {
                icon: MessageCircleHeart,
                title: "Love Messages",
                desc: "AI-powered romantic suggestions and heartfelt messages for every occasion.",
              },
              {
                icon: Palette,
                title: "Love Themes",
                desc: "20+ beautiful theme presets to express your romantic aesthetic. Make it truly yours.",
              },
              {
                icon: Users,
                title: "Love Community",
                desc: "Join a community that vibes with love, kindness, and creativity together.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:bg-primary/2"
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                whileHover={{ y: -2 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Love quote footer */}
          <motion.p
            className="mt-4 text-sm italic text-muted-foreground/60 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            &ldquo;The best thing to hold onto in life is each other.&rdquo;
            &mdash; Audrey Hepburn{" "}
            <Heart className="inline h-3 w-3 text-primary/50 fill-primary/50" />
          </motion.p>
        </div>
      </main>
    </div>
  );
}
