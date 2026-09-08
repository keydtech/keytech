import { CtaBand } from "@/components/home/CtaBand";
import { Hero } from "@/components/home/Hero";
import { Process } from "@/components/home/Process";
import { SolutionsGrid } from "@/components/home/SolutionsGrid";
import { WhyKeydTech } from "@/components/home/WhyKeydTech";
import { setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <SolutionsGrid />
      <WhyKeydTech />
      <Process />
      <CtaBand />
    </>
  );
}
