// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// Set SITE_URL in Netlify environment variables for production builds.
const SITE = process.env.SITE_URL ?? "https://akiyoshiyapa.netlify.app";

export default defineConfig({
  site: SITE,
  trailingSlash: "never",
  server: {
    port: 3000,
  },
  build: {
    inlineStylesheets: "auto",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    mdx(),
    react(),
    sitemap({
      changefreq: "monthly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes("/admin-panel"),
    }),
  ],
  image: {
    responsiveStyles: true,
  },
  vite: {
    build: {
      cssMinify: "lightningcss",
    },
  },
});
