import { SectionHeading } from "@/components/ui/SectionHeading";
import { getTranslations, setRequestLocale } from "next-intl/server";

const VALUES = ["clarity", "reliability", "partnership"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  return (
    <section className="bg-atmosphere py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t("title")}
          subtitle={t("subtitle")}
          align="left"
          className="mx-0 max-w-3xl"
        />

        <p className="mt-10 max-w-3xl text-base leading-relaxed text-muted-fg sm:text-lg">
          {t("story")}
        </p>

        <div className="mt-14 max-w-3xl border-l-2 border-teal pl-6">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {t("missionTitle")}
          </h3>
          <p className="mt-2 text-muted-fg">{t("mission")}</p>
        </div>

        <h3 className="mt-16 font-display text-2xl font-semibold text-foreground">
          {t("valuesTitle")}
        </h3>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value}>
              <h4 className="font-display text-base font-semibold text-teal">
                {t(`values.${value}.title`)}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                {t(`values.${value}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
