import { ArrowUpRight, Sparkles, Layers3, Terminal, BookOpen, Compass, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface NowItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  updatedAt: Date;
}

const icons: [string, LucideIcon][] = [
  ["ai", Sparkles],
  ["architecture", Layers3],
  ["product", Terminal],
  ["learning", BookOpen],
];

function iconFor(category: string | null): LucideIcon {
  const key = category?.toLowerCase() ?? "";
  return icons.find(([k]) => key.includes(k))?.[1] ?? Compass;
}

export function NowSection({ items }: { items: NowItem[] }) {
  const lastUpdated = items.reduce<Date | null>((max, i) => (!max || i.updatedAt > max ? i.updatedAt : max), null);

  return (
    <section className="now-section" id="now">
      <div className="section-wrap now-inner">
        <div className="now-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> 04 / CURRENTLY EXPLORING
            </div>
            <h2>
              On the <span className="serif-italic">workbench.</span>
            </h2>
          </div>
          {lastUpdated && (
            <div className="now-status">
              <i className="live-dot" /> UPDATED{" "}
              {lastUpdated.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()}
            </div>
          )}
        </div>
        {items.length === 0 ? (
          <EmptyState message="NOTHING ON THE WORKBENCH RIGHT NOW." />
        ) : (
          <div className="focus-grid">
            {items.map((item, i) => {
              const Icon = iconFor(item.category);
              return (
                <div className="focus-item" key={item.id}>
                  <div className="focus-top">
                    <span>
                      {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                    <Icon size={19} />
                  </div>
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                  <span className="focus-arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
