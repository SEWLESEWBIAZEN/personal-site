import "server-only";
import { common, createLowlight } from "lowlight";
import { toHtml } from "hast-util-to-html";

const lowlight = createLowlight(common);

function decodeEntities(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&");
}

// Replaces <pre><code class="language-x">…</code></pre> blocks with highlighted markup.
// lowlight escapes text nodes, so the output stays safe.
export function highlightCodeBlocks(html: string): string {
  return html.replace(
    /<pre><code(?: class="language-([\w+#-]+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_m, lang: string | undefined, code: string) => {
      const source = decodeEntities(code);
      try {
        const tree = lang && lowlight.registered(lang) ? lowlight.highlight(lang, source) : lowlight.highlightAuto(source);
        const cls = lang ? ` class="hljs language-${lang}"` : ` class="hljs"`;
        return `<pre><code${cls}>${toHtml(tree)}</code></pre>`;
      } catch {
        return _m;
      }
    },
  );
}
