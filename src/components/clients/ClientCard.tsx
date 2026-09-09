"use client";

import {
  initials,
  type PublicClient,
} from "@/components/clients/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export function ClientCard({
  client,
  index = 0,
  compact = false,
}: {
  client: PublicClient;
  index?: number;
  compact?: boolean;
}) {
  const t = useTranslations("Clients");
  const locale = useLocale();
  const isSo = locale === "so";
  const description = isSo ? client.descriptionSo : client.descriptionEn;

  const inner = (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.06, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(248,250,252,0.88))] p-5 shadow-[0_24px_60px_-36px_rgba(10,37,64,0.55)] dark:border-white/8 dark:bg-[linear-gradient(165deg,rgba(15,22,35,0.95),rgba(10,18,30,0.9))]"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-teal via-teal/40 to-transparent" />
      <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-teal/10 blur-2xl transition duration-500 group-hover:bg-teal/25" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 h-24 w-24 rotate-12 rounded-3xl border border-teal/15" />

      <div className="relative flex items-start gap-3">
        {client.logoUrl ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm">
            <Image
              src={client.logoUrl}
              alt=""
              fill
              className="object-contain p-1.5"
              sizes="56px"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy via-[#0d3558] to-teal/40 font-display text-sm font-bold text-teal shadow-inner">
            {initials(client.name) || "KT"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-foreground">
            {client.name}
          </h3>
          <span className="mt-2 inline-flex rounded-full bg-teal/12 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-teal">
            {t(`work.${client.workType}`)}
          </span>
        </div>
      </div>

      <p className="relative mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-fg">
        {t(`industry.${client.industry}`)}
      </p>
      {!compact && description ? (
        <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-fg">
          {description}
        </p>
      ) : null}

      <div className="relative mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs font-semibold text-navy/70 dark:text-teal/80">
        <span className="opacity-80">KeydTech</span>
        <span className="translate-x-0 transition group-hover:translate-x-1">
          →
        </span>
      </div>
    </motion.article>
  );

  if (client.websiteUrl) {
    return (
      <a
        href={client.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      >
        {inner}
      </a>
    );
  }

  return inner;
}
