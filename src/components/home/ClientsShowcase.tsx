"use client";

import { cn } from "@/lib/utils";
import type { ClientIndustry, ClientWorkType } from "@prisma/client";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

export type PublicClient = {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: ClientIndustry;
  workType: ClientWorkType;
  descriptionEn: string;
  descriptionSo: string;
  websiteUrl: string | null;
  featured: boolean;
};

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
  const spring = useSpring(motionValue, { stiffness: 70, damping: 22 });

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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ClientCard({
  client,
  index,
}: {
  client: PublicClient;
  index: number;
}) {
  const t = useTranslations("Clients");
  const locale = useLocale();
  const isSo = locale === "so";
  const description = isSo ? client.descriptionSo : client.descriptionEn;

  const card = (
    <motion.article
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.35) }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative h-full overflow-hidden rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-[0_20px_50px_-30px_rgba(10,37,64,0.45)] backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal/15 blur-2xl transition duration-500 group-hover:bg-teal/30" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-teal/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex h-16 items-center gap-3">
        {client.logoUrl ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
            <Image
              src={client.logoUrl}
              alt=""
              fill
              className="object-contain p-1.5"
              sizes="56px"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-[#123456] font-display text-sm font-bold text-teal">
            {initials(client.name) || "KT"}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-foreground">
            {client.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-teal">
            {t(`work.${client.workType}`)}
          </p>
        </div>
      </div>

      <p className="relative mt-3 text-xs font-semibold uppercase tracking-wide text-muted-fg">
        {t(`industry.${client.industry}`)}
      </p>
      {description ? (
        <p className="relative mt-2 line-clamp-3 text-sm leading-relaxed text-muted-fg">
          {description}
        </p>
      ) : null}
    </motion.article>
  );

  if (client.websiteUrl) {
    return (
      <a
        href={client.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {card}
      </a>
    );
  }
  return card;
}

export function ClientsShowcase({ clients, stats }: ClientsShowcaseProps) {
  const t = useTranslations("Clients");
  const featured = clients.filter((c) => c.featured);
  const display = featured.length ? featured : clients;
  const marquee = [...display, ...display];

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
      value: Math.max(stats.clientsCount, display.length),
      suffix: "+",
      label: t("stats.clients"),
    },
  ] as const;

  return (
    <section
      id="clients"
      className="relative isolate overflow-hidden py-20 sm:py-24"
      aria-labelledby="clients-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-atmosphere" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,178,0.12),transparent_55%)]" />
      <div
        className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full border border-teal/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-20 h-72 w-72 rotate-12 rounded-[2.5rem] bg-navy/5 dark:bg-teal/5"
        aria-hidden
      />
      <svg
        className="pointer-events-none absolute right-[8%] top-16 hidden h-40 w-40 text-teal/20 lg:block"
        viewBox="0 0 160 160"
        fill="none"
        aria-hidden
      >
        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="80" cy="80" r="42" stroke="currentColor" strokeWidth="1.2">
          <animate
            attributeName="r"
            values="38;48;38"
            dur="5.5s"
            repeatCount="indefinite"
          />
        </circle>
        <path
          d="M40 80h80M80 40v80"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-[0.2em] text-teal"
          >
            {t("eyebrow")}
          </motion.p>
          <motion.h2
            id="clients-title"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-base text-muted-fg sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, type: "spring", stiffness: 120 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-border bg-surface/70 px-4 py-5 text-center sm:px-5 sm:py-6",
                index % 2 === 1 && "lg:translate-y-2",
              )}
            >
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-teal/50 to-transparent" />
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
      </div>

      {display.length > 0 ? (
        <div className="relative mt-14 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent sm:w-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent sm:w-20" />
          <motion.div
            className="flex w-max gap-4 py-2"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          >
            {marquee.map((client, index) => (
              <div
                key={`${client.id}-${index}`}
                className="flex h-20 w-[11.5rem] shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-surface/60 px-4 backdrop-blur-sm sm:h-24 sm:w-56"
              >
                {client.logoUrl ? (
                  <div className="relative h-12 w-full sm:h-14">
                    <Image
                      src={client.logoUrl}
                      alt={client.name}
                      fill
                      className="object-contain"
                      sizes="180px"
                    />
                  </div>
                ) : (
                  <span className="font-display text-sm font-semibold text-foreground sm:text-base">
                    {client.name}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      ) : null}

      <div className="relative mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
        {display.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {display.map((client, index) => (
              <ClientCard key={client.id} client={client} index={index} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-fg">
            {t("empty")}
          </p>
        )}
      </div>
    </section>
  );
}
