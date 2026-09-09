import { ClientsShowcase } from "@/components/home/ClientsShowcase";
import { CtaBand } from "@/components/home/CtaBand";
import { Hero } from "@/components/home/Hero";
import { Process } from "@/components/home/Process";
import { SolutionsGrid } from "@/components/home/SolutionsGrid";
import { WhyKeydTech } from "@/components/home/WhyKeydTech";
import { getPublishedClients, getSiteStats } from "@/lib/clients";
import { setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [clients, stats] = await Promise.all([
    getPublishedClients().catch(() => []),
    getSiteStats().catch(() => ({
      yearsExperience: 8,
      projectsCompleted: 48,
      expertsOnTeam: 12,
      clientsCount: 0,
    })),
  ]);

  return (
    <>
      <Hero />
      <SolutionsGrid />
      <ClientsShowcase clients={clients} stats={stats} />
      <WhyKeydTech />
      <Process />
      <CtaBand />
    </>
  );
}
