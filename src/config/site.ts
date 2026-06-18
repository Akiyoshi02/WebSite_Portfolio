import { fallbackSiteConfigRow } from "@/lib/fallbackContent";
import { mailtoForEmail, normalizeEmailAddress, normalizeExternalUrl } from "@/lib/safeUrl";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { SiteConfigRow } from "@/types/supabase";

const nav = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Experience", href: "/#experience" },
  { label: "Education", href: "/#education" },
  { label: "Writing", href: "/blog" },
  { label: "Contact", href: "/#contact" },
] as const;

function mapSiteConfig(row: SiteConfigRow) {
  const fallbackUrl = (import.meta.env.SITE_URL ?? import.meta.env.SITE ?? row.site_url).replace(/\/$/, "");
  const email = normalizeEmailAddress(row.email) ?? fallbackSiteConfigRow.email;

  return {
    name: row.name,
    fullName: row.full_name,
    shortName: row.short_name,
    role: row.role,
    tagline: row.tagline,
    description: row.description,
    heroCopy: row.hero_copy ?? fallbackSiteConfigRow.hero_copy,
    location: row.location,
    timeZoneLabel: row.timezone_label,
    email,
    url: (normalizeExternalUrl(row.site_url) ?? fallbackUrl).replace(/\/$/, ""),
    locale: row.locale,
    themeColor: row.theme_color,
    startYear: row.start_year,
    openToWork: row.open_to_work,
    typewriterRoles: row.typewriter_roles,
    focusLately: row.focus_lately,
    socials: {
      github: normalizeExternalUrl(row.social_github),
      linkedin: normalizeExternalUrl(row.social_linkedin),
      x: normalizeExternalUrl(row.social_x),
      instagram: normalizeExternalUrl(row.social_instagram),
      facebook: normalizeExternalUrl(row.social_facebook),
      mastodon: normalizeExternalUrl(row.social_mastodon),
      youtube: normalizeExternalUrl(row.social_youtube),
      email: mailtoForEmail(email),
    },
    nav,
  };
}

let cachedSiteConfig: ReturnType<typeof mapSiteConfig> | null = null;
const shouldCacheSiteConfig = !import.meta.env.DEV;

export async function getSiteConfig() {
  if (shouldCacheSiteConfig && cachedSiteConfig) return cachedSiteConfig;

  if (!isSupabaseConfigured) {
    const siteConfig = mapSiteConfig(fallbackSiteConfigRow);
    if (shouldCacheSiteConfig) cachedSiteConfig = siteConfig;
    return siteConfig;
  }

  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) {
      console.error("Failed to fetch site_config:", error);
      const siteConfig = mapSiteConfig(fallbackSiteConfigRow);
      if (shouldCacheSiteConfig) cachedSiteConfig = siteConfig;
      return siteConfig;
    }

    const siteConfig = mapSiteConfig(data as SiteConfigRow);
    if (shouldCacheSiteConfig) cachedSiteConfig = siteConfig;
    return siteConfig;
  } catch (error) {
    console.error("Failed to fetch site_config:", error);
    const siteConfig = mapSiteConfig(fallbackSiteConfigRow);
    if (shouldCacheSiteConfig) cachedSiteConfig = siteConfig;
    return siteConfig;
  }
}

export type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>;
