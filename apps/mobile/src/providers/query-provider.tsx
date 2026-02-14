/**
 * TanStack React Query provider
 */

import { QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

import { createQueryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
