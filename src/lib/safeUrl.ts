const HTTP_PROTOCOLS = ["http:", "https:"] as const;
const LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"] as const;
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/;

interface NormalizeUrlOptions {
  allowHash?: boolean;
  allowRelative?: boolean;
  protocols?: readonly string[];
}

function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || CONTROL_CHAR_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function normalizeUrl(
  value: string | null | undefined,
  {
    allowHash = false,
    allowRelative = false,
    protocols = LINK_PROTOCOLS,
  }: NormalizeUrlOptions = {},
): string | null {
  const trimmed = textOrNull(value);
  if (!trimmed) return null;

  if (allowHash && /^#[A-Za-z][\w:-]*$/.test(trimmed)) {
    return trimmed;
  }

  if (allowRelative && trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    try {
      const parsed = new URL(trimmed, "https://portfolio.local");
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(trimmed);
    return protocols.includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function normalizeExternalUrl(value: string | null | undefined): string | null {
  return normalizeUrl(value, { protocols: HTTP_PROTOCOLS });
}

export function normalizePublicAssetUrl(value: string | null | undefined): string | null {
  return normalizeUrl(value, { allowRelative: true, protocols: HTTP_PROTOCOLS });
}

export function normalizeLinkUrl(value: string | null | undefined): string | null {
  return normalizeUrl(value, { allowHash: true, allowRelative: true, protocols: LINK_PROTOCOLS });
}

export function normalizeEmailAddress(value: string | null | undefined): string | null {
  const email = textOrNull(value);
  if (!email || email.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function mailtoForEmail(value: string | null | undefined): string | null {
  const email = normalizeEmailAddress(value);
  return email ? `mailto:${email}` : null;
}
