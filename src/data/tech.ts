/**
 * Tech stack shown on the homepage in the Skills section.
 * Each item: [displayName, simple-icons slug or public asset path, brand hex color, optional fallback initials]
 * Pass an empty string as the icon slug to force the fallback to render.
 */
export type TechItem = readonly [
  name: string,
  iconSlug: string,
  brandHex: string,
  fallback?: string,
];

export interface TechCategory {
  title: string;
  items: readonly TechItem[];
}

export const techCategories: readonly TechCategory[] = [
  {
    title: "Languages",
    items: [
      ["Java", "openjdk", "#ED8B00"],
      ["JavaScript", "javascript", "#F7DF1E"],
      ["TypeScript", "typescript", "#3178C6"],
      ["Python", "python", "#3776AB"],
      ["PHP", "php", "#777BB4"],
      ["HTML5", "html5", "#E34F26"],
      ["CSS3", "/logos/css3.svg", "#663399"],
    ],
  },
  {
    title: "Frontend",
    items: [
      ["React", "react", "#61DAFB"],
      ["Vite", "vite", "#646CFF"],
      ["Tailwind CSS", "tailwindcss", "#06B6D4"],
      ["React Router", "reactrouter", "#CA4245"],
      ["Headless UI", "headlessui", "#66E3FF"],
      ["PWA", "pwa", "#5A0FC8"],
    ],
  },
  {
    title: "Backend",
    items: [
      ["Node.js", "nodedotjs", "#5FA04E"],
      ["Express", "express", "#ffffff"],
      ["REST APIs", "/logos/openapi.svg", "#6BA539"],
      ["JWT", "jsonwebtokens", "#000000", "JWT"],
      ["Socket.IO", "socketdotio", "#ffffff"],
      ["SendGrid", "/logos/sendgrid.svg", "#1A82E2"],
    ],
  },
  {
    title: "Database",
    items: [
      ["MySQL", "mysql", "#4479A1"],
      ["Firebase", "firebase", "#DD2C00"],
      ["Supabase", "supabase", "#3FCF8E"],
      ["IndexedDB", "/logos/indexeddb.svg", "#005A9C"],
    ],
  },
  {
    title: "AI / ML",
    items: [
      ["Ollama", "ollama", "#ffffff"],
      [
        "Whisper STT",
        "https://upload.wikimedia.org/wikipedia/commons/6/66/OpenAI_logo_2025_%28symbol%29.svg",
        "#10A37F",
      ],
      ["MediaPipe", "mediapipe", "#00f5d4"],
      ["Hugging Face", "huggingface", "#FFD21E"],
    ],
  },
  {
    title: "DevOps & Tools",
    items: [
      ["Docker", "docker", "#2496ED"],
      ["GitHub Actions", "githubactions", "#2088FF"],
      ["Git", "git", "#F05032"],
      ["GitHub", "github", "#ffffff"],
      ["Azure", "/logos/azure.svg", "#0078D4"],
      ["WordPress", "wordpress", "#21759B"],
    ],
  },
];
