import { describe, expect, it } from "vitest";
import { sanitizeContent, withHeadingAnchors } from "@/lib/content";

const A = "/api/upload/11111111-1111-4111-8111-111111111111.png";

describe("sanitizeContent", () => {
  it("keeps editor formatting and uploaded images in place", () => {
    const html = `<h2>T</h2><p><strong>b</strong> <em>i</em> <a href="https://e.com">l</a></p><img src="${A}" alt="cap"><ul><li><p>x</p></li></ul><ol><li><p>y</p></li></ol><blockquote><p>q</p></blockquote>`;
    const out = sanitizeContent(html);
    expect(out).toContain(`<img src="${A}" alt="cap" />`);
    for (const tag of ["<h2>", "<strong>", "<em>", "<ul>", "<ol>", "<blockquote>"]) expect(out).toContain(tag);
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("keeps YouTube embeds from the nocookie host", () => {
    const out = sanitizeContent('<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/abc" width="640" height="360" allowfullscreen="true"></iframe></div>');
    expect(out).toContain("youtube-nocookie.com/embed/abc");
  });

  it("strips scripts, handlers and unsafe sources", () => {
    const out = sanitizeContent(`<p onclick="x()">a</p><script>alert(1)</script><img src="javascript:alert(1)"><img src="data:image/png;base64,AAA" onerror="x()"><iframe src="https://evil.example/x"></iframe><a href="javascript:alert(1)">x</a>`);
    expect(out).not.toMatch(/script|onclick|onerror|javascript:|data:|evil\.example/);
  });
});

describe("withHeadingAnchors", () => {
  it("adds unique ids and a toc", () => {
    const { html, toc } = withHeadingAnchors("<h2>Intro</h2><h3>Intro</h3>");
    expect(html).toContain('id="intro"');
    expect(toc.map((t) => t.id)).toEqual(["intro", "intro-1"]);
  });
});
