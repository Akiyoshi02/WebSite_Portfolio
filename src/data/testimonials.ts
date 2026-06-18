import { fallbackTestimonials } from "@/lib/fallbackContent";
import { normalizePublicAssetUrl } from "@/lib/safeUrl";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { TestimonialRow } from "@/types/supabase";

export interface Testimonial {
  text: string;
  name: string;
  title: string;
  company: string;
  initials: string;
  avatarUrl: string | null;
}

function mapTestimonials(rows: TestimonialRow[]): Testimonial[] {
  return rows
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      text: row.text,
      name: row.name,
      title: row.title,
      company: row.company,
      initials: row.initials,
      avatarUrl: normalizePublicAssetUrl(row.avatar_url),
    }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured) return mapTestimonials(fallbackTestimonials);

  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch testimonials:", error);
      return mapTestimonials(fallbackTestimonials);
    }

    return mapTestimonials((data ?? []) as TestimonialRow[]);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return mapTestimonials(fallbackTestimonials);
  }
}
