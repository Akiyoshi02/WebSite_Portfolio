import rss from "@astrojs/rss";
import { getSiteConfig } from "@/config/site";
import { getBlogPosts } from "@/lib/content";

export async function GET() {
  const site = await getSiteConfig();
  const posts = await getBlogPosts();

  return rss({
    title: `${site.name} | Writing`,
    description: `Essays and engineering notes by ${site.name}.`,
    site: site.url,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.pub_date),
      description: post.description,
      link: `/blog/${post.slug}`,
      categories: post.tags,
    })),
    customData: `<language>${site.locale.toLowerCase()}</language>`,
  });
}
