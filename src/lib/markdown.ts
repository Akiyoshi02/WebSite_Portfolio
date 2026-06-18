import { Marked, type Tokens } from "marked";
import { normalizeLinkUrl, normalizePublicAssetUrl } from "@/lib/safeUrl";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function titleAttribute(title: string | null | undefined): string {
  return title ? ` title="${escapeHtml(title)}"` : "";
}

const safeMarked = new Marked<string, string>({
  async: false,
  gfm: true,
  breaks: false,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens) as string;
      const safeHref = normalizeLinkUrl(href);
      if (!safeHref) return text;
      return `<a href="${escapeHtml(safeHref)}"${titleAttribute(title)}>${text}</a>`;
    },
    image({ href, title, text }: Tokens.Image) {
      const safeSrc = normalizePublicAssetUrl(href);
      if (!safeSrc) return escapeHtml(text);
      return `<img src="${escapeHtml(safeSrc)}" alt="${escapeHtml(text)}"${titleAttribute(title)} loading="lazy" decoding="async">`;
    },
  },
});

export function renderMarkdown(markdown: string | null | undefined): string {
  return safeMarked.parse(markdown ?? "", { async: false });
}
