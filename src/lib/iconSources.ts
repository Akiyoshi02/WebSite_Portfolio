const SIMPLE_ICONS_CDN = "https://cdn.simpleicons.org";
const DEVICON_CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
const ICONIFY_CDN = "https://api.iconify.design";

function getDeviconSrc(iconName: string): string {
  return `${DEVICON_CDN}/${iconName}/${iconName}-original.svg`;
}

function getIconifySimpleIconSrc(iconName: string, hex: string): string {
  return `${ICONIFY_CDN}/simple-icons:${iconName}.svg?color=%23${hex.replace("#", "")}`;
}

export function getSkillIconSrc(slug: string, hex: string): string | null {
  const value = slug.trim();
  if (!value) return null;
  if (value.startsWith("/") || value.startsWith("http")) return value;

  const lowerValue = value.toLowerCase();
  if (lowerValue === "dicss3" || lowerValue === "sicss") {
    return getDeviconSrc("css3");
  }
  if (/^Si[A-Z]/.test(value)) {
    return getIconifySimpleIconSrc(value.slice(2).toLowerCase(), hex);
  }

  const [prefix, iconName] = value.split(":");
  if (prefix === "devicon" && iconName) {
    return getDeviconSrc(iconName);
  }
  if (prefix === "simple-icons" && iconName) {
    return getIconifySimpleIconSrc(iconName, hex);
  }
  if (prefix === "logos" && iconName) {
    return `${ICONIFY_CDN}/logos:${iconName}.svg`;
  }

  return `${SIMPLE_ICONS_CDN}/${value}/${hex.replace("#", "")}`;
}

export function isSimpleIconSlug(slug: string): boolean {
  const value = slug.trim();
  return Boolean(value) && !value.startsWith("/") && !value.startsWith("http") && !value.includes(":") && !/^Si[A-Z]/.test(value);
}
