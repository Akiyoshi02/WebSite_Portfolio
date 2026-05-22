// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Set SITE_URL in Netlify environment variables for production builds.
const SITE = process.env.SITE_URL ?? "https://akiyoshiyapa.netlify.app";

export default defineConfig({
  site: SITE,
  trailingSlash: "never",
  build: {
    inlineStylesheets: "auto",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    mdx(),
    sitemap({
      changefreq: "monthly",
      priority: 0.7,
      lastmod: new Date(),
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
