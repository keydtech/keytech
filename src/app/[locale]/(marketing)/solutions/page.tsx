import { CtaBand } from "@/components/home/CtaBand";
import { SolutionsGrid } from "@/components/home/SolutionsGrid";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("solutionsTitle"),
    description: t("solutionsDescription"),
  };
}

export default async function SolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SolutionsGrid showViewAll={false} />
      <CtaBand />
    </>
  );
}
