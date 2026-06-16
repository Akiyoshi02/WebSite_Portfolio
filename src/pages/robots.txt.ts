import { getSiteConfig } from "@/config/site";

export async function GET() {
  const site = await getSiteConfig();

  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin-panel/",
      "Disallow: /admin-panel",
      "",
      // Politely ask AI training crawlers not to index this portfolio
      "User-agent: GPTBot",
      "Disallow: /",
      "",
      "User-agent: Google-Extended",
      "Disallow: /",
      "",
      "User-agent: CCBot",
      "Disallow: /",
      "",
      `Sitemap: ${site.url}/sitemap-index.xml`,
      "",
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
