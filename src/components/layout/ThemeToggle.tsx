"use client";

import { IconButton } from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const t = useTranslations("Nav");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton
        aria-label={t("toggleTheme")}
        className="h-11 w-11 opacity-0"
        disabled
      >
        <Sun className="h-5 w-5" />
      </IconButton>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <IconButton
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-11 w-11 border border-border bg-surface/50"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-teal" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </IconButton>
  );
}
