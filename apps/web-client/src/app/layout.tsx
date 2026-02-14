import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/client";
import { ThemeProvider } from "@/services/theme";
import { ThemeLoader } from "@/services/theme";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Crushie 💕",
  description:
    "A love-themed platform — spread love, connect hearts, and vibe together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
          <Suspense fallback={null}>
            <NuqsAdapter>
              <TRPCReactProvider>
                <ThemeProvider>
                  <ThemeLoader>{children}</ThemeLoader>
                </ThemeProvider>
              </TRPCReactProvider>
            </NuqsAdapter>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
