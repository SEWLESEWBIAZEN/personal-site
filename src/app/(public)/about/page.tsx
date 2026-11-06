import type { Metadata } from "next";
import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";
import { settingsRepository } from "@/server/repositories/settings";

export const metadata: Metadata = {
  title: "About",
  description: "Software engineer exploring enterprise systems, AI engineering, and digital products.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const settings = await settingsRepository.get();
  return (
    <>
      <AboutSection githubUrl={settings.githubUrl} linkedinUrl={settings.linkedinUrl} profileImage={settings.profileImage} />
      <ContactSection email={settings.email} />
    </>
  );
}
