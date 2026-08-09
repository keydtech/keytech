"use client";

import { getWhatsAppUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type WhatsAppButtonProps = {
  floating?: boolean;
  className?: string;
  label?: string;
};

export function WhatsAppButton({
  floating = false,
  className,
  label,
}: WhatsAppButtonProps) {
  const t = useTranslations("WhatsApp");
  const href = getWhatsAppUrl();

  if (floating) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("aria")}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(37,211,102,0.4)] transition-shadow hover:shadow-[0_16px_40px_rgba(37,211,102,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:bottom-6 sm:right-6",
          className,
        )}
      >
        <MessageCircle className="h-5 w-5 fill-white/20" aria-hidden />
        <span className="hidden sm:inline">{label ?? t("label")}</span>
      </motion.a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={t("aria")}
    >
      {label ?? t("label")}
    </a>
  );
}
