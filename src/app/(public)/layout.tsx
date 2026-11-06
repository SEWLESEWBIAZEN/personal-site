import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { settingsRepository } from "@/server/repositories/settings";

// Rendered per request from PostgreSQL, so builds don't need a database and
// published changes appear immediately. Only published content is ever queried.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await settingsRepository.get();

  return (
    <ThemeProvider>
      <div className="site-shell">
        <Header location={settings.location} />
        <main id="home">{children}</main>
        <Footer location={settings.location} />
        <div className="scroll-progress" aria-hidden="true" />
      </div>
    </ThemeProvider>
  );
}
