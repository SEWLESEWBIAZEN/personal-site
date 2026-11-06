import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { IdeaCard, type IdeaCardData } from "@/components/ideas/IdeaCard";

export function IdeasSection({ ideas }: { ideas: IdeaCardData[] }) {
  if (ideas.length === 0) return null;

  return (
    <section className="ideas-section section-wrap" id="ideas">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> IDEAS / UNFINISHED THINKING
          </div>
          <h2>
            Worth <span className="serif-italic">exploring.</span>
          </h2>
        </div>
        <p className="section-aside">Early concepts, experiments, and questions I keep coming back to.</p>
      </div>
      <div className="idea-grid">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
      <div className="work-foot">
        <span>SOME OF THESE WILL BECOME PROJECTS.</span>
        <Link href="/ideas">
          ALL IDEAS <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}
