import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type Notify = (message: string, type?: "success" | "error") => void;

export interface ModuleProps {
  notify: Notify;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function initialsFromName(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function withUpdatedAt<T extends Record<string, unknown>>(data: T): T & { updated_at: string } {
  return { ...data, updated_at: new Date().toISOString() };
}

export function sortByOrder<T extends { sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

export async function updateSortOrder(table: string, ids: string[]) {
  if (!isSupabaseConfigured) return;
  await Promise.all(
    ids.map((id, index) =>
      supabase
        .from(table)
        .update({ sort_order: (index + 1) * 10 })
        .eq("id", id),
    ),
  );
}

export function toNumber(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toNullableNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}
