import { KeydAppContent } from "@/components/keyd-app/KeydAppContent";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("keydAppTitle"),
    description: t("keydAppDescription"),
  };
}

export default async function KeydAppPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <KeydAppContent />;
}
