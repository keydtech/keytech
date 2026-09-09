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
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-3 px-4 sm:h-[4.75rem] sm:px-6 lg:px-8">
        <Logo priority className="min-w-0 shrink-0" />

        {/* Desktop nav — xl+ only so 7 links never collide with language controls */}
        <nav
          className="mx-3 hidden min-w-0 flex-1 items-center justify-center xl:flex"
          aria-label="Primary"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1">
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
                    "shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold tracking-tight transition-colors 2xl:px-3 2xl:text-[0.95rem]",
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

        <div className="ml-auto hidden shrink-0 items-center gap-2 xl:flex">
          <LanguageSwitcher compact />
          <ThemeToggle />
          <Button
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            className="min-h-10 whitespace-nowrap px-3.5 py-2 text-sm"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            {t("cta")}
          </Button>
        </div>

        {/* Mobile / tablet: language + theme + hamburger (no overlapping desktop nav) */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:hidden">
          <LanguageSwitcher compact />
          <ThemeToggle />
          <IconButton
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="h-10 w-10 border border-border bg-surface/50 sm:h-11 sm:w-11"
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
            className="overflow-hidden border-t border-border bg-[var(--header-bg)] backdrop-blur-xl xl:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 sm:px-6">
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
                      "rounded-xl px-4 py-3.5 text-base font-semibold hover:bg-muted",
                      active ? "text-teal" : "text-foreground",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
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
