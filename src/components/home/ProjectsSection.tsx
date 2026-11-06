"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { ProjectCardBody, type ProjectCardData } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";

const ALL = "ALL WORK";

export function ProjectsSection({ projects }: { projects: ProjectCardData[] }) {
  const [activeFilter, setActiveFilter] = useState(ALL);
  const categories = [ALL, ...new Set(projects.flatMap((p) => (p.category ? [p.category.name.toUpperCase()] : [])))];
  const visible = activeFilter === ALL ? projects : projects.filter((p) => p.category?.name.toUpperCase() === activeFilter);

  return (
    <section className="work-section section-wrap" id="work">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> 01 / SELECTED WORK
          </div>
          <h2>
            Made with <span className="serif-italic">intention.</span>
          </h2>
        </div>
        <p className="section-aside">A selection of products, systems, and experiments. Each one taught me something worth keeping.</p>
      </div>

      {projects.length === 0 ? (
        <EmptyState message="NEW WORK IS ON THE WORKBENCH. CHECK BACK SOON." />
      ) : (
        <>
          {categories.length > 2 && (
            <div className="filter-row" role="group" aria-label="Filter projects">
              {categories.map((f) => (
                <button
                  key={f}
                  className={activeFilter === f ? "filter active" : "filter"}
                  aria-pressed={activeFilter === f}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          <div className="project-grid">
            {visible.map((project, i) => (
              <motion.article
                layout
                key={project.id}
                className={`project-card${i === 0 ? " project-01" : ""}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <ProjectCardBody project={project} index={i} />
              </motion.article>
            ))}
          </div>
        </>
      )}

      <div className="work-foot">
        <span>MORE WORK IS ALWAYS IN PROGRESS.</span>
        <Link href="/projects">
          VIEW ALL WORK <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}
