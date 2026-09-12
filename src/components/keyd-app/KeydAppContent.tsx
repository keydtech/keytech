"use client";

import { Button } from "@/components/ui/Button";
import {
  getKeydAppWhatsAppUrl,
  KEYD_APP_APK_URL,
  KEYD_APP_PLAY_URL,
  KEYD_APP_STORE_URL,
} from "@/lib/constants";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Calculator,
  Download,
  MessageCircle,
  Package,
  ShieldCheck,
  Settings2,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";
import { useTranslations } from "next-intl";

const MODULES = [
  { key: "sales", icon: ShoppingCart },
  { key: "purchase", icon: Truck },
  { key: "accounting", icon: Calculator },
  { key: "expense", icon: Wallet },
  { key: "inventory", icon: Package },
  { key: "settings", icon: Settings2 },
] as const;

const HOW_STEPS = [
  { key: "register", icon: Smartphone },
  { key: "approve", icon: BadgeCheck },
  { key: "trial", icon: Store },
  { key: "subscribe", icon: Wallet },
] as const;

const AUDIENCE = [
  { key: "retail", icon: Store },
  { key: "wholesale", icon: Building2 },
  { key: "teams", icon: Users },
] as const;

function StoreBadge({
  store,
  href,
  label,
}: {
  store: "google" | "apple";
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target={href === "#" ? undefined : "_blank"}
      rel={href === "#" ? undefined : "noopener noreferrer"}
      aria-label={label}
      className="group inline-flex min-h-[2.75rem] items-center gap-2.5 rounded-lg border border-border bg-surface/80 px-3 py-2 shadow-sm transition-all duration-300 hover:border-teal/50 hover:shadow-[0_12px_32px_-12px_rgba(0,212,178,0.35)] sm:min-h-[3rem] sm:px-4"
    >
      {store === "google" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
          <path
            fill="#4285F4"
            d="M3.6 1.8A2.4 2.4 0 0 0 2 4.1v15.8a2.4 2.4 0 0 0 1.6 2.3l8.4-8.4-8.4-8.4Z"
          />
          <path
            fill="#34A853"
            d="M16.8 10.1 5.2 21.7a2.4 2.4 0 0 0 3.4 0l8.2-8.2-8.2-8.2Z"
          />
          <path
            fill="#FBBC04"
            d="M21.8 10.8a2.2 2.2 0 0 0 0-3.6l-5-2.9-3.4 3.4 8.4 3.1Z"
          />
          <path
            fill="#EA4335"
            d="M5.2 2.3 13.4 10.5l3.4-3.4L8.6 1.4A2.4 2.4 0 0 0 5.2 2.3Z"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-foreground"
          fill="currentColor"
          aria-hidden
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
        </svg>
      )}
      <span className="text-left leading-tight">
        <span className="block text-[0.6rem] uppercase tracking-wide text-muted-fg">
          {store === "google" ? "Google Play" : "App Store"}
        </span>
        <span className="block text-xs font-semibold text-foreground group-hover:text-teal sm:text-sm">
          {label}
        </span>
      </span>
    </a>
  );
}

function PhoneVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-teal/25 via-transparent to-navy/20 blur-2xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-b from-navy to-[#0d1f33] p-3 shadow-[0_40px_80px_-40px_rgba(10,37,64,0.65)]"
      >
        <div className="rounded-[1.5rem] border border-white/10 bg-[#0f1828] p-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[0.65rem] font-medium text-slate-400">9:41</span>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-teal/80" />
              <span className="h-2 w-2 rounded-full bg-teal/40" />
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="font-display text-2xl font-bold">
              <span className="text-offwhite">Keyd</span>
              <span className="text-teal"> App</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">ERP · Somali shops</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {["Sales", "Stock", "Bills", "Pay"].map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="rounded-xl border border-white/8 bg-white/5 px-3 py-3 text-center"
              >
                <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-teal/15" />
                <span className="text-[0.7rem] font-medium text-slate-300">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="mt-5 rounded-xl bg-teal/15 px-3 py-2 text-center text-[0.7rem] font-semibold text-teal"
          >
            Mobile money · EVC / Zaad
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function KeydAppContent() {
  const t = useTranslations("KeydApp");

  return (
    <div className="relative overflow-hidden bg-atmosphere">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-teal/15 blur-3xl" />
        <div className="absolute right-[-4rem] top-40 h-80 w-80 rounded-[2rem] bg-navy/10 blur-3xl dark:bg-teal/10" />
        <div className="absolute bottom-40 left-1/3 h-64 w-64 rounded-full bg-navy/8 blur-3xl dark:bg-teal/5" />
      </div>

      {/* Hero */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal"
            >
              <Smartphone className="h-4 w-4" aria-hidden />
              {t("eyebrow")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="text-navy dark:text-offwhite">Keyd</span>
              <span className="text-teal"> App</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-xl text-base leading-relaxed text-muted-fg sm:text-lg"
            >
              {t("subtitle")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="mt-4 max-w-xl text-base leading-relaxed text-muted-fg"
            >
              {t("description")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-2 text-sm font-semibold text-navy dark:text-teal"
            >
              <span className="h-2 w-2 rounded-full bg-teal" aria-hidden />
              {t("trialBadge")}
              <span className="font-normal text-muted-fg">· {t("trialNote")}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <Button
                href={KEYD_APP_APK_URL}
                download
                variant="primary"
                className="min-h-14 px-7 text-base shadow-[0_16px_40px_-16px_rgba(10,37,64,0.45)] dark:shadow-[0_16px_40px_-16px_rgba(0,212,178,0.35)]"
              >
                <Download className="h-5 w-5" aria-hidden />
                {t("downloadApk")}
              </Button>
              <Button
                href={getKeydAppWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                className="min-h-12"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                {t("earlyAccess")}
              </Button>
            </motion.div>
            <p className="mt-2 text-sm text-muted-fg">{t("downloadApkNote")}</p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            >
              <StoreBadge
                store="google"
                href={KEYD_APP_PLAY_URL}
                label={t("googlePlay")}
              />
              <StoreBadge
                store="apple"
                href={KEYD_APP_STORE_URL}
                label={t("appStore")}
              />
            </motion.div>
            <p className="mt-2 text-xs text-muted-fg">{t("earlyAccessNote")}</p>
          </div>

          <PhoneVisual />
        </div>
      </section>

      {/* Features deep-dive */}
      <section className="relative border-y border-border/60 bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("modulesTitle")}
            </h2>
            <p className="mt-3 text-muted-fg">{t("modulesSubtitle")}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(({ key, icon: Icon }, index) => (
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
                  {t(`modules.${key}.title`)}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-fg">
                  {t(`modules.${key}.description`)}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("howItWorksTitle")}
            </h2>
            <p className="mt-3 text-muted-fg">{t("howItWorksSubtitle")}</p>
          </div>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map(({ key, icon: Icon }, index) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="relative rounded-2xl border border-border bg-surface/60 p-6"
              >
                <span className="font-display text-3xl font-bold text-teal/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy dark:bg-teal/15 dark:text-teal">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {t(`howItWorks.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                  {t(`howItWorks.${key}.description`)}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Who it's for */}
      <section className="relative border-y border-border/60 bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {t("audienceTitle")}
            </h2>
            <p className="mt-3 text-muted-fg">{t("audienceSubtitle")}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {AUDIENCE.map(({ key, icon: Icon }, index) => (
              <motion.article
                key={key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-2xl border border-border bg-background/70 p-6"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal/12 text-navy dark:text-teal">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {t(`audience.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                  {t(`audience.${key}.description`)}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Security + billing */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border border-teal/25 bg-gradient-to-br from-navy to-[#0d1f33] p-8 text-offwhite sm:p-10"
            >
              <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-teal/25 blur-2xl" />
              <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal/20 text-teal">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="relative mt-4 font-display text-2xl font-semibold sm:text-3xl">
                {t("securityTitle")}
              </h2>
              <p className="relative mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
                {t("securityDescription")}
              </p>
              <div className="relative mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                <p className="text-sm text-slate-300">{t("offlineNote")}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="flex flex-col justify-center rounded-3xl border border-border bg-surface/70 p-8 sm:p-10"
            >
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {t("billingTitle")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-fg sm:text-lg">
                {t("billingDescription")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Download band */}
      <section className="relative border-t border-border/60 bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-navy via-[#0d1f33] to-navy p-8 text-offwhite sm:p-10"
          >
            <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-teal/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-teal/15 blur-2xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                  {t("downloadTitle")}
                </h2>
                <p className="mt-3 max-w-xl text-slate-300">{t("downloadSubtitle")}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    href={KEYD_APP_APK_URL}
                    download
                    variant="primary"
                    className="min-h-12 bg-teal text-midnight hover:bg-teal-dim dark:bg-teal dark:text-midnight"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    {t("downloadApk")}
                  </Button>
                  <Button
                    href={getKeydAppWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="whatsapp"
                    className="min-h-12"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    {t("ctaWhatsApp")}
                  </Button>
                </div>
                <p className="mt-3 text-sm text-slate-400">{t("downloadApkNote")}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                <StoreBadge
                  store="google"
                  href={KEYD_APP_PLAY_URL}
                  label={t("googlePlay")}
                />
                <StoreBadge
                  store="apple"
                  href={KEYD_APP_STORE_URL}
                  label={t("appStore")}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-surface/70 p-8 sm:flex-row sm:items-center"
          >
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                {t("ctaTitle")}
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-fg sm:text-base">
                {t("ctaSubtitle")}
              </p>
            </div>
            <Button
              href={getKeydAppWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              className="min-h-12 shrink-0"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {t("ctaWhatsApp")}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
