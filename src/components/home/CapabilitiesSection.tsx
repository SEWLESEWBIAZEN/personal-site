import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// What the studio builds. Kept to plain, verifiable descriptions of the kind of work —
// no client names, metrics or claims that the projects themselves do not back up.
const capabilities = [
  {
    title: "AI engineering",
    body: "Retrieval-augmented (RAG) applications, AI agents and assistants that sit inside real workflows — with evaluation, guardrails and sensible fallbacks.",
    keywords: ["RAG", "Agents", "LLM integration"],
    href: "/projects?category=ai-engineering",
  },
  {
    title: "Enterprise software",
    body: "Backend systems and business applications built around clear domain boundaries, secure access and data that stays consistent as they grow.",
    keywords: ["Backend", "SSO", "PostgreSQL"],
    href: "/projects?category=enterprise-systems",
  },
  {
    title: "Full-stack products",
    body: "SaaS platforms and digital products taken from a rough idea to a usable, deployable product — interface, API and database together.",
    keywords: ["Next.js", "React", "Node.js"],
    href: "/projects",
  },
  {
    title: "Workflow automation",
    body: "Turning repetitive, manual business processes into automated workflows, with people kept in the loop where judgement matters.",
    keywords: ["n8n", "Integrations", "Agents"],
    href: "/projects",
  },
  {
    title: "System integration",
    body: "APIs and integrations that connect existing systems reliably — contracts, retries, idempotency and the operational details in between.",
    keywords: ["APIs", "Distributed systems", "A2A"],
    href: "/journal?category=system-design",
  },
];

export function CapabilitiesSection() {
  return (
    <section className="capabilities-section section-wrap" id="capabilities" aria-labelledby="capabilities-title">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> 01 / WHAT I BUILD
          </div>
          <h2 id="capabilities-title">
            Software &amp; AI, <span className="serif-italic">end to end.</span>
          </h2>
        </div>
        <p className="section-aside">
          Building AI-powered products, enterprise applications, and intelligent automation systems — from first sketch to running software.
        </p>
      </div>
      <ol className="capability-list">
        {capabilities.map((c, i) => (
          <li key={c.title} className="capability-row">
            <span className="capability-index">{String(i + 1).padStart(2, "0")}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <div className="capability-tail">
              <span className="capability-keywords">{c.keywords.join(" / ")}</span>
              <Link href={c.href} aria-label={`Related work: ${c.title}`}>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </li>
        ))}
      </ol>
      <div className="work-foot">
        <span>HAVE A PROJECT IN MIND?</span>
        <Link href="#contact">
          LET&apos;S BUILD IT <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}
