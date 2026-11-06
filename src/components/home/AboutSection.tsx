import { Github, Linkedin, ArrowUpRight } from "lucide-react";

interface AboutSectionProps {
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  profileImage?: string | null;
}

export function AboutSection({ githubUrl, linkedinUrl, profileImage }: AboutSectionProps) {
  return (
    <section className="about-section section-wrap" id="about">
      <div className="about-top">
        <div className="eyebrow">
          <span className="eyebrow-line" /> 03 / A LITTLE ABOUT ME
        </div>
        <h2>
          Curiosity is my
          <br />
          <span className="serif-italic">operating system.</span>
        </h2>
      </div>
      <div className="about-content">
        <div className="about-visual">
          {profileImage ? (
            <div className="portrait-placeholder portrait-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profileImage} alt="Portrait of Sewlesew Biazen" loading="lazy" />
            </div>
          ) : (
            <div className="portrait-placeholder">
              <div className="portrait-monogram">
                S<span>.</span>
              </div>
              <span className="portrait-note">
                A WORK IN PROGRESS
                <br />
                LIKE EVERYTHING ELSE.
              </span>
              <span className="portrait-cross">&#10035;</span>
            </div>
          )}
          <span className="visual-caption">FIG. 02 — THE PERSON BEHIND THE BUILDS</span>
        </div>
        <div className="about-text">
          <p className="about-lead">
            I&apos;m a software engineer who enjoys working at the intersection of thoughtful engineering and useful products.
          </p>
          <p>
            My work spans full-stack development, enterprise applications, workflow automation, and AI-powered systems. I&apos;m
            interested in the details: how systems fit together, why a particular architecture makes sense, and how technology can
            make real work better.
          </p>
          <p>
            This site is where I keep a record of that process — the finished things, the messy middle, and the lessons in between.
          </p>
          {(githubUrl || linkedinUrl) && (
            <div className="social-links">
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github size={16} /> GITHUB <ArrowUpRight size={12} />
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Linkedin size={16} /> LINKEDIN <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
