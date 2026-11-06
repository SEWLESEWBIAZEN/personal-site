import { highlightCodeBlocks } from "@/lib/highlight";

// HTML here was sanitized on write (server/services/content.ts); highlighting only
// adds span elements with hljs classes to escaped code text.
export function RichContent({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: highlightCodeBlocks(html) }} />;
}
