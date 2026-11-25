"use client";

import { useState } from "react";
import { ArrowUpRight, Copy, Check } from "lucide-react";

interface ContactSectionProps {
  email?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}

// Ways of working together. Described as offers, not as past engagements.
const engagements = [
  { title: "Build a product", body: "Take an idea or a defined scope to a working, deployable application." },
  { title: "Add AI to a system", body: "Design and build RAG features, agents or automations inside existing software." },
  { title: "Architecture & review", body: "A second pair of eyes on a design, a codebase or a scaling problem." },
  { title: "Collaborate", body: "Open-source work, research ideas or engineering experiments worth exploring." },
];

export function ContactSection({ email, githubUrl, linkedinUrl }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <section className="contact-section section-wrap" id="contact" aria-labelledby="contact-title">
      <div className="contact-kicker">
        <span className="eyebrow-line" /> WORK WITH THE STUDIO
      </div>
      <h2 id="contact-title">
        Have a challenging problem
        <br />
        <span className="serif-italic">or an idea worth building?</span>
      </h2>

      <ul className="engagement-list" aria-label="Ways to work together">
        {engagements.map((e, i) => (
          <li key={e.title}>
            <span className="capability-index">{String(i + 1).padStart(2, "0")}</span>
            <h3>{e.title}</h3>
            <p>{e.body}</p>
          </li>
        ))}
      </ul>

      <div className="contact-bottom">
        <p>
          Let&apos;s talk. Tell me what you&apos;re building, where it&apos;s stuck and what a good outcome looks like — I reply to every
          message, and I&apos;m happy to work across time zones.
        </p>
        <div className="contact-actions">
          {email && (
            <div className="contact-email">
              <a className="button-primary" href={`mailto:${email}?subject=${encodeURIComponent("Project enquiry")}`}>
                EMAIL ME <ArrowUpRight size={15} />
              </a>
              <button type="button" className="icon-button" onClick={copyEmail} aria-label={copied ? "Email address copied" : `Copy ${email}`} title={email}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
              <span className="sr-only" aria-live="polite">{copied ? "Email address copied" : ""}</span>
            </div>
          )}
          <div className="contact-social">
            {linkedinUrl && (
              <a className="text-link" href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                LINKEDIN <ArrowUpRight size={13} />
              </a>
            )}
            {githubUrl && (
              <a className="text-link" href={githubUrl} target="_blank" rel="noopener noreferrer">
                GITHUB <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
