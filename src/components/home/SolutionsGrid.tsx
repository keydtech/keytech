"use client";

import { SolutionIcon } from "@/components/icons/SolutionIcons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { SOLUTION_IDS, type SolutionId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

type SolutionsGridProps = {
  showViewAll?: boolean;
  limit?: number;
};

export function SolutionsGrid({
  showViewAll = true,
  limit,
}: SolutionsGridProps) {
  const t = useTranslations("Solutions");
  const ids = limit ? SOLUTION_IDS.slice(0, limit) : SOLUTION_IDS;
  const [active, setActive] = useState<SolutionId | null>(ids[0] ?? null);

  return (
    <section
      id="solutions"
      className="relative scroll-mt-28 bg-muted/80 py-20 sm:py-24"
      aria-labelledby="solutions-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="solutions-title"
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ids.map((id, index) => {
            const features = t.raw(`items.${id}.features`) as string[];
            const isActive = active === id;

            return (
              <motion.article
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => setActive(id)}
                  onMouseEnter={() => setActive(id)}
                  onFocus={() => setActive(id)}
                  className={cn(
                    "group flex h-full w-full flex-col rounded-2xl border p-6 text-left transition-all duration-300",
                    isActive
                      ? "border-teal/50 bg-surface shadow-[0_16px_40px_rgba(10,37,64,0.08)] dark:bg-surface dark:shadow-[0_16px_40px_rgba(0,212,178,0.08)]"
                      : "border-border bg-surface/40 hover:border-teal/30",
                  )}
                >
                  <span
                    className={cn(
                      "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                      isActive
                        ? "bg-teal/15 text-navy dark:text-teal"
                        : "bg-muted text-navy dark:text-offwhite",
                    )}
                  >
                    <SolutionIcon id={id} className="h-8 w-8" />
                  </span>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                    {t(`items.${id}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-fg">
                    {t(`items.${id}.description`)}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="text-xs font-medium text-teal"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              </motion.article>
            );
          })}
        </div>

        {showViewAll ? (
          <div className="mt-10 text-center">
            <Link
              href="/solutions"
              className="text-sm font-semibold text-navy underline-offset-4 transition-colors hover:text-teal hover:underline dark:text-teal"
            >
              {t("viewAll")}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
