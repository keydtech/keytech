"use client";

import { Button } from "@/components/ui/Button";
import { getWhatsAppUrl } from "@/lib/constants";
import { motion } from "framer-motion";
import {
  AppWindow,
  Globe2,
  Layers3,
  MessageCircle,
  Settings2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const SERVICES = [
  { key: "odoo", icon: Settings2 },
  { key: "apps", icon: AppWindow },
  { key: "websites", icon: Globe2 },
  { key: "systems", icon: Layers3 },
] as const;

const VALUES = ["clarity", "reliability", "partnership"] as const;
const STATS = ["focus", "scope", "base"] as const;

export function AboutContent() {
  const t = useTranslations("About");

  return (
    <div className="relative overflow-hidden bg-atmosphere">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-teal/15 blur-3xl" />
        <div className="absolute right-[-4rem] top-40 h-80 w-80 rounded-[2rem] bg-navy/10 blur-3xl dark:bg-teal/10" />
        <div className="absolute bottom-24 left-1/3 h-40 w-40 rotate-12 rounded-3xl border border-teal/20" />
        <svg
          className="absolute right-8 top-28 hidden h-48 w-48 text-teal/25 lg:block"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="78" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="1.5" opacity="0.6">
            <animate
              attributeName="r"
              values="44;52;44"
              dur="6s"
              repeatCount="indefinite"
            />
          </circle>
          <rect
            x="70"
            y="70"
            width="60"
            height="60"
            rx="14"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      </div>

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {t("eyebrow")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              {t("title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-2xl text-base leading-relaxed text-muted-fg sm:text-lg"
            >
              {t("subtitle")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-muted-fg"
            >
              {t("story")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mt-4 max-w-2xl text-base leading-relaxed text-muted-fg"
            >
              {t("storySecondary")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-teal/30 via-transparent to-navy/20 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface/80 p-8 shadow-[0_30px_80px_-40px_rgba(10,37,64,0.55)]">
              <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-[#123456] p-8">
                <Image
                  src="/images/keydtech-logo-on-dark.png"
                  alt="KeydTech"
                  width={280}
                  height={120}
                  className="h-auto w-full max-w-[240px] object-contain"
                  priority
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {STATS.map((key, index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.06 }}
                    className="rounded-xl border border-border/80 bg-background/70 px-2 py-3 text-center"
                  >
                    <p className="font-display text-sm font-semibold text-teal sm:text-base">
                      {t(`stats.${key}.value`)}
                    </p>
                    <p className="mt-1 text-[0.65rem] leading-snug text-muted-fg sm:text-xs">
                      {t(`stats.${key}.label`)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative border-y border-border/60 bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("servicesTitle")}
            </h2>
            <p className="mt-3 text-muted-fg">{t("servicesSubtitle")}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {SERVICES.map(({ key, icon: Icon }, index) => (
              <motion.article
                key={key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-background/70 p-6"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal/10 transition group-hover:bg-teal/20" />
                <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal/12 text-navy dark:text-teal">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="relative mt-4 font-display text-lg font-semibold text-foreground">
                  {t(`services.${key}.title`)}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-fg">
                  {t(`services.${key}.description`)}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-teal/25 bg-gradient-to-br from-navy to-[#0d1f33] p-8 text-offwhite sm:p-10"
          >
            <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-teal/25 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-10 h-28 w-28 rotate-12 rounded-3xl border border-white/10" />
            <h2 className="relative font-display text-2xl font-semibold sm:text-3xl">
              {t("missionTitle")}
            </h2>
            <p className="relative mt-4 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {t("mission")}
            </p>
          </motion.div>

          <h3 className="mt-16 font-display text-2xl font-semibold text-foreground">
            {t("valuesTitle")}
          </h3>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {VALUES.map((value, index) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-border bg-surface/60 p-5"
              >
                <div className="mb-3 h-1.5 w-10 rounded-full bg-teal" />
                <h4 className="font-display text-base font-semibold text-foreground">
                  {t(`values.${value}.title`)}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                  {t(`values.${value}.description`)}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-surface/70 p-8 sm:flex-row sm:items-center"
          >
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                {t("ctaTitle")}
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-fg sm:text-base">
                {t("ctaSubtitle")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                {t("ctaWhatsApp")}
              </Button>
              <Button href="/contact" variant="secondary">
                {t("ctaContact")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
