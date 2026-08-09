"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { motion } from "framer-motion";
import { Headphones, MapPinned, Rocket, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";

const ITEMS = [
  { key: "local", icon: MapPinned },
  { key: "odoo", icon: Settings2 },
  { key: "speed", icon: Rocket },
  { key: "support", icon: Headphones },
] as const;

export function WhyKeydTech() {
  const t = useTranslations("Why");

  return (
    <section
      id="why"
      className="scroll-mt-28 py-20 sm:py-24"
      aria-labelledby="why-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="why-title"
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, icon: Icon }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="relative"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal/12 text-navy dark:text-teal">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                {t(`items.${key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
