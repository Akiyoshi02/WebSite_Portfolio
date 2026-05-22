const COMPACT_HEATMAP_CELLS = 156;
const LEVEL_OPACITY = {
  NONE: 0.12,
  FIRST_QUARTILE: 0.25,
  SECOND_QUARTILE: 0.45,
  THIRD_QUARTILE: 0.7,
  FOURTH_QUARTILE: 1,
} as const;

type ContributionLevel = keyof typeof LEVEL_OPACITY;

export interface GitHubActivityCell {
  date: string;
  count: number;
  level: number;
  title: string;
}

export interface GitHubActivity {
  cells: GitHubActivityCell[];
  source: "github-graphql" | "github-public" | "fallback";
  summary: string;
  totalContributions: number | null;
}

interface GraphQlContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: ContributionLevel;
}

interface GraphQlResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: GraphQlContributionDay[];
          }>;
        };
      };
    } | null;
  };
  errors?: Array<{ message?: string }>;
}

const fallbackLevels = [0.12, 0.25, 0.45, 0.7, 1] as const;

export async function getGitHubActivity(username: string): Promise<GitHubActivity> {
  const token = getGitHubToken();

  if (token) {
    const graphQlActivity = await fetchGraphQlActivity(username, token);
    if (graphQlActivity) {
      return graphQlActivity;
    }
  }

  const publicActivity = await fetchPublicProfileActivity(username);
  if (publicActivity) {
    return publicActivity;
  }

  return {
    cells: buildFallbackCells(),
    source: "fallback",
    summary: `GitHub activity preview for @${username}. Add GH_TOKEN to load live contributions.`,
    totalContributions: null,
  };
}

function getGitHubToken() {
  const env = import.meta.env as Record<string, string | undefined>;
  return (
    process.env.GH_TOKEN ??
    process.env.GITHUB_TOKEN ??
    env.GH_TOKEN ??
    env.GITHUB_TOKEN
  );
}

async function fetchGraphQlActivity(username: string, token: string): Promise<GitHubActivity | null> {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 190);

  const query = `
    query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetchWithTimeout("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "akiyoshi-portfolio",
      },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as GraphQlResponse;
    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar || json.errors?.length) {
      return null;
    }

    const days = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVEL_OPACITY[day.contributionLevel] ?? LEVEL_OPACITY.NONE,
      })),
    );

    return {
      cells: toCompactCells(days),
      source: "github-graphql",
      summary: `Recent GitHub contribution activity for @${username}.`,
      totalContributions: calendar.totalContributions,
    };
  } catch {
    return null;
  }
}

async function fetchPublicProfileActivity(username: string): Promise<GitHubActivity | null> {
  try {
    const response = await fetchWithTimeout(`https://github.com/users/${username}/contributions`, {
      headers: {
        "User-Agent": "akiyoshi-portfolio",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const titleById = new Map<string, string>();
    const tooltipPattern =
      /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;

    for (const match of html.matchAll(tooltipPattern)) {
      titleById.set(match[1], decodeHtml(match[2].trim()));
    }

    const days: Array<{ date: string; count: number; level: number; title?: string }> = [];
    const dayPattern = /<td\b(?=[^>]*ContributionCalendar-day)([^>]*)>/g;

    for (const match of html.matchAll(dayPattern)) {
      const attributes = match[1];
      const date = readAttribute(attributes, "data-date");
      const id = readAttribute(attributes, "id");
      const rawLevel = Number(readAttribute(attributes, "data-level") ?? 0);

      if (!date) {
        continue;
      }

      const title = id ? titleById.get(id) : undefined;
      const count = title ? readContributionCount(title) : 0;

      days.push({
        date,
        count,
        level: fallbackLevels[Math.max(0, Math.min(rawLevel, fallbackLevels.length - 1))],
        title,
      });
    }

    if (!days.length) {
      return null;
    }

    const compactCells = toCompactCells(days);

    return {
      cells: compactCells,
      source: "github-public",
      summary: `Recent GitHub contribution activity for @${username}.`,
      totalContributions: compactCells.reduce((sum, cell) => sum + cell.count, 0),
    };
  } catch {
    return null;
  }
}

function toCompactCells(days: Array<{ date: string; count: number; level: number; title?: string }>) {
  return [...days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-COMPACT_HEATMAP_CELLS)
    .map((day) => ({
      date: day.date,
      count: day.count,
      level: day.level,
      title: day.title ?? formatContributionTitle(day.count, day.date),
    }));
}

function buildFallbackCells(): GitHubActivityCell[] {
  return Array.from({ length: COMPACT_HEATMAP_CELLS }, (_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const n = seed - Math.floor(seed);
    const level = fallbackLevels[Math.floor(n * fallbackLevels.length)];
    const count = Math.round(level * 10);

    return {
      date: "",
      count,
      level,
      title: `${count} sample contributions`,
    };
  });
}

function formatContributionTitle(count: number, date: string) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
  const label = count === 1 ? "contribution" : "contributions";

  return `${count} ${label} on ${formattedDate}`;
}

function readContributionCount(title: string) {
  if (/^no contributions/i.test(title)) {
    return 0;
  }

  const match = title.match(/([\d,]+)\s+contributions?/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function readAttribute(attributes: string, name: string) {
  const match = attributes.match(new RegExp(`${name}="([^"]*)"`));
  return match?.[1];
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchWithTimeout(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
