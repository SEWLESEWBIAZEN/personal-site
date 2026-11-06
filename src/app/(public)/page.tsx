import { HeroSection } from "@/components/home/HeroSection";
import { TickerSection } from "@/components/home/TickerSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { JournalSection } from "@/components/home/JournalSection";
import { IdeasSection } from "@/components/home/IdeasSection";
import { AboutSection } from "@/components/home/AboutSection";
import { NowSection } from "@/components/home/NowSection";
import { ContactSection } from "@/components/home/ContactSection";
import { JsonLd } from "@/components/ui/JsonLd";
import { projectRepository } from "@/server/repositories/project";
import { journalRepository } from "@/server/repositories/journal";
import { ideaRepository } from "@/server/repositories/idea";
import { settingsRepository } from "@/server/repositories/settings";
import { nowRepository } from "@/server/repositories/now";
import { absoluteUrl } from "@/lib/utils";

export default async function HomePage() {
  const [projects, articles, ideas, settings, nowItems] = await Promise.all([
    projectRepository.findFeatured(5),
    journalRepository.findRecent(4),
    ideaRepository.findPublic(3),
    settingsRepository.get(),
    nowRepository.findActive(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Sewlesew Biazen",
          jobTitle: "Software Engineer",
          url: absoluteUrl("/"),
          ...(settings.location ? { address: settings.location } : {}),
          sameAs: [settings.githubUrl, settings.linkedinUrl].filter(Boolean),
        }}
      />
      <HeroSection introduction={settings.introduction} />
      <TickerSection />
      <ProjectsSection projects={projects} />
      <JournalSection articles={articles} />
      <IdeasSection ideas={ideas} />
      <AboutSection githubUrl={settings.githubUrl} linkedinUrl={settings.linkedinUrl} profileImage={settings.profileImage} />
      <NowSection items={nowItems} />
      <ContactSection email={settings.email} />
    </>
  );
}
