import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getWhatsAppUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check, MessageCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

const PLANS = ["starter", "growth", "enterprise"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("pricingTitle"),
    description: t("pricingDescription"),
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");

  return (
    <section className="bg-atmosphere py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <p className="mt-4 text-center text-sm font-semibold text-teal">
          {t("demoBadge")}
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const features = t.raw(`plans.${plan}.features`) as string[];
            const highlighted = plan === "growth";

            return (
              <article
                key={plan}
                className={cn(
                  "flex flex-col rounded-2xl border p-6 sm:p-8",
                  highlighted
                    ? "border-teal/60 bg-surface shadow-[0_20px_50px_rgba(0,212,178,0.12)]"
                    : "border-border bg-surface/50",
                )}
              >
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {t(`plans.${plan}.name`)}
                </h2>
                <p className="mt-2 text-2xl font-bold text-navy dark:text-teal">
                  {t(`plans.${plan}.price`)}
                </p>
                <p className="mt-3 text-sm text-muted-fg">
                  {t(`plans.${plan}.description`)}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant={highlighted ? "whatsapp" : "secondary"}
                  className="mt-8"
                >
                  {highlighted ? (
                    <MessageCircle className="h-4 w-4" aria-hidden />
                  ) : null}
                  {t("cta")}
                </Button>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-fg">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
