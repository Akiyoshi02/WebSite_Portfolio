import type {
  AboutContentRow,
  BlogPostRow,
  EducationRow,
  NowPageRow,
  ProjectRow,
  SiteConfigRow,
  SkillCategoryWithItems,
  TestimonialRow,
  UsesGroupWithItems,
  WorkExperienceRow,
} from "@/types/supabase";

const timestamp = "2026-05-21T00:00:00.000Z";

const DEVICON = (name: string) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-original.svg`;

export const fallbackSiteConfigRow: SiteConfigRow = {
  id: 1,
  name: "Akiyoshi Yapa",
  full_name: "Akiyoshi Hikaru Yapa",
  short_name: "Akiyoshi",
  role: "Software Engineer",
  tagline: "Software Engineer & Full-Stack Developer",
  description:
    "Portfolio of Akiyoshi Yapa, a software engineering undergraduate and full-stack developer building practical, AI-powered web products from Sri Lanka.",
  hero_copy:
    "I build resilient web products, polished interfaces, and practical systems that make complex work feel effortless.",
  location: "Ragama, Western Province, Sri Lanka",
  timezone_label: "(UTC+5:30)",
  email: "akiyoshiyapa@gmail.com",
  site_url: "https://akiyoshiyapa.netlify.app",
  locale: "en-US",
  theme_color: "#050810",
  start_year: 2026,
  open_to_work: true,
  typewriter_roles: [
    "Full-Stack Developer",
    "AI Enthusiast",
    "Web Developer",
    "Backend Developer",
    "Problem Solver",
    "Tech Enthusiast",
    "UI/UX Focused",
    "Open to Opportunities",
  ],
  focus_lately: ["Agentic AI", "MCP tooling", "RAG products"],
  social_github: "https://github.com/Akiyoshi02",
  social_linkedin: "https://www.linkedin.com/in/akiyoshi-yapa",
  social_x: "https://x.com/akiyapax",
  social_instagram: "https://www.instagram.com/_.akiya_/",
  social_facebook: "https://www.facebook.com/Akiyoshi.Yapa",
  social_mastodon: null,
  social_youtube: null,
  updated_at: timestamp,
};

export const fallbackAboutContent: AboutContentRow = {
  id: 1,
  bio_paragraph_1:
    "I am a Software Engineering undergraduate with a strong foundation in web development, backend systems, databases, and modern AI-powered applications. I enjoy creating practical, user-focused digital solutions that combine clean design, reliable functionality, and emerging technologies.",
  bio_paragraph_2:
    "I am passionate about software engineering, artificial intelligence, and problem-solving, with a strong interest in building systems that are meaningful, efficient, and impactful. My goal is to continue growing as a developer while applying technology to solve real-world challenges.",
  profile_image_url: null,
  chips: [
    "Full-Stack Developer",
    "AI Enthusiast",
    "Web Developer",
    "Backend Developer",
    "Problem Solver",
    "Tech Enthusiast",
    "UI/UX Focused",
    "Open to Opportunities",
  ],
  stat_featured_projects: 4,
  stat_years_coding: 4,
  stat_technologies: 20,
  stat_skill_domains: 6,
  updated_at: timestamp,
};

export const fallbackEducation: EducationRow[] = [
  {
    id: "thurstan-college",
    institution: "Thurstan College, Sri Lanka",
    period: "2008 - 2022",
    degree: "G.C.E. Ordinary Level",
    logo_path: "/logos/thurstan.png",
    logo_type: "crest",
    logo_width: 1254,
    logo_height: 1254,
    tags: ["G.C.E. O/L", "Secondary Education", "Academic Foundation", "Leadership", "Teamwork"],
    sort_order: 10,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "sliit-city-university",
    institution: "SLIIT City University, Sri Lanka",
    period: "2022 - 2025",
    degree: "Foundation Certificate + HND in Information Technology",
    logo_path: "/logos/sliit.png",
    logo_type: "wide",
    logo_width: 864,
    logo_height: 466,
    tags: ["Programming", "Web Dev", "Databases", "Server-side", "Dean's List 2024"],
    sort_order: 20,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "university-of-bedfordshire",
    institution: "University of Bedfordshire, UK",
    period: "2025 - Present",
    degree: "BSc (Hons) Software Engineering",
    logo_path: "/logos/bedfordshire.png",
    logo_type: "wide",
    logo_width: 1234,
    logo_height: 492,
    tags: ["Software Engineering", "Software Development", "Databases", "Project Execution"],
    sort_order: 30,
    created_at: timestamp,
    updated_at: timestamp,
  },
];

export const fallbackSkillCategories: SkillCategoryWithItems[] = [
  {
    id: "languages",
    title: "Languages",
    sort_order: 10,
    created_at: timestamp,
    skill_items: [
      { id: "java", category_id: "languages", name: "Java", icon_slug: "openjdk", brand_hex: "#ED8B00", fallback: null, sort_order: 10, created_at: timestamp },
      { id: "javascript", category_id: "languages", name: "JavaScript", icon_slug: "javascript", brand_hex: "#F7DF1E", fallback: null, sort_order: 20, created_at: timestamp },
      { id: "typescript", category_id: "languages", name: "TypeScript", icon_slug: "typescript", brand_hex: "#3178C6", fallback: null, sort_order: 30, created_at: timestamp },
      { id: "python", category_id: "languages", name: "Python", icon_slug: "python", brand_hex: "#3776AB", fallback: null, sort_order: 40, created_at: timestamp },
      { id: "php", category_id: "languages", name: "PHP", icon_slug: "php", brand_hex: "#777BB4", fallback: null, sort_order: 50, created_at: timestamp },
      { id: "html5", category_id: "languages", name: "HTML5", icon_slug: "html5", brand_hex: "#E34F26", fallback: null, sort_order: 60, created_at: timestamp },
      { id: "css3", category_id: "languages", name: "CSS3", icon_slug: "devicon:css3", brand_hex: "#1572B6", fallback: null, sort_order: 70, created_at: timestamp },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    sort_order: 20,
    created_at: timestamp,
    skill_items: [
      { id: "react", category_id: "frontend", name: "React", icon_slug: "react", brand_hex: "#61DAFB", fallback: null, sort_order: 10, created_at: timestamp },
      { id: "vite", category_id: "frontend", name: "Vite", icon_slug: "vite", brand_hex: "#646CFF", fallback: null, sort_order: 20, created_at: timestamp },
      { id: "tailwind", category_id: "frontend", name: "Tailwind CSS", icon_slug: "tailwindcss", brand_hex: "#06B6D4", fallback: null, sort_order: 30, created_at: timestamp },
      { id: "router", category_id: "frontend", name: "React Router", icon_slug: "reactrouter", brand_hex: "#CA4245", fallback: null, sort_order: 40, created_at: timestamp },
      { id: "headless", category_id: "frontend", name: "Headless UI", icon_slug: "headlessui", brand_hex: "#66E3FF", fallback: null, sort_order: 50, created_at: timestamp },
      { id: "pwa", category_id: "frontend", name: "PWA", icon_slug: "pwa", brand_hex: "#5A0FC8", fallback: null, sort_order: 60, created_at: timestamp },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    sort_order: 30,
    created_at: timestamp,
    skill_items: [
      { id: "node", category_id: "backend", name: "Node.js", icon_slug: "nodedotjs", brand_hex: "#5FA04E", fallback: null, sort_order: 10, created_at: timestamp },
      { id: "express", category_id: "backend", name: "Express", icon_slug: "express", brand_hex: "#000000", fallback: null, sort_order: 20, created_at: timestamp },
      { id: "rest", category_id: "backend", name: "REST APIs", icon_slug: DEVICON("openapi"), brand_hex: "#6BA539", fallback: null, sort_order: 30, created_at: timestamp },
      { id: "jwt", category_id: "backend", name: "JWT", icon_slug: "jsonwebtokens", brand_hex: "#000000", fallback: "JWT", sort_order: 40, created_at: timestamp },
      { id: "socketio", category_id: "backend", name: "Socket.IO", icon_slug: "socketdotio", brand_hex: "#010101", fallback: null, sort_order: 50, created_at: timestamp },
      { id: "sendgrid", category_id: "backend", name: "SendGrid", icon_slug: "simple-icons:sendgrid", brand_hex: "#1A82E2", fallback: null, sort_order: 60, created_at: timestamp },
    ],
  },
  {
    id: "database",
    title: "Database",
    sort_order: 40,
    created_at: timestamp,
    skill_items: [
      { id: "mysql", category_id: "database", name: "MySQL", icon_slug: "mysql", brand_hex: "#4479A1", fallback: null, sort_order: 10, created_at: timestamp },
      { id: "firebase", category_id: "database", name: "Firebase", icon_slug: "firebase", brand_hex: "#DD2C00", fallback: null, sort_order: 20, created_at: timestamp },
      { id: "supabase", category_id: "database", name: "Supabase", icon_slug: "supabase", brand_hex: "#3FCF8E", fallback: null, sort_order: 30, created_at: timestamp },
      { id: "indexeddb", category_id: "database", name: "IndexedDB", icon_slug: "mozilla", brand_hex: "#005A9C", fallback: null, sort_order: 40, created_at: timestamp },
    ],
  },
  {
    id: "ai-ml",
    title: "AI / ML",
    sort_order: 50,
    created_at: timestamp,
    skill_items: [
      { id: "ollama", category_id: "ai-ml", name: "Ollama", icon_slug: "ollama", brand_hex: "#000000", fallback: null, sort_order: 10, created_at: timestamp },
      { id: "whisper", category_id: "ai-ml", name: "Whisper STT", icon_slug: "https://upload.wikimedia.org/wikipedia/commons/6/66/OpenAI_logo_2025_%28symbol%29.svg", brand_hex: "#10A37F", fallback: null, sort_order: 20, created_at: timestamp },
      { id: "mediapipe", category_id: "ai-ml", name: "MediaPipe", icon_slug: "mediapipe", brand_hex: "#00f5d4", fallback: null, sort_order: 30, created_at: timestamp },
      { id: "huggingface", category_id: "ai-ml", name: "Hugging Face", icon_slug: "huggingface", brand_hex: "#FFD21E", fallback: null, sort_order: 40, created_at: timestamp },
    ],
  },
  {
    id: "devops-tools",
    title: "DevOps & Tools",
    sort_order: 60,
    created_at: timestamp,
    skill_items: [
      { id: "docker", category_id: "devops-tools", name: "Docker", icon_slug: "docker", brand_hex: "#2496ED", fallback: null, sort_order: 10, created_at: timestamp },
      { id: "github-actions", category_id: "devops-tools", name: "GitHub Actions", icon_slug: "githubactions", brand_hex: "#2088FF", fallback: null, sort_order: 20, created_at: timestamp },
      { id: "git", category_id: "devops-tools", name: "Git", icon_slug: "git", brand_hex: "#F05032", fallback: null, sort_order: 30, created_at: timestamp },
      { id: "github", category_id: "devops-tools", name: "GitHub", icon_slug: "github", brand_hex: "#181717", fallback: null, sort_order: 40, created_at: timestamp },
      { id: "azure", category_id: "devops-tools", name: "Azure", icon_slug: DEVICON("azure"), brand_hex: "#0078D4", fallback: null, sort_order: 50, created_at: timestamp },
      { id: "wordpress", category_id: "devops-tools", name: "WordPress", icon_slug: "wordpress", brand_hex: "#21759B", fallback: null, sort_order: 60, created_at: timestamp },
    ],
  },
];

export const fallbackTestimonials: TestimonialRow[] = [
  {
    id: "dylan-rodrigo",
    text: "CleanOps Pro was for one of our client. Scheduling, attendance, proof, and invoicing in one app instead of spreadsheets everywhere. The team got how cleaners work on site and kept us in the loop without the usual back-and-forth.",
    name: "Dylan Rodrigo",
    title: "Operations Manager",
    company: "Cynectex (Pvt) Ltd",
    initials: "DR",
    avatar_url: null,
    sort_order: 10,
    created_at: timestamp,
    updated_at: timestamp,
  },
];

export const fallbackWorkExperience: WorkExperienceRow[] = [
  {
    id: "cynectex",
    company: "Cynectex (Pvt) Ltd",
    logo: "CX",
    logo_url: null,
    title: "Junior Web Developer",
    date_range: "Nov 2025 - Present",
    bullets: [
      "Ship and maintain full-stack web apps: responsive UI, integrations, and quarterly releases.",
      "Standardize API validation and error handling for reliable client-facing flows.",
      "Tune WordPress and web apps for faster loads, stability, and responsiveness.",
    ],
    tags: ["Web Development", "Mobile UI", "API Integration", "WordPress", "Performance"],
    sort_order: 50,
    url: "https://cynectex.com/",
    body: "",
    created_at: timestamp,
    updated_at: timestamp,
  },
];

export const fallbackProjects: ProjectRow[] = [
  {
    id: "interviewai-pro",
    title: "InterviewAI Pro",
    slug: "interviewai-pro",
    tagline: "AI-powered interview practice and candidate screening platform.",
    description:
      "An AI-driven platform for interview preparation and candidate screening: real-time AI interviewer, candidate and organization dashboards, job postings, applications, scheduling, role-based access, moderation, and automated notifications.",
    category: "web",
    stack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "Firebase", "Socket.IO", "JWT", "PWA", "Ollama", "Whisper", "Python", "MediaPipe", "SendGrid", "GitHub Actions"],
    year: 2025,
    featured: true,
    wide: true,
    theme_from: "#7b2fff",
    theme_to: "#ff4ecd",
    stars: null,
    forks: null,
    cover_url: null,
    cover_alt: null,
    media_items: [],
    link_live: null,
    link_repo: "https://github.com/Akiyoshi02/InterviewAI_Pro",
    link_case_study: null,
    draft: false,
    sort_order: 10,
    body: `## Context

InterviewAI Pro started as an experiment in turning the interview loop into something more interactive and structured. The goal was a single platform that could help candidates rehearse with a real-time AI interviewer and help organizations run lightweight, repeatable screening rounds.

## What's in it

- **Real-time AI interviewer:** speech in, speech out, with local LLM responses via Ollama and transcription via Whisper.
- **Two-sided product:** candidate dashboards for practice and applications; organization dashboards for job postings, scheduling, and moderation.
- **Role-based access control:** clearly separated permissions for candidates, organization staff, and admins.
- **Automated notifications:** transactional email via SendGrid for application updates and scheduling.

## Decisions

- **Local-first AI.** Running models with Ollama keeps inference cost and privacy under control during prototyping.
- **PWA shell.** The candidate-facing surface installs and works offline for the practice flows.
- **Sockets, not polling.** Real-time states flow over Socket.IO with reconnection handled at the client.`,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "cleanops-pro",
    title: "CleanOps Pro",
    slug: "cleanops-pro",
    tagline: "Offline-first operations platform for scheduling, attendance, proof tracking, and invoicing.",
    description:
      "A commercial cleaning operations platform built for Admin, Supervisor, and Cleaner workflows: scheduling, QR/selfie attendance, proof uploads, issue reporting, timesheets, invoice generation, and audit tracking. Focused on practical business process automation with offline-first functionality.",
    category: "web",
    stack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "Supabase", "IndexedDB", "PWA", "Docker", "Ollama", "Whisper"],
    year: 2025,
    featured: true,
    wide: false,
    theme_from: "#00f5d4",
    theme_to: "#20e080",
    stars: null,
    forks: null,
    cover_url: null,
    cover_alt: null,
    media_items: [],
    link_live: null,
    link_repo: "https://github.com/Tehan-Hewage/CleanOps_Pro",
    link_case_study: null,
    draft: false,
    sort_order: 20,
    body: `## Context

Field operations don't have the luxury of a stable network. CleanOps Pro was designed around that constraint: cleaners on site need to record attendance, capture proof of work, and report issues even when the connection is patchy or absent, and then sync cleanly when it comes back.

## Three workflows, one app

- **Cleaner.** QR + selfie attendance, proof uploads from the shift, fast issue reporting.
- **Supervisor.** Schedules, live shift state, exception handling, timesheet review.
- **Admin.** Roster, audit trail, invoice generation, dashboards.

## Decisions

- **IndexedDB-backed sync layer.** Every write hits the local store first; a background worker reconciles with Supabase when online.
- **PWA install.** No app-store overhead for a workforce that just needs to open it on their phone.
- **Audit-first design.** Every consequential action is recorded with who/when/where so disputes are resolved in seconds, not days.`,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "fonecove-mobile-store",
    title: "FoneCove Mobile Store",
    slug: "fonecove-mobile-store",
    tagline: "Responsive frontend e-commerce platform for a mobile phone retailer.",
    description:
      "A frontend-only e-commerce site for a mobile phone retailer: public storefront with filtering, search, product pages, and dark/light themes, plus an admin panel UI for products, categories, brands, reviews, announcements, contact messages, and staff roles.",
    category: "web",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "React Router", "Headless UI"],
    year: 2025,
    featured: true,
    wide: false,
    theme_from: "#ff8a3c",
    theme_to: "#ff4ecd",
    stars: null,
    forks: null,
    cover_url: null,
    cover_alt: null,
    media_items: [],
    link_live: null,
    link_repo: "https://github.com/Tehan-Hewage/FoneCove_Mobile_Store",
    link_case_study: null,
    draft: false,
    sort_order: 30,
    body: `## Context

A pure-frontend retail surface designed to look and behave like a finished storefront before any backend exists. The goal was a tight, polished shopping experience with an equally serious admin console.

## What's in it

- **Storefront.** Product grid with faceted filters, search, product detail pages, and a complete dark/light theme system.
- **Admin panel.** UI for products, categories, brands, reviews, announcements, contact messages, and staff roles.
- **Typed end-to-end.** TypeScript throughout, strict mode, no any.

## Decisions

- **Headless UI over a heavyweight UI kit.** Stayed close to the design, no fighting opinionated components.
- **React Router with nested layouts.** Lets the admin panel share chrome cleanly without re-rendering the shell on every navigation.
- **Themeable via CSS variables.** Dark/light toggles flip a single attribute, with no class-bombing in component trees.`,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "banana-blitz",
    title: "Banana Blitz",
    slug: "banana-blitz",
    tagline: "Browser puzzle game with multiplayer and daily challenges.",
    description:
      "A browser-based puzzle game where players guess banana counts across multiple modes: classic levels, timed challenges, daily puzzles, achievements, customization, and real-time multiplayer with friends and matchmaking.",
    category: "web",
    stack: ["HTML", "CSS", "JavaScript", "Firebase", "Tailwind CSS"],
    year: 2024,
    featured: false,
    wide: true,
    theme_from: "#ffc857",
    theme_to: "#ff8a3c",
    stars: null,
    forks: null,
    cover_url: null,
    cover_alt: null,
    media_items: [],
    link_live: "https://akiyoshi02.github.io/BananaBlitz_Game/",
    link_repo: "https://github.com/Akiyoshi02/BananaBlitz_Game",
    link_case_study: null,
    draft: false,
    sort_order: 40,
    body: `## Context

Banana Blitz started as a small bet: how much real game can you build with plain HTML, CSS, and JavaScript? The answer turned out to be: more than expected, once Firebase joined the chat.

## Modes

- **Classic.** Progressive levels with handcrafted difficulty curves.
- **Timed.** Beat-the-clock runs with leaderboards.
- **Daily challenge.** One puzzle, the same for everyone, every day.
- **Multiplayer.** Real-time matches against friends or matchmaking.

## Decisions

- **Firebase for the realtime spine.** Auth, presence, leaderboards, and daily seeds all live behind one SDK.
- **No build step.** Static files, deploys to GitHub Pages, loads anywhere.
- **Achievements + customization** kept the game replayable without expanding scope into a full live-ops machine.`,
    created_at: timestamp,
    updated_at: timestamp,
  },
];

export const fallbackBlogPosts: BlogPostRow[] = [
  {
    id: "hello-world",
    title: "Hello, World",
    slug: "hello-world",
    description: "First post on the new site: what's here, what's coming, and how it was built.",
    pub_date: "2026-05-21",
    updated_date: null,
    tags: ["meta", "astro"],
    cover_url: null,
    cover_alt: null,
    draft: false,
    body: `This is the first post on the new portfolio. The site is built with **Astro**, deployed as a fully static bundle, and ships effectively no JavaScript on content pages by default.

Plans from here:

- **Project case studies** under /projects/<slug>, written in MDX so they can mix prose, code, and embedded components.
- **Engineering notes:** short, focused posts on building software with real users in mind: backend, AI integration, system design.
- **A /uses page** for the tools, hardware, and setup I work with.

If you spotted something you want to talk about, the contact link in the nav goes straight to my inbox.`,
    created_at: timestamp,
    updated_at: timestamp,
  },
];

export const fallbackUsesGroups: UsesGroupWithItems[] = [
  {
    id: "editor",
    title: "Editor",
    sort_order: 10,
    created_at: timestamp,
    uses_items: [
      { id: "vs-code", group_id: "editor", name: "VS Code", description: "Primary editor with extensions for TypeScript, Astro, and Git.", sort_order: 10 },
      { id: "jetbrains-mono", group_id: "editor", name: "JetBrains Mono", description: "Editor font, weights 400/500/700.", sort_order: 20 },
      { id: "github-dark-default", group_id: "editor", name: "GitHub Dark Default", description: "Color theme: easy on the eyes for long sessions.", sort_order: 30 },
    ],
  },
  {
    id: "terminal",
    title: "Terminal",
    sort_order: 20,
    created_at: timestamp,
    uses_items: [
      { id: "windows-terminal", group_id: "terminal", name: "Windows Terminal", description: "Tabs, profiles, and decent rendering.", sort_order: 10 },
      { id: "powershell", group_id: "terminal", name: "PowerShell 7", description: "Default shell on Windows.", sort_order: 20 },
      { id: "starship", group_id: "terminal", name: "Starship", description: "Cross-shell prompt with git status.", sort_order: 30 },
    ],
  },
  {
    id: "runtimes",
    title: "Languages & Runtimes",
    sort_order: 30,
    created_at: timestamp,
    uses_items: [
      { id: "node", group_id: "runtimes", name: "Node.js 22 LTS", description: "JavaScript / TypeScript runtime.", sort_order: 10 },
      { id: "python", group_id: "runtimes", name: "Python 3.12", description: "Tooling, scripts, and backend utilities.", sort_order: 20 },
      { id: "go", group_id: "runtimes", name: "Go 1.22+", description: "Small services and CLIs.", sort_order: 30 },
    ],
  },
  {
    id: "hardware",
    title: "Hardware",
    sort_order: 40,
    created_at: timestamp,
    uses_items: [
      { id: "monitor", group_id: "hardware", name: "27\" monitor", description: "1440p, the productivity sweet spot.", sort_order: 10 },
      { id: "keyboard", group_id: "hardware", name: "Mechanical keyboard", description: "Brown switches.", sort_order: 20 },
      { id: "mouse", group_id: "hardware", name: "Wired mouse", description: "Latency over wireless.", sort_order: 30 },
    ],
  },
];

export const fallbackNowPage: NowPageRow = {
  id: 1,
  location: "Ragama, Western Province, Sri Lanka",
  working_on:
    "Junior Web Developer at Cynectex, shipping client web apps and API work, while pushing forward on two personal builds: InterviewAI Pro and CleanOps Pro.",
  studying: "BSc (Hons) Software Engineering at the University of Bedfordshire, UK.",
  learning:
    "Backend engineering depth, AI integration patterns (local LLMs, retrieval, speech I/O), and system design fundamentals for production-ready software.",
  open_to:
    "Software engineering opportunities: remote, hybrid, or relocation-friendly. Junior to mid-level roles where careful engineering and ownership matter.",
  last_updated: "2026-05-21",
  updated_at: timestamp,
};
