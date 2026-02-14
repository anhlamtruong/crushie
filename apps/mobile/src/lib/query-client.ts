/**
 * TanStack Query client factory
 */

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // 30 s
        gcTime: 5 * 60_000, // 5 min
        retry: (failureCount, error) => {
          // Don't retry auth errors — they won't resolve by themselves
          if (error instanceof ApiError && error.status === 401) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
