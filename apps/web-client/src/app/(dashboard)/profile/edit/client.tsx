"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

type ProfileFormState = {
  vibeName: string;
  vibeSummary: string;
  bio: string;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say" | "";
  interestedIn: "male" | "female" | "non-binary" | "everyone" | "";
  interestTags: string;
};

const INITIAL_FORM: ProfileFormState = {
  vibeName: "",
  vibeSummary: "",
  bio: "",
  gender: "",
  interestedIn: "",
  interestTags: "",
};

export default function EditProfileClient() {
  const trpc = useTRPC();
  const profileQuery = useQuery(trpc.vibeProfiles.getMe.queryOptions());
  const updateMutation = useMutation(
    trpc.vibeProfiles.updateMyProfile.mutationOptions(),
  );

  const [form, setForm] = useState<ProfileFormState>(INITIAL_FORM);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;

    setForm({
      vibeName: profile.vibeName ?? "",
      vibeSummary: profile.vibeSummary ?? "",
      bio: profile.bio ?? "",
      gender: (profile.gender as ProfileFormState["gender"]) ?? "",
      interestedIn:
        (profile.interestedIn as ProfileFormState["interestedIn"]) ?? "",
      interestTags: (profile.interestTags ?? []).join(", "),
    });
  }, [profileQuery.data]);

  const setField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedMessage(null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedTags = form.interestTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 20);

    await updateMutation.mutateAsync({
      vibeName: form.vibeName || undefined,
      vibeSummary: form.vibeSummary || undefined,
      bio: form.bio || undefined,
      gender: form.gender || undefined,
      interestedIn: form.interestedIn || undefined,
      interestTags: parsedTags,
    });

    setSavedMessage("Your vibe profile is updated ✨");
    await profileQuery.refetch();
  };

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!profileQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vibe profile not found</CardTitle>
        </CardHeader>
        <CardContent>
          Please complete onboarding first, then come back to edit your vibe.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Your Vibe</h1>
        <p className="text-muted-foreground">
          Refine your identity and preferences with inclusive profile fields.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-rose-500" />
            Profile Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vibe Label</label>
              <Input
                value={form.vibeName}
                onChange={(event) => setField("vibeName", event.target.value)}
                maxLength={100}
                placeholder="Your vibe label"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vibe Summary</label>
              <textarea
                value={form.vibeSummary}
                onChange={(event) => setField("vibeSummary", event.target.value)}
                maxLength={500}
                rows={3}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                placeholder="A short summary of your vibe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={form.bio}
                onChange={(event) => setField("bio", event.target.value)}
                maxLength={500}
                rows={4}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                placeholder="Tell people who you are"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select
                  value={form.gender}
                  onChange={(event) =>
                    setField(
                      "gender",
                      event.target.value as ProfileFormState["gender"],
                    )
                  }
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                >
                  <option value="">Choose</option>
                  <option value="male">♂ Male</option>
                  <option value="female">♀ Female</option>
                  <option value="non-binary">⚧ Non-binary</option>
                  <option value="prefer-not-to-say">◌ Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Interested In</label>
                <select
                  value={form.interestedIn}
                  onChange={(event) =>
                    setField(
                      "interestedIn",
                      event.target.value as ProfileFormState["interestedIn"],
                    )
                  }
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                >
                  <option value="">Choose</option>
                  <option value="male">♂ Male</option>
                  <option value="female">♀ Female</option>
                  <option value="non-binary">⚧ Non-binary</option>
                  <option value="everyone">∞ Everyone</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Interests</label>
              <Input
                value={form.interestTags}
                onChange={(event) =>
                  setField("interestTags", event.target.value)
                }
                placeholder="music, coffee, gym, coding"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas.
              </p>
            </div>

            {savedMessage ? (
              <p className="text-sm text-rose-600">{savedMessage}</p>
            ) : null}

            {updateMutation.error ? (
              <p className="text-sm text-destructive">
                {updateMutation.error.message}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
