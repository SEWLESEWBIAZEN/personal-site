import type { Metadata } from "next";
import { NowSection } from "@/components/home/NowSection";
import { nowRepository } from "@/server/repositories/now";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm currently working on and exploring.",
  alternates: { canonical: "/now" },
};

export default async function NowPage() {
  const items = await nowRepository.findActive();
  return <NowSection items={items} />;
}
