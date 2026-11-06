"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function ContactSection({ email }: { email?: string | null }) {
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
    <section className="contact-section section-wrap" id="contact">
      <div className="contact-kicker">
        <span className="eyebrow-line" /> HAVE SOMETHING INTERESTING IN MIND?
      </div>
      <h2>
        Let&apos;s make
        <br />
        <span className="serif-italic">something useful.</span>
      </h2>
      <div className="contact-bottom">
        <p>
          Good ideas get better when they&apos;re shared. If you&apos;re building something, exploring an idea, or simply want to
          talk engineering — my inbox is open.
        </p>
        {email && (
          <button className="button-primary" onClick={copyEmail} aria-live="polite">
            {copied ? "EMAIL COPIED" : "SAY HELLO"} {copied ? <span aria-hidden="true">&#10003;</span> : <ArrowUpRight size={15} />}
          </button>
        )}
      </div>
    </section>
  );
}
