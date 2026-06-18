const SIMPLE_ICONS_CDN = "https://cdn.simpleicons.org";
const DEVICON_CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
const ICONIFY_CDN = "https://api.iconify.design";
const SAFE_ICON_PATH = /^[a-z0-9@._/-]+$/i;
const SAFE_ICON_NAME = /^[a-z0-9._-]+$/i;
const SAFE_HEX = /^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i;

function getDeviconSrc(iconName: string): string {
  return `${DEVICON_CDN}/${iconName}/${iconName}-original.svg`;
}

function getIconifySimpleIconSrc(iconName: string, hex: string): string {
  const safeHex = SAFE_HEX.test(hex.replace("#", "")) ? hex.replace("#", "") : "ffffff";
  return `${ICONIFY_CDN}/simple-icons:${iconName}.svg?color=%23${safeHex}`;
}

export function getSkillIconSrc(slug: string, hex: string): string | null {
  const value = slug.trim();
  if (!value) return null;
  if (value.startsWith("/") && SAFE_ICON_PATH.test(value)) return value;
  if (
    value.startsWith("https://cdn.jsdelivr.net/") ||
    value.startsWith("https://api.iconify.design/") ||
    value.startsWith("https://cdn.simpleicons.org/")
  ) {
    return value;
  }

  const lowerValue = value.toLowerCase();
  if (lowerValue === "dicss3" || lowerValue === "sicss") {
    return getDeviconSrc("css3");
  }
  if (/^Si[A-Z]/.test(value)) {
    const iconName = value.slice(2).toLowerCase();
    return SAFE_ICON_NAME.test(iconName) ? getIconifySimpleIconSrc(iconName, hex) : null;
  }

  const [prefix, iconName] = value.split(":");
  if (prefix === "devicon" && iconName && SAFE_ICON_NAME.test(iconName)) {
    return getDeviconSrc(iconName);
  }
  if (prefix === "simple-icons" && iconName && SAFE_ICON_NAME.test(iconName)) {
    return getIconifySimpleIconSrc(iconName, hex);
  }
  if (prefix === "logos" && iconName && SAFE_ICON_NAME.test(iconName)) {
    return `${ICONIFY_CDN}/logos:${iconName}.svg`;
  }

  if (!SAFE_ICON_NAME.test(value)) return null;
  const safeHex = SAFE_HEX.test(hex.replace("#", "")) ? hex.replace("#", "") : "ffffff";
  return `${SIMPLE_ICONS_CDN}/${value}/${safeHex}`;
}

export function isSimpleIconSlug(slug: string): boolean {
  const value = slug.trim();
  return Boolean(value) && !value.startsWith("/") && !value.startsWith("http") && !value.includes(":") && !/^Si[A-Z]/.test(value);
}
