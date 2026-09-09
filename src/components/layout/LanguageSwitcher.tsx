"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const t = useTranslations("Nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-surface/50",
        compact ? "p-0.5" : "p-1",
      )}
      role="group"
      aria-label={t("switchLanguage")}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            className={cn(
              "rounded-lg font-semibold uppercase tracking-wide transition-colors",
              compact
                ? "px-2 py-1.5 text-[0.7rem] sm:px-2.5 sm:text-xs"
                : "px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm",
              active
                ? "bg-navy text-white dark:bg-teal dark:text-midnight"
                : "text-muted-fg hover:text-foreground",
            )}
            aria-pressed={active}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
