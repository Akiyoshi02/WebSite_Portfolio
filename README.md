# Portfolio

Personal portfolio for Akiyoshi Yapa, built with Astro and deployed to Netlify.

## Tech Stack

- Astro
- TypeScript
- MDX content
- Leaflet for the contact map
- Formspree for the contact form
- Netlify for hosting

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Formspree form ID to `.env` as `PUBLIC_FORMSPREE_FORM_ID` to test contact submissions locally.

## Production Build

```bash
npm run build
npm run preview
```

The production output is generated in `dist`.

## Netlify Deployment

1. Connect this repository to [Netlify](https://app.netlify.com/).
2. Use these build settings (or rely on `netlify.toml`):

   | Setting | Value |
   |---------|--------|
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Node version | `22` |

3. Add environment variables under **Site configuration → Environment variables**:

   | Variable | Required | Purpose |
   |----------|----------|---------|
   | `SITE_URL` | Recommended | Canonical URL for sitemap, RSS, and Open Graph |
   | `PUBLIC_FORMSPREE_FORM_ID` | Required for contact form | Formspree endpoint ID |
   | `GH_TOKEN` | Optional | Live GitHub contribution heatmap at build time |

4. Deploy. Netlify rebuilds on each push to `main`.

Do not commit `.env`. Use Netlify environment variables for production.

## Formspree Setup

1. Sign up at [formspree.io](https://formspree.io/).
2. Create a new form and confirm your email address.
3. Copy the form ID from the endpoint URL (`https://formspree.io/f/YOUR_ID`).
4. Set `PUBLIC_FORMSPREE_FORM_ID=YOUR_ID` in `.env` locally and in Netlify for production.

Formspree sends email notifications on the free plan (with monthly submission limits).
