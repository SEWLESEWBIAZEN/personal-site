"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

interface HeroSectionProps {
  introduction?: string | null;
}

export function HeroSection({ introduction }: HeroSectionProps) {
  return (
    <section className="hero section-wrap">
      <div className="hero-copy">
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="eyebrow-line" /> SOFTWARE ENGINEER / BUILDER / EXPLORER
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
        >
          I build software
          <br />
          that <span className="serif-italic">moves</span>
          <span className="blue-period">.</span>
          <br />
          <span className="muted-heading">
            And share what
            <br />I learn along the way.
          </span>
        </motion.h1>
        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p className="hero-intro">
            {introduction ||
              "I'm Sewlesew — a software engineer exploring enterprise systems, AI engineering, and digital products. This is my corner of the internet to build, document, and explore."}
          </p>
          <div className="hero-links">
            <Link className="button-primary" href="/projects">
              EXPLORE MY WORK <ArrowUpRight size={15} />
            </Link>
            <Link className="text-link" href="/journal">
              READ THE JOURNAL <ArrowDownRight size={15} />
            </Link>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="hero-art"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="art-top">
          <span>FIELD NOTES / 001</span>
          <span>BUILDING IN PROGRESS</span>
        </div>
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />
        <div className="art-center">
          <div className="core-ring">
            <span>
              SB<span className="blue-period">.</span>
            </span>
          </div>
          <span className="core-caption">IDEAS &rarr; SYSTEMS</span>
        </div>
        <div className="orbit-label label-a">
          <span className="label-dot blue-dot" /> AI SYSTEMS
        </div>
        <div className="orbit-label label-b">
          <span className="label-dot green-dot" /> PRODUCT
        </div>
        <div className="orbit-label label-c">
          <span className="label-dot orange-dot" /> ENGINEERING
        </div>
        <div className="art-coordinate coord-a">
          09&deg;01&prime; N
          <br />
          38&deg;45&prime; E
        </div>
        <div className="art-coordinate coord-b">FIG. 01 — ITERATION</div>
        <div className="art-bottom">
          <span>CURIOUS BY DEFAULT</span>
          <span>SCROLL TO EXPLORE &darr;</span>
        </div>
      </motion.div>
      <div className="hero-index">
        <span>01 — 04</span>
        <span>PERSONAL ENGINEERING JOURNAL</span>
      </div>
    </section>
  );
}
