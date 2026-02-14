import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/client";
import { ThemeProvider } from "@/services/theme";
import { ThemeLoader } from "@/services/theme";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Tinh Yeu Chuchube 💕",
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
          <NuqsAdapter>
            <TRPCReactProvider>
              <ThemeProvider>
                <ThemeLoader>{children}</ThemeLoader>
              </ThemeProvider>
            </TRPCReactProvider>
          </NuqsAdapter>
        </body>
      </html>
    </ClerkProvider>
  );
}
