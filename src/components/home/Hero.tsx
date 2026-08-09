"use client";

import { Button } from "@/components/ui/Button";
import { getWhatsAppUrl } from "@/lib/constants";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-atmosphere"
      aria-labelledby="hero-brand"
    >
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-3xl opacity-70">
        <HeroVisual />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-5.25rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.p
          id="hero-brand"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="font-display text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
        >
          <span className="text-navy dark:text-offwhite">Keyd</span>
          <span className="text-teal">Tech</span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="mt-5 max-w-2xl font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl"
        >
          {t("headline")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
          className="mt-5 max-w-xl text-base leading-relaxed text-muted-fg sm:text-lg"
        >
          {t("subhead")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24, ease: "easeOut" }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            className="min-h-12 px-6"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {t("primaryCta")}
          </Button>
          <Button href="/solutions" variant="secondary" className="min-h-12 px-6">
            {t("secondaryCta")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 inline-flex items-center gap-2 text-sm text-muted-fg"
        >
          <MapPin className="h-4 w-4 text-teal" aria-hidden />
          {t("location")}
        </motion.p>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <svg
      viewBox="0 0 720 720"
      className="h-full w-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="heroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4B2" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#0A2540" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00D4B2" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="480" cy="280" r="220" fill="url(#heroGlow)" />
      <g
        stroke="currentColor"
        className="text-navy/20 dark:text-offwhite/15"
        strokeWidth="1.25"
        fill="none"
      >
        <path d="M260 180h220l80 80v220H340l-80-80V180Z" />
        <path d="M320 240h140l50 50v140H370l-50-50V240Z" />
      </g>
      <g fill="#00D4B2">
        <circle cx="340" cy="300" r="6">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="420" cy="260" r="5">
          <animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="470" cy="340" r="7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="390" cy="400" r="5">
          <animate attributeName="opacity" values="0.35;1;0.35" dur="3.2s" repeatCount="indefinite" />
        </circle>
      </g>
      <g stroke="#00D4B2" strokeWidth="1.5" opacity="0.7">
        <path d="M340 300 420 260 470 340 390 400 340 300" fill="none" />
      </g>
      <rect
        x="448"
        y="312"
        width="44"
        height="44"
        rx="8"
        transform="rotate(45 470 334)"
        fill="#00D4B2"
        opacity="0.9"
      />
      <path
        d="M470 322c4.4 0 8 3.6 8 8 0 2.8-1.5 5.3-3.8 6.7V342h-8.4v-5.3c-2.3-1.4-3.8-3.9-3.8-6.7 0-4.4 3.6-8 8-8Z"
        fill="#090D16"
        className="dark:fill-midnight"
      />
    </svg>
  );
}
