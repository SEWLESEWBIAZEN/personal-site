import type { TocEntry } from "@/lib/content";

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;
  return (
    <nav className="toc" aria-label="Table of contents">
      <p className="aside-label">ON THIS PAGE</p>
      <ol>
        {entries.map((e) => (
          <li key={e.id} className={e.level === 3 ? "toc-sub" : undefined}>
            <a href={`#${e.id}`}>{e.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
