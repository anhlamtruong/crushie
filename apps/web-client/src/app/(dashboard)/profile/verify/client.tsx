"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationBadge } from "@/components/verification-badge";
import { Camera, ShieldCheck } from "lucide-react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read image"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Invalid image data"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export default function VerifyProfileClient() {
  const trpc = useTRPC();
  const userQuery = useQuery(trpc.users.getMe.queryOptions());
  const verificationMutation = useMutation(
    trpc.verification.requestVerification.mutationOptions(),
  );

  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const onPickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelfieFile(file);
  };

  const previewUrl = useMemo(() => {
    if (!selfieFile) return null;
    return URL.createObjectURL(selfieFile);
  }, [selfieFile]);

  const onVerify = async () => {
    if (!selfieFile) return;

    const base64 = await fileToBase64(selfieFile);
    await verificationMutation.mutateAsync({
      selfieBase64: base64,
      selfieMimeType: (selfieFile.type || "image/jpeg") as
        | "image/jpeg"
        | "image/png"
        | "image/webp",
    });

    setSelfieFile(null);
    await userQuery.refetch();
  };

  const result = verificationMutation.data;

  if (userQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Verify Identity</h1>
        <p className="text-muted-foreground">
          Unlock your Pinky Promise badge with AI-assisted selfie verification.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            Safety Guarantee
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Your selfie is processed by AI and deleted instantly. We never store
            your raw biometric data.
          </p>

          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Camera className="h-4 w-4 text-rose-500" />
              Face Camera
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPickFile}
              className="block w-full text-sm"
            />

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selfie preview"
                className="mt-4 max-h-64 w-full rounded-md border object-cover"
              />
            ) : null}
          </div>

          <Button
            disabled={!selfieFile || verificationMutation.isPending}
            onClick={onVerify}
            className="bg-rose-500 text-white hover:bg-rose-600"
          >
            {verificationMutation.isPending
              ? "Verifying..."
              : "Start Verification"}
          </Button>

          {verificationMutation.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : null}

          {result ? (
            <div className="rounded-md border border-border bg-card p-4 text-sm">
              <p className="font-medium">
                {result.verified
                  ? "You’re verified 🎉"
                  : "Verification was not conclusive"}
              </p>
              <p className="mt-1 text-muted-foreground">{result.reasoning}</p>
              <p className="mt-1 text-muted-foreground">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>
          ) : null}

          {result && !result.verified ? (
            <p className="text-sm text-muted-foreground">
              The lighting might be too dark. Let&apos;s try again in a brighter
              spot!
            </p>
          ) : null}

          <VerificationBadge
            isVerified={Boolean(userQuery.data?.isVerified)}
            size="md"
          />
        </CardContent>
      </Card>
    </div>
  );
}
