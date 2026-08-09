"use client";

import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { getWhatsAppUrl } from "@/lib/constants";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function CtaBand() {
  const t = useTranslations("Cta");

  return (
    <section
      id="cta"
      className="relative overflow-hidden py-20 sm:py-24"
      aria-labelledby="cta-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,178,0.14),transparent_60%)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.h2
          id="cta-title"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
        >
          {t("title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="mx-auto mt-4 max-w-2xl text-base text-muted-fg sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.16 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            className="min-h-12 px-6"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {t("button")}
          </Button>
          <Link
            href="/contact"
            className="text-sm font-semibold text-navy underline-offset-4 hover:text-teal hover:underline dark:text-teal"
          >
            {t("secondary")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
