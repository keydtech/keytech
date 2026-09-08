"use client";

import { BlogDatePicker } from "@/components/blog/BlogDatePicker";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, Search, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

type CategoryChip = {
  slug: string;
  label: string;
  count: number;
};

const COPY = {
  en: {
    search: "Search",
    searchPlaceholder: "Search articles…",
    dateAny: "Any time",
    dateToday: "Today",
    dateYesterday: "Yesterday",
    dateWeek: "This week",
    dateCustom: "Pick a day",
    clearDate: "Clear date",
  },
  so: {
    search: "Raadi",
    searchPlaceholder: "Raadi maqaallo…",
    dateAny: "Waqti kasta",
    dateToday: "Maanta",
    dateYesterday: "Shalay",
    dateWeek: "Toddobaadkan",
    dateCustom: "Dooro maalin",
    clearDate: "Nadiifi taariikhda",
  },
} as const;

function formatDisplayDay(ymd: string, locale: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale === "so" ? "so-SO" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogFilters({
  categories,
  allLabel,
}: {
  categories: CategoryChip[];
  allLabel: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  dateLabels?: unknown;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const copy = locale === "so" ? COPY.so : COPY.en;
  const [pending, startTransition] = useTransition();

  const activeCategory = searchParams.get("category") ?? "";
  const urlQ = searchParams.get("q") ?? "";
  const period = searchParams.get("period") ?? "";
  const day = searchParams.get("day") ?? "";

  const [query, setQuery] = useState(urlQ);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickButtonRef = useRef<HTMLButtonElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(urlQ);
  }, [urlQ]);

  function updatePickerPosition() {
    const btn = pickButtonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const width = 240;
    const gap = 8;
    let left = rect.left;
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - width - 12);
    }
    let top = rect.bottom + gap;
    const estimatedHeight = 280;
    if (top + estimatedHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - estimatedHeight - gap);
    }
    setPickerPos({ top, left });
  }

  function openPicker() {
    updatePickerPosition();
    setShowPicker(true);
  }

  function closePicker() {
    setShowPicker(false);
    setPickerPos(null);
  }

  useEffect(() => {
    if (!showPicker) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const inButton = pickButtonRef.current?.contains(target);
      const inPortal = portalRef.current?.contains(target);
      if (!inButton && !inPortal) closePicker();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closePicker();
    }
    function onReposition() {
      updatePickerPosition();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [showPicker]);

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function setCategory(slug: string) {
    pushParams((params) => {
      if (!slug) params.delete("category");
      else params.set("category", slug);
    });
  }

  function setPeriod(next: string) {
    closePicker();
    pushParams((params) => {
      params.delete("day");
      if (!next) params.delete("period");
      else params.set("period", next);
    });
  }

  function setDay(value: string) {
    closePicker();
    pushParams((params) => {
      params.delete("period");
      if (!value) params.delete("day");
      else params.set("day", value);
    });
  }

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams((params) => {
        const trimmed = value.trim();
        if (trimmed) params.set("q", trimmed);
        else params.delete("q");
      });
    }, 320);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const presets = useMemo(
    () =>
      [
        { id: "", label: copy.dateAny },
        { id: "today", label: copy.dateToday },
        { id: "yesterday", label: copy.dateYesterday },
        { id: "week", label: copy.dateWeek },
      ] as const,
    [copy],
  );

  const hasDateFilter = Boolean(period || day);
  const pickActive = Boolean(day) || showPicker;

  const statusLabel = day
    ? formatDisplayDay(day, locale)
    : period === "today"
      ? copy.dateToday
      : period === "yesterday"
        ? copy.dateYesterday
        : period === "week"
          ? copy.dateWeek
          : copy.dateAny;

  return (
    <div className="space-y-5">
      <div className="relative">
        <label className="sr-only" htmlFor="blog-search">
          {copy.search}
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-fg"
          aria-hidden
        />
        <input
          id="blog-search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={copy.searchPlaceholder}
          autoComplete="off"
          className={cn(
            "w-full rounded-2xl border border-border bg-surface py-3.5 pr-11 pl-11 text-sm outline-none transition",
            "ring-teal/40 focus:border-teal/50 focus:ring-2",
            pending && "opacity-80",
          )}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-fg hover:bg-muted hover:text-foreground"
            onClick={() => onQueryChange("")}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-teal/[0.06] shadow-[0_8px_30px_rgba(10,37,64,0.04)] dark:to-teal/[0.08]">
        <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal/15 text-teal">
              <CalendarDays className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {copy.dateCustom}
              </p>
              <p className="text-xs text-muted-fg">{statusLabel}</p>
            </div>
          </div>
          {hasDateFilter ? (
            <button
              type="button"
              onClick={() => {
                closePicker();
                pushParams((params) => {
                  params.delete("period");
                  params.delete("day");
                });
              }}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-fg transition hover:border-teal/40 hover:text-teal"
            >
              {copy.clearDate}
            </button>
          ) : null}
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const selected =
                !day &&
                !showPicker &&
                ((preset.id === "" && !period) || period === preset.id);
              return (
                <button
                  key={preset.id || "any"}
                  type="button"
                  onClick={() => setPeriod(preset.id)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-xs font-semibold transition",
                    selected
                      ? "bg-navy text-white shadow-sm dark:bg-teal dark:text-midnight"
                      : "border border-border bg-background/70 text-muted-fg hover:border-teal/40 hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
            <div className="relative">
              <button
                ref={pickButtonRef}
                type="button"
                onClick={() => {
                  if (showPicker) closePicker();
                  else openPicker();
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                  pickActive
                    ? "bg-navy text-white shadow-sm dark:bg-teal dark:text-midnight"
                    : "border border-border bg-background/70 text-muted-fg hover:border-teal/40 hover:text-foreground",
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {day ? formatDisplayDay(day, locale) : copy.dateCustom}
              </button>

              {showPicker && pickerPos && typeof document !== "undefined"
                ? createPortal(
                    <div
                      className="fixed z-[80]"
                      style={{ top: pickerPos.top, left: pickerPos.left }}
                      ref={portalRef}
                    >
                      <BlogDatePicker
                        value={day}
                        locale={locale}
                        clearLabel={copy.clearDate}
                        todayLabel={copy.dateToday}
                        onSelect={(ymd) => setDay(ymd)}
                        onClear={() => {
                          closePicker();
                          pushParams((params) => {
                            params.delete("period");
                            params.delete("day");
                          });
                        }}
                      />
                    </div>,
                    document.body,
                  )
                : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold",
            !activeCategory
              ? "bg-navy text-white dark:bg-teal dark:text-midnight"
              : "border border-border text-muted-fg",
          )}
        >
          {allLabel}
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setCategory(category.slug)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              activeCategory === category.slug
                ? "bg-navy text-white dark:bg-teal dark:text-midnight"
                : "border border-border text-muted-fg",
            )}
          >
            {category.label}
            <span className="ml-1 opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      <Link href="/blog" className="sr-only">
        {allLabel}
      </Link>
    </div>
  );
}
