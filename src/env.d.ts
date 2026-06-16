/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_ADMIN_EMAILS?: string;
  readonly PUBLIC_NETLIFY_BUILD_HOOK_URL?: string;
  readonly SITE_URL?: string;
}
