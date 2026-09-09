"use client";

import { ClientCard } from "@/components/clients/ClientCard";
import { LogoOrbit } from "@/components/clients/LogoOrbit";
import {
  HOME_CLIENTS_PREVIEW,
  type PublicClient,
} from "@/components/clients/types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

type ClientsShowcaseProps = {
  clients: PublicClient[];
  stats: {
    yearsExperience: number;
    projectsCompleted: number;
    expertsOnTeam: number;
    clientsCount: number;
  };
};

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
    return unsub;
  }, [spring]);

  return <span ref={ref}>0</span>;
}

export function ClientsShowcase({ clients, stats }: ClientsShowcaseProps) {
  const t = useTranslations("Clients");
  const featured = clients.filter((c) => c.featured);
  const pool = featured.length ? featured : clients;
  const preview = pool.slice(0, HOME_CLIENTS_PREVIEW);
  const hasMore = clients.length > HOME_CLIENTS_PREVIEW || pool.length > preview.length;

  const statItems = [
    {
      key: "years",
      value: stats.yearsExperience,
      suffix: "+",
      label: t("stats.years"),
    },
    {
      key: "projects",
      value: stats.projectsCompleted,
      suffix: "+",
      label: t("stats.projects"),
    },
    {
      key: "experts",
      value: stats.expertsOnTeam,
      suffix: "+",
      label: t("stats.experts"),
    },
    {
      key: "clients",
      value: Math.max(stats.clientsCount, clients.length),
      suffix: "+",
      label: t("stats.clients"),
    },
  ] as const;

  return (
    <section
      id="clients"
      className="relative isolate overflow-hidden py-20 sm:py-28"
      aria-labelledby="clients-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-atmosphere" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,178,0.14),transparent_50%)]" />
      <div
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full border border-teal/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-10 right-[-5rem] h-96 w-96 -rotate-6 rounded-[3rem] bg-gradient-to-br from-navy/10 to-teal/5"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-[0.22em] text-teal"
            >
              {t("eyebrow")}
            </motion.p>
            <motion.h2
              id="clients-title"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.75rem]"
            >
              {t("title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-xl text-base text-muted-fg sm:text-lg"
            >
              {t("subtitle")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex lg:justify-end"
          >
            <Link
              href="/clients"
              className="group inline-flex min-h-12 items-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-offwhite shadow-[0_18px_40px_-20px_rgba(10,37,64,0.8)] transition hover:bg-navy/90 dark:bg-teal dark:text-midnight"
            >
              {t("viewAll")}
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className={cn(
                "relative overflow-hidden rounded-[1.25rem] border border-border/80 bg-surface/80 px-4 py-5 text-center backdrop-blur-sm sm:px-5 sm:py-6",
                index % 2 === 1 && "lg:mt-4",
              )}
            >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-teal/60 to-transparent" />
              <p className="font-display text-3xl font-bold tracking-tight text-navy dark:text-teal sm:text-4xl">
                <AnimatedNumber value={item.value} />
                <span className="text-teal">{item.suffix}</span>
              </p>
              <p className="mt-2 text-xs font-medium text-muted-fg sm:text-sm">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 sm:mt-14">
          <LogoOrbit clients={pool} />
        </div>

        <div className="mt-12 sm:mt-14">
          {preview.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((client, index) => (
                <ClientCard key={client.id} client={client} index={index} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-fg">
              {t("empty")}
            </p>
          )}
        </div>

        {hasMore || clients.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col items-center gap-2 text-center"
          >
            <p className="text-sm text-muted-fg">{t("viewAllHint")}</p>
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal underline-offset-4 hover:underline"
            >
              {t("viewAll")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
