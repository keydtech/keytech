import { ClientsGallery } from "@/components/clients/ClientsGallery";
import { CtaBand } from "@/components/home/CtaBand";
import { getPublishedClients } from "@/lib/clients";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("clientsTitle"),
    description: t("clientsDescription"),
  };
}

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const clients = await getPublishedClients().catch(() => []);

  return (
    <>
      <ClientsGallery clients={clients} />
      <CtaBand />
    </>
  );
}
