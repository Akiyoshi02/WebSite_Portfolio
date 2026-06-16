export type ProjectCategory = "web" | "api" | "mobile" | "open-source" | "other";
export type LogoType = "crest" | "wide";
export type ProjectMediaType = "image" | "video";

export interface ProjectMediaItem {
  id: string;
  type: ProjectMediaType;
  url: string;
  alt: string | null;
  caption: string | null;
  poster_url: string | null;
}

export interface SiteConfigRow {
  id: number;
  name: string;
  full_name: string;
  short_name: string;
  role: string;
  tagline: string;
  description: string;
  hero_copy: string;
  location: string;
  timezone_label: string;
  email: string;
  site_url: string;
  locale: string;
  theme_color: string;
  start_year: number;
  open_to_work: boolean;
  typewriter_roles: string[];
  focus_lately: string[];
  social_github: string | null;
  social_linkedin: string | null;
  social_x: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_mastodon: string | null;
  social_youtube: string | null;
  updated_at: string;
}

export interface AboutContentRow {
  id: number;
  bio_paragraph_1: string;
  bio_paragraph_2: string;
  profile_image_url: string | null;
  chips: string[];
  stat_featured_projects: number;
  stat_years_coding: number;
  stat_technologies: number;
  stat_skill_domains: number;
  updated_at: string;
}

export interface EducationRow {
  id: string;
  institution: string;
  period: string;
  degree: string;
  logo_path: string | null;
  logo_type: LogoType;
  logo_width: number;
  logo_height: number;
  tags: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SkillCategoryRow {
  id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface SkillItemRow {
  id: string;
  category_id: string;
  name: string;
  icon_slug: string;
  brand_hex: string;
  fallback: string | null;
  sort_order: number;
  created_at: string;
}

export interface SkillCategoryWithItems extends SkillCategoryRow {
  skill_items: SkillItemRow[];
}

export interface TestimonialRow {
  id: string;
  text: string;
  name: string;
  title: string;
  company: string;
  initials: string;
  avatar_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkExperienceRow {
  id: string;
  company: string;
  logo: string;
  logo_url: string | null;
  title: string;
  date_range: string;
  bullets: string[];
  tags: string[];
  sort_order: number;
  url: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  stack: string[];
  year: number;
  featured: boolean;
  wide: boolean;
  theme_from: string;
  theme_to: string;
  stars: number | null;
  forks: number | null;
  cover_url: string | null;
  cover_alt: string | null;
  media_items: ProjectMediaItem[];
  link_live: string | null;
  link_repo: string | null;
  link_case_study: string | null;
  draft: boolean;
  sort_order: number;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  pub_date: string;
  updated_date: string | null;
  tags: string[];
  cover_url: string | null;
  cover_alt: string | null;
  draft: boolean;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface UsesGroupRow {
  id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface UsesItemRow {
  id: string;
  group_id: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface UsesGroupWithItems extends UsesGroupRow {
  uses_items: UsesItemRow[];
}

export interface NowPageRow {
  id: number;
  location: string;
  working_on: string;
  studying: string;
  learning: string;
  open_to: string;
  last_updated: string;
  updated_at: string;
}
