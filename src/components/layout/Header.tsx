"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button, IconButton } from "@/components/ui/Button";
import { Link, usePathname } from "@/i18n/navigation";
import { getWhatsAppUrl, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function Header() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isSomali = locale === "so";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 overflow-x-clip border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border bg-[var(--header-bg)] shadow-[0_8px_30px_rgba(10,37,64,0.06)] backdrop-blur-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          : "border-transparent bg-[var(--header-bg)]/70 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-2 px-4 sm:h-20 sm:gap-3 sm:px-6 lg:h-[5.25rem] lg:px-8">
        <Logo priority className="min-w-0 shrink" />

        <nav
          className={cn(
            "mx-auto hidden min-w-0 flex-1 items-center justify-center",
            // Somali labels need more room — show desktop nav from xl up
            isSomali ? "xl:flex" : "lg:flex",
          )}
          aria-label="Primary"
        >
          <div
            className={cn(
              "flex max-w-full items-center",
              isSomali ? "gap-0.5" : "gap-1",
            )}
          >
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-xl font-semibold tracking-tight transition-colors",
                    isSomali
                      ? "px-2 py-2 text-sm xl:px-2.5 xl:text-[0.95rem]"
                      : "px-3 py-2.5 text-[0.95rem] lg:px-3.5 lg:text-base",
                    active
                      ? "text-navy dark:text-teal"
                      : "text-muted-fg hover:text-foreground",
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </div>
        </nav>

        <div
          className={cn(
            "ml-auto hidden shrink-0 items-center gap-2",
            isSomali ? "xl:flex" : "lg:flex",
          )}
        >
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            className={cn(
              "whitespace-nowrap",
              isSomali
                ? "min-h-10 px-3.5 py-2 text-sm"
                : "min-h-11 px-5 py-2.5 text-[0.95rem]",
            )}
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
            {t("cta")}
          </Button>
        </div>

        <div
          className={cn(
            "ml-auto flex shrink-0 items-center gap-2",
            isSomali ? "xl:hidden" : "lg:hidden",
          )}
        >
          <LanguageSwitcher />
          <ThemeToggle />
          <IconButton
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="h-11 w-11 border border-border bg-surface/50"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </IconButton>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "overflow-hidden border-t border-border bg-[var(--header-bg)] backdrop-blur-xl",
              isSomali ? "xl:hidden" : "lg:hidden",
            )}
          >
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:px-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="rounded-xl px-4 py-3.5 text-base font-semibold text-foreground hover:bg-muted"
                >
                  {t(item.key)}
                </Link>
              ))}
              <div className="mt-3 border-t border-border pt-4">
                <Button
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  className="min-h-12 w-full text-base"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  {t("ctaFull")}
                </Button>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
