import { marked } from "marked";

export function renderMarkdown(markdown: string | null | undefined): string {
  return marked.parse(markdown ?? "", { async: false }) as string;
}
