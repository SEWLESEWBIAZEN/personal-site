"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, BookText, Lightbulb, Image as ImageIcon, Settings, LogOut, ExternalLink, Moon, Sun } from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { useTheme } from "@/components/layout/ThemeProvider";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/journal", label: "Journal", icon: BookText },
  { href: "/admin/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggle } = useTheme();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link className="brand" href="/admin/dashboard">
            <span className="brand-mark">SB</span>
            <span className="brand-name">
              STUDIO ADMIN<span className="brand-period">.</span>
            </span>
          </Link>
          <p className="admin-subtitle">{email}</p>
        </div>
        <nav className="admin-sidebar-nav" aria-label="Admin">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`admin-sidebar-link${pathname.startsWith(href) ? " active" : ""}`}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid var(--line)", margin: "12px 0" }} />
          <Link href="/" target="_blank" className="admin-sidebar-link">
            <ExternalLink size={16} />
            View site
          </Link>
          <button type="button" onClick={toggle} className="admin-sidebar-link" style={{ border: 0, background: "none", cursor: "pointer", width: "100%" }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? "Light mode" : "Dark mode"}
          </button>
          <button type="button" onClick={handleLogout} className="admin-sidebar-link" style={{ border: 0, background: "none", cursor: "pointer", width: "100%" }}>
            <LogOut size={16} />
            Sign out
          </button>
        </nav>
      </aside>
      <nav className="admin-mobile-nav" aria-label="Admin">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={pathname.startsWith(href) ? "active" : undefined}>
            {label}
          </Link>
        ))}
        <button type="button" onClick={handleLogout}>
          Sign out
        </button>
      </nav>
    </>
  );
}
