import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

const hasPlaceholder =
  supabaseUrl.includes("your-project") ||
  supabaseUrl.includes("your-ref") ||
  supabaseAnonKey.includes("your-anon") ||
  supabaseAnonKey.includes("eyJ...");

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !hasPlaceholder &&
    supabaseUrl.startsWith("https://"),
);

const isBrowser = typeof window !== "undefined";

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://example.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key",
  {
    auth: {
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      persistSession: isBrowser,
    },
  },
);

export function createEphemeralSupabaseClient() {
  return createClient(
    isSupabaseConfigured ? supabaseUrl : "https://example.supabase.co",
    isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key",
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
