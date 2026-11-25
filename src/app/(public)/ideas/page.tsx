import Link from "next/link";
import type { Metadata } from "next";
import { ideaRepository } from "@/server/repositories/idea";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Product concepts, technical explorations and architectural possibilities worth building.",
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
        <p className="section-aside">Product concepts, technical explorations and architectural possibilities — things that might be worth building next. Each idea is marked with how far it has got. Notes from real builds live in the <Link href="/journal" className="inline-link">Journal</Link>.</p>
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
