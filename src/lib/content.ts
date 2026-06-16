import {
  fallbackAboutContent,
  fallbackBlogPosts,
  fallbackEducation,
  fallbackNowPage,
  fallbackProjects,
  fallbackUsesGroups,
  fallbackWorkExperience,
} from "@/lib/fallbackContent";
import { normaliseProjectMedia } from "@/lib/projectMedia";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  AboutContentRow,
  BlogPostRow,
  EducationRow,
  NowPageRow,
  ProjectRow,
  UsesGroupWithItems,
  WorkExperienceRow,
} from "@/types/supabase";

function logError(label: string, error: unknown) {
  if (error) console.error(`Failed to fetch ${label}:`, error);
}

function normaliseProjectRow(project: ProjectRow): ProjectRow {
  return {
    ...project,
    media_items: normaliseProjectMedia(project.media_items),
  };
}

export async function getAboutContent(): Promise<AboutContentRow> {
  if (!isSupabaseConfigured) return fallbackAboutContent;
  try {
    const { data, error } = await supabase
      .from("about_content")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) {
      logError("about_content", error);
      return fallbackAboutContent;
    }
    return {
      ...fallbackAboutContent,
      ...(data as AboutContentRow),
      profile_image_url: (data as AboutContentRow).profile_image_url ?? null,
    };
  } catch (error) {
    logError("about_content", error);
    return fallbackAboutContent;
  }
}

export async function getEducationEntries(): Promise<EducationRow[]> {
  if (!isSupabaseConfigured) return fallbackEducation;
  try {
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      logError("education", error);
      return fallbackEducation;
    }
    return (data ?? []) as EducationRow[];
  } catch (error) {
    logError("education", error);
    return fallbackEducation;
  }
}

export async function getProjects(includeDrafts = false): Promise<ProjectRow[]> {
  if (!isSupabaseConfigured) {
    return fallbackProjects
      .filter((project) => includeDrafts || !project.draft)
      .sort((a, b) => a.sort_order - b.sort_order || b.year - a.year)
      .map(normaliseProjectRow);
  }

  try {
    let query = supabase.from("projects").select("*").order("sort_order", { ascending: true });
    if (!includeDrafts) query = query.eq("draft", false);
    const { data, error } = await query;
    if (error) {
      logError("projects", error);
      return (includeDrafts ? fallbackProjects : fallbackProjects.filter((project) => !project.draft)).map(normaliseProjectRow);
    }
    return ((data ?? []) as ProjectRow[]).map(normaliseProjectRow);
  } catch (error) {
    logError("projects", error);
    return (includeDrafts ? fallbackProjects : fallbackProjects.filter((project) => !project.draft)).map(normaliseProjectRow);
  }
}

export async function getWorkExperience(): Promise<WorkExperienceRow[]> {
  if (!isSupabaseConfigured) return [...fallbackWorkExperience].sort((a, b) => b.sort_order - a.sort_order);
  try {
    const { data, error } = await supabase
      .from("work_experience")
      .select("*")
      .order("sort_order", { ascending: false });
    if (error) {
      logError("work_experience", error);
      return fallbackWorkExperience;
    }
    return ((data ?? []) as WorkExperienceRow[]).map((entry) => ({ ...entry, logo_url: entry.logo_url ?? null }));
  } catch (error) {
    logError("work_experience", error);
    return fallbackWorkExperience;
  }
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPostRow[]> {
  if (!isSupabaseConfigured) {
    return fallbackBlogPosts
      .filter((post) => includeDrafts || !post.draft)
      .sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());
  }

  try {
    let query = supabase.from("blog_posts").select("*").order("pub_date", { ascending: false });
    if (!includeDrafts) query = query.eq("draft", false);
    const { data, error } = await query;
    if (error) {
      logError("blog_posts", error);
      return includeDrafts ? fallbackBlogPosts : fallbackBlogPosts.filter((post) => !post.draft);
    }
    return (data ?? []) as BlogPostRow[];
  } catch (error) {
    logError("blog_posts", error);
    return includeDrafts ? fallbackBlogPosts : fallbackBlogPosts.filter((post) => !post.draft);
  }
}

export async function getUsesGroups(): Promise<UsesGroupWithItems[]> {
  if (!isSupabaseConfigured) return fallbackUsesGroups;
  try {
    const { data, error } = await supabase
      .from("uses_groups")
      .select("*, uses_items(*)")
      .order("sort_order", { ascending: true });
    if (error) {
      logError("uses_groups", error);
      return fallbackUsesGroups;
    }
    return ((data ?? []) as UsesGroupWithItems[]).map((group) => ({
      ...group,
      uses_items: [...(group.uses_items ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    }));
  } catch (error) {
    logError("uses_groups", error);
    return fallbackUsesGroups;
  }
}

export async function getNowPage(): Promise<NowPageRow> {
  if (!isSupabaseConfigured) return fallbackNowPage;
  try {
    const { data, error } = await supabase
      .from("now_page")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) {
      logError("now_page", error);
      return fallbackNowPage;
    }
    return data as NowPageRow;
  } catch (error) {
    logError("now_page", error);
    return fallbackNowPage;
  }
}
