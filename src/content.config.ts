import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * PROJECTS: each MDX file in `src/content/projects/` becomes a case-study page
 * at `/projects/<slug>` and a card on the homepage projects grid.
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      description: z.string(),
      category: z.enum(["web", "api", "mobile", "open-source", "other"]),
      stack: z.array(z.string()).default([]),
      year: z.number().int().min(2000).max(2100),
      featured: z.boolean().default(false),
      /** Show this card as a wide tile in the homepage grid */
      wide: z.boolean().default(false),
      /** Two-stop linear gradient used for the card's accent */
      theme: z.tuple([z.string(), z.string()]).default(["#00f5d4", "#7b2fff"]),
      stars: z.number().int().nonnegative().optional(),
      forks: z.number().int().nonnegative().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      links: z
        .object({
          live: z.url().optional(),
          repo: z.url().optional(),
          caseStudy: z.url().optional(),
        })
        .default({}),
      draft: z.boolean().default(false),
      /** Manual sort key; lower comes first. Falls back to year desc. */
      order: z.number().optional(),
    }),
});

/**
 * POSTS: blog / writing collection.
 */
const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

/**
 * WORK: experience timeline entries. Markdown files (no MDX needed).
 * The body is rendered as supporting prose under the bullets.
 */
const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    company: z.string(),
    /** 2-character monogram shown in the timeline */
    logo: z.string().min(1).max(4),
    title: z.string(),
    /** Human-readable date range, e.g. "Jun 2023 - Sep 2023" or "2022 - Present" */
    date: z.string(),
    bullets: z.array(z.string()).min(1),
    tags: z.array(z.string()).default([]),
    /** Sort key: higher = more recent (shown first) */
    order: z.number().int(),
    url: z.url().optional(),
  }),
});

export const collections = { projects, posts, work };
