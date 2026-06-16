import type { ProjectMediaItem, ProjectMediaType } from "@/types/supabase";

const videoExtensions = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
export function projectMediaTypeFromUrl(url: string): ProjectMediaType {
  const value = url.trim().toLowerCase();
  if (videoExtensions.test(value) || value.includes("youtube.com") || value.includes("youtu.be") || value.includes("vimeo.com")) {
    return "video";
  }
  return "image";
}

export function normaliseProjectMedia(input: unknown): ProjectMediaItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const url = textOrNull(source.url);
      if (!url) return null;

      const requestedType = source.type === "video" || source.type === "image" ? source.type : null;
      const type = requestedType ?? projectMediaTypeFromUrl(url);
      const id = textOrNull(source.id) ?? `${type}-${index}`;

      return {
        id,
        type,
        url,
        alt: textOrNull(source.alt),
        caption: textOrNull(source.caption),
        poster_url: textOrNull(source.poster_url),
      } satisfies ProjectMediaItem;
    })
    .filter((item): item is ProjectMediaItem => Boolean(item));
}

export function createProjectMediaItem(type: ProjectMediaType): ProjectMediaItem {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    type,
    url: "",
    alt: null,
    caption: null,
    poster_url: null,
  };
}
