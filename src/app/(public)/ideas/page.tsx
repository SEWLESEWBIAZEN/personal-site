import type { Metadata } from "next";
import { ideaRepository } from "@/server/repositories/idea";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Engineering notes, product concepts, and experiments worth exploring.",
  alternates: { canonical: "/ideas" },
};

export default async function IdeasPage() {
  const ideas = await ideaRepository.findPublic();

  return (
    <section className="section-wrap listing-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> IDEAS & EXPLORATIONS
          </div>
          <h1 className="page-title">
            Thinking <span className="serif-italic">space.</span>
          </h1>
        </div>
        <p className="section-aside">Quick thoughts, unfinished concepts, experiments, and things worth exploring.</p>
      </div>
      {ideas.length === 0 ? (
        <EmptyState message="NO PUBLIC IDEAS YET. THE THINKING SPACE IS WARMING UP." />
      ) : (
        <div className="idea-grid">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </section>
  );
}
