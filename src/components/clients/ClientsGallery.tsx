"use client";

import { ClientCard } from "@/components/clients/ClientCard";
import { LogoOrbit } from "@/components/clients/LogoOrbit";
import type { PublicClient } from "@/components/clients/types";
import type { ClientIndustry, ClientWorkType } from "@prisma/client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const INDUSTRIES: Array<ClientIndustry | "ALL"> = [
  "ALL",
  "RETAIL",
  "PHARMACY",
  "ELECTRONICS",
  "WHOLESALE",
  "SERVICES",
  "MANUFACTURING",
  "NGO",
  "GOVERNMENT",
  "OTHER",
];

const WORK_TYPES: Array<ClientWorkType | "ALL"> = [
  "ALL",
  "ODOO",
  "WEBSITE",
  "APP",
  "SYSTEM",
  "POS_RETAIL",
  "OTHER",
];

export function ClientsGallery({ clients }: { clients: PublicClient[] }) {
  const t = useTranslations("Clients");
  const [industry, setIndustry] = useState<(typeof INDUSTRIES)[number]>("ALL");
  const [work, setWork] = useState<(typeof WORK_TYPES)[number]>("ALL");

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      if (industry !== "ALL" && client.industry !== industry) return false;
      if (work !== "ALL" && client.workType !== work) return false;
      return true;
    });
  }, [clients, industry, work]);

  return (
    <div className="relative overflow-hidden bg-atmosphere pb-20 pt-14 sm:pb-28 sm:pt-20">
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-[2rem] bg-navy/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-teal"
        >
          {t("pageEyebrow")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
        >
          {t("pageTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-2xl text-base text-muted-fg sm:text-lg"
        >
          {t("pageSubtitle")}
        </motion.p>

        <div className="mt-10">
          <LogoOrbit clients={clients} />
        </div>

        <div className="mt-10 space-y-4 rounded-[1.5rem] border border-border bg-surface/70 p-4 backdrop-blur-sm sm:p-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-fg">
              {t("filterIndustry")}
            </p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIndustry(item)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    industry === item
                      ? "bg-navy text-offwhite dark:bg-teal dark:text-midnight"
                      : "border border-border text-muted-fg hover:border-teal/40 hover:text-teal"
                  }`}
                >
                  {item === "ALL" ? t("filterAll") : t(`industry.${item}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-fg">
              {t("filterWork")}
            </p>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setWork(item)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    work === item
                      ? "bg-teal/15 text-teal ring-1 ring-teal/40"
                      : "border border-border text-muted-fg hover:border-teal/40 hover:text-teal"
                  }`}
                >
                  {item === "ALL" ? t("filterAll") : t(`work.${item}`)}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-fg">
            {t("countLabel", { count: filtered.length })}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((client, index) => (
              <ClientCard key={client.id} client={client} index={index} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-border px-6 py-14 text-center text-sm text-muted-fg">
            {t("empty")}
          </p>
        )}
      </div>
    </div>
  );
}
