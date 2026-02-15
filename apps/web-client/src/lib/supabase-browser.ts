/**
 * Supabase Browser Client — Client-side Realtime
 *
 * Uses the anonymous key for browser-only features like Realtime channels.
 * Auth context for RLS is delegated to per-request JWT (set via setAuth).
 *
 * ⚠️ This file is safe for browser / "use client" modules.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — Realtime features will not work.",
  );
}

/**
 * Anonymous Supabase client for browser-side Realtime subscriptions.
 * Does NOT bypass RLS. Only useful for Realtime channels and public reads.
 */
export const supabaseBrowser = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);
