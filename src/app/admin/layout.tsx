import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  robots: { index: false, follow: false },
};

// Middleware blocks unauthenticated access to everything except /admin/login,
// and every page and mutation re-checks the session on the server.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <ThemeProvider>
      {isAdmin ? (
        <div className="admin-shell">
          <AdminSidebar email={session.user.email ?? ""} />
          <div className="admin-main">{children}</div>
        </div>
      ) : (
        children
      )}
    </ThemeProvider>
  );
}
