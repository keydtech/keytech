"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const STEPS = ["discover", "configure", "train", "grow"] as const;

export function Process() {
  const t = useTranslations("Process");

  return (
    <section
      id="process"
      className="scroll-mt-28 border-y border-border bg-muted/60 py-20 sm:py-24"
      aria-labelledby="process-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="process-title"
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <ol className="mt-14 grid gap-8 md:grid-cols-4">
          {STEPS.map((step, index) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="relative"
            >
              <span className="font-display text-4xl font-bold text-teal/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                {t(`steps.${step}.description`)}
              </p>
              {index < STEPS.length - 1 ? (
                <span
                  className="pointer-events-none absolute top-6 right-0 hidden h-px w-1/3 bg-gradient-to-r from-teal/50 to-transparent md:block"
                  aria-hidden
                />
              ) : null}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
