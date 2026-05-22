import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { site } from "@/config/site";

export async function GET(context: APIContext) {
  const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  return rss({
    title: `${site.name} | Writing`,
    description: `Essays and engineering notes by ${site.name}.`,
    site: context.site?.toString() ?? site.url,
    items: posts.map((post) => {
      const slug = post.id.replace(/\.(md|mdx)$/, "");
      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${slug}`,
        categories: post.data.tags,
      };
    }),
    customData: `<language>${site.locale.toLowerCase()}</language>`,
  });
}
