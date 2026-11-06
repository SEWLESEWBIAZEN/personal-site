"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const nav = [
  { label: "Work", href: "/projects" },
  { label: "Journal", href: "/journal" },
  { label: "Ideas", href: "/ideas" },
  { label: "About", href: "/about" },
  { label: "Now", href: "/now" },
];

export function Header({ location }: { location?: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const pathname = usePathname();

  return (
    <>
      <div className="topline">
        <span>INDEPENDENT ENGINEERING STUDIO</span>
        <span className="topline-right">
          <i className="live-dot" /> OPEN TO INTERESTING COLLABORATIONS{" "}
          {location && <span className="topline-location">/ {location.toUpperCase()}</span>}
        </span>
      </div>
      <header className="header">
        <Link className="brand" href="/" aria-label="Sewlesew Biazen home">
          <span className="brand-mark">SB</span>
          <span className="brand-name">
            SEWLESEW BIAZEN<span className="brand-period">.</span>
          </span>
        </Link>
        <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button theme-button" aria-label="Toggle color theme" onClick={toggle}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link className="contact-pill" href="/#contact">
            LET&apos;S TALK <ArrowUpRight size={14} />
          </Link>
          <button
            className="icon-button menu-button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
