# 💼 Akiyoshi Yapa — Portfolio

**Version 0.1.0 — Personal site & project showcase**

A production-ready portfolio for **Akiyoshi Yapa**, built with **Astro**, **TypeScript**, and **MDX**. The site presents work experience, education, featured projects, writing, and a contact flow in a single polished experience. Content is driven by Astro content collections, with SEO metadata, RSS, and a sitemap generated at build time.

The live site is deployed on **Netlify**. Contact submissions are delivered by email through a **Netlify Function** and your **SMTP** provider (no third-party form branding).

[![Live on Netlify](https://img.shields.io/badge/Live%20Site-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://akiyoshiyapa.netlify.app)

---

## 🧭 Site Overview

- Single-page home with anchored sections (About, Skills, Projects, Experience, Education, Recommendations, Writing, Contact)
- Dedicated routes for **project case studies**, **blog posts**, **Uses**, and **Now**
- Dark / light theme with persisted preference and smooth view transitions
- Build-time GitHub contribution preview on the Skills section (optional token)
- Interactive contact map (Leaflet) and validated contact form with custom subject picker
- Downloadable CV, social links, and structured data for search engines

---

## 🧩 Feature Summary

| Category | Description |
|----------|-------------|
| 🖥️ **Frontend** | Astro 6 static site with component islands, global CSS design system, responsive layout, custom preloader, scroll progress, and optional custom pointer styling on desktop. |
| 📝 **Content** | MDX-powered collections for **projects**, **posts**, and **work history**; case-study layouts with tech tags, links, and featured flags. |
| 🔍 **SEO & Discovery** | Per-page meta tags, Open Graph, JSON-LD `Person` schema, `sitemap.xml`, and RSS feed (`/rss.xml`). |
| 🗂️ **Projects** | Filterable project grid (All, Web Apps, Mobile, APIs, Open Source) with deep-dive pages per project. |
| 📰 **Writing** | Blog index and post layout with reading time and publication dates. |
| 🛠️ **Uses / Now** | Standalone pages for tooling preferences and current focus. |
| 🗺️ **Contact** | Leaflet map for location context; SMTP-backed form via `netlify/functions/contact` with validation, honeypot, and toast feedback. |
| ⚙️ **Configuration** | Central `src/config/site.ts` for name, URL, nav, socials, and availability status. |
| 🚀 **Deployment** | `netlify.toml` defines build (`npm run build`) and publish directory (`dist`); Node 22 via `.nvmrc`. |

---

## 🛠️ Setup / Run

### Prerequisites

- **Node.js 22** (see `.nvmrc`)
- **npm**

### 1. Clone the repository

```bash
git clone https://github.com/Akiyoshi02/WebSite_Portfolio.git
cd WebSite_Portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `SITE_URL` | Recommended | Canonical URL for sitemap, RSS, and Open Graph (e.g. `https://akiyoshiyapa.netlify.app`) |
| `GH_TOKEN` | Optional | Live GitHub contribution data during `npm run build` |
| `PUBLIC_SUPABASE_URL` | Yes for CMS/admin | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Yes for CMS/admin | Supabase anonymous key |
| `PUBLIC_ADMIN_EMAILS` | Yes for admin | Comma-separated emails allowed through the admin UI check |
| `ADMIN_EMAILS` | Recommended | Server-side comma-separated admin emails allowed to trigger rebuilds |
| `NETLIFY_BUILD_HOOK_URL` | Optional | Server-side Netlify build hook used by `/api/rebuild` |

**SMTP variables** (server-side only - set in Netlify, not prefixed with `PUBLIC_`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `SMTP_HOST` | Yes | Mail server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | No | Port (default `587`; use `465` with `SMTP_SECURE=true`) |
| `SMTP_SECURE` | No | `true` for TLS on port 465 |
| `SMTP_USER` | Yes | SMTP username / login |
| `SMTP_PASS` | Yes | SMTP password or app password |
| `SMTP_FROM` | Yes | From address (must be allowed by your provider) |
| `CONTACT_TO_EMAIL` | No | Inbox for submissions (defaults to `akiyoshiyapa@gmail.com`) |

Do **not** commit `.env`.

### 4. Start the dev server

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:3000`).

For admin password recovery, add the local and production reset URLs to Supabase Auth redirect URLs, for example `http://localhost:3000/admin-panel/reset-password` and `https://your-site.example/admin-panel/reset-password`. Recovery links that land on the site root are forwarded to `/admin-panel/reset-password`.

Admin write access is enforced by Supabase RLS, not just the browser UI. Apply the latest SQL in `supabase/`, then keep `public.admin_users` limited to trusted admin email addresses.

### 5. Production build & preview

```bash
npm run build
npm run preview
```

Output is written to `dist/`.

---

## 🚀 Deployment (Netlify)

1. Connect this repository in the [Netlify dashboard](https://app.netlify.com/).
2. Confirm build settings (or use `netlify.toml`):

   | Setting | Value |
   |---------|--------|
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Node version | `22` |

3. Add environment variables under **Site configuration → Environment variables** (including all SMTP variables above).
4. Deploy from `main`; Netlify rebuilds on each push.

### Test the contact form locally

`npm run dev` does not run Netlify Functions. Use the Netlify CLI:

```bash
npx netlify dev
```

Then open the URL shown (usually `http://localhost:8888`) and submit the form.

---

## 📬 Contact Form (SMTP)

1. Choose an SMTP provider (Gmail with an [app password](https://support.google.com/accounts/answer/185833), Outlook, Zoho, or your domain host).
2. Add the SMTP variables to Netlify (and to `.env` when using `netlify dev`).
3. Ensure `SMTP_FROM` is an address your provider allows you to send from.

The browser posts JSON to `/.netlify/functions/contact`. The function validates input, ignores honeypot spam, and sends a plain-text email with **Reply-To** set to the visitor’s address.

---

## 📂 Project Structure

```
├── public/              # Static assets (favicon, CV, logos, images)
├── src/
│   ├── components/      # UI components & page sections
│   ├── config/          # Site-wide metadata (site.ts)
│   ├── content/         # MDX: projects, posts, work
│   ├── data/            # Tech stack, testimonials, GitHub activity
│   ├── layouts/         # Base, Post, CaseStudy
│   ├── pages/           # Routes (index, blog, projects, uses, now)
│   ├── scripts/         # Client JS (form, theme, interactions)
│   └── styles/          # Global CSS
├── netlify/
│   └── functions/       # Serverless contact handler (SMTP)
├── astro.config.mjs
├── netlify.toml
└── package.json
```

---

## 🌟 Featured Projects (in site content)

| Project | Summary |
|---------|---------|
| **InterviewAI Pro** | AI-driven interview preparation and screening platform |
| **CleanOps Pro** | Commercial cleaning operations (scheduling, attendance, invoicing) |
| **FoneCove Mobile Store** | Frontend e-commerce experience for a mobile retailer |
| **Banana Blitz** | Browser puzzle game with multiplayer and daily challenges |

Case studies live under `/projects/[slug]` and are sourced from `src/content/projects/`.

---

## 📦 Dependencies & Tooling

### Core

| Package | Role |
|---------|------|
| [Astro](https://astro.build/) | Static site framework |
| [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) | MDX content |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | Sitemap generation |
| [@astrojs/rss](https://docs.astro.build/en/guides/rss/) | RSS feed |
| [TypeScript](https://www.typescriptlang.org/) | Type checking |
| [Leaflet](https://leafletjs.com/) | Contact section map |
| [Sharp](https://sharp.pixelplumbing.com/) | Image optimization at build time |
| [lightningcss](https://lightningcss.dev/) | CSS minification (Vite) |

### External services

- **Netlify** — hosting, functions, and deploys  
- **SMTP mail provider** — outbound contact email (Gmail, Outlook, domain host, etc.)  
- **GitHub API** — optional contribution heatmap (build-time)

---

## 📄 License & Usage

This repository is a **personal portfolio**. Project write-ups and assets reflect real work and study; please do not reuse branding or copy without permission.

---

_Updated: 2026-05-22_
