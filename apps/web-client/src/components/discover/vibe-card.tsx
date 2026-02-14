"use client";

import { motion } from "framer-motion";
import { Heart, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerificationBadge } from "@/components/verification-badge";
import type { MockMatchProfile } from "@/lib/mock-matches";

type VibeCardProps = {
  profile: MockMatchProfile;
  onLike: (profile: MockMatchProfile) => void;
  onPass: (profile: MockMatchProfile) => void;
  onOpenCompatibility: (profile: MockMatchProfile) => void;
};

export function VibeCard({
  profile,
  onLike,
  onPass,
  onOpenCompatibility,
}: VibeCardProps) {
  return (
    <motion.div layout whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <Card
        onClick={() => onOpenCompatibility(profile)}
        className="group cursor-pointer border-rose-200 bg-linear-to-b from-pink-50 to-card shadow-md transition-shadow hover:shadow-lg"
      >
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl leading-tight text-rose-600 md:text-3xl">
                {profile.vibeLabel}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {profile.displayName}, {profile.age} • {profile.city} •{" "}
                {profile.pronouns}
              </CardDescription>
            </div>
            <VerificationBadge isVerified={profile.isVerified} size="sm" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="border border-rose-100 bg-pink-50 text-rose-600"
              >
                {interest}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-rose-100 bg-pink-50 px-3 py-2 text-sm text-rose-600">
            <Users className="h-4 w-4" />
            <span>
              Matched with {profile.mutualConnectionsCount} of your friends
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            Looking for:{" "}
            <span className="font-medium text-foreground">
              {profile.lookingFor}
            </span>
          </div>
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
            <Button
              variant="outline"
              className="w-full gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={(event) => {
                event.stopPropagation();
                onPass(profile);
              }}
            >
              <X className="h-4 w-4" />
              Pass
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
            <Button
              className="w-full gap-2 bg-rose-500 text-white hover:bg-rose-600"
              onClick={(event) => {
                event.stopPropagation();
                onLike(profile);
              }}
            >
              <Heart className="h-4 w-4" />
              Like
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
