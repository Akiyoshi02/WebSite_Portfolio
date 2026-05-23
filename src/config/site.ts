/**
 * Single source of truth for site-wide metadata.
 * Update these values once and they propagate everywhere
 * (SEO tags, JSON-LD, RSS, sitemap, footer, OG images, etc.).
 */
export const site = {
  /** Full display name */
  name: "Akiyoshi Yapa",
  /** Full legal name, used in JSON-LD `Person` for richer search results */
  fullName: "Akiyoshi Hikaru Yapa",
  /** Short tag shown next to the logo and used in tab titles */
  shortName: "Akiyoshi",
  /** Role / one-line tagline */
  role: "Software Engineer",
  /** Longer headline used for OG cards and the SEO description fallback */
  tagline: "Software Engineer & Full-Stack Developer",
  /** 1-2 sentence description used as the default meta description */
  description:
    "Portfolio of Akiyoshi Yapa, a software engineering undergraduate and full-stack developer building practical, AI-powered web products from Sri Lanka.",
  /** City, Country */
  location: "Ragama, Western Province, Sri Lanka",
  /** Short timezone label shown on the contact card */
  timeZoneLabel: "(UTC+5:30)",
  /** Primary contact email (clear-text; spam-protected on the page via JS if needed) */
  email: "akiyoshiyapa@gmail.com",
  /** Production URL (no trailing slash). Override at build time with SITE_URL. */
  url: (import.meta.env.SITE ?? "https://akiyoshiyapa.netlify.app").replace(/\/$/, ""),
  /** Default locale (BCP-47) */
  locale: "en-US",
  /** Theme color used by browsers / PWA */
  themeColor: "#050810",
  /** First year the portfolio went live (used in the footer copyright range) */
  startYear: 2026,
  /** Currently open to opportunities; toggles the hero availability pill */
  openToWork: true,
  /** Roles cycled in the hero typewriter */
  typewriterRoles: [
    "Full-Stack Developer",
    "AI Enthusiast",
    "Web Developer",
    "Backend Developer",
    "Problem Solver",
    "Tech Enthusiast",
    "UI/UX Focused",
    "Open to Opportunities",
  ] as readonly string[],
  /** Shown in the contact panel under "Focus lately" */
  focusLately: [
    "Agentic AI",
    "MCP tooling",
    "RAG products",
  ] as readonly string[],
  /** Social links; set to null to hide a link */
  socials: {
    github: "https://github.com/Akiyoshi02",
    linkedin: "https://www.linkedin.com/in/akiyoshi-yapa",
    x: "https://x.com/akiyapax",
    instagram: "https://www.instagram.com/_.akiya_/",
    facebook: "https://www.facebook.com/Akiyoshi.Yapa",
    mastodon: null as string | null,
    youtube: null as string | null,
    email: "mailto:akiyoshiyapa@gmail.com",
  },
  /** Navigation links (in order) */
  nav: [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/#projects" },
    { label: "Experience", href: "/#experience" },
    { label: "Education", href: "/#education" },
    { label: "Writing", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;

export type SiteConfig = typeof site;
