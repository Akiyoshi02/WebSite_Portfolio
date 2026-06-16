import { fallbackSkillCategories } from "@/lib/fallbackContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { SkillCategoryWithItems } from "@/types/supabase";

export interface TechItem {
  name: string;
  iconSlug: string;
  brandHex: string;
  fallback?: string;
}

export interface TechCategory {
  title: string;
  items: TechItem[];
}

function mapCategories(categories: SkillCategoryWithItems[]): TechCategory[] {
  return categories
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => ({
      title: category.title,
      items: (category.skill_items ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({
          name: item.name,
          iconSlug: item.icon_slug,
          brandHex: item.brand_hex,
          fallback: item.fallback ?? undefined,
        })),
    }));
}

export async function getTechCategories(): Promise<TechCategory[]> {
  if (!isSupabaseConfigured) return mapCategories(fallbackSkillCategories);

  try {
    const { data, error } = await supabase
      .from("skill_categories")
      .select("*, skill_items(*)")
      .order("sort_order", { ascending: true });

    if (error || !data) {
      console.error("Failed to fetch skill_categories:", error);
      return mapCategories(fallbackSkillCategories);
    }

    return mapCategories(data as SkillCategoryWithItems[]);
  } catch (error) {
    console.error("Failed to fetch skill_categories:", error);
    return mapCategories(fallbackSkillCategories);
  }
}
